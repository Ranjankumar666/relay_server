import { relayServerStart } from './relay.js';
import http from 'http';
import httpProxy from 'http-proxy';

const RELAY_PORT = process.env.RELAY_PORT | '8080';
const PORT = process.env.PORT;

// Create a proxy server
const proxy = httpProxy.createProxyServer({
	target: 'ws://localhost:' + RELAY_PORT, // target WebSocket server
	ws: true, // enable websocket proxying
});

// Create HTTP server and pass upgrades to proxy
const server = http.createServer((req, res) => {
	proxy.web(req, res);
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
	proxy.ws(req, socket, head);
});

server.listen(PORT, async () => {
	console.log('WebSocket reverse proxy running on http://localhost:3000');
	await relayServerStart();
});
