#!/usr/bin/env node

/**
 * Simple HTTP/HTTPS Proxy Server
 * 
 * Usage:
 *   node proxy-server.js [port]
 * 
 * Default port: 8080
 * 
 * Configure target server by setting TARGET_URL environment variable:
 *   TARGET_URL=http://example.com node proxy-server.js
 * 
 * Or use as a forward proxy (no TARGET_URL):
 *   node proxy-server.js
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || process.env.PORT || 8080;
const TARGET_URL = process.env.TARGET_URL;
const STATIC_DIR = process.env.STATIC_DIR || __dirname;

// Logging utility
const log = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

// Serve static files
function serveStaticFile(filePath, clientRes, requestId) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.xml': 'application/xml',
        '.txt': 'text/plain'
    };

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                clientRes.writeHead(404, { 'Content-Type': 'text/plain' });
                clientRes.end('404 Not Found');
            } else {
                log.error(`[${requestId}] Error reading file: ${err.message}`);
                clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
                clientRes.end('500 Internal Server Error');
            }
            return;
        }

        const contentType = contentTypes[ext] || 'application/octet-stream';
        clientRes.writeHead(200, { 'Content-Type': contentType });
        clientRes.end(data);
    });
}

// Create proxy server
const server = http.createServer((clientReq, clientRes) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    log.info(`[${requestId}] ${clientReq.method} ${clientReq.url}`);

    // Check if this is a proxy request (has ?proxy= URL parameter or X-Proxy-Target header)
    const parsedUrl = url.parse(clientReq.url, true);
    const proxyTarget = parsedUrl.query.proxy || clientReq.headers['x-proxy-target'];

    // Determine target URL
    let targetUrl;
    if (TARGET_URL) {
        // Reverse proxy mode - forward to configured target
        targetUrl = TARGET_URL + parsedUrl.pathname + (parsedUrl.search ? '?' + parsedUrl.search.replace(/[?&]proxy=[^&]*/g, '') : '');
    } else if (proxyTarget) {
        // Proxy request with explicit target
        targetUrl = proxyTarget;
    } else {
        // Serve static file by default
        // Decode URL-encoded paths (e.g., %20 -> space)
        const urlPath = decodeURIComponent(parsedUrl.pathname || '/');
        let filePath = path.join(STATIC_DIR, urlPath === '/' ? 'index.html' : urlPath);
        
        // Security: prevent directory traversal
        const resolvedPath = path.resolve(filePath);
        const resolvedDir = path.resolve(STATIC_DIR);
        if (!resolvedPath.startsWith(resolvedDir)) {
            clientRes.writeHead(403, { 'Content-Type': 'text/plain' });
            clientRes.end('403 Forbidden');
            return;
        }

        // Check if file exists
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                // Try with .html extension
                if (!urlPath.endsWith('/') && !path.extname(filePath)) {
                    filePath += '.html';
                    fs.stat(filePath, (err2, stats2) => {
                        if (err2 || !stats2.isFile()) {
                            clientRes.writeHead(404, { 'Content-Type': 'text/plain' });
                            clientRes.end('404 Not Found');
                        } else {
                            serveStaticFile(filePath, clientRes, requestId);
                        }
                    });
                } else {
                    clientRes.writeHead(404, { 'Content-Type': 'text/plain' });
                    clientRes.end('404 Not Found');
                }
            } else {
                serveStaticFile(filePath, clientRes, requestId);
            }
        });
        return;
    }

    const parsedTarget = url.parse(targetUrl);
    const isHttps = parsedTarget.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Prepare request options
    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || (isHttps ? 443 : 80),
        path: parsedTarget.path,
        method: clientReq.method,
        headers: { ...clientReq.headers }
    };

    // Remove hop-by-hop headers
    delete options.headers['connection'];
    delete options.headers['host'];
    delete options.headers['proxy-connection'];
    delete options.headers['proxy-authorization'];

    // Make request to target
    const proxyReq = httpModule.request(options, (proxyRes) => {
        const duration = Date.now() - startTime;
        log.info(`[${requestId}] ${proxyRes.statusCode} ${duration}ms`);

        // Set response headers
        clientRes.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            'X-Proxy-Server': 'node-proxy',
            'X-Request-ID': requestId
        });

        // Pipe response
        proxyRes.pipe(clientRes);
    });

    // Handle errors
    proxyReq.on('error', (err) => {
        const duration = Date.now() - startTime;
        log.error(`[${requestId}] Error: ${err.message} (${duration}ms)`);
        
        if (!clientRes.headersSent) {
            clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
            clientRes.end(`Proxy Error: ${err.message}`);
        }
    });

    clientReq.on('error', (err) => {
        log.error(`[${requestId}] Client error: ${err.message}`);
        proxyReq.destroy();
    });

    // Pipe request body
    clientReq.pipe(proxyReq);
});

// Start server
server.listen(PORT, () => {
    log.info(`Server started on port ${PORT}`);
    log.info(`Serving static files from: ${STATIC_DIR}`);
    if (TARGET_URL) {
        log.info(`Reverse proxy mode: forwarding to ${TARGET_URL}`);
    } else {
        log.info('Static file server mode');
        log.info('To proxy a request, use: ?proxy=http://example.com or X-Proxy-Target header');
    }
    log.info(`Access at http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        log.error(`Port ${PORT} is already in use`);
    } else {
        log.error(`Server error: ${err.message}`);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    log.info('Shutting down proxy server...');
    server.close(() => {
        log.info('Proxy server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    log.info('Shutting down proxy server...');
    server.close(() => {
        log.info('Proxy server stopped');
        process.exit(0);
    });
});

