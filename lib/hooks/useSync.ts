import { useState, useEffect, useCallback } from 'react';
import { getPendingArtifacts, removePendingArtifact, PendingArtifact } from '@/lib/utils/offline-storage';
import { uploadArtifactFile } from '@/lib/utils/storage';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { useProcessing } from '@/lib/hooks/useProcessing';

export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const { createArtifact } = useArtifacts();
    const { processArtifact } = useProcessing();

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Set initial state
        setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Check pending count on mount and periodically
    const checkPending = useCallback(async () => {
        try {
            const items = await getPendingArtifacts();
            setPendingCount(items.length);
            return items;
        } catch (error) {
            console.error('Failed to check pending artifacts:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        checkPending();
        const interval = setInterval(checkPending, 5000); // Check every 5s just for count updates
        return () => clearInterval(interval);
    }, [checkPending]);

    // Sync function
    const syncArtifacts = useCallback(async () => {
        const items = await checkPending();
        if (items.length === 0) return;

        if (!navigator.onLine || isSyncing) return;

        setIsSyncing(true);
        try {

            for (const item of items) {
                try {
                    let newItem = null;

                    if (item.type === 'text') {
                        // Text artifact
                        newItem = await createArtifact('text', { text: item.content as string });
                    } else {
                        // File artifact (audio, image, video)
                        const blob = item.content as Blob;
                        let folder: 'audio' | 'images' | 'video' = 'images';
                        if (item.type === 'audio') folder = 'audio';
                        if (item.type === 'video') folder = 'video'; // Assuming storage.ts handles this or maps to images

                        // Note: uploadArtifactFile logic might need update if we want 'video' folder support explicitly, 
                        // but standard mapping in storage.ts usuall handles it or defaults.
                        // Let's coerce folder for now.
                        const publicUrl = await uploadArtifactFile(blob, folder);

                        if (publicUrl) {
                            newItem = await createArtifact(item.type, { url: publicUrl });
                        }
                    }

                    if (newItem) {
                        // If created successfully, process it (transcribe etc)
                        processArtifact(newItem);
                        // Remove from offline storage
                        if (item.id !== undefined) {
                            await removePendingArtifact(item.id);
                        }
                    }
                } catch (err) {
                    console.error('Failed to sync item:', item, err);
                    // Keep in storage to retry later? 
                    // Or maybe add a 'retryCount' to the item so we don't loop forever on bad items.
                    // For now, let's leave it.
                }
            }
        } finally {
            setIsSyncing(false);
            checkPending(); // Update count
        }
    }, [createArtifact, processArtifact, isSyncing, checkPending]);

    // Auto-sync when online
    useEffect(() => {
        if (isOnline) {
            syncArtifacts();
            const interval = setInterval(syncArtifacts, 30000); // Retry sync every 30s if online
            return () => clearInterval(interval);
        }
    }, [isOnline, syncArtifacts]);

    return {
        isOnline,
        isSyncing,
        pendingCount,
        syncNow: syncArtifacts
    };
}
