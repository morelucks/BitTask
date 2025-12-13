'use client';

import { useAuth } from './Providers';
import { Wallet } from 'lucide-react';

export function Navbar() {
    const { isConnected, walletInfo, bnsName, connectWallet, disconnectWallet } = useAuth();

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
            <div className="text-xl font-bold">BitTask</div>
            <div>
                {isConnected ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-300">
                            {bnsName || walletInfo?.addresses[2]?.address || walletInfo?.addresses[0]?.address}
                        </span>
                        <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
                    >
                        <Wallet size={18} />
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    );
}
