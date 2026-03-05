import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Artifact } from '@/types';

export function useArtifacts() {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchArtifacts = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('artifacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setArtifacts(data as Artifact[]);
        } catch (err) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const createArtifact = async (
        type: 'audio' | 'image' | 'text' | 'video',
        content: { url?: string; text?: string }
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be logged in to create artifacts');
            }

            const newArtifact: Partial<Artifact> = {
                user_id: user.id,
                type,
                file_urls: content.url ? [content.url] : [],
                text_content: content.text,
                processed: false,
                visibility: 'private'
            };

            const { data, error } = await supabase
                .from('artifacts')
                .insert([newArtifact])
                .select()
                .single();

            if (error) throw error;

            setArtifacts(prev => [data as Artifact, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating artifact:', err);
            throw err;
        }
    };

    const updateArtifact = async (id: string, updates: Partial<Artifact>) => {
        try {
            const { error } = await supabase
                .from('artifacts')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setArtifacts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        } catch (err) {
            console.error('Error updating artifact:', err);
            throw err;
        }
    };

    const deleteArtifact = async (id: string) => {
        try {
            const { error } = await supabase
                .from('artifacts')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
