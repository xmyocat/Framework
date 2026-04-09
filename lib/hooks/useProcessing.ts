import { useState } from 'react';
import { Artifact } from '@/types';

export function useProcessing() {
    const [processing, setProcessing] = useState(false);

    const processArtifact = async (artifact: Artifact) => {
        console.log('Starting artifact processing:', artifact.id, artifact.type);
        try {
            setProcessing(true);
            let transcript = artifact.transcript;

            // 1. Transcribe if audio and no transcript
            try {
                if (artifact.type === 'audio' && !transcript && artifact.fileUrls && artifact.fileUrls.length > 0) {
                    console.log('Audio artifact needs transcription');
                    const url = artifact.fileUrls[0];
                    if (url) {
                        console.log('Calling transcription API...');
                        const txRes = await fetch('/api/transcribe', {
                            method: 'POST',
                            body: JSON.stringify({ fileUrl: url }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (txRes.ok) {
                            const txData = await txRes.json();
                            transcript = txData.text || '';
                            console.log('Transcription successful:', transcript?.length || 0, 'characters');
                        } else {
                            const errorText = await txRes.text();
                            console.error('Transcription failed:', txRes.status, errorText);
                        }
                    }
                } else {
                    console.log('No transcription needed - type:', artifact.type, 'has transcript:', !!transcript);
                }
            } catch (txErr) {
                console.error('Transcription error:', txErr);
            }

            // 2. Organize (Auto-tag)
            const contentToOrganize = transcript || artifact.textContent;
            let organizationData = {};

            try {
                if (contentToOrganize) {
                    const orgRes = await fetch('/api/organize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: contentToOrganize,
                            type: artifact.type
                        })
                    });

                    if (orgRes.ok) {
                        organizationData = await orgRes.json();
                    }
                }
            } catch (orgErr) {
                console.error('Organization error:', orgErr);
            }

            // 3. Update Artifact via API
            const updates = {
                transcript,
                ...organizationData,
                processed: true
            };
            
            console.log('Updating artifact:', updates);

            const updateRes = await fetch(`/api/artifacts/${artifact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!updateRes.ok) {
                const errorText = await updateRes.text();
                throw new Error(`Failed to update artifact: ${errorText}`);
            }

            console.log('Artifact processing completed successfully');
            return { success: true, ...updates };

        } catch (error) {
            console.error('Processing error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        } finally {
            setProcessing(false);
        }
    };

    return {
        processArtifact,
        processing
    };
}
