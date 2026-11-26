/* ==========================================================================
   Component: pack spin (2026-11-25, Men's Health landing → Introducing Quad 4)
   A pack that turns on its own axis, after the user's recording of a bottle
   spinning on its axis ("if possible make it rotatable like this").

   Why it can be one still render: a round pack lit by a fixed light looks
   the same at every turn of its axis. Only its print moves. So the render
   stays an <img> and only the print turns: tools/pack-print.py writes the
   pack's print flat (assets/images/products/label-<pack>.js, the same words,
   hairlines and tab as the approved print), and this script wraps it round
   the render's cylinder every frame in WebGL, with the tool's own maths:
       theta = u / R,  x = cx + R sin(theta),  y = ys + k (ys - eye) cos(theta)
   On clear glass the print on the far side shows through, mirrored and
   softer, as it turns away.

   Turns with scroll and by hand. Scroll: in a section that pins
   ([data-pack-spin-scope] with a sticky [data-pack-spin-sticky] block) one
   full turn while it is pinned, front to front; otherwise one full turn
   while the section crosses the screen, facing front when it is centred.
   Hand: drag it sideways, it follows the finger and coasts to a stop. Reduced motion: it faces front
   and only turns when dragged.
   On its own (data-pack-spin-auto="<seconds per turn>"): it turns continuously while on screen,
   whatever the scroll, and holds still while the pointer rests on it (and under reduced motion);
   drags still turn it. No WebGL, no script, or a lost context: the
   approved static print (.pack-spin__still) shows instead.
   The print is drawn from path data (no image files), so the WebGL texture
   works from file:// too.

   A pack in a photo (the Quad 4 ampoule in a hand): .pack-spin--screen for
   white print on coloured glass, an <img class="pack-spin__front"> of what is
   in front of the pack (the fingers) over the print, and in the label data
   `axis` (the pack's lean), `back` (the far side's strength), `fade` (the
   light's falloff at the left and right silhouettes).

   Markup:
     <section data-pack-spin-scope> <div data-pack-spin-sticky> …   (optional: pin while it turns)
     <div class="pack-spin" data-pack-spin="ampoule-quad4-ink" style="--pack-ratio: 406 / 2200">
       <img class="pack-spin__body" src="…blank render…" alt="">
       <img class="pack-spin__still" src="…static print svg…" alt="">
       <canvas class="pack-spin__print" aria-hidden="true"></canvas>
     </div>
   Framer: a code component with the same shader.
   ========================================================================== */
