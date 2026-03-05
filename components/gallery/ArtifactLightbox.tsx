import React, { useState } from 'react';
import { Artifact } from '@/types';
import { X, Save, Edit2, Trash2 } from 'lucide-react';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { useProcessing } from '@/lib/hooks/useProcessing';

interface ArtifactLightboxProps {
    artifact: Artifact;
    onClose: () => void;
}

export default function ArtifactLightbox({ artifact, onClose }: ArtifactLightboxProps) {
    const { updateArtifact, deleteArtifact: removeArtifact } = useArtifacts();
    const { processArtifact, processing } = useProcessing(); // Use the hook
    const [isEditing, setIsEditing] = useState(false);
    const [textContent, setTextContent] = useState(artifact.text_content || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtifact(artifact.id, { text_content: textContent });
            setIsEditing(false);
        } catch (err) {
            alert('Failed to save changes');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Prevent propagation to close overlay when clicking content
    const stopProp = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="absolute top-4 right-4">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div
                className="max-w-4xl w-full max-h-screen overflow-y-auto flex flex-col items-center justify-center p-4"
                onClick={stopProp}
            >
                {/* Image */}
                {artifact.type === 'image' && artifact.file_urls?.[0] && (
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={artifact.file_urls[0]}
                            alt="Full size"
                            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this artifact?')) {
                                    await removeArtifact(artifact.id);
                                    onClose();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition backdrop-blur-sm"
                        >
                            <Trash2 size={18} />
                            Delete Image
                        </button>
                    </div>
                )}

                {/* Video */}
                {artifact.type === 'video' && artifact.file_urls?.[0] && (
                    <div className="flex flex-col items-center gap-4">
                        <video
                            src={artifact.file_urls[0]}
                            controls
                            autoPlay
                            className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this artifact?')) {
                                    await removeArtifact(artifact.id);
                                    onClose();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition backdrop-blur-sm"
                        >
                            <Trash2 size={18} />
                            Delete Video
                        </button>
                    </div>
                )}

                {/* Audio */}
                {artifact.type === 'audio' && (
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                                <span className="text-4xl">🎤</span>
                            </div>
                            <audio
                                src={artifact.file_urls?.[0]}
                                controls
                                className="w-full"
                            />
                            <div className="w-full mt-4 flex flex-col gap-2">
                                {artifact.transcript ? (
                                    <div className="p-4 bg-slate-50 rounded-xl text-slate-700 max-h-60 overflow-y-auto text-sm leading-relaxed">
                                        <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Transcript</h4>
                                        {artifact.transcript}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500 text-sm mb-3">
                                            {artifact.processed ? 'No transcript available.' : 'Processing transcript...'}
                                        </p>
                                        <button
                                            disabled={processing}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const result = await processArtifact(artifact);
                                                    if (result.success) {
                                                        alert('Processing complete! updating...');
                                                        // Ideally we force a refresh here, but for now the user can close/reopen
                                                        // or we rely on some state update if we had it.
                                                        // Close and reopen is the easiest "refresh" for the lightbox state 
                                                        // unless we update local 'artifact' prop state.
                                                        onClose();
                                                    } else {
                                                        alert(`Processing failed: ${result.error || 'Unknown error'}. Check console for details.`);
                                                    }
                                                } catch (err) {
                                                    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                                                    alert(`Retry failed: ${errorMessage}`);
                                                    console.error('Retry processing error:', err);
                                                }
                                            }}
                                            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : '🔄 Retry Processing'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex justify-end mt-2 border-t pt-4">
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this artifact?')) {
                                            await removeArtifact(artifact.id);
                                            onClose();
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Text */}
                {artifact.type === 'text' && (
                    <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl min-h-[50vh] flex flex-col relative">
                        {isEditing ? (
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                className="flex-1 w-full p-4 text-lg text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-slate-50 leading-relaxed font-serif"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="flex-1 prose prose-lg max-w-none text-slate-800 font-serif leading-relaxed whitespace-pre-wrap cursor-text"
                                onDoubleClick={() => setIsEditing(true)}
                            >
                                {textContent}
                            </div>
                        )}

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this artifact?')) {
                                        await removeArtifact(artifact.id);
                                        onClose();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>

                            <div className="flex justify-end gap-2">
                                {isEditing ? (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Save size={18} />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        <Edit2 size={16} />
                                        <span className="text-sm">Double-tap content or click here to edit</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
