'use client';

import React from 'react';

export type FilterType = 'all' | 'audio' | 'image' | 'text';

interface FilterBarProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export default function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
    const filters: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'audio', label: 'Audio' },
        { id: 'image', label: 'Photos' },
        { id: 'text', label: 'Notes' },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
                <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${currentFilter === f.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}
