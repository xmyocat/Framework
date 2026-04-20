import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CaptureButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    colorClass: string;
}

export default function CaptureButton({ icon: Icon, label, onClick, colorClass }: CaptureButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl shadow-lg transition-transform active:scale-95 w-full h-32 ${colorClass}`}
        >
            <Icon size={36} className="mb-2 opacity-90" />
            <span className="text-lg font-bold tracking-tight opacity-95">{label}</span>
        </button>
    );
}
