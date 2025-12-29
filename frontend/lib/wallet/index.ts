/**
 * Unified Wallet Integration
 * 
 * This module provides a unified interface for wallet integration,
 * supporting multiple wallet SDKs through an abstraction layer.
 * 
 * Current Implementation:
 * - @stacks/connect (Production) - Official Stacks SDK
 * 
 * Future Support (when available):
 * - Reown AppKit - If Stacks support is added
 * - Reown WalletKit - For wallet developers
 */

export { WalletProviderRegistry, WalletDetector, STACKS_NETWORKS } from './abstraction';
export type {
  WalletProvider,
  WalletConnection,
  WalletAccount,
  TransactionRequest,
  TransactionResult,
  NetworkInfo,
} from './abstraction';

export { StacksConnectProvider } from './stacks-provider';
export { ReownAppKitProvider, ReownWalletKitProvider } from './reown-provider';

/**
 * Create and configure wallet provider registry
 */
export function createWalletRegistry() {
  const registry = new WalletProviderRegistry();
  
  // Register Stacks Connect provider (current implementation)
  const stacksProvider = new StacksConnectProvider();
  registry.register('stacks-connect', stacksProvider);
  
  // Register Reown AppKit provider (future support)
  const reownProvider = new ReownAppKitProvider();
  registry.register('reown-appkit', reownProvider);
  
  // Auto-detect and set recommended provider
  const recommended = WalletDetector.getRecommendedProvider();
  if (recommended && registry.getAvailableProviders().includes(recommended)) {
    registry.setProvider(recommended);
  } else {
    // Fallback to Stacks Connect
    registry.setProvider('stacks-connect');
  }
  
  return registry;
}

/**
 * Get the default wallet provider
 * Currently returns Stacks Connect, but could return Reown in the future
 */
export function getDefaultWalletProvider() {
  const registry = createWalletRegistry();
  return registry.getProvider();
}

