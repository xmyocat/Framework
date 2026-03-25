import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Check if we have any audio artifacts without transcripts
        const { data: audioArtifacts, error } = await supabase
            .from('artifacts')
            .select('*')
            .eq('type', 'audio')
            .is('transcript', null)
            .limit(5);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Transcription test endpoint',
            audioArtifacts: audioArtifacts || [],
            count: audioArtifacts?.length || 0,
            openAIKeySet: !!process.env.OPENAI_API_KEY
        });
    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
