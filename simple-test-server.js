const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`📡 Connection from: ${req.socket.remoteAddress}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK\n');
});

server.listen(8000, '0.0.0.0', () => {
    console.log('🔍 Simple test server running on 0.0.0.0:8000');
    console.log('Waiting for ESP32 connection...');
});
