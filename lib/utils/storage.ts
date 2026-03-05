import { createClient } from '@/lib/supabase/client';

export async function uploadArtifactFile(file: Blob, folder: 'audio' | 'images' | 'video'): Promise<string | null> {
    const supabase = createClient();

    let fileExt = 'bin';
    if (file.type === 'image/jpeg') fileExt = 'jpg';
    else if (file.type === 'image/png') fileExt = 'png';
    else if (file.type === 'image/webp') fileExt = 'webp';
    else if (file.type === 'audio/webm') fileExt = 'webm';
    else if (file.type === 'video/webm') fileExt = 'webm';
    else if (file.type === 'video/mp4') fileExt = 'mp4';
    else {
        // Fallback based on folder if type is missing/generic
        if (folder === 'audio') fileExt = 'webm';
        else if (folder === 'images') fileExt = 'jpg';
        else if (folder === 'video') fileExt = 'webm';
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    try {
        const { error } = await supabase.storage
            .from('artifacts')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        const { data } = supabase.storage
            .from('artifacts')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
