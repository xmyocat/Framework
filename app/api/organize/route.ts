import { NextRequest, NextResponse } from 'next/server';
import { organizeArtifact } from '@/lib/processing/organization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content, type } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const metadata = await organizeArtifact(content, type || 'text');

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Organization API error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack',
            type: typeof error,
            constructor: error?.constructor?.name
        });
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Internal Server Error',
            details: 'Failed to organize content'
        }, { status: 500 });
    }
}
