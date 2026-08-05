export function ContactSection() {
  return (
    <section id="contact" className="px-6 md:px-12 py-24 md:py-40">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Available for freelance projects</p>

        <h2 className="font-display text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[1.0] tracking-[-0.02em] mb-12 max-w-4xl bg-gradient-to-r from-sunset-blue via-sunset-mauve to-sunset-terracotta bg-clip-text text-transparent">
          Let's build something worth visiting.
        </h2>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="mailto:omar@tenevue.com"
            className="btn-press inline-flex items-center gap-2 bg-gradient-to-r from-sunset-coral to-sunset-terracotta hover:brightness-110 text-black text-sm font-semibold px-7 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-sunset-terracotta/25 group"
          >
            Email
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="https://wa.me/201060055180"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sunset-coral text-sm border-b border-transparent hover:border-accent/50 transition-colors pb-0.5 group"
          >
            WhatsApp
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
