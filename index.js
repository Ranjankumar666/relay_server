import { noise } from '@chainsafe/libp2p-noise';
import { webSockets } from '@libp2p/websockets';
import { yamux } from '@chainsafe/libp2p-yamux';
import { createLibp2p } from 'libp2p';
import { circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { webRTC } from '@libp2p/webrtc';
import { identify } from '@libp2p/identify';

const port = process.env.PORT || 8080;
const railwayDomain = 'relayserver-production-adeb.up.railway.app'; // Replace with actual Railway domain

const relayServer = await createLibp2p({
	addresses: {
		listen: [
			`/ip4/0.0.0.0/tcp/${port}/ws`, // Allows connections from anywhere
			`/dns4/${railwayDomain}/tcp/${port}/ws`, // Allows clients to use
		],
	},
	transports: [webSockets(), webRTC()],
	connectionEncrypters: [noise()],
	streamMuxers: [yamux()],
	services: {
		identify: identify(),
		relay: circuitRelayServer({
			advertise: true,
			reservations: true,
		}),
	},
});

(async () => {
	await relayServer.start();
	console.log('🚀 Relay Node ID:', relayServer.peerId.toString());
	console.log(
		'🌍 Multiaddrs:',
		relayServer.getMultiaddrs().map((s) => s.toString())
	);
})();
