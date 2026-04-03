import SectionScrollHint from "../components/SectionScrollHint";
import Project from "../components/Project";
import vetrailImg from "../assets/project-demos/vetrail.png";
import crunchyRollImg from "../assets/project-demos/crunchy-roll.png";
import habitHatchersImg from "../assets/project-demos/habit-hatchers.png";

export default function Projects() {
  const featuredWorkItems = [
    {
      image: vetrailImg,
      title: "Vetrail",
      description: 
        "Vetrail is a web application that allows you to track your veterinary appointments and medications.",
      technologies: ["React", "Node.js", "Express", "PostgreSQL"],
      websiteUrl: "https://vetrail.app",
      demoUrl: null,
    },
    {
      image: crunchyRollImg,
      title: "Crunchy Roll Filler Skipper",
      description:
        "Built for those who want to spend more time watching anime than watching filler content.",
      technologies: ["JavaScript", "Chrome Extension API"],
      codeUrl: "https://github.com/jesse1333/Crunchy-Roll-Filler-Extension",
      demoUrl: null,
    },
    {
      image: habitHatchersImg,
      title: "Habit Hatchers",
      description: 
        "Built for people who want to hatch better habits, and break bad ones. ",
      technologies: ["Swift", "SwiftUI", "JSON"],
      codeUrl: "https://github.com/jesse1333/Habit-Hatchers",
      demoUrl: null,
    },
  ];

  return (
    <section
      id="projects"
      className="page projects page-viewport-min page-viewport-min--scroll-hint"
    >
      {/* Keep old anchor for navbar compatibility while moving to featured-work URLs. */}
      <span id="projects" aria-hidden="true" />
      <div className="projects-inner">
        <h1>Featured Work</h1>
        <div className="projects-grid">
          {featuredWorkItems.map((project) => (
            <Project key={project.title} {...project} />
          ))}
        </div>
      </div>
      <SectionScrollHint
        href="#experiences"
        label="Experiences"
        ariaLabel="Scroll to Experiences"
      />
    </section>
  );
}
