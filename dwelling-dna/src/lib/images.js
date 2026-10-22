// Getting an image into a frame: from a file, a drop, a paste or a link.
//
// Saving needs the editor's session, but placing an image must never wait for
// it. An image placed before signing in is kept in this browser (IndexedDB, so
// it survives the sign-in redirect) and shown at once; it is uploaded as soon
// as the editor is signed in.

import { edit, supabase } from './supabase';

const BUCKET = 'architaip-media';
const DB = 'architaip';
const STORE = 'pending-images';
const MAX_SIDE = 2400;

// ── Reading what the user handed over ──────────────────────────────────────

/** The first image file, or else the first link, in a drop or paste. */
export function extractImage(dataTransfer) {
  if (!dataTransfer) return null;
  for (const item of dataTransfer.items ?? []) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return { file };
    }
  }
  for (const file of dataTransfer.files ?? []) {
    if (file.type.startsWith('image/')) return { file };
  }
  // An image dragged from another page arrives as HTML or a URL, not a file.
  const html = dataTransfer.getData?.('text/html') ?? '';
  const src = html.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  const text = (src || dataTransfer.getData?.('text/uri-list') || dataTransfer.getData?.('text/plain') || '').trim();
  if (/^https?:\/\/\S+$/i.test(text)) return { url: text };
  return null;
}

/** Large photos are scaled down before they travel: a magazine frame does
 *  not need a 12-megapixel original, and the upload stays quick. */
export async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5e6) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadImage(entryId, slot, blob) {
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/gif' ? 'gif' : 'jpg';
  const path = `${entryId}/${slot}-${Date.now()}.${ext}`;
  // The server checks the editor and hands back a one-time signed upload; the
  // file itself goes straight to storage.
  const signed = await edit('sign_upload', { path });
  if (signed.error) throw new Error(signed.error.code === '42501' ? 'אין הרשאת עריכה במכשיר הזה' : signed.error.message);
  const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(path, signed.data.token, blob, {
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ── Images waiting for the editor to sign in ────────────────────────────────

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(out?.result ?? out);
    t.onerror = () => reject(t.error);
  });
}

export const pendingKey = (entryId, slot) => `${entryId}::${slot}`;

/** value: { blob } or { url } */
export function putPending(key, value) {
  return tx('readwrite', (s) => s.put(value, key)).catch(() => null);
}

export function deletePending(key) {
  return tx('readwrite', (s) => s.delete(key)).catch(() => null);
}

export async function allPending() {
  try {
    const db = await open();
    return await new Promise((resolve) => {
      const out = [];
      const req = db.transaction(STORE).objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return resolve(out);
        out.push({ key: c.key, value: c.value });
        c.continue();
      };
      req.onerror = () => resolve(out);
    });
  } catch {
    return [];
  }
}
