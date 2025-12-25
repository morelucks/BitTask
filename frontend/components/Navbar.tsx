'use client';

import { useAuth } from './Providers';

export function Navbar() {
    // We can rely on <appkit-button /> to handle the UI for connected state.
    // It shows "Connect Wallet" when disconnected, and the address/balance/profile when connected.

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
            <div className="text-xl font-bold">BitTask</div>
            <div>
                <appkit-button />
            </div>
        </nav>
    );
}
