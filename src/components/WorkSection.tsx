import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectCard } from "@/components/ProjectCard";

gsap.registerPlugin(ScrollTrigger);

// Every entry renders at the same size in a responsive grid. To add a new
// project later, add another entry here with a screenshot in
// public/images/previews/ (or a videoSrc instead).
const PROJECTS = [
  {
    href: "https://riopack.vercel.app",
    imageSrc: "/images/previews/riopack.jpg",
    eyebrow: "Corporate · Print & Packaging",
    title: "Riopack Co.",
  },
  {
    href: "https://www.tenevue.com",
    imageSrc: "/images/previews/tenevue.jpg",
    eyebrow: "AI Product · SaaS",
    title: "Tenevue",
  },
  {
    href: "https://www.acppegypt.com",
    imageSrc: "/images/previews/acpp.jpg",
    eyebrow: "Psychiatry · Psychology Center",
    title: "ACPP Egypt",
  },
  {
    href: "https://thryvetherapy.vercel.app",
    imageSrc: "/images/previews/thryve.jpg",
    eyebrow: "Therapy · Healthcare Center",
    title: "Thryve Therapy",
  },
  {
    href: "https://unfolding-therapy.vercel.app",
    imageSrc: "/images/previews/unfolding-therapy.jpg",
    eyebrow: "Therapy · Personal Practice",
    title: "Unfolding Therapy",
  },
] as const;

// Chunk into rows of 3 so a leftover row (e.g. 2 items) gets its own grid
// with fewer columns - those cards then stretch to fill the row's full
// width instead of leaving an empty gap where a 3rd column would be.
function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

const ROW_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight bg-gradient-to-r from-sunset-blue via-sunset-mauve to-sunset-coral bg-clip-text text-transparent">
            Selected work
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">Client projects, built and shipped.</p>
        </div>

        <div className="flex flex-col gap-4">
          {chunk(PROJECTS, 3).map((row, i) => (
            <div key={i} className={`grid ${ROW_COLS[row.length]} gap-4`}>
              {row.map((project) => (
                <ProjectCard key={project.href} {...project} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
