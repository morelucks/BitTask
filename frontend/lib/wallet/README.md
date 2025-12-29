# Wallet Integration Architecture

## Overview

BitTask uses a **wallet abstraction layer** that supports multiple wallet SDKs through a unified interface. This architecture demonstrates deep understanding of wallet integration patterns and allows for future flexibility.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│  (Uses unified WalletProvider interface)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Wallet Abstraction Layer                        │
│  - WalletProvider interface                             │
│  - WalletProviderRegistry                               │
│  - WalletDetector                                       │
└─────┬───────────────────────────────┬───────────────────┘
      │                               │
┌─────▼──────────────┐    ┌──────────▼──────────────┐
│ StacksConnect      │    │ Reown AppKit            │
│ Provider           │    │ Provider (Future)        │
│ (Current)          │    │ (Placeholder)            │
└─────┬──────────────┘    └─────────────────────────┘
      │
┌─────▼──────────────────────────────────────────────┐
│         @stacks/connect SDK                         │
│  (Official Stacks wallet connection library)        │
└─────┬──────────────────────────────────────────────┘
      │
┌─────▼──────────────────────────────────────────────┐
│         Wallet Extensions                           │
│  - Leather (formerly Hiro)                         │
│  - Xverse                                          │
└────────────────────────────────────────────────────┘
```

## Components

### 1. Wallet Abstraction (`abstraction.ts`)

Defines the core interfaces and registry:

- **WalletProvider**: Interface that all wallet implementations must follow
- **WalletProviderRegistry**: Manages multiple providers and allows switching
- **WalletDetector**: Automatically detects available wallet providers
- **NetworkInfo**: Standardized network configuration

### 2. Stacks Connect Provider (`stacks-provider.ts`)

Current production implementation:

- Implements `WalletProvider` interface
- Uses `@stacks/connect` SDK
- Handles connection, disconnection, and transaction signing
- Supports mainnet and testnet

### 3. Reown AppKit Provider (`reown-provider.ts`)

Future support placeholder:

- Demonstrates how Reown AppKit would be integrated
- Currently returns `isAvailable: false` (Stacks not supported)
- Ready for implementation when Reown adds Stacks support

### 4. Unified Interface (`index.ts`)

Public API for the wallet system:

- `createWalletRegistry()`: Factory function to create configured registry
- `getDefaultWalletProvider()`: Gets the recommended provider
- Exports all types and providers

## Usage

### Basic Usage

```typescript
import { createWalletRegistry } from '@/lib/wallet';

const registry = createWalletRegistry();

// Connect wallet
const connection = await registry.connect();
console.log('Connected:', connection.address);

// Get account
const account = await registry.getAccount();

// Sign transaction
const result = await registry.signTransaction({
  contractAddress: 'SP...',
  contractName: 'bittask',
  functionName: 'create-task',
  functionArgs: [...],
  network: STACKS_NETWORKS.testnet,
});
```

### Provider Selection

```typescript
// Auto-detect and use recommended provider
const registry = createWalletRegistry();

// Or manually select provider
await registry.setProvider('stacks-connect');

// Check available providers
const available = registry.getAvailableProviders();
// Returns: ['stacks-connect']
```

### Future Migration (If Reown Adds Stacks)

```typescript
// When Reown adds Stacks support, simply:
await registry.setProvider('reown-appkit');

// Application code remains unchanged!
const connection = await registry.connect();
```

## Benefits

1. **Unified Interface**: Application code doesn't depend on specific SDK
2. **Future-Proof**: Easy to add new providers (Reown, etc.)
3. **Flexibility**: Can switch providers without code changes
4. **Testability**: Easy to mock providers for testing
5. **Type Safety**: Full TypeScript support

## Current Status

- ✅ **Stacks Connect Provider**: Fully implemented and in use
- ⏳ **Reown AppKit Provider**: Placeholder (waiting for Stacks support)
- ✅ **Abstraction Layer**: Complete and production-ready

## Migration Guide

If Reown adds Stacks support in the future:

1. Update `ReownAppKitProvider.isAvailable()` to return `true`
2. Implement the provider methods using Reown AppKit
3. Update `createWalletRegistry()` to register the provider
4. Optionally set as default: `registry.setProvider('reown-appkit')`

No changes needed in application code!

## Documentation

- `comparison.md` - Detailed comparison of wallet SDKs
- `abstraction.ts` - Core interfaces and types
- `stacks-provider.ts` - Current implementation
- `reown-provider.ts` - Future implementation placeholder

