import type { ImageMetadata } from 'astro';

// The CMS stores image references as absolute-from-root paths (the media
// public_folder + filename), e.g. "/src/assets/trips/cover.jpg". import.meta.glob
// gives us a map keyed by those exact paths, whose loaders return ImageMetadata.
const images = import.meta.glob<{ default: ImageMetadata }>([
  '/src/assets/trips/*.{jpeg,jpg,png,gif,webp,avif}',
  '/src/assets/trips/**/*.{jpeg,jpg,png,gif,webp,avif}',
  '/src/assets/about/*.{jpeg,jpg,png,gif,webp,avif}',
  '/src/assets/about/**/*.{jpeg,jpg,png,gif,webp,avif}',
]);

export async function resolveImage(
  path: string | null | undefined
): Promise<ImageMetadata | null> {
  if (!path) return null;
  const loader = images[path];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
