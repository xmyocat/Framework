import React, { useState, useEffect, useRef } from 'react';
import { AudioRecorder } from '@/lib/utils/audio';
import { Pause, Play, Save, X } from 'lucide-react';

interface AudioRecorderProps {
    onSave: (audioBlob: Blob) => void;
    onCancel: () => void;
}

export default function AudioRecorderComponent({ onSave, onCancel }: AudioRecorderProps) {
    const [recorder] = useState(() => new AudioRecorder());
    const [status, setStatus] = useState<'inactive' | 'recording' | 'paused'>('inactive');
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const contextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        startRecording();

        return () => {
            stopTimer();
            stopVisualizer();
            recorder.cancel();
            if (contextRef.current && contextRef.current.state !== 'closed') {
                contextRef.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startVisualizer = () => {
        const stream = recorder.getStream();
        if (!stream || !canvasRef.current) return;

        if (!contextRef.current) {
            contextRef.current = new window.AudioContext();
        }

        const audioContext = contextRef.current;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');

        if (!canvasCtx) return;

        const draw = () => {
            if (status === 'paused') {
                animationRef.current = requestAnimationFrame(draw);
                return;
            }

            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(24 24 27)'; // Zinc-900 equivalent (bg-gray-800 is closer to Zinc-800 but we want to match container)
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(59 130 246)'; // Blue-500
            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();
    };

    const stopVisualizer = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    const startRecording = async () => {
        try {
            await recorder.start();
            setStatus('recording');
            startTimer();
            // Give the stream a moment to initialize
            setTimeout(startVisualizer, 100);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    const togglePause = () => {
        if (status === 'recording') {
            recorder.pause();
            stopTimer();
            setStatus('paused');
        } else if (status === 'paused') {
            recorder.resume();
            startTimer();
            setStatus('recording');
        }
    };

    const finishRecording = async () => {
        stopTimer();
        stopVisualizer();
        const blob = await recorder.stop();
        setStatus('inactive');
        onSave(blob);
    };

    const cancelRecording = () => {
        stopTimer();
        stopVisualizer();
        recorder.cancel();
        setStatus('inactive');
        onCancel();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-white space-y-8 bg-black/90 rounded-3xl animate-in fade-in zoom-in duration-300">
            <div className="text-4xl font-mono tracking-widest">{formatTime(duration)}</div>

            {/* Visual Waveform */}
            <div className="w-full h-32 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-800">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={128}
                    className="w-full h-full"
                />
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={cancelRecording}
                    className="p-4 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                >
                    <X size={24} />
                </button>

                <button
                    onClick={togglePause}
                    disabled={status === 'inactive'}
                    className={`p-6 rounded-full transition-all shadow-lg ${status === 'inactive'
                        ? 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                        }`}
                >
                    {status === 'recording' ? <Pause size={32} /> : <Play size={32} />}
                </button>

                <button
                    onClick={finishRecording}
                    disabled={status === 'inactive'}
                    className={`p-4 rounded-full transition-all ${status === 'inactive'
                        ? 'bg-gray-700/20 text-gray-500 opacity-50 cursor-not-allowed'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        }`}
                >
                    <Save size={24} />
                </button>
            </div>

            <p className="text-gray-400 text-sm mt-4">
                {status === 'recording' ? 'Listening...' : 'Paused'}
            </p>
        </div>
    );
}
