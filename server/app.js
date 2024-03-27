const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const zlib = require('zlib');
const { createGzip } = require('zlib');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const PORT = 3000;
const { Readable } = require('stream');


// Enable CORS
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for simplicity

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());
const upload = multer();

app.post('/upload', upload.array('files'), (req, res) => {
  console.log('COMPRESS')

  if (!req.files || req.files.length === 0) {
    res.status(400).send({ message: 'No files uploaded.' });
    return;
  }

  req.files.forEach((file) => {
    // Create a gzip instance
    const gzip = createGzip();

    // Generate a timestamp
    const timestamp = Date.now();

    // Append the timestamp to the filename
    const outputFilePath = path.join(__dirname, 'uploads', 'file_' + timestamp + '.gz');

    // Create the output directory if it doesn't exist
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    // Create read and write streams
    const readStream = new Readable();
    readStream._read = () => {}; // _read is required but you can noop it
    readStream.push(file.buffer);
    readStream.push(null);

    const writeStream = fs.createWriteStream(outputFilePath);

    // Pipe the read stream into the gzip instance and then into the write stream
    readStream.pipe(gzip).pipe(writeStream);

    writeStream.on('finish', function () {
      // Set the headers to trigger a file download in the client's browser
      // res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(outputFilePath));
      // res.setHeader('Content-Transfer-Encoding', 'binary');
      // res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Encoding', 'gzip'); // Set Content-Encoding to gzip

      res.download(outputFilePath);
    });
  });
});

app.post('/decompress', upload.array('files'), (req, res) => {
  if (!req.files) {
    res.status(400).send({ message: 'No files uploaded.' });
    return;
  }

  const outputDirectory = path.join(__dirname, 'output');
  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputDirectory, { recursive: true });

  const promises = req.files.map((file, index) => {
    return new Promise((resolve, reject) => {
      // Create a gunzip instance
      const gunzip = zlib.createGunzip();

      // Define the output file paths
      const decompressedFileName = 'decompressed_file_' + Date.now() + '.txt';
      const outputFilePath = path.join(outputDirectory, decompressedFileName);

      // Create read and write streams
      const readStream = new Readable();
      readStream._read = () => {}; // _read is required but you can noop it
      readStream.push(file.buffer);
      readStream.push(null);

      const writeStream = fs.createWriteStream(outputFilePath);

      // Pipe the read stream into the gunzip instance and then into the write stream
      readStream.pipe(gunzip).pipe(writeStream);

      writeStream.on('finish', function () {
        resolve(decompressedFileName);
      });

      writeStream.on('error', function (err) {
        reject(err);
      });
    });
  });

  Promise.all(promises)
    .then((fileNames) => {
      const fileUrls = fileNames.map(fileName => `${req.protocol}://${req.get('host')}/output/${fileName}`);
      res.send({ message: 'Files decompressed successfully', files: fileUrls });
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error decompressing files', error: err.message });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
