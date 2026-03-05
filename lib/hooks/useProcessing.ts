import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Artifact } from '@/types';

export function useProcessing() {
    const [processing, setProcessing] = useState(false);
    const supabase = createClient();

    const processArtifact = async (artifact: Artifact) => {
        try {
            setProcessing(true);
            let transcript = artifact.transcript;

            // 1. Transcribe if audio and no transcript
            try {
                if (artifact.type === 'audio' && !transcript && artifact.file_urls && artifact.file_urls.length > 0) {
                    const url = artifact.file_urls[0];
                    if (url) {
                        const txRes = await fetch('/api/transcribe', {
                            method: 'POST',
                            body: JSON.stringify({ fileUrl: url }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        if (txRes.ok) {
                            const txData = await txRes.json();
                            transcript = txData.text;
                        } else {
                            console.error('Transcription failed:', await txRes.text());
                        }
                    }
                }
            } catch (txErr) {
                console.error('Transcription error:', txErr);
            }

            // 2. Organize (Auto-tag)
            const contentToOrganize = transcript || artifact.text_content;
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

            // 3. Update Artifact in DB
            const updates = {
                transcript,
                ...organizationData,
                processed: true
            };

            const { error: updateError } = await supabase
                .from('artifacts')
                .update(updates)
                .eq('id', artifact.id);

            if (updateError) throw updateError;

            return { success: true, ...updates };

        } catch (error) {
            console.error('Processing error caught:', error);
            console.error('Error type:', typeof error);
            console.error('Error constructor:', error?.constructor?.name);
            console.error('Error keys:', error ? Object.keys(error) : 'No error object');

            // Log specific properties if they exist (likely Supabase error)
            if (typeof error === 'object' && error !== null) {
                if ('code' in error) console.error('Error code:', (error as any).code);
                if ('details' in error) console.error('Error details:', (error as any).details);
                if ('hint' in error) console.error('Error hint:', (error as any).hint);
                if ('message' in error) console.error('Error message property:', (error as any).message);
            }
            
            // Prioritize Supabase error message, then standard Error, then fallback
            const errorMessage = (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') ? (error as any).message : 
                                 (error instanceof Error ? error.message : 
                                 (typeof error === 'string' ? error : 
                                 ((error as any)?.details || (error as any)?.hint || (error as any)?.code || 'Unknown error')));
            const errorStack = error instanceof Error ? error.stack : 'No stack trace';
            
            console.error('Processed error details:', {
                message: errorMessage,
                stack: errorStack,
                errorObject: error
            });
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
