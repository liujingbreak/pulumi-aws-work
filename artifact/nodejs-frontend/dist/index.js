"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support/register');
const http_1 = require("http");
const mime_1 = __importDefault(require("mime"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
process.on('uncaughtException', function (err) {
    console.error('[nodejs app] Uncaught exception: ', err, err.stack);
    throw err; // let PM2 handle exception
});
process.on('unhandledRejection', (err) => {
    console.error('[nodejs app] unhandledRejection: ', err);
});
process.on('SIGINT', function () {
    console.info('[nodejs app] Recieve SIGINT, bye.');
    shutdown();
});
process.on('message', function (msg) {
    if (msg === 'shutdown') {
        console.info('[nodejs app] Recieve shutdown message from PM2, bye.');
        shutdown();
    }
});
const shutdown = startServer(8080);
function startServer(port) {
    const html = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../assets/index.html'));
    const server = http_1.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': mime_1.default.getType('index.html') || 'text/plain' });
        res.end(html);
    });
    server.on('upgrade', (req, socket, head) => {
        socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n');
        socket.pipe(socket);
    });
    server.on('clientError', (err, socket) => {
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
function getLanIPv4() {
    const inters = os_1.default.networkInterfaces();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUN2QywrQkFBa0M7QUFDbEMsZ0RBQXdCO0FBQ3hCLDRDQUFvQjtBQUNwQiw0Q0FBb0I7QUFDcEIsZ0RBQXdCO0FBRXhCLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBUyxHQUFHO0lBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQjtBQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFELENBQUMsQ0FBQyxDQUFDO0FBQ0gsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ2xELFFBQVEsRUFBRSxDQUFDO0FBQ2IsQ0FBQyxDQUFDLENBQUM7QUFDSCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFTLEdBQUc7SUFDaEMsSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUNyRSxRQUFRLEVBQUUsQ0FBQztLQUNaO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbkMsU0FBUyxXQUFXLENBQUMsSUFBWTtJQUMvQixNQUFNLElBQUksR0FBRyxZQUFFLENBQUMsWUFBWSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztJQUM5RSxNQUFNLE1BQU0sR0FBRyxtQkFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNuRixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQ1YsZ0RBQWdEO1lBQzlDLHdCQUF3QjtZQUN4Qix5QkFBeUI7WUFDekIsTUFBTSxDQUNULENBQUM7UUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQixNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7UUFDMUIsdUNBQXVDO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLFVBQVUsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDLENBQUM7QUFDSixDQUFDO0FBR0QsU0FBUyxVQUFVO0lBQ2pCLE1BQU0sTUFBTSxHQUFHLFlBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3RDLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUUsSUFBSSxLQUFLLEVBQUU7WUFDVCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDdEI7S0FDRjtJQUNELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNyQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RFLElBQUksS0FBSyxFQUFFO1lBQ1QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQ3RCO0tBQ0Y7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJyk7XG5pbXBvcnQge2NyZWF0ZVNlcnZlcn0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgbWltZSBmcm9tICdtaW1lJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IFBhdGggZnJvbSAncGF0aCc7XG5cbnByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZnVuY3Rpb24oZXJyKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tub2RlanMgYXBwXSBVbmNhdWdodCBleGNlcHRpb246ICcsIGVyciwgZXJyLnN0YWNrKTtcbiAgdGhyb3cgZXJyOyAvLyBsZXQgUE0yIGhhbmRsZSBleGNlcHRpb25cbn0pO1xucHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgKGVycikgPT4ge1xuICBjb25zb2xlLmVycm9yKCdbbm9kZWpzIGFwcF0gdW5oYW5kbGVkUmVqZWN0aW9uOiAnLCBlcnIpO1xufSk7XG5wcm9jZXNzLm9uKCdTSUdJTlQnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5pbmZvKCdbbm9kZWpzIGFwcF0gUmVjaWV2ZSBTSUdJTlQsIGJ5ZS4nKTtcbiAgc2h1dGRvd24oKTtcbn0pO1xucHJvY2Vzcy5vbignbWVzc2FnZScsIGZ1bmN0aW9uKG1zZykge1xuICBpZiAobXNnID09PSAnc2h1dGRvd24nKSB7XG4gICAgY29uc29sZS5pbmZvKCdbbm9kZWpzIGFwcF0gUmVjaWV2ZSBzaHV0ZG93biBtZXNzYWdlIGZyb20gUE0yLCBieWUuJyk7XG4gICAgc2h1dGRvd24oKTtcbiAgfVxufSk7XG5cbmNvbnN0IHNodXRkb3duID0gc3RhcnRTZXJ2ZXIoODA4MCk7XG5cbmZ1bmN0aW9uIHN0YXJ0U2VydmVyKHBvcnQ6IG51bWJlcikge1xuICBjb25zdCBodG1sID0gZnMucmVhZEZpbGVTeW5jKFBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9hc3NldHMvaW5kZXguaHRtbCcpKTtcbiAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKChyZXEsIHJlcykgPT4ge1xuICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiBtaW1lLmdldFR5cGUoJ2luZGV4Lmh0bWwnKSB8fCAndGV4dC9wbGFpbicgfSk7XG4gICAgcmVzLmVuZChodG1sKTtcbiAgfSk7XG5cbiAgc2VydmVyLm9uKCd1cGdyYWRlJywgKHJlcSwgc29ja2V0LCBoZWFkKSA9PiB7XG4gICAgc29ja2V0LndyaXRlKFxuICAgICAgJ0hUVFAvMS4xIDEwMSBXZWIgU29ja2V0IFByb3RvY29sIEhhbmRzaGFrZVxcclxcbicgK1xuICAgICAgICAnVXBncmFkZTogV2ViU29ja2V0XFxyXFxuJyArXG4gICAgICAgICdDb25uZWN0aW9uOiBVcGdyYWRlXFxyXFxuJyArXG4gICAgICAgICdcXHJcXG4nXG4gICAgKTtcblxuICAgIHNvY2tldC5waXBlKHNvY2tldCk7XG4gIH0pO1xuXG4gIHNlcnZlci5vbignY2xpZW50RXJyb3InLCAoZXJyOiBFcnJvciwgc29ja2V0KSA9PiB7XG4gICAgc29ja2V0LmVuZCgnSFRUUC8xLjEgNDAwIEJhZCBSZXF1ZXN0XFxyXFxuXFxyXFxuJyk7XG4gIH0pO1xuICBzZXJ2ZXIubGlzdGVuKHBvcnQpO1xuXG4gIHNlcnZlci5vbignbGlzdGVuaW5nJywgKCkgPT4ge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKGBbbm9kZWpzIGFwcF0gU2VydmVyIGlzIGxpc3RlbmluZyBvbiAke2dldExhbklQdjQoKX06JHtwb3J0fWApO1xuICB9KTtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHNlcnZlci5jbG9zZSgpO1xuICB9O1xufVxuXG5cbmZ1bmN0aW9uIGdldExhbklQdjQoKTogc3RyaW5nIHtcbiAgY29uc3QgaW50ZXJzID0gb3MubmV0d29ya0ludGVyZmFjZXMoKTtcbiAgaWYgKGludGVycy5lbjApIHtcbiAgICBjb25zdCBmb3VuZCA9IGludGVycy5lbjAuZmluZChpcCA9PiBpcC5mYW1pbHkgPT09ICdJUHY0JyAmJiAhaXAuaW50ZXJuYWwpO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgcmV0dXJuIGZvdW5kLmFkZHJlc3M7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGludGVycykpIHtcbiAgICBjb25zdCBpbnRlcmYgPSBpbnRlcnNba2V5XTtcbiAgICBjb25zdCBmb3VuZCA9IGludGVyZi5maW5kKGlwID0+IGlwLmZhbWlseSA9PT0gJ0lQdjQnICYmICFpcC5pbnRlcm5hbCk7XG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICByZXR1cm4gZm91bmQuYWRkcmVzcztcbiAgICB9XG4gIH1cbiAgcmV0dXJuICcxMjcuMC4wLjEnO1xufVxuIl19