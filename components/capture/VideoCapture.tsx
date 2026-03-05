import React, { useRef, useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface VideoCaptureProps {
    onSave: (blob: Blob) => void;
    onCancel: () => void;
}

export default function VideoCapture({ onSave, onCancel }: VideoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [chunks, setChunks] = useState<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    // Track stream in ref for cleanup to avoid dependency issues
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                // Check if we're on HTTP (mobile browsers block camera on HTTP)
                if (window.location.protocol === 'http:' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    throw new Error('Camera access requires HTTPS on mobile devices. Please use the ngrok HTTPS URL.');
                }

                // Enhanced mobile camera constraints
                const constraints = {
                    video: {
                        facingMode: 'environment', // prefer rear camera on phones
                        width: { ideal: 1920, max: 1920 },
                        height: { ideal: 1080, max: 1080 }
                    },
                    audio: true
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    videoRef.current.setAttribute('muted', 'true');
                    videoRef.current.playsInline = true;
                    videoRef.current.muted = true;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                let errorMessage = "Could not access camera. Please allow permissions.";
                
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
                    } else if (err.name === 'NotFoundError') {
                        errorMessage = 'No camera found on this device.';
                    } else if (err.name === 'NotSupportedError') {
                        errorMessage = 'Camera not supported by this browser.';
                    } else if (err.name === 'NotReadableError') {
                        errorMessage = 'Camera is already in use by another application.';
                    } else if (err.name === 'OverconstrainedError') {
                        errorMessage = 'Camera does not support the required constraints.';
                    } else if (err.name === 'AbortError') {
                        errorMessage = 'Camera access was aborted. Please try again.';
                    } else if (err.message.includes('HTTPS')) {
                        errorMessage = err.message;
                    }
                }
                
                alert(errorMessage);
                onCancel();
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startRecording = () => {
        if (!streamRef.current) return;

        const recorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                setChunks(prev => [...prev, e.data]);
            }
        };

        recorder.start();
        setIsRecording(true);
        setChunks([]);

        setDuration(0);
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    useEffect(() => {
        if (!isRecording && chunks.length > 0) {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setRecordedBlob(blob);
        }
    }, [isRecording, chunks]);

    const handleSave = () => {
        if (recordedBlob) {
            onSave(recordedBlob);
        }
    };

    const handleRetake = () => {
        setRecordedBlob(null);
        setChunks([]);
        setDuration(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header / Camera View */}
            <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
                {recordedBlob ? (
                    <video
                        src={URL.createObjectURL(recordedBlob)}
                        controls
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="max-h-full max-w-full object-cover h-full w-full"
                    />
                )}

                {/* Timer Overlay */}
                {isRecording && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600/80 px-4 py-1 rounded-full text-white font-mono text-lg animate-pulse">
                        {formatTime(duration)}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-32 bg-black/90 p-6 flex items-center justify-center gap-8">
                {recordedBlob ? (
                    <>
                        <button
                            onClick={handleRetake}
                            className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
                        >
                            <RotateCcw size={24} />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
                        >
                            <Save size={32} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onCancel}
                            className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
                        >
                            <X size={24} />
                        </button>

                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-1 rounded-full border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-transparent' : 'border-white'}`}
                        >
                            <div className={`w-16 h-16 rounded-full transition-all duration-300 ${isRecording ? 'scale-50 bg-red-500' : 'bg-white'}`} />
                        </button>

                        {/* Spacer to balance layout */}
                        <div className="w-14" />
                    </>
                )}
            </div>
        </div>
    );
}
