import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const CarouselContext = React.createContext(null);

function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

function ChevronLeft({ className, ...rest }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className, ...rest }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  /** If set (ms), advances to the next slide on an interval; wraps to the first slide after the last. Timer resets on slide change (including manual nav). */
  autoPlayInterval = null,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  React.useEffect(() => {
    if (!api || autoPlayInterval == null || autoPlayInterval <= 0) return undefined;

    let intervalId;

    const tick = () => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    };

    const arm = () => {
      window.clearInterval(intervalId);
      intervalId = window.setInterval(tick, autoPlayInterval);
    };

    arm();
    api.on('select', arm);

    return () => {
      api.off('select', arm);
      window.clearInterval(intervalId);
    };
  }, [api, autoPlayInterval]);

  const resolvedOrientation =
    orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal');

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: resolvedOrientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('carousel-root', className)}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="carousel-root__viewport" data-slot="carousel-content">
      <div
        className={cn(
          'carousel-root__track',
          orientation === 'horizontal' ? 'carousel-root__track--horizontal' : 'carousel-root__track--vertical',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'carousel-root__item',
        orientation === 'horizontal' ? 'carousel-root__item--horizontal' : 'carousel-root__item--vertical',
        className
      )}
      {...props}
    />
  );
}

export function CarouselPrevious({ className, disabled, ...props }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      data-slot="carousel-previous"
      className={cn(
        'carousel-root__btn',
        orientation === 'horizontal' ? 'carousel-root__btn--prev-h' : 'carousel-root__btn--prev-v',
        className
      )}
      disabled={disabled ?? !canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft />
      <span className="carousel-root__sr-only">Previous slide</span>
    </button>
  );
}

export function CarouselNext({ className, disabled, ...props }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      data-slot="carousel-next"
      className={cn(
        'carousel-root__btn',
        orientation === 'horizontal' ? 'carousel-root__btn--next-h' : 'carousel-root__btn--next-v',
        className
      )}
      disabled={disabled ?? !canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight />
      <span className="carousel-root__sr-only">Next slide</span>
    </button>
  );
}
