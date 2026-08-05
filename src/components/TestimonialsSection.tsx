import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Working with you Omar was seamless from start to finish. The new website perfectly reflects our brand and has significantly improved the experience for our customers.",
    name: "Sarah M.",
    role: "Marketing Director",
  },
  {
    quote:
      "The attention to detail was outstanding. Every page feels clean, modern, and easy to navigate. We couldn't be happier with the final result.",
    name: "Nour El-Din",
    role: "CEO",
  },
  {
    quote:
      "Fast, reliable, and incredibly talented. The website looks fantastic on every device and performs exactly as we needed, thank you so much Omar.",
    name: "Omar Khaled",
    role: "Startup Founder",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight bg-gradient-to-r from-sunset-mauve via-sunset-coral to-sunset-rose bg-clip-text text-transparent">
            What clients say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-[28px] border border-border bg-card p-8 flex flex-col gap-6 min-h-[220px] justify-between"
            >
              <Quote className="w-6 h-6 text-sunset-coral/70" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-primary/90">{t.quote}</p>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                — {t.name}, {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
