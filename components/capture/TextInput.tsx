'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TextInputProps {
    onSave: (text: string) => void;
    onCancel: () => void;
}

export default function TextInput({ onSave, onCancel }: TextInputProps) {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSave = () => {
        if (text.trim()) {
            onSave(text);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white text-black animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <button
                    onClick={onCancel}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                    <X size={24} />
                </button>
                <h2 className="font-semibold text-lg">New Note</h2>
                <button
                    onClick={handleSave}
                    disabled={!text.trim()}
                    className="p-2 -mr-2 text-blue-600 disabled:text-gray-300 font-medium hover:bg-blue-50 rounded-full"
                >
                    Save
                </button>
            </div>

            {/* Editor */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did you learn today?"
                className="flex-1 w-full p-4 resize-none outline-none text-lg leading-relaxed placeholder:text-gray-400"
            />
        </div>
    );
}
