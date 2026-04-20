'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Camera, Type, Image as ImageIcon, Video, Upload, WifiOff } from 'lucide-react';
import CaptureButton from '@/components/capture/CaptureButton';
import AudioRecorder from '@/components/capture/AudioRecorder';
import VideoCapture from '@/components/capture/VideoCapture';
import PhotoCapture from '@/components/capture/PhotoCapture';
import TextInput from '@/components/capture/TextInput';
import { useSession } from 'next-auth/react';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { uploadArtifactFile } from '@/lib/utils/storage';
import { useProcessing } from '@/lib/hooks/useProcessing';
import { useRouter } from 'next/navigation';
import { savePendingArtifact } from '@/lib/utils/offline-storage';

type CaptureMode = 'menu' | 'audio' | 'photo' | 'text' | 'video';

function useAuthSession() {
    try {
        return useSession();
    } catch {
        // Return mock session during SSR
        return { data: null, status: 'loading' };
    }
}

export default function CapturePage() {
    const [mode, setMode] = useState<CaptureMode>('menu');
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const sessionData = useAuthSession();
    const status = sessionData?.status || 'loading';
    const { createArtifact } = useArtifacts();
    const { processArtifact } = useProcessing();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        // Handle URL parameters for PWA shortcuts
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const modeParam = urlParams.get('mode') as CaptureMode;
            if (modeParam && ['audio', 'photo', 'text', 'video'].includes(modeParam)) {
                setMode(modeParam);
            }
        }
    }, [status, router]);

    // Prevent hydration mismatch - don't render until mounted
    if (!mounted) {
        return <div className="flex flex-col min-h-full bg-slate-50" />;
    }

    const handleSaveAudio = async (blob: Blob) => {
        setIsSaving(true);
        try {
            const publicUrl = await uploadArtifactFile(blob, 'audio');
            // If upload fails (publicUrl is null), we should probably stop.
            if (!publicUrl) {
                throw new Error('Upload failed');
            }

            if (publicUrl) {
                const newArtifact = await createArtifact('audio', { url: publicUrl });
                if (newArtifact) processArtifact(newArtifact);
            }
        } catch (err) {
            const e = err as Error;
            console.error(e);
            if (e.message?.includes('logged in')) {
                router.push('/login');
            } else {
                // Fallback to offline storage
                try {
                    await savePendingArtifact('audio', blob);
                    alert('Saved offline. Will sync when back online.');
                } catch (offlineErr) {
                    console.error('Offline save failed', offlineErr);
                    alert(`Failed to save audio: ${e.message}`);
                }
            }
        } finally {
            setIsSaving(false);
            setMode('menu');
            router.refresh();
        }
    };

    const handleSavePhoto = async (dataUrl: string) => {
        setIsSaving(true);
        try {
            // Convert DataURL to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            const publicUrl = await uploadArtifactFile(blob, 'images');
            if (!publicUrl) {
                throw new Error('Upload failed');
            }

            if (publicUrl) {
                const newArtifact = await createArtifact('image', { url: publicUrl });
                if (newArtifact) processArtifact(newArtifact);
            }
        } catch (err) {
            const e = err as Error;
            console.error(e);
            if (e.message?.includes('logged in')) {
                router.push('/login');
            } else {
                // Fallback to offline storage
                try {
                    // Convert DataURL to Blob is tricky if we don't have it, but here we already fetched it?
                    // Wait, handleSavePhoto takes dataUrl. fetch(dataUrl).blob() might fail if offline?
                    // Actually dataURL is local string, fetch() on it works fine offline.
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    await savePendingArtifact('image', blob);
                    alert('Saved offline. Will sync when back online.');
                } catch (offlineErr) {
                    alert('Failed to save photo.');
                }
            }
        } finally {
            setIsSaving(false);
            setMode('menu');
            router.refresh();
        }
    };

    const handleSaveText = async (text: string) => {
        setIsSaving(true);
        try {
            const newArtifact = await createArtifact('text', { text });
            if (newArtifact) processArtifact(newArtifact);
        } catch (err) {
            const e = err as Error;
            console.error(e);
            if (e.message?.includes('logged in')) {
                router.push('/login');
            } else {
                // Fallback to offline storage
                try {
                    await savePendingArtifact('text', text);
                    alert('Saved offline. Will sync when back online.');
                } catch (offlineErr) {
                    alert('Failed to save note.');
                }
            }
        } finally {
            setIsSaving(false);
            setMode('menu');
            router.refresh();
        }
    };

    const handleSaveVideo = async (blob: Blob) => {
        setIsSaving(true);
        try {
            const publicUrl = await uploadArtifactFile(blob, 'video');

            if (!publicUrl) throw new Error('Upload failed');

            if (publicUrl) {
                const newArtifact = await createArtifact('video', { url: publicUrl });
                if (newArtifact) processArtifact(newArtifact);
            }
        } catch (err) {
            const e = err as Error;
            console.error(e);
            try {
                await savePendingArtifact('video', blob);
                alert('Saved offline. Will sync when back online.');
            } catch (offlineErr) {
                alert(`Failed to save video: ${e.message}`);
            }
        } finally {
            setIsSaving(false);
            setMode('menu');
            router.refresh();
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsSaving(true);

        try {
            // Determine type
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            if (!isVideo && !isImage) {
                alert('Only images and videos are supported');
                return;
            }

            const folder = isVideo ? 'video' : 'images';
            const publicUrl = await uploadArtifactFile(file, folder);
            if (!publicUrl) throw new Error('Upload failed');

            const type = isVideo ? 'video' : 'image';
            const newArtifact = await createArtifact(type, { url: publicUrl });
            if (newArtifact) processArtifact(newArtifact);

        } catch (err) {
            console.error(err);
            // Offline support for import is tricky because we need the file.
            // But 'file' is available in scope.
            try {
                // We need to know type
                const file = e.target.files?.[0];
                if (file) {
                    const isVideo = file.type.startsWith('video/');
                    const type = isVideo ? 'video' : 'image';
                    await savePendingArtifact(type, file);
                    alert('Saved offline. Will sync when back online.');
                }
            } catch (offlineErr) {
                alert('Import failed');
            }
        } finally {
            setIsSaving(false);
            router.refresh();
        }
    };

    if (mode === 'audio') {
        return <AudioRecorder onSave={handleSaveAudio} onCancel={() => setMode('menu')} />;
    }

    if (mode === 'photo') {
        return <PhotoCapture onSave={handleSavePhoto} onCancel={() => setMode('menu')} />;
    }

    if (mode === 'video') {
        return <VideoCapture onSave={handleSaveVideo} onCancel={() => setMode('menu')} />;
    }

    if (mode === 'text') {
        return <TextInput onSave={handleSaveText} onCancel={() => setMode('menu')} />;
    }

    return (
        <div className="flex flex-col min-h-full bg-slate-50">
            {/* Header */}
            <header className="p-6 pb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Capture</h1>
                <p className="text-slate-500 font-medium">What are you learning?</p>
            </header>

            {/* Main Grid */}
            <main className="flex-1 p-6 grid grid-cols-2 gap-4 auto-rows-min content-start">

                {/* Audio and Video Row */}
                <div className="col-span-1">
                    <CaptureButton
                        icon={Mic}
                        label="Audio"
                        onClick={() => setMode('audio')}
                        colorClass="bg-red-500 text-white shadow-red-200"
                    />
                </div>
                <div className="col-span-1">
                    <CaptureButton
                        icon={Video}
                        label="Video"
                        onClick={() => setMode('video')}
                        colorClass="bg-violet-500 text-white shadow-violet-200"
                    />
                </div>

                {/* Photo and Text Row */}
                <div className="col-span-1">
                    <CaptureButton
                        icon={Camera}
                        label="Photo"
                        onClick={() => setMode('photo')}
                        colorClass="bg-blue-500 text-white shadow-blue-200"
                    />
                </div>

                <div className="col-span-1">
                    <CaptureButton
                        icon={Type}
                        label="Text"
                        onClick={() => setMode('text')}
                        colorClass="bg-amber-400 text-white shadow-amber-200"
                    />
                </div>

                {/* Import Row */}
                <div className="col-span-2">
                    <label className="flex items-center justify-center p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-medium cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors">
                        <Upload className="mr-2" size={20} />
                        <span>Import from Device</span>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleImport}
                        />
                    </label>
                </div>

                {/* Recent Section (Placeholder) */}
                <div className="col-span-2 mt-8">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Captures</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-shrink-0 w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                                <ImageIcon className="text-slate-200" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {isSaving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-xl animate-bounce">
                        <span className="font-bold text-slate-900">Saving...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
