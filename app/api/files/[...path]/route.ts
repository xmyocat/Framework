import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { cwd } from 'process'

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(cwd(), 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = join(UPLOAD_DIR, ...path)
    
    // Security check: ensure the path is within upload directory
    const resolvedPath = await import('path').then(m => m.resolve(filePath))
    const resolvedUploadDir = await import('path').then(m => m.resolve(UPLOAD_DIR))
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return new NextResponse('Access denied', { status: 403 })
    }
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    const fileBuffer = await readFile(filePath)

    const ext = path[path.length - 1].split('.').pop()?.toLowerCase()
    const folder = path[0]
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'webm': folder === 'audio' ? 'audio/webm' : 'video/webm',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': folder === 'audio' ? 'audio/ogg' : 'video/ogg'
    }

    const contentType = contentTypes[ext || ''] || 'application/octet-stream'
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
