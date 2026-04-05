import { useEffect, useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';

/** Used when natural size cannot be read so the row layout still includes the image. */
const FALLBACK_ASPECT = { width: 4, height: 3 };

const photoModules = import.meta.glob(
  '../assets/about/memories/**/*.{webp,WEBP,jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);

function readDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function MemoriesPhotoGallery() {
  const entries = useMemo(
    () =>
      Object.entries(photoModules)
        .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
        .map(([path, mod]) => {
          const file = path.split('/').pop() ?? '';
          const base = file.replace(/\.[^.]+$/i, '');
          return {
            src: mod.default,
            alt: base ? `Memory (${base})` : 'Memory',
          };
        }),
    []
  );

  const [allPhotos, setAllPhotos] = useState([]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (entries.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        entries.map(async ({ src, alt }) => {
          const dims = await readDimensions(src);
          const { width, height } = dims ?? FALLBACK_ASPECT;
          return { src, width, height, alt };
        })
      );
      if (cancelled) return;
      setAllPhotos(results);
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [entries]);

  if (entries.length === 0) return null;

  if (!resolved) {
    return (
      <div
        className="memories-photo-album-wrap memories-photo-album-wrap--pending memories-photo-album-scroll"
        aria-hidden="true"
      />
    );
  }

  if (allPhotos.length === 0) return null;

  return (
    <div
      className="memories-photo-album-wrap memories-photo-album-scroll"
      role="region"
      aria-label="Memory photos"
    >
      <RowsPhotoAlbum
        photos={allPhotos}
        padding={0}
        spacing={16}
        targetRowHeight={(w) =>
          w < 420 ? w / 1.85 : w < 640 ? w / 2.15 : w / 2.35
        }
        sizes={{
          size: 'min(42rem, 100% - 2rem)',
          sizes: [
            {
              viewport: '(max-width: 960px)',
              size: 'calc(100vw - 48px)',
            },
          ],
        }}
      />
    </div>
  );
}
