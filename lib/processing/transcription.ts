import OpenAI from 'openai';

export async function transcribeAudio(file: File | Blob): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const response = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
        });

        return response.text;
    } catch (error) {
        console.error('Error in transcription:', error);
        throw new Error('Failed to transcribe audio');
    }
}
