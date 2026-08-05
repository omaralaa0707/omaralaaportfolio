const SKILLS = [
  "Web Design",
  "Frontend Development",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "UI/UX",
  "Supabase",
  "Vercel Deployment",
];

function MarqueeGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center shrink-0" aria-hidden={ariaHidden}>
      {SKILLS.map((skill, i) => (
        <div key={i} className="flex items-center shrink-0">
          <span className="font-display text-2xl md:text-3xl font-medium tracking-tight text-primary/80 px-6">
            {skill}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-sunset-coral/70 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="marquee-viewport border-y border-border py-6 md:py-8">
      <div className="marquee-track">
        <MarqueeGroup />
        <MarqueeGroup ariaHidden />
      </div>
    </div>
  );
}
