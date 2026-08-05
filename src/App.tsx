import { Nav } from "@/components/Nav";
import { PortfolioHero } from "@/components/PortfolioHero";
import { Marquee } from "@/components/Marquee";
import { WorkSection } from "@/components/WorkSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

function Divider() {
  return <div className="section-divider mx-6 md:mx-12" />;
}

export default function App() {
  return (
    <>
      {/* Shader lives only inside the hero (see PortfolioHero); the rest of the
          page gets a static ambient-glow depth system in the sunset palette. */}
      <div className="ambient" aria-hidden="true" />
      <div className="grid-texture" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main-content">
        <PortfolioHero />

        <Marquee />

        <WorkSection />

        <Divider />
        <AboutSection />

        <Divider />
        <TestimonialsSection />

        <Divider />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
