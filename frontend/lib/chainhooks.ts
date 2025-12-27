import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const apiKey = process.env.CHAINHOOKS_API_KEY;
const network = process.env.CHAINHOOKS_NETWORK || 'testnet'; // default to testnet

if (!apiKey) {
    console.warn('CHAINHOOKS_API_KEY is not set. Chainhooks client may fail to authenticate if operations require it.');
}

const baseUrl = network === 'mainnet' ? CHAINHOOKS_BASE_URL.mainnet : CHAINHOOKS_BASE_URL.testnet;

export const chainhooksClient = new ChainhooksClient({
    baseUrl,
    apiKey: apiKey || '',
});

export const getChainhooksNetwork = () => network;