(function packSpin() {
  const LABELS = window.MEDARO_LABELS || {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TURNS = 1;          // full turns while the section crosses the screen
  const BACK = 0.34;        // the far side's print, seen through the glass
  const TEX = 2048;         // texture size (power of two: mipmaps and wrapping in WebGL 1)

  const VERT = `
    attribute vec2 aPos;
    uniform vec2 uSize;
    varying vec2 vPos;
    void main() {
      vPos = vec2((aPos.x * 0.5 + 0.5) * uSize.x, (0.5 - aPos.y * 0.5) * uSize.y);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  const FRAG = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec4 uCyl;     // cx, r, eye, k (render pixels)
    uniform vec2 uRows;    // the texture's top and foot, down the axis
    uniform float uPhi;    // the turn, radians
    uniform float uBack;
    uniform vec3 uAxis;    // the pack's lean: angle (radians, clockwise), pivot x, y. 0 for an upright render
    uniform vec2 uFade;    // the print's brightness at the left and right silhouettes (light falling off)
    varying vec2 vPos;
    vec2 P;                // this pixel in the upright pack's frame
    const float PI = 3.141592653589793;

    // the flat print at angle th round the axis (c = cos th): undo the perspective arc, then look up u
    vec4 printAt(float th, float c, float bias) {
      float k = uCyl.w, eye = uCyl.z;
      float ys = (P.y + k * eye * c) / (1.0 + k * c);
      float yf = ys * (1.0 + k) - k * eye;
      float ty = (yf - uRows.x) / (uRows.y - uRows.x);
      float tx = (th - uPhi + PI) / (2.0 * PI);
      vec4 col = texture2D(uTex, vec2(tx, clamp(ty, 0.0, 1.0)), bias);
      return col * step(0.0, ty) * step(ty, 1.0);
    }

    void main() {
      vec2 d = vPos - uAxis.yz;
      float ca = cos(uAxis.x), sa = sin(uAxis.x);
      P = uAxis.yz + vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y);   // undo the lean
      float s0 = (P.x - uCyl.x) / uCyl.y;
      float inside = step(abs(s0), 0.9995);
      float s = clamp(s0, -0.9995, 0.9995);
      float th = asin(s);
      float c = sqrt(1.0 - s * s);
      vec4 front = printAt(th, c, -0.6) * smoothstep(0.0, 0.16, c);   // a little sharper than the default mip (matches the static print)
      vec4 back = printAt(PI - th, -c, 1.6) * uBack * smoothstep(0.0, 0.35, c);
      float light = mix(uFade.x, 1.0, smoothstep(-1.0, -0.15, s)) * mix(1.0, uFade.y, smoothstep(0.55, 1.0, s));
      gl_FragColor = (front + back * (1.0 - front.a)) * inside * light;
    }`;

  document.querySelectorAll('[data-pack-spin]').forEach(init);

  function init(root) {
    const label = LABELS[root.dataset.packSpin];
    const canvas = root.querySelector('.pack-spin__print');
    if (!label || !canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const prog = program(gl, VERT, FRAG);
    if (!prog) return;
    const loc = (n) => gl.getUniformLocation(prog, n);
    const u = { size: loc('uSize'), cyl: loc('uCyl'), rows: loc('uRows'), phi: loc('uPhi'), back: loc('uBack'), tex: loc('uTex'), axis: loc('uAxis'), fade: loc('uFade') };

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');

    // the flat print → texture: u from −πR..πR across, the label rows down
    const { cyl, rows, size } = label;
    const flat = document.createElement('canvas');
    flat.width = flat.height = TEX;
    const ctx = flat.getContext('2d');
    const circ = 2 * Math.PI * cyl.r;
    ctx.setTransform(TEX / circ, 0, 0, TEX / (rows[1] - rows[0]), TEX / 2, -rows[0] * TEX / (rows[1] - rows[0]));
    label.layers.forEach(([fill, op, d]) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = fill;
      ctx.fill(new Path2D(d));
    });
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flat);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));

    gl.useProgram(prog);
    gl.uniform2f(u.size, size[0], size[1]);
    gl.uniform4f(u.cyl, cyl.cx, cyl.r, cyl.eye, cyl.k);
    gl.uniform2f(u.rows, rows[0], rows[1]);
    gl.uniform1f(u.back, label.back != null ? label.back : BACK);
    const ax = label.axis || { angle: 0, x: 0, y: 0 };
    gl.uniform3f(u.axis, ax.angle * Math.PI / 180, ax.x, ax.y);
    const fd = label.fade || [1, 1];
    gl.uniform2f(u.fade, fd[0], fd[1]);
    gl.uniform1i(u.tex, 0);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    // ---------- state ----------
    const scope = root.closest('[data-pack-spin-scope]') || root.closest('section') || root;
    const sticky = scope.querySelector('[data-pack-spin-sticky]');
    const auto = parseFloat(root.dataset.packSpinAuto) || 0;   // seconds per turn, turning on its own
    let autoPhi = 0;        // what turning on its own added
    let resting = false;    // the pointer rests on it: hold still
    let shown = 0;          // the turn on screen
    let scrollPhi = 0;      // where scrolling wants it
    let dragPhi = 0;        // what dragging and coasting added
    let vel = 0;            // coasting speed, rad/ms
    let dragging = false;
    let lastX = 0, lastT = 0;
    let visible = false, raf = 0, prev = 0, drawn = NaN, lost = false;

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(root.clientWidth * dpr), h = Math.round(root.clientHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h; drawn = NaN;
      }
    }

    // Pinned (a [data-pack-spin-sticky] block inside the scope): one turn while the block is held,
    // front to front. Otherwise: one turn while the scope crosses the screen, front when centred.
    function readScroll() {
      if (reduce.matches || auto) { scrollPhi = 0; return; }
      const r = scope.getBoundingClientRect();
      if (sticky && getComputedStyle(sticky).position === 'sticky') {
        const top = parseFloat(getComputedStyle(sticky).top) || 0;
        const run = r.height - sticky.offsetHeight;          // the scroll it stays pinned for
        const p = run > 0 ? (top - r.top) / run : 0;
        scrollPhi = Math.min(Math.max(p, 0), 1) * TURNS * 2 * Math.PI;
        return;
      }
      const vh = window.innerHeight;
      const p = (vh - r.top) / (vh + r.height);              // 0 entering … 1 leaving
      scrollPhi = (Math.min(Math.max(p, 0), 1) - 0.5) * TURNS * 2 * Math.PI;
    }

    function draw(phi) {
      if (lost) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.phi, phi);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      drawn = phi;
      if (!root.classList.contains('is-live')) root.classList.add('is-live');
    }

    function frame(t) {
      raf = 0;
      const dt = prev ? Math.min(t - prev, 64) : 16;
      prev = t;
      if (!dragging && vel) {                                  // coast to a stop
        dragPhi += vel * dt;
        vel *= Math.exp(-dt / 380);
        if (Math.abs(vel) < 0.00002 || reduce.matches) vel = 0;
      }
      const spinning = auto && !dragging && !resting && !reduce.matches;
      if (spinning) autoPhi += dt * 2 * Math.PI / (auto * 1000);
      const target = scrollPhi + dragPhi + autoPhi;
      // scroll moves arrive eased (wheel steps read as a smooth turn); drags follow the finger
      shown += (target - shown) * (dragging ? 1 : 1 - Math.exp(-dt / 110));
      if (Math.abs(target - shown) < 0.0004) shown = target;
      if (shown !== drawn) draw(shown);
      if (visible && (dragging || vel || spinning || shown !== target)) queue();
      else prev = 0;
    }

    function queue() { if (!raf) raf = requestAnimationFrame(frame); }

    // ---------- inputs ----------
    window.addEventListener('scroll', () => { if (visible) { readScroll(); queue(); } }, { passive: true });
    window.addEventListener('resize', () => { fit(); readScroll(); queue(); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { fit(); queue(); }).observe(root);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { fit(); readScroll(); queue(); }
    }).observe(root);

    // radians per CSS pixel of drag: the surface under the finger moves with it
    const radPerPx = () => 1 / (root.clientWidth * cyl.r / size[0]);

    root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') resting = true; });
    root.addEventListener('pointerleave', () => { resting = false; queue(); });
    root.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true; vel = 0;
      lastX = e.clientX; lastT = e.timeStamp;
      root.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
    });
    root.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dt = Math.max(e.timeStamp - lastT, 1);
      dragPhi += dx * radPerPx();
      const v = dx * radPerPx() / dt;
      vel = vel * 0.6 + v * 0.4;                                 // smoothed release speed
      lastX = e.clientX; lastT = e.timeStamp;
      queue();
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      if (e.timeStamp - lastT > 90) vel = 0;                    // held still before letting go: no coast
      root.classList.remove('is-dragging');
      queue();
    };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    root.addEventListener('dragstart', (e) => e.preventDefault());

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; root.classList.remove('is-live'); });

    fit();
    readScroll();
    shown = scrollPhi;
    draw(shown);
  }

  function program(gl, vs, fs) {
    const make = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const v = make(gl.VERTEX_SHADER, vs), f = make(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
})();
