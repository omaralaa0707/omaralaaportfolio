import React, { useRef, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

// Types for component props
interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

// Reusable Shader Background Hook. `theme` picks which fragment shader
// renders - a dark cosmic nebula, or a light airy-sky variant - so the
// hero's own background (not just the UI chrome) responds to the toggle.
export const useShaderBackground = (theme: "light" | "dark" = "dark") => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);

  // WebGL Renderer class
  class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private vs: WebGLShader | null = null;
    private fs: WebGLShader | null = null;
    private buffer: WebGLBuffer | null = null;
    private scale: number;
    private shaderSource: string;
    private mouseMove = [0, 0];
    private mouseCoords = [0, 0];
    private pointerCoords = [0, 0];
    private nbrOfPointers = 0;

    private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext("webgl2")!;
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = defaultShaderSource;
    }

    updateShader(source: string) {
      this.reset();
      this.shaderSource = source;
      this.setup();
      this.init();
    }

    updateMove(deltas: number[]) {
      this.mouseMove = deltas;
    }

    updateMouse(coords: number[]) {
      this.mouseCoords = coords;
    }

    updatePointerCoords(coords: number[]) {
      this.pointerCoords = coords;
    }

    updatePointerCount(nbr: number) {
      this.nbrOfPointers = nbr;
    }

    updateScale(scale: number) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error("Shader compilation error:", error);
      }
    }

    test(source: string) {
      let result = null;
      const gl = this.gl;
      const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        result = gl.getShaderInfoLog(shader);
      }
      gl.deleteShader(shader);
      return result;
    }

    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) {
          gl.detachShader(this.program, this.vs);
          gl.deleteShader(this.vs);
        }
        if (this.fs) {
          gl.detachShader(this.program, this.fs);
          gl.deleteShader(this.fs);
        }
        gl.deleteProgram(this.program);
      }
    }

    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER)!;
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram()!;
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program));
      }
    }

    init() {
      const gl = this.gl;
      const program = this.program!;

      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      (program as any).resolution = gl.getUniformLocation(program, "resolution");
      (program as any).time = gl.getUniformLocation(program, "time");
      (program as any).move = gl.getUniformLocation(program, "move");
      (program as any).touch = gl.getUniformLocation(program, "touch");
      (program as any).pointerCount = gl.getUniformLocation(program, "pointerCount");
      (program as any).pointers = gl.getUniformLocation(program, "pointers");
    }

    render(now = 0) {
      const gl = this.gl;
      const program = this.program;

      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

      gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f((program as any).time, now * 1e-3);
      gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
      gl.uniform2f((program as any).touch, this.mouseCoords[0], this.mouseCoords[1]);
      gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
      gl.uniform2fv((program as any).pointers, this.pointerCoords);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // Pointer Handler class
  class PointerHandler {
    private scale: number;
    private active = false;
    private pointers = new Map<number, number[]>();
    private lastCoords = [0, 0];
    private moves = [0, 0];

    constructor(element: HTMLCanvasElement, scale: number) {
      this.scale = scale;

      const map = (element: HTMLCanvasElement, scale: number, x: number, y: number) => [
        x * scale,
        element.height - y * scale,
      ];

      element.addEventListener("pointerdown", (e) => {
        this.active = true;
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      });

      element.addEventListener("pointerup", (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener("pointerleave", (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener("pointermove", (e) => {
        if (!this.active) return;
        this.lastCoords = [e.clientX, e.clientY];
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
      });
    }

    getScale() {
      return this.scale;
    }

    updateScale(scale: number) {
      this.scale = scale;
    }

    get count() {
      return this.pointers.size;
    }

    get move() {
      return this.moves;
    }

    get coords() {
      return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0];
    }

    get first() {
      return this.pointers.values().next().value || this.lastCoords;
    }
  }

  const resize = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    if (rendererRef.current) {
      rendererRef.current.updateScale(dpr);
    }
  };

  const loop = (now: number) => {
    if (!rendererRef.current || !pointersRef.current) return;

    rendererRef.current.updateMouse(pointersRef.current.first);
    rendererRef.current.updatePointerCount(pointersRef.current.count);
    rendererRef.current.updatePointerCoords(pointersRef.current.coords);
    rendererRef.current.updateMove(pointersRef.current.move);
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);

    rendererRef.current.setup();
    rendererRef.current.init();

    resize();

    const initialSource = theme === "dark" ? defaultShaderSource : lightShaderSource;
    if (rendererRef.current.test(initialSource) === null) {
      rendererRef.current.updateShader(initialSource);
    }

    loop(0);

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.reset();
      }
    };
    // Only the initial mount sets up the GL context - theme swaps after
    // that are handled by the effect below via updateShader(), not a
    // full teardown/rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the fragment shader in place when the theme changes post-mount.
  useEffect(() => {
    if (!rendererRef.current) return;
    const source = theme === "dark" ? defaultShaderSource : lightShaderSource;
    if (rendererRef.current.test(source) === null) {
      rendererRef.current.updateShader(source);
    }
  }, [theme]);

  return canvasRef;
};

