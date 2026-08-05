import { createRoot } from "react-dom/client";
import App from "@/App";
import { ThemeProvider } from "@/hooks/use-theme";
import "@/index.css";

// No <StrictMode> wrapper: the animated-shader-hero component owns an
// imperative WebGL context (setup/teardown via canvas.getContext + manual
// program management) that isn't safe under StrictMode's dev-only double
// effect invocation - it tears the GL program down and rebuilds it twice on
// mount, which leaves the canvas blank in dev (confirmed the production
// build renders correctly either way; this only affects `npm run dev`).
createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
