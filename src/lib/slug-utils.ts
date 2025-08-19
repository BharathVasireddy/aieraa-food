/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if necessary
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Extract readable name from order number for URL
 */
export function getOrderSlug(orderNumber: string): string {
  // Remove any special characters and make it URL-friendly
  return orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Generate menu item slug with fallback
 */
export function generateMenuItemSlug(name: string, id?: string): string {
  const baseSlug = generateSlug(name);
  
  // If slug is empty (e.g., name has only special characters), use ID as fallback
  if (!baseSlug && id) {
    return `item-${id.slice(-8)}`;
  }
  
  return baseSlug || 'item';
}