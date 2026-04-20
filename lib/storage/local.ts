import { mkdir, writeFile, readFile, unlink, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

import { cwd } from 'process'

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(cwd(), 'uploads')

export interface StorageResult {
  path: string
  url: string
}

export async function ensureUploadDir(): Promise<void> {
  try {
    await access(UPLOAD_DIR, constants.W_OK)
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true })
    await mkdir(join(UPLOAD_DIR, 'audio'), { recursive: true })
    await mkdir(join(UPLOAD_DIR, 'images'), { recursive: true })
    await mkdir(join(UPLOAD_DIR, 'video'), { recursive: true })
  }
}

export async function uploadFile(
  file: Blob,
  folder: 'audio' | 'images' | 'video',
  filename?: string
): Promise<StorageResult> {
  await ensureUploadDir()

  let fileExt = 'bin'
  if (file.type === 'image/jpeg') fileExt = 'jpg'
  else if (file.type === 'image/png') fileExt = 'png'
  else if (file.type === 'image/webp') fileExt = 'webp'
  else if (file.type === 'audio/webm') fileExt = 'webm'
  else if (file.type === 'video/webm') fileExt = 'webm'
  else if (file.type === 'video/mp4') fileExt = 'mp4'
  else {
    if (folder === 'audio') fileExt = 'webm'
    else if (folder === 'images') fileExt = 'jpg'
    else if (folder === 'video') fileExt = 'webm'
  }

  const fileName = filename || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = join(folder, fileName)
  const fullPath = join(UPLOAD_DIR, filePath)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(fullPath, buffer)

  return {
    path: filePath,
    url: `/api/files/${filePath}`
  }
}

export async function downloadFile(filePath: string): Promise<Buffer> {
  const fullPath = join(UPLOAD_DIR, filePath)
  return readFile(fullPath)
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = join(UPLOAD_DIR, filePath)
  try {
    await unlink(fullPath)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

export function getFilePath(filePath: string): string {
  return join(UPLOAD_DIR, filePath)
}
