import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  href: string;
  /** Screen-recording of the live site (looping mp4). Provide this OR imageSrc. */
  videoSrc?: string;
  /** Static screenshot of the live site. Provide this OR videoSrc. */
  imageSrc?: string;
  eyebrow: string;
  title: string;
  className?: string;
}

export function ProjectCard({ href, videoSrc, imageSrc, eyebrow, title, className }: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };
    card.addEventListener("mousemove", onMove);
    return () => card.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => video.play().catch(() => {});
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });
  }, []);

  return (
    <a
      ref={cardRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "project-card rounded-[28px] overflow-hidden border border-border bg-surface group flex flex-col h-full",
        className,
      )}
    >
      <div className="card-media shrink-0">
        {videoSrc ? (
          <video ref={videoRef} autoPlay muted loop playsInline preload="metadata">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img src={imageSrc} alt={`${title} homepage preview`} loading="lazy" />
        )}
      </div>
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-border">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 truncate">{eyebrow}</div>
          <div className="text-base font-medium text-primary truncate">{title}</div>
        </div>
        <span className="arrow-link text-muted-foreground text-sm shrink-0">
          <span>View project</span>
          <span>→</span>
        </span>
      </div>
    </a>
  );
}

// Empty slot for a project that hasn't been wired in yet - fill in a real
// <ProjectCard> in WorkSection.tsx's PROJECTS array to replace it. Rendered
// as a non-interactive div (no fake href, no fabricated client work) so it
// reads unmistakably as a placeholder, not a broken link.
export function ProjectCardPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[28px] overflow-hidden border border-dashed border-border/70 flex flex-col items-center justify-center gap-3 text-muted-foreground/60 min-h-[220px] card-media",
        className,
      )}
    >
      <Plus className="w-6 h-6" strokeWidth={1.5} />
      <div className="text-xs uppercase tracking-widest text-center px-6">
        Next project - add it in WorkSection.tsx
      </div>
    </div>
  );
}
