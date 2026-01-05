import { useState, useEffect } from "react";
import Link from "next/link";
import { FlowerCanvas } from "./FlowerCanvas";

// Main work experience
const mainExperiences = [
  {
    id: "lapis",
    company: "LAPIS",
    role: "Founder",
    start: "2025",
    end: "····",
    href: "https://trylapis.com",
  },
  {
    id: "walmart",
    company: "WALMART",
    role: "ML Engineer",
    start: "2023",
    end: "2025",
    href: "https://www.walmart.com/",
  },
];

// Internship/Previous experience
const internshipExperiences = [
  {
    id: "inquirer",
    company: "INQUIRER",
    role: "Data Engineer",
    start: "2021",
    end: "2021",
    href: "https://www.inquirer.com/",
  },
  {
    id: "amfam",
    company: "AMFAM",
    role: "ML Intern",
    start: "2020",
    end: "2021",
    href: "https://www.amfam.com/",
  },
  {
    id: "mindgram",
    company: "MINDGRAM",
    role: "ML Engineer",
    start: "2019",
    end: "2020",
    href: "https://www.mindgram.ai/",
  },
  {
    id: "stellenbosch",
    company: "STELLENBOSCH",
    role: "Research",
    start: "2019",
    end: "2019",
    href: "https://www.sun.ac.za/english",
  },
  {
    id: "aaa",
    company: "AAA",
    role: "Data Science",
    start: "2018",
    end: "2018",
    href: "https://www.acg.aaa.com/",
  },
];

// Education data
const educationExperiences = [
  {
    id: "columbia",
    company: "COLUMBIA",
    role: "MS CS",
    start: "2021",
    end: "2023",
    href: "https://www.columbia.edu/",
  },
  {
    id: "umich",
    company: "UMICH",
    role: "BSI",
    start: "2017",
    end: "2021",
    href: "https://umich.edu/",
  },
];

const socialLinks = [{ title: "EMAIL", href: "mailto:ss6365@columbia.edu" }];

const externalLinks = [
  { title: "GITHUB", href: "https://github.com/saisurbehera" },
  { title: "LINKEDIN", href: "https://linkedin.com/in/saisurbehera" },
  { title: "TWITTER", href: "https://x.com/saibuilds" },
];

function ExperienceRow({ experience, onHover, isHovered }) {
  return (
    <a
      href={experience.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 py-1 transition-opacity duration-200 group ${
        isHovered ? "opacity-100" : "opacity-70 hover:opacity-100"
      }`}
      onMouseEnter={() => onHover(experience.id)}
      onMouseLeave={() => onHover("default")}
    >
      <span className="font-mono text-sm uppercase tracking-wide">
        {experience.company}
      </span>
      <span className="font-mono text-sm opacity-60">
        {experience.start} → {experience.end}
      </span>
    </a>
  );
}

function LinkRow({ title, href, isExternal = false }) {
  const linkProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      className="block font-mono text-sm uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity py-1"
      {...linkProps}
    >
      {title}
    </a>
  );
}

export function Home() {
  const [hoveredExperience, setHoveredExperience] = useState("default");
  const [showInternships, setShowInternships] = useState(false);
  const [theme, setTheme] = useState("blue");

  useEffect(() => {
    // Get initial theme from localStorage
    const storedTheme = localStorage.getItem("theme") || "blue";
    setTheme(storedTheme);

    // Set blue as default if no theme is stored
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "blue");
      document.documentElement.classList.add("theme-blue");
    }
  }, []);

  const cycleTheme = () => {
    const html = document.documentElement;
    let newTheme;

    if (theme === "blue") {
      html.classList.remove("theme-blue");
      html.classList.add("dark");
      newTheme = "dark";
    } else if (theme === "dark") {
      html.classList.remove("dark");
      newTheme = "light";
    } else {
      html.classList.add("theme-blue");
      newTheme = "blue";
    }

    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  // Dynamic classes based on theme
  const containerClasses =
    theme === "blue"
      ? "min-h-screen bg-[#2544fe] text-white font-mono p-6 md:p-12 flex relative"
      : theme === "dark"
        ? "min-h-screen bg-off-black text-slate-200 font-mono p-6 md:p-12 flex relative"
        : "min-h-screen bg-off-white text-gray-900 font-mono p-6 md:p-12 flex relative";

  return (
    <div className={containerClasses}>
      {/* Left side - Content */}
      <div className="flex-1 max-w-md z-10">
        <div className="mb-12">{/* S.CV removed */}</div>

        {/* Name & Title */}
        <div className="mb-12">
          <h1 className="text-lg font-mono uppercase tracking-wide mb-1">
            SAI SURBEHERA
          </h1>
          <p className="text-sm font-mono uppercase tracking-wide opacity-70">
            Reflexivity maxxing
          </p>
        </div>

        {/* Work Experience */}
        <div className="mb-8">
          {mainExperiences.map((exp) => (
            <ExperienceRow
              key={exp.id}
              experience={exp}
              onHover={setHoveredExperience}
              isHovered={hoveredExperience === exp.id}
            />
          ))}

          <button
            onClick={() => setShowInternships(!showInternships)}
            className="flex items-center gap-2 py-1 mt-2 group opacity-70 hover:opacity-100 transition-opacity w-full text-left outline-none focus:outline-none"
          >
            <span className="font-mono text-sm uppercase tracking-wide">
              {showInternships ? "[-]" : "[+]"} INTERNSHIPS
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showInternships ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
          >
            <div className="pl-4 border-l border-current/20">
              {internshipExperiences.map((exp) => (
                <ExperienceRow
                  key={exp.id}
                  experience={exp}
                  onHover={setHoveredExperience}
                  isHovered={hoveredExperience === exp.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="mb-12">
          {educationExperiences.map((exp) => (
            <ExperienceRow
              key={exp.id}
              experience={exp}
              onHover={setHoveredExperience}
              isHovered={hoveredExperience === exp.id}
            />
          ))}
        </div>

        {/* Links */}
        <div className="mb-8">
          {socialLinks.map((link) => (
            <LinkRow key={link.title} title={link.title} href={link.href} />
          ))}
        </div>

        {/* Social Links */}
        <div className="mb-12">
          {externalLinks.map((link) => (
            <LinkRow
              key={link.title}
              title={link.title}
              href={link.href}
              isExternal
            />
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="mt-auto">
          <button
            className="text-sm font-mono uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity"
            onClick={cycleTheme}
          >
            THEME
          </button>
        </div>
      </div>

      {/* Flower Canvas - Full screen background */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        <FlowerCanvas experienceId={hoveredExperience} />
      </div>

      {/* Top right corner indicator */}
      <div className="absolute top-6 right-6 md:top-12 md:right-12 z-10">
        <span className="font-mono text-sm">[*]</span>
      </div>
    </div>
  );
}
