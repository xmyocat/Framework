'use client';

import React, { useState } from 'react';
import ArtifactGrid from '@/components/gallery/ArtifactGrid';
import FilterBar, { FilterType } from '@/components/gallery/FilterBar';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import ArtifactLightbox from '@/components/gallery/ArtifactLightbox';
import { Artifact } from '@/types';

export default function GalleryPage() {
    const { artifacts, loading } = useArtifacts();
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const supabase = createClient();

    // Check auth on mount
    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
            }
        };
        checkUser();
    }, []);

    const filteredArtifacts = artifacts.filter(art => {
        const matchesType = filter === 'all' || art.type === filter;
        const matchesSearch = search === '' ||
            art.text_content?.toLowerCase().includes(search.toLowerCase()) ||
            art.transcript?.toLowerCase().includes(search.toLowerCase()) ||
            art.subject?.toLowerCase().includes(search.toLowerCase());

        return matchesType && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Gallery</h1>
                        <Link href="/capture" className="text-blue-600 font-medium text-sm">
                            + Capture
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search your learning..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <FilterBar currentFilter={filter} onFilterChange={setFilter} />
                </div>
            </header>

            {/* Grid */}
            <main className="p-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    </div>
                ) : (
                    <ArtifactGrid
                        artifacts={filteredArtifacts}
                        onArtifactClick={(art) => setSelectedArtifact(art)} // Single click now opens it too? User asked for double click. 
                        // I will make single click act as selection or "view details" and double click as fullscreen.
                        // Actually, looking at `ArtifactLightbox`, it IS the fullscreen view.
                        // If I bind `onArtifactClick` to `setSelectedArtifact`, single click opens it.
                        // The user specifically asked: "double click/double tap to fullscreen".
                        // This implies single click might do something else or nothing.
                        // If I map onClick -> setSelectedArtifact, user gets fullscreen on single click.
                        // If I map onDoubleClick -> setSelectedArtifact, user gets it on double.
                        // But what about single click? Currently it logs to console.
                        // I'll map BOTH for now to be safe, or just onDoubleClick if adhering strictly.
                        // "double click/double tap to fullscreen a photo/video"
                        // I'll make single click harmless (maybe just console log or select highlight), and double click open lightbox.
                        // BUT on mobile "double tap" is tricky if single tap doesn't do anything visible.
                        // Let's implement double click for lightbox, and keep single click as console log for now.
                        onArtifactDoubleClick={(art) => setSelectedArtifact(art)}
                    />
                )}
            </main>

            {selectedArtifact && (
                <ArtifactLightbox
                    artifact={selectedArtifact}
                    onClose={() => setSelectedArtifact(null)}
                />
            )}
        </div>
    );
}
