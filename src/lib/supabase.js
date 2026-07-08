import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const PACKS_BUCKET   = 'sirophub-packs';
export const IMAGES_BUCKET  = 'sirophub-images';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload un fichier de pack dans Supabase Storage
 * @param {File} file
 * @param {string} packId
 * @returns {Promise<string>} URL publique du fichier
 */
export async function uploadPack(file, packId) {
  const ext = file.name.split('.').pop();
  const path = `${packId}/pack.${ext}`;

  const { error } = await supabase.storage
    .from(PACKS_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from(PACKS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Supprime un fichier de pack de Supabase Storage
 * @param {string} packId
 */
export async function deletePack(packId) {
  const { error } = await supabase.storage
    .from(PACKS_BUCKET)
    .remove([`${packId}/pack.mcpack`, `${packId}/pack.zip`, `${packId}/pack.mcaddon`]);

  if (error) throw error;
}
