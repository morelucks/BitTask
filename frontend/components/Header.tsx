'use client';

import { useStacksWallet } from '../lib/stacks-wallet';
import { Loader2, Wallet, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export function Header() {
    const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useStacksWallet();

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return '';
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">BitTask</span>
                </Link>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : isConnected ? (
                        <div className="flex items-center gap-2">
                            <Link href="/create">
                                <Button variant="outline" size="sm" className="hidden sm:flex">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </Link>

                            <Badge variant="outline" className="hidden sm:flex font-mono">
                                {formatAddress(address)}
                            </Badge>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={disconnectWallet}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <LogOut className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Disconnect</span>
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={connectWallet} size="sm">
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
