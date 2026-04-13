// =============================================================
// SUPABASE STORAGE HELPERS — card-images bucket
//
// Security model:
//   - Bucket is PUBLIC for reads (card images are not sensitive)
//   - RLS policies restrict INSERT/DELETE to the file owner
//   - File paths are always scoped to `{user_id}/{uuid}.ext`
//   - No service role key is used — anon key + RLS is sufficient
// =============================================================

import { createClient } from './client'

export const CARD_IMAGES_BUCKET = 'card-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─── Upload ───────────────────────────────────────────────────

export async function uploadCardImage(
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only JPG, PNG, and WEBP images are allowed' }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Image must be under 5 MB' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to upload images' }

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const path     = `${user.id}/${filename}`

  const { error } = await supabase.storage
    .from(CARD_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { error: error.message }

  const { data } = supabase.storage
    .from(CARD_IMAGES_BUCKET)
    .getPublicUrl(path)

  return { url: data.publicUrl }
}

// ─── Delete ───────────────────────────────────────────────────
// Call this when replacing or removing an image that was
// previously uploaded to this bucket.

export async function deleteCardImage(url: string): Promise<void> {
  const path = extractStoragePath(url)
  if (!path) return // not a storage URL — nothing to do

  const supabase = createClient()
  await supabase.storage.from(CARD_IMAGES_BUCKET).remove([path])
}

// ─── Path extraction ──────────────────────────────────────────
// Converts a full public URL back to the storage path so we
// can pass it to storage.remove().
//
// URL shape: https://<ref>.supabase.co/storage/v1/object/public/card-images/<path>

export function extractStoragePath(url: string): string | null {
  try {
    const marker = `/object/public/${CARD_IMAGES_BUCKET}/`
    const idx    = url.indexOf(marker)
    return idx !== -1 ? url.slice(idx + marker.length) : null
  } catch {
    return null
  }
}
