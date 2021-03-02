const http = require('http');
const app = require('./app');

const port = process.env.port || 8080;

// Skapar en ny http-server där app fungerar som request-listener
const server = http.createServer(app);

// Startar servern och lyssnar på port 8080
server.listen(port);