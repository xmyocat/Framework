import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/processing/transcription';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    console.log('🎤 Transcription API called');
    
    try {
        const supabase = await createClient();
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.log('❌ No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ Session valid for user:', session.user.id);

        // Parse body
        const { fileUrl } = await req.json();
        if (!fileUrl) {
            console.log('❌ No fileUrl provided');
            return NextResponse.json({ error: 'No fileUrl provided' }, { status: 400 });
        }
        console.log('📁 File URL:', fileUrl);

        // Extract path from URL (e.g., .../artifacts/audio/123.webm -> audio/123.webm)
        // Adjust logic to be robust for your specific URL structure
        const urlObj = new URL(fileUrl);
        const pathParts = urlObj.pathname.split('/artifacts/');
        if (pathParts.length < 2) {
            console.log('❌ Invalid file URL format:', urlObj.pathname);
            return NextResponse.json({ error: 'Invalid file URL format' }, { status: 400 });
        }
        const storagePath = decodeURIComponent(pathParts[1]);
        console.log('📂 Storage path:', storagePath);

        // Download from Supabase
        console.log('⬇️ Downloading file from storage...');
        const { data: blob, error: downloadError } = await supabase.storage
            .from('artifacts')
            .download(storagePath);

        if (downloadError || !blob) {
            console.error('❌ Download error:', downloadError);
            return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
        }
        console.log('✅ File downloaded successfully, size:', blob.size, 'type:', blob.type);

        // Convert Blob to File for OpenAI
        const file = new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' });

        console.log('🤖 Starting transcription with OpenAI...');
        const transcript = await transcribeAudio(file);
        console.log('✅ Transcription completed, length:', transcript.length);

        return NextResponse.json({ text: transcript });
    } catch (error) {
        console.error('❌ Transcription API error:', error);
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
