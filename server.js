import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// allow overriding the port via environment variable
let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5173;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Serve index.html for SPA routing
            filePath = path.join(__dirname, 'public', 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
                return;
            }

            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    });
});

function startServer(port) {
    server.listen(port, () => {
        console.log(`\n  ✨ Banker's Algorithm Simulator\n`);
        console.log(`  ➜ Local:   http://localhost:${port}/`);
        console.log(`  ➜ Ready to use!\n`);
    });
}

// attempt to start, with fallback if port busy
startServer(PORT);

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        const nextPort = PORT + 1;
        console.log(`Trying port ${nextPort} instead...`);
        PORT = nextPort;
        startServer(PORT);
    } else {
        console.error('Server error:', err);
    }
});
