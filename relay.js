import 'dotenv/config';
import { noise } from '@chainsafe/libp2p-noise';
import { webSockets } from '@libp2p/websockets';
import { yamux } from '@chainsafe/libp2p-yamux';
import { createLibp2p } from 'libp2p';
import { circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
import { autoNAT } from '@libp2p/autonat';
import { tcp } from '@libp2p/tcp';
import { loadOrCreateIdentity } from './loadOrCreateIdentity.js';
import { createLibp2p } from '@lib';

const port = process.env.RELAY_PORT || 8080;

const relayServer = await createLibp2p({
	// privateKey: id,
	privateKey: await loadOrCreateIdentity(),
	addresses: {
		listen: [`/ip4/0.0.0.0/tcp/${port}/ws`],
	},
	transports: [tcp(), webSockets()],
	connectionEncrypters: [noise()],
	streamMuxers: [yamux()],
	services: {
		identify: identify(),
		relay: circuitRelayServer({
			hopTimeout: 120 * 1000,
		}),
		autoNAT: autoNAT(),
	},
	connectionGater: {
		denyDialMultiaddr: () => false,
		denyInboundRelayReservation: () => false,
		denyOutboundRelayReservation: () => false,
	},
	connectionManager: {
		dialTimeout: 60 * 1000,
	},
});

export const relayServerStart = async () => {
	await relayServer.start();
	console.log('🚀 Relay Node ID:', relayServer.peerId.toString());
	console.log(
		'🌍 Multiaddrs:',
		relayServer.getMultiaddrs().map((s) => s.toString())
	);

	relayServer.addEventListener('peer:connect', (evt) => {
		console.log(`✅ New peer connected: ${evt.detail.toString()}`);
	});

	relayServer.addEventListener('peer:disconnect', (evt) => {
		console.log(`❌ Peer disconnected: ${evt.detail.toString()}`);
		// console.log(relayServer.services.relay.reservations.size);
	});

	relayServer.services.relay.addEventListener(
		'relay:advert:success',
		(evt) => {
			console.log(`Relay Advert Success: ${evt.detail.toString()}`);
		}
	);

	relayServer.services.relay.addEventListener('relay:advert:err', (evt) => {
		console.log(`Relay Advert Failure: ${evt.detail.toString()}`);
	});

	relayServer.services.relay.addEventListener('relay:reservation', (evt) => {
		console.log(`Relay Reservation: ${evt.detail.toString()}`);
	});
};
