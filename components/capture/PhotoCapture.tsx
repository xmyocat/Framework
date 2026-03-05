'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CameraHandler } from '@/lib/utils/camera';
import { X, Check, RotateCcw } from 'lucide-react';

interface PhotoCaptureProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}

export default function PhotoCapture({ onSave, onCancel }: PhotoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [camera] = useState(() => new CameraHandler());
    const [photo, setPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (videoRef.current && !photo) {
            camera.start(videoRef.current).catch((err) => {
                const errorMessage = err instanceof Error ? err.message : 'Could not access camera. Please allow permissions.';
                setError(errorMessage);
            });
        }

        return () => {
            camera.stop();
        };
    }, [camera, photo]);

    const handleSnap = () => {
        const dataUrl = camera.takePhoto();
        if (dataUrl) {
            setPhoto(dataUrl);
            camera.stop();
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        // Effect will re-trigger to start camera since photo is null
    };

    const handleSave = () => {
        if (photo) {
            onSave(photo);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white bg-black p-6">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={onCancel} className="px-4 py-2 bg-gray-800 rounded-lg">Close</button>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-black flex flex-col animate-in fade-in duration-300">
            {/* Viewfinder / Preview */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={photo} alt="Captured" className="max-w-full max-h-full object-contain" />
                ) : (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                    />
                )}
            </div>

            {/* Controls */}
            <div className="h-24 bg-black/90 flex items-center justify-around px-6">
                {!photo ? (
                    <>
                        <button
                            onClick={onCancel}
                            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                            <X size={24} />
                        </button>
                        <button
                            onClick={handleSnap}
                            className="p-1 rounded-full border-4 border-white"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-black"></div>
                        </button>
                        <div className="w-12"></div> {/* Spacer for balance */}
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleRetake}
                            className="p-3 rounded-full bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 flex flex-col items-center"
                        >
                            <RotateCcw size={24} />
                            <span className="text-xs mt-1">Retake</span>
                        </button>

                        <button
                            onClick={handleSave}
                            className="p-3 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30 flex flex-col items-center"
                        >
                            <Check size={32} />
                            <span className="text-xs mt-1">Save</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
