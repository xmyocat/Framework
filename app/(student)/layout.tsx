import React from 'react';
import BottomNav from '@/components/navigation/BottomNav';
import SyncStatus from '@/components/ui/SyncStatus';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-[100dvh]">
            <SyncStatus />
            <div className="flex-1 overflow-y-auto pb-20 pt-6"> {/* Added pt-6 to account for potential banner, though banner is fixed overlay */}
                {children}
            </div>
            <BottomNav />
        </div>
    );
}
