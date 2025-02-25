import 'dotenv/config';
import { noise } from '@chainsafe/libp2p-noise';
import { webSockets } from '@libp2p/websockets';
import { yamux } from '@chainsafe/libp2p-yamux';
import { createLibp2p } from 'libp2p';
import {
	circuitRelayServer,
	circuitRelayTransport,
} from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
import * as filters from '@libp2p/websockets/filters';
import { autoNAT } from '@libp2p/autonat';
import { webRTC } from '@libp2p/webrtc';
import { tcp } from '@libp2p/tcp';

const port = process.env.PORT || 8080;
const railwayDomain = process.env.HOST; // Replace with actual Railway domain

const relayServer = await createLibp2p({
	// privateKey: id,
	addresses: {
		listen: [
			`/ip4/127.0.0.1/tcp/${port}/ws`,
			`/ip4/0.0.0.0/tcp/${port}/ws`,
			'/p2p-circuit',
			'/webrtc',
		],
		appendAnnounce: ['/p2p-circuit'],
	},
	transports: [
		circuitRelayTransport({
			discoverRelays: 0, // Set to 1+ to act as a relay finder
		}),
		tcp(),
		webRTC({
			iceServers: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{ urls: 'stun:stun1.l.google.com:19302' },
			],
		}),
		webSockets({
			filter: filters.all,
		}),
	],
	connectionEncrypters: [noise()],
	streamMuxers: [
		yamux({
			maxMessageSize: 2048,
			maxInboundStreams: 2048,
			maxOutboundStreams: 2048,
		}),
	],
	services: {
		identify: identify(),
		relay: circuitRelayServer({
			advertise: true,
			reservations: {
				// Configure reservations for access control
				maxReservations: 100,
				applyDefaultLimit: true,
				maxInboundStreams: 1000,
				maxOutboundStreams: 1000,
			},
		}),
		autoNAT: autoNAT(),
	},
	connectionManager: {
		maxConnections: 50,
		minConnections: 1,
	},
});

(async () => {
	await relayServer.start();
	console.log('🚀 Relay Node ID:', relayServer.peerId.toString());
	console.log(
		'🌍 Multiaddrs:',
		relayServer.getMultiaddrs().map((s) => s.toString())
	);

	relayServer.addEventListener('peer:connect', (evt) => {
		console.log(`✅ New peer connected: ${evt.detail.toString()}`);
		console.log(evt.detail);

		console.log(relayServer.services.relay.reservations.size);
		// console.log(relayServer.services.relay.reservations.entries());
	});

	relayServer.addEventListener('peer:disconnect', (evt) => {
		console.log(`❌ Peer disconnected: ${evt.detail.toString()}`);
		relayServer.services.relay.reservations.delete(evt.detail);
		console.log(relayServer.services.relay.reservations.size);
	});
})();
