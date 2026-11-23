/* ==========================================================================
   Component: stage light (Home hero V3; V2 can use it on the same stage)
   The studio light beam drawn live in WebGL instead of the compressed photo
   plate: a shaft of warm light from beyond the top-right corner, with sun
   rays drifting slowly through it, haze moving in the air, and optional
   dust catching the light. Fine grain and dithering keep it crisp, with no
   banding, at 2x.

   The light comes through a narrow opening just past the stage's top-right
   corner and fans out down-left over the products (user, 2026-11-20: "coming
   from narrow source then it widens"): OPEN_* and SPREAD in the shader. The
   colour response is fitted to the original plate
   (assets/images/products/stage-plate.webp). The plate stays underneath as
   the fallback (no WebGL, no JS); the canvas fades in over it, then the rays
   come in.

   Markup: <canvas class="stage-light" data-stage-light data-light="dust">
   inside the box the plate covers. Looks (review: ?light=dust|rays|soft):
     dust: shafts drifting sideways + fine dust drifting in the light
     rays: crisper, stronger shafts, no dust
     soft: fewer, softer shafts, more haze, a little dust, slower
   Reduced motion: one still frame, no intro, no grain flicker.
   Runs only while the stage is on screen and the tab is visible.
   Phase 2 (Framer): becomes a code component with the same shader.
   ========================================================================== */
