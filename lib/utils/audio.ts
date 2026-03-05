export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;

    constructor() { }

    async start(): Promise<void> {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
        } catch (error) {
            console.error('Error starting audio recording:', error);
            throw error;
        }
    }

    pause(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
        }
    }

    resume(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
    }

    stop(): Promise<Blob> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                // If stopped before started, return empty blob or handle gracefully
                console.warn('MediaRecorder not initialized or already stopped');
                return resolve(new Blob([], { type: 'audio/webm' }));
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.reset();
                resolve(audioBlob);
            };

            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            } else {
                // Should not happen if logic is correct, but safe fallback
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.reset();
                resolve(audioBlob);
            }
        });
    }

    cancel(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.reset();
    }

    private reset() {
        this.audioChunks = [];
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
    }

    getState(): 'inactive' | 'recording' | 'paused' {
        return this.mediaRecorder?.state || 'inactive';
    }

    getStream(): MediaStream | null {
        return this.stream;
    }
}
