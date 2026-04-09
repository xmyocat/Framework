export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Artifact {
    id: string
    userId: string
    type: 'audio' | 'image' | 'text' | 'video' | 'mixed'
    fileUrls: string[] | null
    textContent: string | null
    transcript: string | null
    thumbnailUrl: string | null
    autoTags: string[] | null
    userTags: string[] | null
    subject: string | null
    connections: string[] | null
    processed: boolean
    visibility: 'private' | 'teacher' | 'public'
    createdAt: string
    updatedAt: string
}

export interface Collection {
    id: string
    user_id: string
    name: string | null
    type: 'auto' | 'manual'
    artifact_ids: string[] | null
    cover_image_url: string | null
    subject: string | null
    date_range: string | null // tstzrange is complex to type perfectly, treating as string for now or specific range object
    created_at: string
}

export interface Reflection {
    id: string
    user_id: string
    artifact_id: string | null
    collection_id: string | null
    content_blocks: Json | null
    depth_indicator: number | null
    created_at: string
    updated_at: string
}

export interface Profile {
    id: string
    role: 'student' | 'teacher' | null
    display_name: string | null
    settings: Json | null
    linked_teacher_ids: string[] | null
    created_at: string
}
