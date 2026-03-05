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
            className={`relative flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg transition-transform active:scale-95 w-full aspect-square ${colorClass}`}
        >
            <Icon size={48} className="mb-3 opacity-90" />
            <span className="text-xl font-bold tracking-tight opacity-95">{label}</span>
        </button>
    );
}
