export class CameraHandler {
    private stream: MediaStream | null = null;
    private videoElement: HTMLVideoElement | null = null;

    async start(videoElement: HTMLVideoElement): Promise<void> {
        this.videoElement = videoElement;
        if (this.stream) return;

        try {
            // Check if we're on HTTP (mobile browsers block camera on HTTP)
            if (window.location.protocol === 'http:' && this.isMobile()) {
                throw new Error('Camera access requires HTTPS on mobile devices. Please use the ngrok HTTPS URL.');
            }

            // Enhanced mobile camera constraints
            const constraints = {
                video: {
                    facingMode: 'environment', // prefer rear camera on phones
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = this.stream;
            
            // Ensure video plays on mobile
            videoElement.setAttribute('playsinline', 'true');
            videoElement.setAttribute('muted', 'true');
            videoElement.playsInline = true;
            videoElement.muted = true;
            
            await videoElement.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            
            // Provide specific error messages
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
                } else if (error.name === 'NotFoundError') {
                    throw new Error('No camera found on this device.');
                } else if (error.name === 'NotSupportedError') {
                    throw new Error('Camera not supported by this browser.');
                } else if (error.name === 'NotReadableError') {
                    throw new Error('Camera is already in use by another application.');
                } else if (error.name === 'OverconstrainedError') {
                    throw new Error('Camera does not support the required constraints.');
                } else if (error.name === 'AbortError') {
                    throw new Error('Camera access was aborted. Please try again.');
                }
            }
            
            throw error;
        }
    }

    private isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    takePhoto(): string | null {
        if (!this.videoElement || !this.stream) return null;

        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(this.videoElement, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.85);
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
            this.videoElement = null;
        }
    }
}
