import OpenAI from 'openai';

export async function transcribeAudio(file: File | Blob): Promise<string> {
    console.log('🎙️ Starting audio transcription...');
    console.log('📊 File info:', {
        name: (file as File).name || 'blob',
        size: file.size,
        type: file.type
    });

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY is not set');
        throw new Error('OpenAI API key is not configured');
    }
    console.log('✅ OpenAI client initialized');

    try {
        console.log('📤 Sending to OpenAI Whisper API...');
        const response = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
        });

        console.log('✅ Transcription response received');
        console.log('📝 Transcript length:', response.text.length);
        console.log('📝 Transcript preview:', response.text.substring(0, 100) + '...');

        return response.text;
    } catch (error) {
        console.error('❌ Error in transcription:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw new Error('Failed to transcribe audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
