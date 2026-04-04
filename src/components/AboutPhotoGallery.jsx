import { useRef } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/image-gallery.css';

const photoModules = import.meta.glob('../assets/about/photography/*.webp', { eager: true });

const ABOUT_FAVORITE_PHOTOS = Object.entries(photoModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([path, mod]) => {
    const file = path.split('/').pop() ?? '';
    const base = file.replace(/\.webp$/i, '');
    return {
      src: mod.default,
      alt: `Photography (${base})`,
    };
  });

const ABOUT_GALLERY_ITEMS = ABOUT_FAVORITE_PHOTOS.map((photo, index) => ({
  original: photo.src,
  thumbnail: photo.src,
  fullscreen: photo.src,
  originalAlt: photo.alt,
  thumbnailAlt: photo.alt,
  loading: index === 0 ? 'eager' : 'lazy',
  thumbnailLoading: 'lazy',
}));

export default function AboutPhotoGallery() {
  const galleryRef = useRef(null);
  const count = ABOUT_GALLERY_ITEMS.length;
  if (count === 0) return null;

  return (
    <div className="about-photo-gallery-wrap">
      <ImageGallery
        ref={galleryRef}
        items={ABOUT_GALLERY_ITEMS}
        showPlayButton={false}
        showFullscreenButton={false}
        showBullets={count > 1}
        showNav={count > 1}
        showThumbnails={count > 1}
        autoPlay={count > 1}
        slideInterval={7000}
        infinite
        lazyLoad
      />
    </div>
  );
}
