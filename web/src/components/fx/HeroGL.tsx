'use client'

import {useEffect, useRef} from 'react'
import {createGL, motionAllowed, program, texture} from '@/lib/gl'
import {play} from '@/lib/sound'
import {getLenis} from './SmoothScroll'

/*
 * The hero photograph as a coated panel. Water beads sit on the glass in front of the car:
 * each one refracts the photo behind it and catches the light. The beads run away from the
 * pointer the way water runs off a hydrophobic coating, a strip light drifts along the
 * bodywork, and a tap sends a ripple through the surface.
 */
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uTime;
uniform vec2 uMouse;
uniform float uActive;
uniform vec3 uRipple;
uniform float uIntro;
varying vec2 vUv;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  vec2 pos = vec2(0.6, 0.5);
  return (uv - pos) * s + pos;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float aspect = uRes.x / uRes.y;
  vec2 asp = vec2(aspect, 1.0);

  // Ripple from the last tap.
  if (uRipple.z < 2.0) {
    vec2 d = (uv - uRipple.xy) * asp;
    float dist = length(d);
    float wave = sin(dist * 70.0 - uRipple.z * 20.0) * exp(-dist * 5.0) * exp(-uRipple.z * 2.2);
    uv += normalize(d + 1e-5) / asp * wave * 0.008;
  }

  // Beads on a jittered grid, pushed away from the pointer.
  float DENS = uRes.x < 700.0 ? 5.0 : 7.0;
  vec2 p = uv * asp * DENS;
  vec2 mp = uMouse * asp * DENS;
  vec2 cell = floor(p);
  float best = 1e3;
  vec2 bc = vec2(0.0);
  float br = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      vec2 h = hash2(c);
      if (h.x < 0.6) continue;
      vec2 ctr = c + 0.25 + 0.5 * hash2(c + 3.17);
      ctr.y += sin(uTime * 0.3 + h.y * 6.283) * 0.03;
      vec2 away = ctr - mp;
      float md = length(away);
      ctr += normalize(away + 1e-4) * 1.2 * exp(-md * md * 0.4) * uActive;
      float r = mix(0.12, 0.42, pow(hash2(c + 7.7).x, 1.6));
      float d = length(p - ctr) / r;
      if (d < 1.0 && d < best) {
        best = d;
        bc = ctr;
        br = r;
      }
    }
  }

  vec3 col;
  if (best < 1.0) {
    // Inside a bead: the scene seen through a tiny lens, inverted and pulled in.
    vec2 local = (p - bc) / br;
    vec2 q = bc - (p - bc) * 0.55;
    vec3 inside = texture2D(uTex, cover(q / (asp * DENS))).rgb * 1.15;
    float rim = smoothstep(0.55, 1.0, best);
    col = inside * (1.0 - rim * 0.4);
    // Highlight toward the light, caustic glow opposite it.
    vec2 ldir = normalize((uMouse - uv) * asp + vec2(-0.6, -0.8) * (1.0 - uActive) + 1e-4);
    float hl = smoothstep(0.32, 0.0, length(local - ldir * 0.45));
    float caustic = smoothstep(0.6, 0.0, length(local + ldir * 0.5)) * 0.18;
    col += hl * 0.85 + caustic;
    // Soft edge into the surrounding photo.
    vec3 photo = texture2D(uTex, cover(uv)).rgb;
    col = mix(col, photo, smoothstep(0.92, 1.0, best));
  } else {
    col = texture2D(uTex, cover(uv)).rgb;
  }

  // Strip light gliding along the bodywork, strongest on the brighter (painted) surfaces.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float ly = 0.42 + 0.06 * sin(uTime * 0.22) + (uMouse.y - 0.5) * 0.18 * uActive;
  float band = exp(-pow((uv.y - ly) * 16.0, 2.0)) * (0.6 + 0.4 * sin(uv.x * 3.0 + uTime * 0.4));
  col += band * smoothstep(0.06, 0.35, lum) * 0.3 * vec3(0.86, 0.93, 1.0);

  gl_FragColor = vec4(col, uIntro);
}`

export function HeroGL() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const section = canvas?.closest('section')
    if (!canvas || !section || !motionAllowed()) return
    const gl = createGL(canvas)
    if (!gl) return

    let prog: ReturnType<typeof program>
    try {
      prog = program(gl, FRAG)
    } catch (e) {
      console.warn('hero shader', e)
      return
    }
    const {u} = prog
    const img = [...section.querySelectorAll('img')].find((i) => getComputedStyle(i).display !== 'none')
    if (!img) return

    let raf = 0
    let alive = true
    let visible = true
    const mouse = {x: 0.62, y: 0.42, tx: 0.62, ty: 0.42, active: 0, tActive: 0}
    let ripple = {x: 0.5, y: 0.5, t0: -10}
    const t0 = performance.now()
    let introStart = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const r = section.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const start = () => {
      if (!alive) return
      // Draw the photo the browser already decoded, at the size it chose.
      const src = new Image()
      src.decoding = 'async'
      src.src = img.currentSrc || img.src
      src.onload = () => {
        if (!alive) return
        texture(gl, src, 0)
        gl.uniform1i(u('uTex'), 0)
        gl.uniform2f(u('uImg'), src.naturalWidth, src.naturalHeight)
        gl.clearColor(0, 0, 0, 0)
        resize()
        introStart = performance.now()
        loop()
      }
    }

    const loop = () => {
      if (!alive) return
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const now = performance.now()
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      mouse.active += (mouse.tActive - mouse.active) * 0.05
      gl.uniform2f(u('uRes'), canvas.width, canvas.height)
      gl.uniform1f(u('uTime'), (now - t0) / 1000)
      gl.uniform2f(u('uMouse'), mouse.x, mouse.y)
      gl.uniform1f(u('uActive'), mouse.active)
      gl.uniform3f(u('uRipple'), ripple.x, ripple.y, (now - ripple.t0) / 1000)
      gl.uniform1f(u('uIntro'), Math.min(1, (now - introStart) / 900))
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const move = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
      mouse.tActive = 1
    }
    const leave = () => {
      mouse.tActive = 0
    }
    const tap = (e: PointerEvent) => {
      if ((e.target as Element).closest('a,button')) return
      const r = section.getBoundingClientRect()
      ripple = {x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t0: performance.now()}
      play('drop')
    }

    // Parallax: the photo drifts slower than the page as it scrolls away.
    const onScroll = () => {
      const y = getLenis()?.scroll ?? window.scrollY
      const h = section.offsetHeight
      if (y > h) return
      const media = section.querySelector<HTMLElement>('[data-hero-media]')
      if (media) media.style.transform = `translate3d(0, ${y * 0.3}px, 0)`
      const copy = section.querySelector<HTMLElement>('[data-hero-copy]')
      if (copy) {
        copy.style.transform = `translate3d(0, ${y * 0.12}px, 0)`
        copy.style.opacity = String(1 - Math.min(1, y / (h * 0.8)))
      }
    }

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(section)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, {passive: true})
    section.addEventListener('pointermove', move)
    section.addEventListener('pointerleave', leave)
    section.addEventListener('pointerdown', tap)
    // Start after the photo's settle-in, so the first paint stays the plain image.
    const timer = setTimeout(() => (img.complete ? start() : img.addEventListener('load', start, {once: true})), 1600)

    return () => {
      alive = false
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      section.removeEventListener('pointerdown', tap)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
