import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage/local';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;
        const folder = formData.get('folder') as 'audio' | 'images' | 'video' | null;

        if (!file || !folder) {
            return NextResponse.json({ error: 'Missing file or folder' }, { status: 400 });
        }

        const result = await uploadFile(file, folder);
        return NextResponse.json({ url: result.url, path: result.path });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        );
    }
}
