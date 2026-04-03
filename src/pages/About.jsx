import { useEffect, useId, useRef, useState } from 'react';
import uscVillage from '../assets/usc-village.png';
import techAws from '../assets/tech-aws.svg';
import techC from '../assets/tech-c.svg';
import techNodejs from '../assets/tech-nodejs.svg';
import techPostgresql from '../assets/tech-postgresql.svg';
import techPython from '../assets/tech-python.svg';
import techReact from '../assets/tech-react.svg';
import techTypescript from '../assets/tech-typescript.svg';
import chevronRight from '../assets/about/chevron-right.svg';
import SectionScrollHint from '../components/SectionScrollHint';
import SelectionPhysicsComponent from '../components/SelectionPhysicsComponent';
import Switch from '../components/Switch';

function AboutUscLink() {
  return (
    <a
      href="https://www.usc.edu/"
      target="_blank"
      rel="noopener noreferrer"
      className="about-usc-link"
      aria-label="University of Southern California (opens in new tab)"
    >
      USC
      <span className="about-usc-link__preview" aria-hidden="true">
        <img src={uscVillage} alt="" width={640} height={360} loading="lazy" decoding="async" />
      </span>
    </a>
  );
}

const ABOUT_SWITCH_TRACK = {
  off: 'rgba(241, 245, 249, 0.14)',
  on: 'rgba(53, 129, 184, 0.48)',
};

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

