import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/processing/transcription';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse body
        const { fileUrl } = await req.json();
        if (!fileUrl) {
            return NextResponse.json({ error: 'No fileUrl provided' }, { status: 400 });
        }

        // Extract path from URL (e.g., .../artifacts/audio/123.webm -> audio/123.webm)
        // Adjust logic to be robust for your specific URL structure
        const urlObj = new URL(fileUrl);
        const pathParts = urlObj.pathname.split('/artifacts/');
        if (pathParts.length < 2) {
            return NextResponse.json({ error: 'Invalid file URL format' }, { status: 400 });
        }
        const storagePath = decodeURIComponent(pathParts[1]);

        // Download from Supabase
        const { data: blob, error: downloadError } = await supabase.storage
            .from('artifacts')
            .download(storagePath);

        if (downloadError || !blob) {
            console.error('Download error:', downloadError);
            return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
        }

        // Convert Blob to File for OpenAI
        const file = new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' });

        const transcript = await transcribeAudio(file);

        return NextResponse.json({ text: transcript });
    } catch (error) {
        console.error('Transcription API error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack',
            type: typeof error,
            constructor: error?.constructor?.name
        });
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Internal Server Error',
            details: 'Failed to transcribe audio'
        }, { status: 500 });
    }
}
