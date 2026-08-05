import { useEffect, useState } from "react";
import Hero from "@/components/ui/animated-shader-hero";

// Wraps the shader Hero with Omar's actual copy (kept the demo's original
// orange/yellow shader palette per request, only the content is site-specific).
export function PortfolioHero() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Africa/Cairo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Hero
      trustBadge={{
        text: `Cairo, Egypt · ${time} — available for freelance work`,
        icons: ["✨"],
      }}
      headline={{
        line1: "Websites that",
        line2: "people remember",
      }}
      subtitle="Freelance web designer & developer. I work with brands, clinics, and founders to turn ideas into production sites."
      buttons={{
        primary: {
          text: "Get in touch",
          onClick: () => scrollTo("contact"),
        },
        secondary: {
          text: "View work",
          onClick: () => scrollTo("work"),
        },
      }}
    />
  );
}
