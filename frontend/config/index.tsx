import { cookieStorage, createStorage } from '@reown/appkit/react'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Manually define networks to avoid module resolution issues
export const networks = [
    {
        id: 'bitcoin-mainnet',
        caipNetworkId: 'bip122:000000000019d6689c085ae165831e93',
        chainNamespace: 'bip122',
        name: 'Bitcoin',
        nativeCurrency: {
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8,
        },
        rpcUrls: {
            default: {
                http: ['https://rpc.walletconnect.com/v1'],
            },
        },
        blockExplorers: {
            default: {
                name: 'Mempool',
                url: 'https://mempool.space',
            },
        },
    },
    {
        id: 'bitcoin-testnet',
        caipNetworkId: 'bip122:000000000933ea01ad0ee984209779ba',
        chainNamespace: 'bip122',
        name: 'Bitcoin Testnet',
        nativeCurrency: {
            name: 'Bitcoin',
            symbol: 'tBTC',
            decimals: 8,
        },
        rpcUrls: {
            default: {
                http: ['https://rpc.walletconnect.com/v1'],
            },
        },
        blockExplorers: {
            default: {
                name: 'Mempool',
                url: 'https://mempool.space/testnet',
            },
        },
    },
] as any[]

// Set up the Bitcoin Adapter
export const bitcoinAdapter = new BitcoinAdapter({
    projectId,
})

export const metadata = {
    name: 'BitTask',
    description: 'BitTask - Task Management on Stacks',
    url: 'https://bittask.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}
// Updated networks
// Updated adapter
