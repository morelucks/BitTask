'use client';

import { StacksWalletProvider, useStacksWallet } from '../lib/stacks-wallet';
import { createContext, useContext, ReactNode } from 'react';

// Simplified context for backward compatibility
interface AuthContextType {
    isConnected: boolean;
    address: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
    return (
        <StacksWalletProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </StacksWalletProvider>
    );
}

function AuthProvider({ children }: { children: ReactNode }) {
    const { isConnected, address } = useStacksWallet();

    return (
        <AuthContext.Provider value={{ isConnected, address }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context || { isConnected: false, address: undefined };
};
