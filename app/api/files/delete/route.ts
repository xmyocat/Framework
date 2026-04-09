import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/storage/local';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { path } = await req.json();
        if (!path) {
            return NextResponse.json({ error: 'Missing path' }, { status: 400 });
        }

        await deleteFile(path);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Delete failed' },
            { status: 500 }
        );
    }
}
