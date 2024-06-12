/* eslint-env node */

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {

  // Get the file path of the requested resource
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {

      // File not found
      res.statusCode = 404;
      res.end('File not found');
    } else {

      // Read the file and send it as the response
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal server error');
        } else {
          res.setHeader('Content-Type', 'text/html');
          res.end(data);
        }
      });
    }
  });
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});