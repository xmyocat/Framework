'use client';

import React, { useState } from 'react';
import { Mic, Camera, Type, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickCaptureButton() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleQuickCapture = (mode: string) => {
        router.push(`/capture?mode=${mode}`);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
            {isOpen && (
                <div className="absolute bottom-16 right-0 space-y-3">
                    <button
                        onClick={() => handleQuickCapture('audio')}
                        className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                        <Mic size={18} />
                        <span className="font-medium">Audio</span>
                    </button>
                    <button
                        onClick={() => handleQuickCapture('photo')}
                        className="flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                        <Camera size={18} />
                        <span className="font-medium">Photo</span>
                    </button>
                    <button
                        onClick={() => handleQuickCapture('text')}
                        className="flex items-center gap-3 bg-amber-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                    >
                        <Type size={18} />
                        <span className="font-medium">Note</span>
                    </button>
                </div>
            )}
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </button>
        </div>
    );
}
