/**
 * DM HUD Development Server
 * 
 * A simple HTTP server for local development of the DM HUD application.
 * Uses Node.js built-in HTTP server to serve static files.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Default port
let PORT = 8080;

// Check if a port is specified as a command line argument
const portArg = process.argv.find(arg => arg.startsWith('--port='));
if (portArg) {
    PORT = parseInt(portArg.split('=')[1], 10);
}

/**
 * Check if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - Promise that resolves to true if port is available, false otherwise
 */
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => {
                tester.close();
                resolve(true);
            })
            .listen(port);
    });
}

/**
 * Find an available port starting from the given port
 * @param {number} startPort - The port to start checking from
 * @returns {Promise<number>} - Promise that resolves to an available port
 */
async function findAvailablePort(startPort) {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > startPort + 100) {
            throw new Error('Could not find an available port after 100 attempts');
        }
    }
    return port;
}

/**
 * Start the HTTP server
 */
async function startServer() {
    try {
        // Find an available port
        PORT = await findAvailablePort(PORT);
        
        // Create HTTP server
        const server = http.createServer((req, res) => {
            // Get the file path
            let filePath = '.' + req.url;
            if (filePath === './') {
                filePath = './index.html';
            }
            
            // Get the file extension
            const extname = path.extname(filePath);
            let contentType = 'text/html';
            
            // Set the content type based on the file extension
            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
            }
            
            // Read the file
            fs.readFile(filePath, (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        // File not found
                        console.log(`404: ${filePath}`);
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        // Server error
                        console.error(`Server error: ${error.code}`);
                        res.writeHead(500);
                        res.end(`Server Error: ${error.code}`);
                    }
                } else {
                    // Success
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });
        
        // Start listening
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log('Press Ctrl+C to stop the server');
        });
        
        // Handle server errors
        server.on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });
        
        // Handle process termination
        process.on('SIGINT', () => {
            console.log('Server stopped');
            server.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

// Start the server
startServer(); 