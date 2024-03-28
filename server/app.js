const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Readable } = require('stream');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

const upload = multer();

app.post('/upload', upload.array('files'), (req, res) => {
  console.log('UPLOAD')
  if (!req.files) {
    res.status(400).send({ message: 'No files uploaded.' });
    return;
  }

  const outputDirectory = path.join(__dirname, 'uploads');
  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputDirectory, { recursive: true });

  const promises = req.files.map((file, index) => {
    return new Promise((resolve, reject) => {
      // Create a Brotli compress instance
      const brotliCompress = zlib.createBrotliCompress();

      // Define the output file paths
      const compressedFileName = 'compressed_file_' + Date.now() + '.br';
      const outputFilePath = path.join(outputDirectory, compressedFileName);

      // Create read and write streams
      const readStream = new Readable();
      readStream._read = () => {}; // _read is required but you can noop it
      readStream.push(file.buffer);
      readStream.push(null);

      const writeStream = fs.createWriteStream(outputFilePath);

      // Pipe the read stream into the Brotli compress instance and then into the write stream
      readStream.pipe(brotliCompress).pipe(writeStream);

      writeStream.on('finish', function () {
        resolve(compressedFileName);
      });

      writeStream.on('error', function (err) {
        reject(err);
      });
    });
  });

  Promise.all(promises)
    .then((fileNames) => {
      const fileUrls = fileNames.map(fileName => `${req.protocol}://${req.get('host')}/uploads/${fileName}`);
      res.send({ message: 'Files compressed successfully', files: fileUrls });
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error compressing files', error: err.message });
    });
});
// Serve static files from the "output" directory
app.use('/output', express.static(path.join(__dirname, 'output')));

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
      // Create a Brotli decompress instance
      const brotliDecompress = zlib.createBrotliDecompress();

      // Define the output file paths
      const decompressedFileName = 'decompressed_file_' + Date.now() + '.txt';
      const outputFilePath = path.join(outputDirectory, decompressedFileName);

      // Create read and write streams
      const readStream = new Readable();
      readStream._read = () => {}; // _read is required but you can noop it
      readStream.push(file.buffer);
      readStream.push(null);

      const writeStream = fs.createWriteStream(outputFilePath);

      // Pipe the read stream into the Brotli decompress instance and then into the write stream
      readStream.pipe(brotliDecompress).pipe(writeStream);

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

app.listen(3000, () => {
  console.log('Server started on port 3000');
});