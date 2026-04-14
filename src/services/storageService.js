import { supabase } from './supabase';

const BUCKET = 'f1-images';

/**
 * Upload a file to Supabase Storage.
 * @param {File} file
 * @param {string} folder  e.g. 'drivers' | 'constructors'
 * @returns {Promise<string>} public URL
 */
export async function uploadImage(file, folder = 'general') {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete an image by its public URL.
 * @param {string} publicUrl
 */
export async function deleteImage(publicUrl) {
  const url = new URL(publicUrl);
  // path after /storage/v1/object/public/{bucket}/
  const parts = url.pathname.split(`/object/public/${BUCKET}/`);
  if (parts.length < 2) return;
  const { error } = await supabase.storage.from(BUCKET).remove([parts[1]]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
