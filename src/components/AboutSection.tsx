const TRAITS = [
  { n: "01", label: "Fast delivery" },
  { n: "02", label: "Fully customizable" },
  { n: "03", label: "Designed to turn visitors into clients" },
];

export function AboutSection() {
  return (
    <section id="about" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-start">
        <div>
          <h2 className="font-display text-3xl md:text-[2.75rem] font-medium leading-[1.1] tracking-tight mb-6 bg-gradient-to-r from-sunset-mauve via-sunset-coral to-sunset-rose bg-clip-text text-transparent">
            A site that works for your business.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            I'm Omar Alaa, a freelance web designer and developer based in Cairo, Egypt. I build for businesses
            that need results, clinics that need bookings, manufacturers that need credibility, founders that need
            to launch fast. Every project is built to be fast, easy to maintain, and ready for real customers on
            day one.
          </p>
        </div>

        <div className="flex flex-col gap-0 border-t border-border">
          {TRAITS.map((t) => (
            <div key={t.n} className="py-5 border-b border-border flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">{t.n}</span>
              <span className="text-primary font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
