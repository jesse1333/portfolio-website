/**
 * Eager image maps for About — shared by photo galleries and early prefetch so
 * the browser can warm the HTTP cache as soon as the app loads.
 */

export const photographyModuleMap = import.meta.glob(
  '../assets/about/photography/*.webp',
  { eager: true }
);

export const memoriesModuleMap = import.meta.glob(
  '../assets/about/memories/**/*.{webp,WEBP,jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);

export function allAboutImageUrls() {
  return [
    ...Object.values(photographyModuleMap).map((m) => m.default),
    ...Object.values(memoriesModuleMap).map((m) => m.default),
  ];
}