// Standalone shader canvas - used to mount the WebGL background once, fixed
// behind the entire page, instead of once per <Hero> instance.
export const ShaderCanvas: React.FC<{ className?: string; theme?: "light" | "dark" }> = ({
  className = "",
  theme = "dark",
}) => {
  const canvasRef = useShaderBackground(theme);
  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-contain touch-none ${className}`}
      style={{ background: "black" }}
    />
  );
};

// Reusable Hero Component
const Hero: React.FC<HeroProps & { hideCanvas?: boolean }> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = "",
  hideCanvas = false,
}) => {
  const { theme } = useTheme();
  const canvasRef = useShaderBackground(theme);

  return (
    <div
      id="hero-shader"
      className={`relative w-full h-screen overflow-hidden ${hideCanvas ? "" : theme === "dark" ? "bg-black" : "bg-[#f7f0ea]"} ${className}`}
    >
      {/* Animation keyframes (fade-in-down/up, gradient-shift) live in src/index.css -
          styled-jsx (`<style jsx>`) is a Next.js-only mechanism and isn't available
          in this Vite setup, so they were extracted to a plain global stylesheet. */}

      {/* When hideCanvas is set, a single global <ShaderCanvas> (mounted once in
          App.tsx, fixed behind the whole page) shows through instead - avoids
          running a second redundant WebGL context per <Hero> instance. */}
      {!hideCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain touch-none opacity-60"
          style={{ background: "black" }}
        />
      )}

      {/* Scrim behind the content, same structure for both themes - a flat
          tint plus a radial falloff centered on the text - just black/35 for
          dark and white/35 for light so the shader's clouds/streaks don't
          wash out the text. */}
      {theme === "dark" ? (
        <>
          <div className="absolute inset-0 z-[5] bg-black/35 pointer-events-none" />
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 75% 65% at 50% 45%, rgba(0,0,0,0.55), rgba(0,0,0,0.2) 70%)",
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-[5] bg-white/35 pointer-events-none" />
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 75% 65% at 50% 45%, rgba(255,255,255,0.55), rgba(255,255,255,0.2) 70%)",
            }}
          />
        </>
      )}

      {/* Hero Content Overlay */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center ${theme === "dark" ? "text-white" : "text-neutral-900"}`}
      >
        {/* Trust Badge */}
        {trustBadge && (
          <div className="mb-8 animate-fade-in-down">
            <div
              className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md border border-sunset-mauve/30 rounded-full text-sm ${theme === "dark" ? "bg-black/30" : "bg-white/40"}`}
            >
              {trustBadge.icons && (
                <div className="flex">
                  {trustBadge.icons.map((icon, index) => (
                    <span
                      key={index}
                      className={
                        index === 0 ? "text-sunset-coral" : index === 1 ? "text-sunset-mauve" : "text-sunset-blue"
                      }
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              )}
              <span className={theme === "dark" ? "text-white/90" : "text-neutral-900/90"}>{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-6 max-w-5xl mx-auto px-4">
          {/* Main Heading with Animation */}
          <div className="space-y-2">
            <h1
              className={`text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-sunset-blue via-sunset-mauve to-sunset-coral bg-clip-text text-transparent animate-fade-in-up animation-delay-200 ${theme === "dark" ? "drop-shadow-[0_4px_28px_rgba(0,0,0,0.65)]" : "drop-shadow-[0_4px_24px_rgba(255,255,255,0.75)]"}`}
            >
              {headline.line1}
            </h1>
            <h1
              className={`text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-sunset-mauve via-sunset-coral to-sunset-terracotta bg-clip-text text-transparent animate-fade-in-up animation-delay-400 ${theme === "dark" ? "drop-shadow-[0_4px_28px_rgba(0,0,0,0.65)]" : "drop-shadow-[0_4px_24px_rgba(255,255,255,0.75)]"}`}
            >
              {headline.line2}
            </h1>
          </div>

          {/* Subtitle with Animation */}
          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            <p
              className={`text-lg md:text-xl lg:text-2xl font-light leading-relaxed ${theme === "dark" ? "text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]" : "text-neutral-900/90 drop-shadow-[0_2px_12px_rgba(255,255,255,0.8)]"}`}
            >
              {subtitle}
            </p>
          </div>

          {/* CTA Buttons with Animation */}
          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-8 py-4 bg-gradient-to-r from-sunset-coral to-sunset-terracotta hover:brightness-110 text-black rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-sunset-terracotta/25"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className={`px-8 py-4 bg-sunset-blue/10 hover:bg-sunset-blue/20 border border-sunset-blue/30 hover:border-sunset-blue/50 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm ${theme === "dark" ? "text-white" : "text-neutral-900"}`}
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const defaultShaderSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*
*	To explore strange new worlds, to seek out new life
*	and new civilizations, to boldly go where no man has
*	gone before.
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
// Returns a pseudo random number for a given point (white noise)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
// Returns a pseudo random number for a given point (value noise)
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
// Returns a pseudo random number for a given point (fractal noise)
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.)*vec3(.95,.75,.85);
		float b=noise(i+p+bg*1.731);
		col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
		vec3 skyTop=vec3(.14,.32,.46);
		vec3 skyBot=vec3(.72,.45,.40);
		vec3 sky=mix(skyBot,skyTop,clamp(uv.y*.6+.5,0.,1.));
		col=mix(col,sky*bg*1.4,d);
	}
	O=vec4(col,1);
}`;

// Light-theme variant: a pale dawn sky (instead of a dark nebula) with soft
// tinted streaks subtracted from the base rather than glowing additively -
// additive white-on-white would just disappear, so this shader is genuinely
// different math, not an inverted palette swap of the dark one.
const lightShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	vec3 skyTop=vec3(.68,.74,.88);
	vec3 skyBot=vec3(.97,.68,.56);
	vec3 sky=mix(skyBot,skyTop,clamp(uv.y*.6+.5,0.,1.));
	vec3 cloudLit=vec3(1.,.97,.93);
	vec3 cloudShadow=vec3(.55,.32,.5);
	// The dark shader gets its contrast from additive brightening against a
	// black base - that trick clips to plain white on a light base, which is
	// why earlier passes here read as a washed-out flat tint no matter how
	// the coefficients were tuned. Fix: push contrast through a sharpened
	// (smoothstep) lit/shadow cloud mix instead of a soft linear blend, and
	// give the streak terms real weight since a mix toward a fixed color is
	// inherently softer than the dark shader's unbounded additive glow.
	vec3 col=mix(sky,mix(cloudShadow,cloudLit,bg),smoothstep(.15,.85,bg));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		// Mix directly toward fixed indigo/mauve tones instead of subtracting
		// an oscillating per-channel value - that approach let green become
		// the least-reduced (and so dominant) channel by accident.
		// Cloud remix happens BEFORE the streak blends below, not after -
		// otherwise this large-weight mix runs last each iteration and
		// paints back over the comet streaks, erasing them.
		col=mix(col,mix(cloudShadow,cloudLit,bg),d*.45);
		float glow=clamp(.05*dot(cos(sin(i)*vec3(1,2,3))+1.,vec3(.333))/d,0.,1.);
		col=mix(col,vec3(.16,.1,.34),glow);
		// Dark mode's comet reads as a bright streak because it ADDS
		// brightness (col+=...) rather than mixing toward a fixed color -
		// mix() overrides the base entirely as the factor rises, which
		// washed the whole frame toward flat white. Additive only ever
		// brightens the thin streak path, leaving the rest of the cloud
		// texture untouched, same as the dark shader's technique.
		// Near-white against an already-pale sky has too little contrast to
		// read as a line - it just looks like a soft glow. A saturated warm
		// gold stands out from the purple/pink palette instead.
		// Unclamped like the dark shader's trail term - clamping per
		// iteration saturates a wide area to the same ceiling, which is
		// what read as a round blob instead of a thin decaying line.
		float b=noise(i+p+bg*1.731);
		float trail=.014*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col+=trail*vec3(1.,.65,.25);
	}
	col=clamp(col,0.,1.);
	O=vec4(col,1);
}`;

export default Hero;
