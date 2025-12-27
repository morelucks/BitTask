'use client'

import { createAppKit } from '@reown/appkit/react'
import { bitcoinAdapter, projectId, networks, metadata } from '@/config'
import React, { ReactNode } from 'react'

// Create the modal
createAppKit({
    adapters: [bitcoinAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    }
})

export function AppKitProvider({ children }: { children: ReactNode }) {
    return (
        <>{children}</>
    )
}
