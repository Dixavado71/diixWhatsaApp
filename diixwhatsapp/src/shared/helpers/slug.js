/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} Slugified string
 */
export function generateSlug(text) {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with dashes
    .replace(/^-+|-+$/g, ''); // Trim dashes from ends
}

/**
 * Generate a unique slug with incrementing number if needed
 * @param {string} baseSlug - Base slug
 * @param {number} counter - Counter for uniqueness
 * @returns {string} Unique slug
 */
export function generateUniqueSlug(baseSlug, counter = 0) {
  if (counter === 0) {
    return baseSlug;
  }
  return `${baseSlug}-${counter}`;
}
