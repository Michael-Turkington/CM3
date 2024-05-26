// import http from 'http';
// import fs from 'fs';
// import path from 'path';
// import { WebSocketServer } from 'ws';

// const server = http.createServer((req, res) => {
//     if (req.method === 'GET') {
//         let filePath = '.' + req.url;
//         if (filePath === './') {
//             filePath = './index.html';
//         }

//         const extname = String(path.extname(filePath)).toLowerCase();
//         const mimeTypes = {
//             '.html': 'text/html',
//             '.js': 'application/javascript',
//             '.css': 'text/css',
//             '.json': 'application/json',
//             '.png': 'image/png',
//             '.jpg': 'image/jpg',
//             '.gif': 'image/gif',
//             '.wav': 'audio/wav',
//             '.mp4': 'video/mp4',
//             '.woff': 'application/font-woff',
//             '.ttf': 'application/font-ttf',
//             '.eot': 'application/vnd.ms-fontobject',
//             '.otf': 'application/font-otf',
//             '.svg': 'application/image/svg+xml'
//         };

//         const contentType = mimeTypes[extname] || 'application/octet-stream';

//         fs.readFile(filePath, (error, content) => {
//             if (error) {
//                 if (error.code === 'ENOENT') {
//                     res.writeHead(404, { 'Content-Type': 'text/html' });
//                     res.end('404 Not Found', 'utf-8');
//                 } else {
//                     res.writeHead(500);
//                     res.end('Sorry, there was an error: ' + error.code + ' ..\n');
//                 }
//             } else {
//                 res.writeHead(200, { 'Content-Type': contentType });
//                 res.end(content, 'utf-8');
//             }
//         });
//     }
// });

// const PORT = 8080;
// server.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}/`);
// });

// const wss = new WebSocketServer({ noServer: true });

// server.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//         wss.emit('connection', ws, request);
//     });
// });

// wss.on('connection', ws => {
//     console.log('A client connected.');
//     ws.on('message', data => {
//         const sensorData = JSON.parse(data);
//         if (sensorData.type === 'orientation') {
//             console.log('Orientation Data:', sensorData);
//         } else if (sensorData.type === 'motion') {
//             console.log('Motion Data:', sensorData);
//         }
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

// console.log('WebSocket server is running on ws://localhost:8080');