const fs = require('fs');
const archiver = require('archiver');

// Create a file to stream archive data to.
const output = fs.createWriteStream('src.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Archive created successfully. Total bytes: ' + archive.pointer());
});

// Catch any errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from src/, the `true` argument means to include subdirectories
archive.directory('src/', true);

// Finalize the archive (i.e., finish appending files and finalize the archive)
archive.finalize();
