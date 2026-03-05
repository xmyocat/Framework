'use client';

import React from 'react';
import { Artifact } from '@/types';
import ArtifactCard from './ArtifactCard';

interface ArtifactGridProps {
    artifacts: Artifact[];
    onArtifactClick: (artifact: Artifact) => void;
    onArtifactDoubleClick?: (artifact: Artifact) => void;
}

export default function ArtifactGrid({ artifacts, onArtifactClick, onArtifactDoubleClick }: ArtifactGridProps) {
    if (artifacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📭</span>
                </div>
                <h3 className="text-slate-900 font-medium text-lg">No artifacts yet</h3>
                <p className="text-slate-500 mt-1">Capture something to get started!</p>
            </div>
        );
    }

    return (
        /* Masonry Layout using Tailwind columns */
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-1">
            {artifacts.map((artifact) => (
                <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onClick={onArtifactClick}
                    onDoubleClick={onArtifactDoubleClick}
                />
            ))}
        </div>
    );
}
