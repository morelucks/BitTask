'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserSession, AppConfig, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// Determine network based on environment
const network = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

// Create app config
const getAppDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_STACKS_DOMAIN || 'http://localhost:3000';
};

const appConfig = new AppConfig(['store_write', 'publish_data'], getAppDomain());

interface StacksWalletContextType {
  userSession: UserSession;
  isConnected: boolean;
  address: string | undefined;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

export function StacksWalletProvider({ children }: { children: ReactNode }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsConnected(true);
      setAddress(userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet);
    } else {
      setIsConnected(false);
      setAddress(undefined);
    }
    setIsLoading(false);

    // Listen for authentication changes
    const handleStorageChange = () => {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        setIsConnected(true);
        setAddress(userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet);
      } else {
        setIsConnected(false);
        setAddress(undefined);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userSession]);

  const connectWallet = async () => {
    try {
      await showConnect({
        appDetails: {
          name: 'BitTask',
          icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
        },
        redirectTo: '/',
        onFinish: () => {
          if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            setIsConnected(true);
            setAddress(userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet);
          }
        },
        userSession,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setAddress(undefined);
  };

  return (
    <StacksWalletContext.Provider
      value={{
        userSession,
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
        isLoading,
      }}
    >
      {children}
    </StacksWalletContext.Provider>
  );
}

export function useStacksWallet() {
  const context = useContext(StacksWalletContext);
  if (context === undefined) {
    throw new Error('useStacksWallet must be used within a StacksWalletProvider');
  }
  return context;
}

