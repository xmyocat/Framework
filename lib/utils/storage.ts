import { uploadFile, deleteFile } from '@/lib/storage/local';

export async function uploadArtifactFile(
  file: Blob,
  folder: 'audio' | 'images' | 'video'
): Promise<string | null> {
  try {
    const result = await uploadFile(file, folder);
    return result.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteArtifactFile(fileUrl: string): Promise<void> {
  try {
    // Extract path from URL (e.g., /api/files/audio/123.webm -> audio/123.webm)
    const pathMatch = fileUrl.match(/\/api\/files\/(.+)/);
    if (pathMatch) {
      await deleteFile(pathMatch[1]);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
