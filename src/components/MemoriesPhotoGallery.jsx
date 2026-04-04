import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import InfiniteScroll from 'react-photo-album/scroll';
import 'react-photo-album/rows.css';

const CHUNK_SIZE = 8;

const photoModules = import.meta.glob('../assets/about/memories/*.{webp,jpg,jpeg,png}', {
  eager: true,
});

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
  const scrollRef = useRef(null);

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
          if (!dims) return null;
          return { src, width: dims.width, height: dims.height, alt };
        })
      );
      if (cancelled) return;
      setAllPhotos(results.filter(Boolean));
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const initialBatch = useMemo(() => {
    if (allPhotos.length === 0) return undefined;
    return allPhotos.slice(0, CHUNK_SIZE);
  }, [allPhotos]);

  const fetchMore = useCallback(
    async (batchCount) => {
      const start = batchCount * CHUNK_SIZE;
      const batch = allPhotos.slice(start, start + CHUNK_SIZE);
      if (batch.length === 0) return null;
      await Promise.resolve();
      return batch;
    },
    [allPhotos]
  );

  const scrollContainer = useCallback(() => scrollRef.current, []);

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
      ref={scrollRef}
      className="memories-photo-album-wrap memories-photo-album-scroll"
      role="region"
      aria-label="Memory photos"
    >
      <InfiniteScroll
        photos={initialBatch}
        fetch={fetchMore}
        scrollContainer={scrollContainer}
        fetchRootMargin="240px"
        loading={
          <p className="memories-infinite-scroll-status" role="status">
            Loading more…
          </p>
        }
      >
        <RowsPhotoAlbum
          photos={[]}
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
      </InfiniteScroll>
    </div>
  );
}
