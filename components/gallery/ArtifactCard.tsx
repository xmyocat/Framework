'use client';

import { Artifact } from '@/types';
import { Play, FileText, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { useState } from 'react';
// import Image from 'next/image'; // Unused, preferring img tag for data/blob URLs for now

interface ArtifactCardProps {
    artifact: Artifact;
    onClick: (artifact: Artifact) => void;
    onDoubleClick?: (artifact: Artifact) => void;
    onDelete?: (artifact: Artifact) => void;
}

export default function ArtifactCard({ artifact, onClick, onDoubleClick, onDelete }: ArtifactCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setShowDeleteConfirm(true);
    };

    const confirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(artifact);
        setShowDeleteConfirm(false);
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };
    return (
        <div
            onClick={() => onClick(artifact)}
            onDoubleClick={() => onDoubleClick?.(artifact)}
            className="break-inside-avoid mb-4 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
        >
            {/* Thumbnail / Content Preview */}
            <div className="relative">
                {/* Delete Button Overlay */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleDelete}
                        className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                        title="Delete artifact"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs mx-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Delete Artifact?</h3>
                            <p className="text-sm text-slate-600 mb-4">This action cannot be undone.</p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={cancelDelete}
                                    className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {artifact.type === 'image' && artifact.file_urls?.[0] && (
                    <div className="relative w-full">
                        {/* Using standard img tag for data URLs or external storage URLs if next/image config isn't set up for them yet */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={artifact.file_urls[0]}
                            alt="Artifact"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {artifact.type === 'video' && artifact.file_urls?.[0] && (
                    <div className="relative w-full bg-black">
                        <video
                            src={artifact.file_urls[0]}
                            className="w-full h-auto object-cover"
                            controls={false} // No controls in card view, play on click/hover? Or just thumbnail.
                        // For now, let's show a play overlay
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-violet-500">
                                <Video size={20} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                )}

                {artifact.type === 'audio' && (
                    <div className="h-24 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500">
                            <Play size={20} fill="currentColor" />
                        </div>
                        {/* Placeholder waveform visual */}
                        <div className="absolute bottom-2 left-0 right-0 h-8 flex items-end justify-center gap-0.5 px-4 opacity-30">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-1 bg-red-500" style={{ height: `${Math.random() * 100}%` }}></div>
                            ))}
                        </div>
                    </div>
                )}

                {artifact.type === 'text' && (
                    <div className="bg-amber-50 p-4 min-h-[8rem]">
                        <FileText className="text-amber-300 mb-2" size={24} />
                        <p className="text-slate-700 font-medium line-clamp-3 leading-relaxed">
                            {artifact.text_content || "No content"}
                        </p>
                    </div>
                )}
            </div>

            {/* Meta Info */}
            <div className="p-3">
                {/* Type Icon & Time */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1 capitalize">
                        {artifact.type === 'image' && <ImageIcon size={12} />}
                        {artifact.type === 'audio' && <Play size={12} />}
                        {artifact.type === 'video' && <Video size={12} />}
                        {artifact.type === 'text' && <FileText size={12} />}
                        {artifact.type}
                    </span>
                    <span>{new Date(artifact.created_at).toLocaleDateString()}</span>
                </div>

                {/* Transcript Snippet for Audio */}
                {artifact.type === 'audio' && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                        {artifact.transcript ? (
                            <span className="italic">&quot;{artifact.transcript}&quot;</span>
                        ) : (
                            <span className="text-slate-400 italic text-xs">
                                {artifact.processed ? 'No transcript available' : 'Processing transcript...'}
                            </span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
