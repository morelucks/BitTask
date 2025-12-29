/**
 * Wallet Abstraction Layer
 * 
 * This abstraction allows the app to support multiple wallet SDKs:
 * - @stacks/connect (current implementation for Stacks)
 * - Reown AppKit/WalletKit (future support if Stacks is added)
 * 
 * The abstraction provides a unified interface regardless of the underlying SDK.
 */

export interface WalletProvider {
  name: string;
  isAvailable: () => boolean;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
  getAccount: () => Promise<WalletAccount | null>;
  signTransaction: (transaction: TransactionRequest) => Promise<TransactionResult>;
  getNetwork: () => Promise<NetworkInfo>;
}

export interface WalletConnection {
  address: string;
  network: NetworkInfo;
  provider: string;
}

export interface WalletAccount {
  address: string;
  network: NetworkInfo;
  balance?: string;
}

export interface TransactionRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  postConditions?: any[];
  network: NetworkInfo;
}

export interface TransactionResult {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface NetworkInfo {
  chainId: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

/**
 * Wallet Provider Registry
 * Manages multiple wallet providers and allows switching between them
 */
export class WalletProviderRegistry {
  private providers: Map<string, WalletProvider> = new Map();
  private currentProvider: WalletProvider | null = null;

  register(name: string, provider: WalletProvider): void {
    this.providers.set(name, provider);
  }

  async setProvider(name: string): Promise<void> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Wallet provider ${name} not found`);
    }
    if (!provider.isAvailable()) {
      throw new Error(`Wallet provider ${name} is not available`);
    }
    this.currentProvider = provider;
  }

  getProvider(): WalletProvider | null {
    return this.currentProvider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  async connect(): Promise<WalletConnection> {
    if (!this.currentProvider) {
      throw new Error('No wallet provider selected');
    }
    return this.currentProvider.connect();
  }

  async disconnect(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.disconnect();
    }
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.currentProvider) {
      return null;
    }
    return this.currentProvider.getAccount();
  }

  async signTransaction(request: TransactionRequest): Promise<TransactionResult> {
    if (!this.currentProvider) {
      throw new Error('No wallet provider selected');
    }
    return this.currentProvider.signTransaction(request);
  }
}

/**
 * Network Configuration
 */
export const STACKS_NETWORKS: Record<string, NetworkInfo> = {
  mainnet: {
    chainId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    name: 'Stacks Mainnet',
    rpcUrl: 'https://api.stacks.co',
    explorerUrl: 'https://explorer.stacks.co',
  },
  testnet: {
    chainId: '0x0000000000000000000000000000000000000000000000000000000000000002',
    name: 'Stacks Testnet',
    rpcUrl: 'https://api.testnet.stacks.co',
    explorerUrl: 'https://explorer.stacks.co',
  },
};

/**
 * Wallet Provider Detection
 * Automatically detects available wallet providers
 */
export class WalletDetector {
  static detectStacksWallets(): string[] {
    const wallets: string[] = [];
    
    // Check for Leather (formerly Hiro Wallet)
    if (typeof window !== 'undefined' && (window as any).LeatherProvider) {
      wallets.push('leather');
    }
    
    // Check for Xverse
    if (typeof window !== 'undefined' && (window as any).XverseProvider) {
      wallets.push('xverse');
    }
    
    // Check for generic Stacks wallet
    if (typeof window !== 'undefined' && (window as any).stacks) {
      wallets.push('stacks-generic');
    }
    
    return wallets;
  }

  static detectReownWallets(): boolean {
    // Check if Reown AppKit is available
    if (typeof window !== 'undefined') {
      // Reown AppKit would inject these
      return !!(window as any).WalletConnect || !!(window as any).AppKit;
    }
    return false;
  }

  static getRecommendedProvider(): string {
    const stacksWallets = this.detectStacksWallets();
    if (stacksWallets.length > 0) {
      return 'stacks-connect'; // Use @stacks/connect
    }
    
    if (this.detectReownWallets()) {
      return 'reown-appkit'; // Would use Reown if Stacks support existed
    }
    
    return 'stacks-connect'; // Default fallback
  }
}

