/**
 * Public files (images, marks) are referenced as "/photos/x.jpg" in code and data. When the site is
 * served from a subfolder (GitHub Pages: /svsd-competition/), prefix the build's base path.
 * Uploaded images (data: URLs) and full URLs pass through untouched.
 */
export const asset = (path?: string) => {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL || '/';
  return path.startsWith(base) ? path : base + path.slice(1);
};
