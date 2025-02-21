import { noise } from '@chainsafe/libp2p-noise';
import { webSockets } from '@libp2p/websockets';
import { yamux } from '@chainsafe/libp2p-yamux';
import { createLibp2p } from 'libp2p';
import { circuitRelayServer } from '@libp2p/circuit-relay-v2';
const port = process.env['port'] || 4000;

const relayServer = await createLibp2p({
	addresses: {
		listen: [`/ip4/0.0.0.0/tcp/${port}/wss`],
	},
	transports: [webSockets()],
	connectionEncrypters: [noise()],
	streamMuxers: [yamux()],
	services: {
		relay: new circuitRelayServer(),
	},
});

(async () => {
	await relayServer.start();
	console.log('Relay Node ID -->', relayServer.peerId.toString());
	console.log(
		'Multiaddrs -->',
		relayServer.getMultiaddrs().map((s) => s.toString())
	);
})();
