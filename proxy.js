import http from 'http';
import httpProxy from 'http-proxy';
import { relayServerStart } from './relay.js';

const RELAY_PORT = process.env.RELAY_PORT || 8080;
const PORT = process.env.PORT || 4000;

const proxy = httpProxy.createProxyServer({
	target: `http://127.0.0.1:${RELAY_PORT}`,
	ws: true, // Enable websocket proxying
});

// Create server to handle HTTP requests
const server = http.createServer((req, res) => {
	proxy.web(req, res);
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
	proxy.ws(req, socket, head);
});

server.listen(PORT, async () => {
	console.log(
		`Reverse proxy listening on port ${PORT}, forwarding to ${RELAY_PORT}`
	);
	await relayServerStart();
});
