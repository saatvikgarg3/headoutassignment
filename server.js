const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // Parsing URL and query parameters
  console.log("HERE")
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fileName = url.searchParams.get('n');
  const lineNumber = url.searchParams.get('m');

  // Checking if both fileName and lineNumber are provided
  if (fileName && lineNumber) {
    // Read specific line from the file
    readSpecificLine(fileName, lineNumber, res);
  } else if (fileName) {
    // Reading entire content of the file
    console.log("HERE ")
    readEntireFile(fileName, res);
  } else {
    // Invalid request
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid request. Both "n" and "m" parameters are required.');
  }
});

// Function reading specific line from the file
function readSpecificLine(fileName, lineNumber, res) {
  const filePath = `/tmp/data/${fileName}.txt`;
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  let currentLine = 1;

  stream.on('data', (chunk) => {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (currentLine === lineNumber) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(line);
        stream.destroy();
        return;
      }
      currentLine++;
    }
  });

  stream.on('end', () => {
    // Line number is greater than the number of lines in the file
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Line not found.');
  });

  stream.on('error', (err) => {
    // File is not found or other error
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error.');
  });
}

// Function reading entire content of the file
function readEntireFile(fileName, res) {
  const filePath = `/tmp/data/${fileName}.txt`;
  console.log("HERE came")
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      // File not found or other error
      console.error('Error reading file:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error.');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      console.log(JSON.stringify(data));
      console.log(filePath);
      res.end(data);
    }
  });
}

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
