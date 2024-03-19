const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const zlib = require('zlib');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Route to handle file uploads using multer
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('test')
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  const originalFileBuffer = req.file.buffer;

  zlib.gzip(originalFileBuffer, (err, compressedBuffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error compressing the file.', error: err.message });
    }

    res.setHeader('Content-Disposition', 'attachment; filename=compressed_file.gz');
    res.setHeader('Content-Type', 'application/x-gzip');
    console.log(compressedBuffer)
    res.send(compressedBuffer);
  });
});

app.post('/decompress', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  const compressedBuffer = Buffer.from(req.file.buffer);

  zlib.gunzip(compressedBuffer, (err, decompressedBuffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error decompressing the file.', error: err.message });
    }

    res.setHeader('Content-Disposition', 'attachment; filename=decompressed_file.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(decompressedBuffer);
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