function AboutPhotoScroller() {
  const scrollerRef = useRef(null);
  const slidesRef = useRef(null);
  const indexRef = useRef(0);

  const scrollToIndex = (nextIndex, behavior = 'smooth') => {
    const scroller = scrollerRef.current;
    const track = slidesRef.current;
    if (!scroller || !track) return;
    const slide = track.children[nextIndex];
    if (!slide) return;
    const slideWidth = slide.getBoundingClientRect().width || scroller.clientWidth;
    scroller.scrollTo({
      left: slideWidth * nextIndex,
      behavior,
    });
    indexRef.current = nextIndex;
  };

  useEffect(() => {
    if (ABOUT_FAVORITE_PHOTOS.length <= 1) return undefined;
    const id = window.setInterval(() => {
      const next = (indexRef.current + 1) % ABOUT_FAVORITE_PHOTOS.length;
      scrollToIndex(next);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const photoCount = ABOUT_FAVORITE_PHOTOS.length;
  const goPrev = () => {
    if (photoCount <= 1) return;
    const next = (indexRef.current - 1 + photoCount) % photoCount;
    scrollToIndex(next);
  };
  const goNext = () => {
    if (photoCount <= 1) return;
    const next = (indexRef.current + 1) % photoCount;
    scrollToIndex(next);
  };

  return (
    <div className="about-photo-scroller-wrap">
      <div
        className="about-photo-scroller"
        role="region"
        aria-roledescription="carousel"
        aria-label="Favorite photos"
        ref={scrollerRef}
      >
        <div className="about-photo-scroller__track" ref={slidesRef}>
          {ABOUT_FAVORITE_PHOTOS.map((photo, index) => (
            <figure key={photo.src} className="about-photo-scroller__slide">
              <img
                src={photo.src}
                alt={photo.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
      {photoCount > 1 && (
        <>
          <button
            type="button"
            className="about-photo-scroller__nav about-photo-scroller__nav--prev"
            aria-label="Previous photo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={goPrev}
          >
            <img src={chevronRight} alt="" width={18} height={18} draggable={false} />
          </button>
          <button
            type="button"
            className="about-photo-scroller__nav about-photo-scroller__nav--next"
            aria-label="Next photo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={goNext}
          >
            <img src={chevronRight} alt="" width={18} height={18} draggable={false} />
          </button>
        </>
      )}
    </div>
  );
}

const TECH_STACK = [
  { id: 'react', name: 'React', icon: techReact },
  { id: 'typescript', name: 'TypeScript', icon: techTypescript },
  { id: 'nodejs', name: 'Node.js', icon: techNodejs },
  { id: 'python', name: 'Python', icon: techPython },
  { id: 'c', name: 'C++', icon: techC },
  { id: 'postgresql', name: 'PostgreSQL', icon: techPostgresql },
  { id: 'aws', name: 'AWS', icon: techAws },
];

/** Personal “Aside from coding” — driven by pyramid stackLevel: 0 photos, 1 music, 2 family. */
function PersonalIntroContent({ stackLevel }) {
  if (stackLevel === 1) {
    return (
      <>
        <p className="about-lead">
          I&apos;m also a huge fan of music, playing piano/guitar and writing songs. I&apos;m a little
          too shy to show off some songs I wrote, but...
        </p>
        <p className="about-body">Add stuff about music here...</p>
      </>
    );
  }
  if (stackLevel >= 2) {
    return (
      <>
        <p className="about-lead">
          Lastly, my friends and family define who I am. Here are some of my favorite memories that I
          got to make from the past few years:
        </p>
      </>
    );
  }
  return (
    <>
      <p className="about-lead">
        I also got into photography recently. I have an Fujifilm X-T5 that I always pullout whenever I
        go on roadtrips with my friends. Here are some of my favorites:
      </p>
      <AboutPhotoScroller />
      <br />
    </>
  );
}

const technicalIntro = (
  <>
    <p className="about-lead">
      I&apos;m Jesse, a Computer Science senior at <AboutUscLink /> and I turn problems into products.
      <br/><br/>
      
      I&apos;ve shipped real projects
      end to end, and I work product-first: understand the problem, then write code that adheres to
      principles I care about—clarity, correctness, and maintainability.

      <br/><br/>

      I bring a lot of frontend experience, and lately I&apos;ve been digging into
      backend-heavy work, building APIs, databases, and the services behind the UI. 
    </p>
    <p className="about-tech-label about-tech-label--belt">Some tech I&apos;ve worked with</p>
    <div
      className="about-tech-belt"
      aria-label={`Technologies: ${TECH_STACK.map((t) => t.name).join(', ')}`}
    >
      <ul className="about-tech-belt__track" aria-hidden="true">
        {[...TECH_STACK, ...TECH_STACK].map(({ id, name, icon }, index) => (
          <li key={`${id}-${index}`} className="about-tech-chip">
            <img
              src={icon}
              alt=""
              className="about-tech-chip__icon"
              width={18}
              height={18}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {name}
          </li>
        ))}
      </ul>
    </div>
    <p className="about-body about-body--segue">
      Check out some of the stuff I&apos;ve been working on below.
    </p>
  </>
);

export default function About() {
  const [introType, setIntroType] = useState(true);
  const [stackLevel, setStackLevel] = useState(0);
  const switchId = useId();
  const labelId = `${switchId}-label`;

  return (
    <section
      id="about-me"
      className="page about page-viewport-min page-viewport-min--scroll-hint"
      aria-labelledby="about-heading"
    >
      <div className="about-header-row">
        <h1
          key={introType ? 'technical' : 'personal'}
          id="about-heading"
          className="about-heading about-reveal-item"
        >
          {introType ? 'A little bit about me…' : 'Aside from coding…'}
        </h1>
        <div className="about-header-row__switch">
          <Switch
            id={switchId}
            aria-labelledby={labelId}
            value={!introType}
            onPress={() => setIntroType((v) => !v)}
            duration={400}
            trackColors={ABOUT_SWITCH_TRACK}
          />
          <p
            id={labelId}
            style={{
              marginTop: '0.5rem',
              ...(introType ? { color: '#f5d259' } : {}),
            }}
            className="about-intro-toggle__label"
          >
            Hi I'm Button
          </p>
        </div>
      </div>

      <div className="about-main-grid">
        <div
          className="about-copy about-reveal-item"
          key={introType ? 'technical' : `personal-${stackLevel}`}
          aria-live="polite"
        >
          {introType ? technicalIntro : <PersonalIntroContent stackLevel={stackLevel} />}
        </div>
        <aside className="about-physics-aside about-reveal-item" aria-label="Physics sandbox">
          <SelectionPhysicsComponent
            key={introType ? 'about-intro' : 'aside-intro'}
            variant={introType ? 'about' : 'aside'}
            onStackLevelChange={setStackLevel}
          />
        </aside>
      </div>

      <SectionScrollHint
        href="#projects"
        label="Featured Work"
        ariaLabel="Scroll to Featured Work"
      />
    </section>
  );
}
