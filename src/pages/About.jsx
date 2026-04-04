import { lazy, Suspense, useEffect, useId, useState, useTransition } from 'react';
import uscVillage from '../assets/usc-village.png';
import techAws from '../assets/tech-aws.svg';
import techC from '../assets/tech-c.svg';
import techNodejs from '../assets/tech-nodejs.svg';
import techPostgresql from '../assets/tech-postgresql.svg';
import techPython from '../assets/tech-python.svg';
import techReact from '../assets/tech-react.svg';
import techTypescript from '../assets/tech-typescript.svg';
import SectionScrollHint from '../components/SectionScrollHint';
import SelectionPhysicsComponent from '../components/SelectionPhysicsComponent';
import Switch from '../components/Switch';
import SpotifyEmbed from '../components/SpotifyEmbed';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/Carousel';

const SPOTIFY_FAVORITE_TRACKS = [
  'https://open.spotify.com/track/3hEfpBHxgieRLz4t3kLNEg?si=31d81f469656486e',
  'https://open.spotify.com/track/1sTtlEZeVeeEnxEztJNkYN?si=63b554c4f215484e',
  'https://open.spotify.com/track/2JN3ugW1cEahbYw0I5mw5U?si=54defafa35ec4556',
  'https://open.spotify.com/track/5MMLS3xm12D7N26xlfFApr?si=b982714081504b51',
  'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr?si=375c798164fd469c',
  'https://open.spotify.com/track/38o5lj4mbLK34vQkJUlMrg?si=83793ab381134a45',
  'https://open.spotify.com/track/6fNQDsCq6LWfwTZnXl2Xsg?si=413adeaa79494ddc',
  'https://open.spotify.com/track/3pTHZHX0MRE7xYeiTEWlaM?si=1fdb945830524750',
  'https://open.spotify.com/track/7EsjkelQuoUlJXEw7SeVV4?si=3fbe494bd9774ae8',
  'https://open.spotify.com/track/7eJMfftS33KTjuF7lTsMCx?si=2dc9fbbec92746f4',
  'https://open.spotify.com/track/4C4zy9kfjYjr6IcNAdV7ZD?si=9f97bee6bf6b4908'
];

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

const AboutPhotoGallery = lazy(() => import('../components/AboutPhotoGallery.jsx'));

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
          I&apos;m also a huge fan of music. I grew up playing piano and violin and also taught myself guitar. I love singing and jamming in my free time! 

          <br />
          <br />
          Here are some of my favorite songs from some of my favorite artists:


        </p>

        <Carousel
          className="spotify-carousel"
          opts={{ align: 'start', loop: false }}
          autoPlayInterval={7000}
        >
          <CarouselContent>
            {SPOTIFY_FAVORITE_TRACKS.map((link) => (
              <CarouselItem key={link}>
                <SpotifyEmbed link={link} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label="Previous track" />
          <CarouselNext aria-label="Next track" />
        </Carousel>

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
      <Suspense
        fallback={
          <div
            className="about-photo-gallery-wrap about-photo-gallery-wrap--pending"
            aria-hidden="true"
          />
        }
      >
        <AboutPhotoGallery />
      </Suspense>
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
  const [, startIntroTransition] = useTransition();
  const switchId = useId();
  const labelId = `${switchId}-label`;

  useEffect(() => {
    const runPrefetch = () => {
      void import('../components/AboutPhotoGallery.jsx');
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(runPrefetch, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(runPrefetch, 400);
    return () => window.clearTimeout(t);
  }, []);

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
            onPress={() =>
              startIntroTransition(() => {
                setIntroType((v) => !v);
              })
            }
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
