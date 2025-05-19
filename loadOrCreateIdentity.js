import fs from 'fs';
import path from 'path';
import { keys } from '@libp2p/crypto';
const keyFile = './peerkey.key';

export async function loadOrCreateIdentity() {
	if (fs.existsSync(keyFile)) {
		const pem = fs.readFileSync(keyFile);

		return keys.privateKeyFromRaw(pem);
	}

	const key = await keys.generateKeyPair('Ed25519');

	fs.writeFileSync(keyFile, key.raw, { mode: 0o600 });
	return key;
}