(function stageLight() {
  const canvases = Array.from(document.querySelectorAll('[data-stage-light]'));
  if (!canvases.length) return;

  const LOOKS = {
    dust: { rays: 1.0, haze: 0.55, dust: 1.0, sharp: 0.5, speed: 1.0 },
    rays: { rays: 1.1, haze: 0.45, dust: 0.0, sharp: 1.0, speed: 1.0 },
    soft: { rays: 0.55, haze: 0.9, dust: 0.55, sharp: 0.0, speed: 0.75 },
  };
  const INTRO = 2.4;       // seconds for the rays to come in
  const MAX_PIXELS = 5.2e6; // cap on drawing-buffer pixels (1440 stage at 2x ≈ 4.9M)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uIntro;   /* 0 → 1: rays, haze and dust come in */
uniform float uRays;
uniform float uHaze;
uniform float uDust;
uniform float uSharp;   /* 0 soft … 1 crisp shaft edges */
uniform float uGrain;
uniform float uFrame;   /* grain seed, steps at 24 fps */

/* the opening the light comes through (plate space, x from the right edge)
   and how the beam spreads from it */
#define OPEN_X 0.04
#define OPEN_Y -0.10
#define OPEN_W 0.07
#define SPREAD 0.22
#define OPEN_ANG 2.49
#define OPEN_I 1.1

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

/* one layer of dust: a mote in some grid cells, drifting up through the
   air with a slow wobble, glinting as it turns */
float dust(vec2 p, float scale, float density, float t, float seed) {
  vec2 q = p * scale + vec2(-0.010, 0.016) * t * scale; /* rises slowly, drifts left */
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float h = hash12(id + seed);
  if (h > density) return 0.0;
  float h2 = hash12(id + seed + 3.7);
  float h3 = hash12(id + seed + 9.1);
  vec2 o = (vec2(h2, h3) - 0.5) * 0.5;
  o += 0.14 * vec2(sin(t * (0.35 + h2 * 0.4) + h * 40.0), cos(t * (0.3 + h3 * 0.4) + h * 27.0));
  float size = 0.035 + 0.045 * h3;
  float m = smoothstep(size, size * 0.25, length(f - o));
  float glint = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (0.8 + 1.6 * h2) + h * 60.0), 3.0);
  return m * glint;
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * asp, 1.0 - uv.y);   /* plate space: y down, height 1 */
  float t = uTime;

  /* ---- the beam: light through a narrow opening just past the top-right
     corner (user, 2026-11-20: "coming from narrow source then it widens …
     dont need to be point source but narrow"), fanning out down-left over
     the products ---- */
  float ang = OPEN_ANG + 0.006 * sin(t * 0.17) + 0.004 * sin(t * 0.29 + 1.3); /* the light drifts a hair */
  vec2 ax = vec2(cos(ang), sin(ang));       /* along the beam, down-left (y is down) */
  vec2 nx = vec2(ax.y, -ax.x);              /* across it, toward the upper left */
  vec2 q = p - vec2(asp + OPEN_X, OPEN_Y);  /* from the opening */
  float s = max(dot(q, ax), 0.0);           /* distance along the beam */
  float hw = OPEN_W + SPREAD * s;           /* half-width: narrow at the opening, widening */
  float u = dot(q, nx) / hw;                /* across, -1 … 1 inside the beam */

  /* sun rays: shafts with darker gaps that fan out from the opening (noise
     across the beam in its own width, stretched along it), sliding sideways
     and flowing outward, over a faint fine streak */
  float across = u * 5.0;
  float along = s * 1.6;
  float s1 = noise(vec2(across + t * 0.075, along * 0.6 - t * 0.06));
  float s2 = noise(vec2(across * 2.1 - t * 0.05 + 5.0, along * 0.9 - t * 0.075));
  float soft = mix(0.30, 0.17, uSharp);                  /* half-width of a shaft's edge */
  float shafts = smoothstep(0.52 - soft, 0.52 + soft, s1 * 0.62 + s2 * 0.38);
  float fine = noise(vec2(across * 6.0 + t * 0.03, along * 2.0 - t * 0.1));
  float ray = shafts * 0.85 + fine * 0.15;              /* 0 … 1 */

  /* the rays fray the beam's edges: light leaks out along a few of them.
     Edges are crisp near the opening and soften as the beam spreads */
  float edge = u + (ray - 0.5) * 0.36 * uRays * uIntro;
  float side = edge > 0.0 ? 1.0 : 0.86;
  float k = mix(5.0, 2.8, clamp(s / 1.8, 0.0, 1.0));
  float prof = exp(-pow(abs(edge) / side, k));
  /* brightest at the opening; thins out as it spreads and travels */
  float att = exp(-0.38 * s) * pow(OPEN_W / hw, 0.42);
  float beam = OPEN_I * prof * att + 0.05 * exp(-1.6 * abs(u)) * att; /* + a little scatter around it */

  float rays = mix(1.0, 0.5 + 1.0 * ray, uRays * uIntro);
  float haze = mix(1.0, 0.72 + 0.56 * fbm(p * 1.7 + vec2(-t * 0.022, t * 0.015)), uHaze * uIntro);
  float breathe = 1.0 + 0.035 * sin(t * 0.45) * uIntro;

  float L = 0.121 + 0.018 * p.y + beam * rays * haze * breathe;

  /* dust: only visible where the light catches it */
  if (uDust > 0.0) {
    float motes = dust(p, 26.0, 0.16, t, 1.0) + 0.8 * dust(p, 15.0, 0.08, t * 0.8, 7.0);
    L += motes * uDust * uIntro * prof * att * (0.25 + ray) * 2.6; /* brighter in the shafts, faint in the gaps */
  }

  /* a soft shoulder keeps the brightest shafts at the plate's own peak
     (L 0.77) instead of washing out to grey */
  float sh = 0.84, kn = 0.6;
  if (L > kn) L = kn + (sh - kn) * (1.0 - exp(-(L - kn) / (sh - kn)));

  /* the plate's own colour response: olive in the shadows, warm sage-cream
     in the light (fitted per channel to the plate) */
  vec3 col = vec3(
    -0.1316 * L * L + 1.1771 * L - 0.0385,
     0.0020 * L * L + 0.9941 * L + 0.0100,
     0.3681 * L * L + 0.5366 * L + 0.0144);

  /* fine film grain (steps at 24 fps) and a dither against banding */
  vec2 fc = gl_FragCoord.xy;
  float g = hash12(fc + uFrame * vec2(37.0, 17.0)) - 0.5;
  col += g * uGrain * (0.35 + 0.65 * clamp(L * 1.6, 0.0, 1.0));
  col += (hash12(fc * 1.37 + 11.0) - 0.5) / 255.0;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  canvases.forEach((canvas) => {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'default' });
    if (!gl) return; // the plate underneath stays

    const program = build(gl);
    if (!program) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    const u = {};
    ['uRes', 'uTime', 'uIntro', 'uRays', 'uHaze', 'uDust', 'uSharp', 'uGrain', 'uFrame'].forEach((n) => { u[n] = gl.getUniformLocation(program, n); });

    let visible = false;
    let raf = 0;
    let start = 0;
    let last = 0;
    let clock = 14; // light time: starts a little way in, where the rays have formed; runs at the look's speed
    let shown = false;
    let quality = 1;       // drops a step (to 1x at worst) if frames run slow
    let slow = 0;
    let frames = 0;
    const look = { ...LOOKS.dust };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      let dpr = Math.max(Math.min(window.devicePixelRatio || 1, 2) * quality, 1);
      const px = rect.width * rect.height * dpr * dpr;
      if (px > MAX_PIXELS) dpr *= Math.sqrt(MAX_PIXELS / px);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return true;
    }

    function draw(now) {
      if (!resize()) return;
      const still = reduce.matches;
      const target = LOOKS[canvas.dataset.light] || LOOKS.dust;
      // ease between looks when the review switch changes
      Object.keys(look).forEach((key) => { look[key] += (target[key] - look[key]) * (still ? 1 : 0.06); });
      const secs = (now - start) / 1000;
      const intro = still ? 1 : easeOut(Math.min(secs / INTRO, 1));
      if (!still && last) {
        const dt = now - last;
        clock += Math.min(dt / 1000, 0.1) * look.speed;
        // after the intro, if most frames take longer than ~45 fps allows, draw fewer pixels
        if (secs > INTRO && quality > 0.5) {
          frames++;
          if (dt > 22) slow++;
          if (frames === 90) {
            if (slow > 45) quality -= 0.25;
            frames = 0; slow = 0;
          }
        }
      }
      last = now;
      const time = still ? 14 : clock;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uIntro, intro);
      gl.uniform1f(u.uRays, look.rays);
      gl.uniform1f(u.uHaze, look.haze);
      gl.uniform1f(u.uDust, look.dust);
      gl.uniform1f(u.uSharp, look.sharp);
      gl.uniform1f(u.uGrain, 0.03);
      gl.uniform1f(u.uFrame, still ? 0 : Math.floor(secs * 24) % 997);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!shown) { shown = true; canvas.classList.add('is-live'); }
    }

    function loop(now) {
      draw(now);
      raf = visible && !reduce.matches && document.visibilityState === 'visible' ? requestAnimationFrame(loop) : 0;
    }

    function wake() {
      if (!visible || raf || document.visibilityState !== 'visible') return;
      last = 0; // don't jump ahead after a pause
      if (!start) start = performance.now();
      if (reduce.matches) { draw(performance.now()); return; }
      raf = requestAnimationFrame(loop);
    }

    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      wake();
    }).observe(canvas);
    new ResizeObserver(() => { if (raf === 0 && visible) draw(performance.now()); }).observe(canvas);
    document.addEventListener('visibilitychange', wake);
    reduce.addEventListener('change', () => { if (!raf) wake(); });
    // the review switcher changes the look: redraw a still frame right away
    window.addEventListener('version-change', () => { if (!raf && visible) draw(performance.now()); });

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf); raf = 0;
      canvas.classList.remove('is-live'); // the plate shows again
    });
  });

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

  function build(gl) {
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('stage-light:', gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('stage-light:', gl.getProgramInfoLog(p)); return null; }
    return p;
  }
})();
