const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Readable } = require('stream');
const cors = require('cors');
const archiver = require('archiver');
const { path7za } = require('7zip-bin');
const { extractFull } = require('node-7z');
const zip7 = require('7zip-min');

const app = express();
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

const upload = multer();

app.post('/upload', upload.array('files'), (req, res) => {
  console.log(req.body)
  if (!req.files) {
    res.status(400).send({ message: 'No files uploaded.' });
    return;
  }


  const compressionLevel = Number(req.body.compressionLevel); // Extract compressionLevel from the request body

  console.log('COMPRESSION LEVEL', compressionLevel)
  const outputDirectory = path.join(__dirname, 'uploads');
  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputDirectory, { recursive: true });

  const promises = req.files.map((file, index) => {
    return new Promise((resolve, reject) => {
      // Create a Brotli compress instance
      const brotliCompress = zlib.createBrotliCompress({ params: compressionLevel });

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

app.post('/archive', upload.array('files'), (req, res) => {
  const archiverType = req.body.type || 'zip'; // Use 'zip' as the default archiver type
  const compressionLevel = req.body.compressionLevel || 9;
  console.log(archiverType) // Use 9 as the default compression level
  const archive = archiver(archiverType, {
    zlib: { level: compressionLevel } // Sets the compression level.
  });

  // Ensure 'archives' directory exists
  const archivesDir = path.join(__dirname, 'archives');
  if (!fs.existsSync(archivesDir)){
    fs.mkdirSync(archivesDir);
  }

  const output = fs.createWriteStream(path.join(archivesDir, `archive.${archiverType}`));
  // This is to handle the issue of end of stream error.
  output.on('close', function() {
    console.log('Archive wrote %d bytes', archive.pointer());
  });

  archive.pipe(output);

  req.files.forEach((file, index) => {
    const fileData = Buffer.from(file.buffer);
    archive.append(fileData, { name: file.originalname });
  });

  archive.finalize();

  res.status(200).send({ message: 'Files archived successfully.' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});