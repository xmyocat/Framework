export async function uploadArtifactFile(
  file: Blob,
  folder: 'audio' | 'images' | 'video'
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
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
      // Call delete API
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathMatch[1] }),
      });
      if (!response.ok) {
        console.error('Failed to delete file:', await response.text());
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
