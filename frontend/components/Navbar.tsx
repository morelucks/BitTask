'use client';

import { useAuth } from './Providers';
import { useStacksWallet } from '../lib/stacks-wallet';
import { Loader2, Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
    const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useStacksWallet();

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return '';
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 text-white">
            <Link href="/" className="text-xl font-bold hover:text-indigo-400 transition-colors">
                BitTask
            </Link>
            <div className="flex items-center gap-4">
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : isConnected ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
                            <Wallet className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm font-mono">{formatAddress(address)}</span>
                        </div>
                        <button
                            onClick={disconnectWallet}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                    >
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    );
}
