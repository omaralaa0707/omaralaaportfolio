import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-5",
        scrolled && "nav-scrolled",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#" className="text-primary font-semibold text-base tracking-tight">
          Omar Alaa
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#work" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide">
            Work
          </a>
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide">
            Contact
          </a>
        </div>

        <a
          href="#contact"
          className="btn-press hidden md:inline-flex items-center gap-2 bg-sunset-mauve/10 border border-sunset-mauve/30 text-primary backdrop-blur-sm text-sm px-5 py-2.5 rounded-full hover:bg-sunset-mauve/20 hover:border-sunset-mauve/50 transition-colors duration-200 group"
        >
          Get in touch
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </nav>
  );
}
