'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Grid } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-40 pb-safe">
            <Link
                href="/capture"
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/capture') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <Camera size={24} strokeWidth={isActive('/capture') ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Capture</span>
            </Link>

            <Link
                href="/gallery"
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/gallery') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                <Grid size={24} strokeWidth={isActive('/gallery') ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Gallery</span>
            </Link>
        </nav>
    );
}
