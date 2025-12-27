'use client';

import { AppKitProvider as ReownAppKitProvider } from '@/context';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Simplified context for backward compatibility if needed, 
// but we encourage using useAppKit* hooks directly in components.
interface AuthContextType {
    isConnected: boolean;
    address: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ReownAppKitProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ReownAppKitProvider>
    );
}

function AuthProvider({ children }: { children: ReactNode }) {
    const { isConnected, address } = useAppKitAccount();

    return (
        <AuthContext.Provider value={{ isConnected, address }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    // If used outside of provider, it might be undefined, but we ensure it's wrapped.
    // However, for Reown, we can also just discourage useAuth and use hooks directly.
    return context || { isConnected: false, address: undefined };
};
