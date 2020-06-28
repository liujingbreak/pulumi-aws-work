require('source-map-support/register');
import {createServer} from 'http';
import mime from 'mime';
import os from 'os';
import fs from 'fs';
import Path from 'path';

process.on('uncaughtException', function(err) {
  console.error('[nodejs app] Uncaught exception: ', err, err.stack);
  throw err; // let PM2 handle exception
});
process.on('unhandledRejection', (err) => {
  console.error('[nodejs app] unhandledRejection: ', err);
});
process.on('SIGINT', function() {
  console.info('[nodejs app] Recieve SIGINT, bye.');
  shutdown();
});
process.on('message', function(msg) {
  if (msg === 'shutdown') {
    console.info('[nodejs app] Recieve shutdown message from PM2, bye.');
    shutdown();
  }
});

const shutdown = startServer(8080);

function startServer(port: number) {
  const html = fs.readFileSync(Path.resolve(__dirname, '../assets/index.html'));
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': mime.getType('index.html') || 'text/plain' });
    res.end(html);
  });

  server.on('upgrade', (req, socket, head) => {
    socket.write(
      'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        '\r\n'
    );

    socket.pipe(socket);
  });

  server.on('clientError', (err: Error, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
  server.listen(port);

  server.on('listening', () => {
    // tslint:disable-next-line: no-console
    console.log(`[nodejs app] Server is listening on ${getLanIPv4()}:${port}`);
  });

  return () => {
    server.close();
  };
}


function getLanIPv4(): string {
  const inters = os.networkInterfaces();
  if (inters.en0) {
    const found = inters.en0.find(ip => ip.family === 'IPv4' && !ip.internal);
    if (found) {
      return found.address;
    }
  }
  for (const key of Object.keys(inters)) {
    const interf = inters[key];
    const found = interf.find(ip => ip.family === 'IPv4' && !ip.internal);
    if (found) {
      return found.address;
    }
  }
  return '127.0.0.1';
}
