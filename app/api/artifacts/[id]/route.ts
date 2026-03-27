import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db'
import { deleteArtifactFile } from '@/lib/utils/storage'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify ownership
    const existing = await prisma.artifact.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const artifact = await prisma.artifact.update({
      where: { id },
      data: body
    })

    return NextResponse.json(artifact)
  } catch (error) {
    console.error('Error updating artifact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership and get file URLs
    const artifact = await prisma.artifact.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!artifact) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete associated files
    if (artifact.fileUrls) {
      for (const url of artifact.fileUrls) {
        await deleteArtifactFile(url)
      }
    }

    await prisma.artifact.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artifact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
