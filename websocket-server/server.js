// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });

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
