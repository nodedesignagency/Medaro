import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * PackSpin: a pack turning on its own axis, a 1:1 port of site/components/pack-spin.js (MEDARO HTML, approved on main,
 * Men's Health science section, 2026-11-28). The render stays an image; only its print turns: the flat print (a 2048px
 * texture made from tools/pack-print.py → label-ampoule-quad4.js, back sticker included) is wrapped round the render's
 * cylinder every frame in WebGL with the tool's maths (theta = u / R, x = cx + R sin theta, y = ys + k (ys − eye) cos theta).
 * On clear glass the far side shows through, mirrored and softer. Turns on its own (one turn per Seconds), holds still while
 * the mouse rests on it, drag sideways to turn it (it coasts to a stop); still under reduced motion; pauses off screen.
 * The canvas, and anything without WebGL, shows the still (the same ampoule with its print, flattened).
 */
const VERT = `
  attribute vec2 aPos;
  uniform vec2 uSize;
  varying vec2 vPos;
  void main() {
    vPos = vec2((aPos.x * 0.5 + 0.5) * uSize.x, (0.5 - aPos.y * 0.5) * uSize.y);
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`

const FRAG = `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec4 uCyl;
  uniform vec2 uRows;
  uniform float uPhi;
  uniform float uBack;
  uniform vec3 uAxis;
  uniform vec2 uFade;
  varying vec2 vPos;
  vec2 P;
  const float PI = 3.141592653589793;
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
    P = uAxis.yz + vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y);
    float s0 = (P.x - uCyl.x) / uCyl.y;
    float inside = step(abs(s0), 0.9995);
    float s = clamp(s0, -0.9995, 0.9995);
    float th = asin(s);
    float c = sqrt(1.0 - s * s);
    vec4 front = printAt(th, c, -0.6) * smoothstep(0.0, 0.16, c);
    vec4 back = printAt(PI - th, -c, 1.6) * uBack * smoothstep(0.0, 0.35, c);
    float light = mix(uFade.x, 1.0, smoothstep(-1.0, -0.15, s)) * mix(1.0, uFade.y, smoothstep(0.55, 1.0, s));
    gl_FragColor = (front + back * (1.0 - front.a)) * inside * light;
  }`

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const v = make(gl.VERTEX_SHADER, vs), f = make(gl.FRAGMENT_SHADER, fs)
  if (!v || !f) return null
  const p = gl.createProgram()!
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null
}

