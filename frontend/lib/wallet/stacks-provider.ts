/**
 * Stacks Connect Wallet Provider Implementation
 * 
 * Implements the WalletProvider interface using @stacks/connect
 * This is the current production implementation for Stacks blockchain.
 */

import { UserSession, AppConfig, showConnect, openContractCall } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import type {
  WalletProvider,
  WalletConnection,
  WalletAccount,
  TransactionRequest,
  TransactionResult,
  NetworkInfo,
} from './abstraction';
import { STACKS_NETWORKS } from './abstraction';

export class StacksConnectProvider implements WalletProvider {
  name = 'stacks-connect';
  private userSession: UserSession;
  private network: typeof STACKS_MAINNET | typeof STACKS_TESTNET;

  constructor() {
    const networkEnv = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
      ? STACKS_MAINNET 
      : STACKS_TESTNET;
    this.network = networkEnv;

    const appConfig = new AppConfig(
      ['store_write', 'publish_data'],
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    this.userSession = new UserSession({ appConfig });
  }

  isAvailable(): boolean {
    // @stacks/connect is always available (it's a library, not a browser extension)
    // But we check if user has a Stacks wallet installed
    return typeof window !== 'undefined' && (
      !!(window as any).LeatherProvider ||
      !!(window as any).XverseProvider ||
      !!(window as any).stacks
    );
  }

  async connect(): Promise<WalletConnection> {
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'BitTask',
          icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
        },
        redirectTo: '/',
        onFinish: () => {
          if (this.userSession.isUserSignedIn()) {
            const userData = this.userSession.loadUserData();
            const address = userData.profile?.stxAddress?.mainnet || 
                          userData.profile?.stxAddress?.testnet || '';
            
            const networkInfo = this.network === STACKS_MAINNET 
              ? STACKS_NETWORKS.mainnet 
              : STACKS_NETWORKS.testnet;

            resolve({
              address,
              network: networkInfo,
              provider: this.name,
            });
          } else {
            reject(new Error('Failed to connect wallet'));
          }
        },
        onCancel: () => {
          reject(new Error('User cancelled wallet connection'));
        },
        userSession: this.userSession,
      });
    });
  }

  async disconnect(): Promise<void> {
    this.userSession.signUserOut();
  }

  async getAccount(): Promise<WalletAccount | null> {
    if (!this.userSession.isUserSignedIn()) {
      return null;
    }

    const userData = this.userSession.loadUserData();
    const address = userData.profile?.stxAddress?.mainnet || 
                    userData.profile?.stxAddress?.testnet || '';

    if (!address) {
      return null;
    }

    const networkInfo = this.network === STACKS_MAINNET 
      ? STACKS_NETWORKS.mainnet 
      : STACKS_NETWORKS.testnet;

    return {
      address,
      network: networkInfo,
    };
  }

  async signTransaction(request: TransactionRequest): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: request.contractAddress,
        contractName: request.contractName,
        functionName: request.functionName,
        functionArgs: request.functionArgs,
        postConditions: request.postConditions,
        network: this.network,
        userSession: this.userSession,
        onFinish: (data) => {
          const txId = data?.txId || data?.txid || data?.response?.txid || 
                      data?.stacksTransaction?.txid();
          
          if (txId) {
            resolve({
              txId,
              status: 'pending',
            });
          } else {
            reject(new Error('Failed to get transaction ID'));
          }
        },
        onCancel: () => {
          reject(new Error('User cancelled transaction'));
        },
      });
    });
  }

  async getNetwork(): Promise<NetworkInfo> {
    return this.network === STACKS_MAINNET 
      ? STACKS_NETWORKS.mainnet 
      : STACKS_NETWORKS.testnet;
  }

  getUserSession(): UserSession {
    return this.userSession;
  }
}

