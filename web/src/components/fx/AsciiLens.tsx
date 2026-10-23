'use client'

import {useEffect} from 'react'
import {createGL, motionAllowed, program, texture} from '@/lib/gl'

/*
 * Hovering a picture marked data-ascii turns the area around the pointer into a live
 * character rendering of the same photograph: a lens that shows the image the way a
 * scanner reads it. One WebGL canvas is shared and moved to whichever picture is hovered.
 */
const RAMP = ' .`:-=+*cso#%&@'
const CELL_CSS = 9

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform float uReveal;
uniform float uCell;
uniform float uGlyphs;
uniform float uTime;
varying vec2 vUv;

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec3 photo = texture2D(uTex, cover(uv)).rgb;

  vec2 px = uv * uRes;
  vec2 id = floor(px / uCell);
  vec2 cuv = (id + 0.5) * uCell / uRes;
  vec3 c = texture2D(uTex, cover(cuv)).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = clamp((l - 0.02) * 2.2, 0.0, 1.0);
  // A slow shimmer on the darkest cells keeps the lens alive while the pointer rests.
  l += 0.06 * sin(uTime * 3.0 + id.x * 0.7 + id.y * 1.3) * (1.0 - l);
  float gi = floor(clamp(l, 0.0, 1.0) * (uGlyphs - 1.0) + 0.5);
  vec2 inCell = fract(px / uCell);
  float g = texture2D(uAtlas, vec2((gi + inCell.x) / uGlyphs, inCell.y)).r;
  vec3 ink = vec3(0.012, 0.03, 0.08);
  vec3 lit = mix(vec3(0.80, 0.86, 0.94), c * 1.3 + 0.12, 0.45);
  vec3 ascii = mix(ink, lit, g);

  float d = length((uv - uMouse) * vec2(uRes.x / uRes.y, 1.0));
  float radius = uReveal * 0.42;
  float lens = 1.0 - smoothstep(radius - 0.06, radius, d);
  float ring = smoothstep(radius - 0.012, radius - 0.004, d) * (1.0 - smoothstep(radius - 0.004, radius + 0.004, d));
  vec3 col = mix(photo, ascii, lens) + ring * 0.25 * uReveal;
  gl_FragColor = vec4(col, 1.0);
}`

function atlas() {
  const size = 48
  const c = document.createElement('canvas')
  c.width = size * RAMP.length
  c.height = size
  const x = c.getContext('2d')!
  x.fillStyle = '#000'
  x.fillRect(0, 0, c.width, c.height)
  x.fillStyle = '#fff'
  x.font = `600 ${Math.round(size * 0.8)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  for (let i = 0; i < RAMP.length; i++) x.fillText(RAMP[i], i * size + size / 2, size / 2 + 1)
  return c
}

export function AsciiLens() {
  useEffect(() => {
    if (!motionAllowed() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:0;transition:opacity .2s'
    const gl = createGL(canvas)
    if (!gl) return
    let prog: ReturnType<typeof program>
    try {
      prog = program(gl, FRAG)
    } catch (e) {
      console.warn('ascii shader', e)
      return
    }
    const {u} = prog
    texture(gl, atlas(), 1)
    gl.uniform1i(u('uAtlas'), 1)
    gl.uniform1f(u('uGlyphs'), RAMP.length)
    let tex: WebGLTexture | null = null

    let host: HTMLElement | null = null
    let raf = 0
    let reveal = 0
    let target = 0
    const mouse = {x: 0.5, y: 0.5, tx: 0.5, ty: 0.5}
    const t0 = performance.now()
    const cache = new Map<string, HTMLImageElement>()

    const frame = () => {
      raf = requestAnimationFrame(frame)
      reveal += (target - reveal) * (target > reveal ? 0.12 : 0.18)
      mouse.x += (mouse.tx - mouse.x) * 0.25
      mouse.y += (mouse.ty - mouse.y) * 0.25
      if (target === 0 && reveal < 0.01) {
        cancelAnimationFrame(raf)
        raf = 0
        canvas.style.opacity = '0'
        canvas.remove()
        host = null
        return
      }
      gl.uniform2f(u('uMouse'), mouse.x, mouse.y)
      gl.uniform1f(u('uReveal'), reveal)
      gl.uniform1f(u('uTime'), (performance.now() - t0) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const attach = (el: HTMLElement, img: HTMLImageElement) => {
      const src = img.currentSrc || img.src
      const apply = (im: HTMLImageElement) => {
        if (host !== el) return
        if (tex) gl.deleteTexture(tex)
        tex = texture(gl, im, 0)
        gl.uniform1i(u('uTex'), 0)
        gl.uniform2f(u('uImg'), im.naturalWidth, im.naturalHeight)
        canvas.style.opacity = '1'
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = el.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u('uRes'), canvas.width, canvas.height)
      gl.uniform1f(u('uCell'), CELL_CSS * dpr)
      canvas.style.opacity = '0'
      el.appendChild(canvas)
      const cached = cache.get(src)
      if (cached) apply(cached)
      else {
        const im = new Image()
        im.src = src
        im.onload = () => {
          cache.set(src, im)
          apply(im)
        }
      }
    }

    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const el = (e.target as Element).closest?.<HTMLElement>('[data-ascii]')
      if (!el || el === host) return
      const img = el.querySelector('img')
      if (!img?.complete) return
      host = el
      reveal = 0
      attach(el, img)
      target = 1
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const move = (e: PointerEvent) => {
      if (!host) return
      const r = host.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
      target = mouse.tx < 0 || mouse.tx > 1 || mouse.ty < 0 || mouse.ty > 1 ? 0 : 1
      if (target && !raf) raf = requestAnimationFrame(frame)
      if (reveal < 0.05) {
        mouse.x = mouse.tx
        mouse.y = mouse.ty
      }
    }
    document.addEventListener('pointerover', over, {passive: true})
    document.addEventListener('pointermove', move, {passive: true})
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])
  return null
}
