import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artifacts = await prisma.artifact.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(artifacts)
  } catch (error) {
    console.error('Error fetching artifacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, url, text } = body

    const artifact = await prisma.artifact.create({
      data: {
        userId: session.user.id,
        type,
        fileUrls: url ? [url] : [],
        textContent: text || null,
        processed: false,
        visibility: 'private'
      }
    })

    return NextResponse.json(artifact)
  } catch (error) {
    console.error('Error creating artifact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
