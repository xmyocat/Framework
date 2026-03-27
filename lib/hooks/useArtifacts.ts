import { useState, useEffect, useCallback } from 'react';
import { Artifact } from '@/types';

export function useArtifacts() {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArtifacts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/artifacts');
            if (!res.ok) throw new Error('Failed to fetch artifacts');
            const data = await res.json();
            setArtifacts(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createArtifact = async (
        type: 'audio' | 'image' | 'text' | 'video',
        content: { url?: string; text?: string }
    ) => {
        try {
            const res = await fetch('/api/artifacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...content })
            });
            if (!res.ok) throw new Error('Failed to create artifact');
            const data = await res.json();
            setArtifacts(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating artifact:', err);
            throw err;
        }
    };

    const updateArtifact = async (id: string, updates: Partial<Artifact>) => {
        try {
            const res = await fetch(`/api/artifacts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update artifact');
            setArtifacts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        } catch (err) {
            console.error('Error updating artifact:', err);
            throw err;
        }
    };

    const deleteArtifact = async (id: string) => {
        try {
            const res = await fetch(`/api/artifacts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete artifact');
            setArtifacts(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting artifact:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchArtifacts();
    }, [fetchArtifacts]);

    return {
        artifacts,
        loading,
        error,
        refresh: fetchArtifacts,
        createArtifact,
        updateArtifact,
        deleteArtifact
    };
}
