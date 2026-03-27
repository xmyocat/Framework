import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/processing/transcription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { downloadFile } from '@/lib/storage/local';

export async function POST(req: NextRequest) {
    console.log('Transcription API called');
    
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('Session valid for user:', session.user.id);

        const { fileUrl } = await req.json();
        if (!fileUrl) {
            console.log('No fileUrl provided');
            return NextResponse.json({ error: 'No fileUrl provided' }, { status: 400 });
        }
        console.log('File URL:', fileUrl);

        // Extract path from URL (e.g., /api/files/audio/123.webm -> audio/123.webm)
        const pathMatch = fileUrl.match(/\/api\/files\/(.+)/);
        if (!pathMatch) {
            console.log('Invalid file URL format:', fileUrl);
            return NextResponse.json({ error: 'Invalid file URL format' }, { status: 400 });
        }
        const storagePath = decodeURIComponent(pathMatch[1]);
        console.log('Storage path:', storagePath);

        // Download from local storage
        console.log('Downloading file from storage...');
        const fileBuffer = await downloadFile(storagePath);
        console.log('File downloaded successfully, size:', fileBuffer.length);

        // Convert Buffer to Blob for OpenAI
        const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'audio/webm' });
        const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

        console.log('Starting transcription with OpenAI...');
        const transcript = await transcribeAudio(file);
        console.log('Transcription completed, length:', transcript.length);

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
