import { BACKEND_BASE_URL } from './runtimeConfig';

/**
 * Normalize a profile image URL and provide a fallback avatar.
 * - Full URLs (http/https) are returned as-is.
 * - Relative paths (e.g. /media/...) get the backend base URL prepended.
 * - Null/empty values fall back to a ui-avatars URL using the given name.
 */
export const getImageUrl = (imageUrl, name = 'User') => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === 'None') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F1A3D&color=fff`;
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Relative path – prepend backend origin
  return `${BACKEND_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
