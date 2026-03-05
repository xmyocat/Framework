'use client';

import { useSync } from '@/lib/hooks/useSync';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SyncStatus() {
    const { isOnline, isSyncing, pendingCount } = useSync();

    if (!isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 z-50">
                <WifiOff size={12} />
                <span>Offline</span>
            </div>
        );
    }

    if (isSyncing) {
        return (
            <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 z-50">
                <RefreshCw size={12} className="animate-spin" />
                <span>Syncing {pendingCount} items...</span>
            </div>
        );
    }

    if (pendingCount > 0) {
        return (
            <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 z-50">
                <RefreshCw size={12} />
                <span>{pendingCount} items pending sync</span>
            </div>
        );
    }

    return null;
}
