export function Footer() {
  return (
    <footer className="px-6 md:px-12 py-8 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <nav className="flex items-center gap-6">
          <a href="#work" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            Work
          </a>
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            Contact
          </a>
        </nav>

        <a href="mailto:omar@tenevue.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
          omar@tenevue.com
        </a>

        <span className="text-muted-foreground text-sm">© 2026 Omar Alaa</span>
      </div>
    </footer>
  );
}