interface Props {
  body?: { src?: string; srcSet?: string }
  still?: { src?: string; srcSet?: string }
  texture: string
  seconds: number
  back: number
  fadeLeft: number
  fadeRight: number
  cx: number; r: number; eye: number; k: number
  rowTop: number; rowFoot: number
  renderWidth: number; renderHeight: number
  shadow: boolean
  style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function PackSpin(props: Props) {
  const { body, still, texture, seconds, back, fadeLeft, fadeRight, cx, r, eye, k, rowTop, rowFoot, renderWidth, renderHeight, shadow, style } = props
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [live, setLive] = React.useState(false)
  const onCanvas = RenderTarget.current() === RenderTarget.canvas

  React.useEffect(() => {
    if (onCanvas || !texture) return
    const root = rootRef.current, canvas = canvasRef.current
    if (!root || !canvas) return
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) as WebGLRenderingContext | null
    if (!gl) return
    const prog = program(gl, VERT, FRAG)
    if (!prog) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const loc = (n: string) => gl.getUniformLocation(prog, n)
    const u = { size: loc("uSize"), cyl: loc("uCyl"), rows: loc("uRows"), phi: loc("uPhi"), back: loc("uBack"), tex: loc("uTex"), axis: loc("uAxis"), fade: loc("uFade") }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, "aPos")
    gl.useProgram(prog)
    gl.uniform2f(u.size, renderWidth, renderHeight)
    gl.uniform4f(u.cyl, cx, r, eye, k)
    gl.uniform2f(u.rows, rowTop, rowFoot)
    gl.uniform1f(u.back, back)
    gl.uniform3f(u.axis, 0, 0, 0)
    gl.uniform2f(u.fade, fadeLeft, fadeRight)
    gl.uniform1i(u.tex, 0)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.clearColor(0, 0, 0, 0)

    let disposed = false, ready = false, lost = false
    let autoPhi = 0, resting = false, shown = 0, dragPhi = 0, vel = 0, dragging = false
    let lastX = 0, lastT = 0, visible = false, raf = 0, prev = 0, drawn = NaN

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(root.clientWidth * dpr), h = Math.round(root.clientHeight * dpr)
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; drawn = NaN }
    }
    const draw = (phi: number) => {
      if (lost || !ready) return
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(u.phi, phi)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      drawn = phi
      setLive(true)
    }
    const queue = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame) }
    function frame(t: number) {
      raf = 0
      const dt = prev ? Math.min(t - prev, 64) : 16
      prev = t
      if (!dragging && vel) {
        dragPhi += vel * dt
        vel *= Math.exp(-dt / 380)
        if (Math.abs(vel) < 0.00002 || reduce.matches) vel = 0
      }
      const spinning = seconds > 0 && !dragging && !resting && !reduce.matches
      if (spinning) autoPhi += (dt * 2 * Math.PI) / (seconds * 1000)
      const target = dragPhi + autoPhi
      shown += (target - shown) * (dragging ? 1 : 1 - Math.exp(-dt / 110))
      if (Math.abs(target - shown) < 0.0004) shown = target
      if (shown !== drawn) draw(shown)
      if (visible && (dragging || vel || spinning || shown !== target)) queue()
      else prev = 0
    }

    // the flat print: one 2048px texture (power of two: mipmaps and wrapping in WebGL 1)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (disposed) return
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic")
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
      ready = true
      fit()
      draw(shown)
      queue()
    }
    img.src = texture

    const radPerPx = () => 1 / ((root.clientWidth * r) / renderWidth)
    const onEnter = (e: PointerEvent) => { if (e.pointerType === "mouse") resting = true }
    const onLeave = () => { resting = false; queue() }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true; vel = 0; lastX = e.clientX; lastT = e.timeStamp
      root.setPointerCapture(e.pointerId)
      root.style.cursor = "grabbing"
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX, dt = Math.max(e.timeStamp - lastT, 1)
      dragPhi += dx * radPerPx()
      vel = vel * 0.6 + ((dx * radPerPx()) / dt) * 0.4
      lastX = e.clientX; lastT = e.timeStamp
      queue()
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (e.timeStamp - lastT > 90) vel = 0
      root.style.cursor = "grab"
      queue()
    }
    const onDrag = (e: Event) => e.preventDefault()
    const onLost = (e: Event) => { e.preventDefault(); lost = true; setLive(false) }
    root.addEventListener("pointerenter", onEnter)
    root.addEventListener("pointerleave", onLeave)
    root.addEventListener("pointerdown", onDown)
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerup", onUp)
    root.addEventListener("pointercancel", onUp)
    root.addEventListener("dragstart", onDrag)
    canvas.addEventListener("webglcontextlost", onLost)
    const ro = new ResizeObserver(() => { fit(); queue() })
    ro.observe(root)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { fit(); queue() } })
    io.observe(root)

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect()
      root.removeEventListener("pointerenter", onEnter)
      root.removeEventListener("pointerleave", onLeave)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerup", onUp)
      root.removeEventListener("pointercancel", onUp)
      root.removeEventListener("dragstart", onDrag)
      canvas.removeEventListener("webglcontextlost", onLost)
    }
  }, [onCanvas, texture, seconds, back, fadeLeft, fadeRight, cx, r, eye, k, rowTop, rowFoot, renderWidth, renderHeight])

  const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none", userSelect: "none" }
  return (
    <div ref={rootRef} aria-hidden="true" style={{ ...style, position: "relative", cursor: "grab", touchAction: "pan-y", userSelect: "none", WebkitTapHighlightColor: "transparent", filter: shadow ? "drop-shadow(0 18px 22px rgba(29, 42, 58, 0.12))" : undefined }}>
      {body?.src ? <img src={body.src} srcSet={body.srcSet} alt="" draggable={false} style={fill} /> : null}
      {still?.src ? <img src={still.src} srcSet={still.srcSet} alt="" draggable={false} style={{ ...fill, opacity: live ? 0 : 1 }} /> : null}
      <canvas ref={canvasRef} style={{ ...fill, mixBlendMode: "screen", opacity: live ? 1 : 0 }} />
    </div>
  )
}

PackSpin.defaultProps = { texture: "", seconds: 12, back: 0.3, fadeLeft: 0.72, fadeRight: 0.9, cx: 202.5, r: 197, eye: 1100, k: 0.03, rowTop: 1130, rowFoot: 2140, renderWidth: 406, renderHeight: 2200, shadow: true }

addPropertyControls(PackSpin, {
  body: { type: ControlType.ResponsiveImage, title: "Body" },
  still: { type: ControlType.ResponsiveImage, title: "Still" },
  texture: { type: ControlType.String, title: "Label texture" },
  seconds: { type: ControlType.Number, title: "Seconds/turn", min: 0, max: 60, step: 0.5, defaultValue: 12 },
  back: { type: ControlType.Number, title: "Far side", min: 0, max: 1, step: 0.01, defaultValue: 0.3 },
  fadeLeft: { type: ControlType.Number, title: "Fade left", min: 0, max: 1, step: 0.01, defaultValue: 0.72 },
  fadeRight: { type: ControlType.Number, title: "Fade right", min: 0, max: 1, step: 0.01, defaultValue: 0.9 },
  shadow: { type: ControlType.Boolean, title: "Shadow", defaultValue: true },
  cx: { type: ControlType.Number, title: "Cylinder x", defaultValue: 202.5, hidden: () => true },
  r: { type: ControlType.Number, title: "Radius", defaultValue: 197, hidden: () => true },
  eye: { type: ControlType.Number, title: "Eye", defaultValue: 1100, hidden: () => true },
  k: { type: ControlType.Number, title: "Perspective", defaultValue: 0.03, step: 0.001, hidden: () => true },
  rowTop: { type: ControlType.Number, title: "Print top", defaultValue: 1130, hidden: () => true },
  rowFoot: { type: ControlType.Number, title: "Print foot", defaultValue: 2140, hidden: () => true },
  renderWidth: { type: ControlType.Number, title: "Render width", defaultValue: 406, hidden: () => true },
  renderHeight: { type: ControlType.Number, title: "Render height", defaultValue: 2200, hidden: () => true },
})
