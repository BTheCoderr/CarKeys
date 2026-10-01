import { useEffect, useRef, useState } from 'react'

const NOTES = ['C', 'D', 'E', 'F']
const COLORS = ['#ff4f88', '#ffd43d', '#55d84a', '#9b4cf0']
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23]
const LEVELS = [
  { name: 'FIRST DRIVE', pattern: [0, 0, 0, 0], scene: 'drive', world: 'city' },
  { name: 'TWO KEYS', pattern: [0, 1, 0, 1], scene: 'drive', world: 'city' },
  { name: 'THREE KEYS', pattern: [0, 1, 2, 1], scene: 'drive', world: 'city' },
  { name: 'FOUR KEYS', pattern: [0, 1, 2, 3], scene: 'drive', world: 'city' },
  { name: 'MIX IT UP', pattern: [0, 2, 1, 3, 0, 1], scene: 'drive', world: 'city' },
  { name: 'LIGHT THE STREET', pattern: [0, 0, 1, 1], scene: 'lights', world: 'city' },
  { name: 'OPEN THE BRIDGE', pattern: [0, 1, 0, 1], scene: 'bridge', world: 'city' },
  { name: 'GLOW TUNNEL', pattern: [0, 1, 2, 3], scene: 'tunnel', world: 'city' },
  { name: 'MUSIC CITY', pattern: [0, 2, 1, 3, 2], scene: 'music', world: 'city' },
  { name: 'FINISH LINE', pattern: [0, 1, 2, 3, 1, 3], scene: 'finish', world: 'city' },
  { name: 'BUNNY BOUNCE', pattern: [0, 0, 1, 1], scene: 'rabbit', world: 'forest' },
  { name: 'FIREFLY TRAIL', pattern: [0, 1, 2, 1], scene: 'fireflies', world: 'forest' },
  { name: 'DRUM TREES', pattern: [2, 2, 0, 2], scene: 'drums', world: 'forest' },
  { name: 'OWL GLOW', pattern: [0, 2, 1, 3], scene: 'owl', world: 'forest' },
  { name: 'MOON PARADE', pattern: [0, 1, 2, 3, 2, 1], scene: 'parade', world: 'forest' },
  { name: 'ROCK STEPS', pattern: [0, 0, 1, 2], scene: 'rocks', world: 'mountain' },
  { name: 'WATERFALL NOTES', pattern: [0, 1, 2, 3], scene: 'waterfall', world: 'mountain' },
  { name: 'CRYSTAL CAVE', pattern: [1, 2, 1, 3], scene: 'crystals', world: 'mountain' },
  { name: 'MOUNTAIN LIGHTS', pattern: [0, 2, 3, 2, 1], scene: 'beacons', world: 'mountain' },
  { name: 'SUMMIT SONG', pattern: [0, 1, 2, 3, 0, 3], scene: 'summit', world: 'mountain' },
  { name: 'LIFT OFF', pattern: [0, 0, 1, 2], scene: 'launch', world: 'space' },
  { name: 'STAR HOP', pattern: [0, 1, 2, 3], scene: 'stars', world: 'space' },
  { name: 'PLANET RINGS', pattern: [1, 2, 3, 1], scene: 'rings', world: 'space' },
  { name: 'COMET CHASE', pattern: [0, 2, 1, 3, 2], scene: 'comets', world: 'space' },
  { name: 'MOON CONCERT', pattern: [0, 1, 2, 3, 0, 2], scene: 'moonconcert', world: 'space' },
]

const CARS = {
  blue: { name: 'Blue Buddy', body: '#1d9cf0', roof: '#5fc8ff' },
  pink: { name: 'Pink Pop', body: '#f04f91', roof: '#ff91bd' },
  green: { name: 'Forest Flash', body: '#36bf64', roof: '#7bea93' },
  gold: { name: 'Summit Spark', body: '#f0a52b', roof: '#ffd96b' },
  purple: { name: 'Galaxy Glide', body: '#7a4ee8', roof: '#b893ff' },
}

const WORLD_NAMES = {
  city: 'MUSIC CITY',
  forest: 'RHYTHM FOREST',
  mountain: 'MELODY MOUNTAIN',
  space: 'SPACE BEAT',
}

const WORLD_META = {
  city: { icon: '♪', start: 0, end: 9 },
  forest: { icon: '♣', start: 10, end: 14 },
  mountain: { icon: '▲', start: 15, end: 19 },
  space: { icon: '★', start: 20, end: 24 },
}

let audioContext
let masterVolume = 1
let worldMusicTimer
let worldMusicWorld
let worldMusicBeat = 0

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function playWorldPulse(world, beat) {
  try {
    if (masterVolume <= 0) return
    const context = ensureAudio()
    const bases = { city: 130.81, forest: 110, mountain: 146.83, space: 98 }
    const shapes = { city: 'triangle', forest: 'sine', mountain: 'triangle', space: 'sine' }
    const steps = [1, 1.5, 2, 1.5]
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    const now = context.currentTime
    const base = bases[world] || bases.city

    oscillator.type = shapes[world] || 'sine'
    oscillator.frequency.value = base * steps[beat % steps.length]
    filter.type = 'lowpass'
    filter.frequency.value = world === 'space' ? 850 : 1200
    gain.gain.setValueAtTime(0.018 * masterVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23)

    oscillator.connect(filter).connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.24)

    if (beat % 4 === 0) {
      const accent = context.createOscillator()
      const accentGain = context.createGain()
      accent.type = 'sine'
      accent.frequency.value = base / 2
      accentGain.gain.setValueAtTime(0.02 * masterVolume, now)
      accentGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
      accent.connect(accentGain).connect(context.destination)
      accent.start(now)
      accent.stop(now + 0.17)
    }
  } catch {}
}

function startWorldMusic(world) {
  try {
    ensureAudio()
    if (worldMusicTimer && worldMusicWorld === world) return
    if (worldMusicTimer) window.clearInterval(worldMusicTimer)

    worldMusicWorld = world
    worldMusicBeat = 0
    playWorldPulse(world, worldMusicBeat++)
    worldMusicTimer = window.setInterval(() => playWorldPulse(world, worldMusicBeat++), 520)
  } catch {}
}

function stopWorldMusic() {
  if (worldMusicTimer) window.clearInterval(worldMusicTimer)
  worldMusicTimer = undefined
  worldMusicWorld = undefined
}

function playWorldStinger(world) {
  const sequences = {
    city: [0, 1, 2],
    forest: [2, 1, 0],
    mountain: [0, 2, 3],
    space: [3, 2, 3],
  }
  ;(sequences[world] || sequences.city).forEach((note, i) => {
    window.setTimeout(() => playTone(note, false), i * 100)
  })
}

function playTone(index, soft) {
  try {
    if (masterVolume <= 0) return
    ensureAudio()

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()
    const now = audioContext.currentTime

    oscillator.type = soft ? 'sine' : 'triangle'
    oscillator.frequency.value = FREQUENCIES[index]
    filter.type = 'lowpass'
    filter.frequency.value = soft ? 1200 : 1900

    gain.gain.setValueAtTime((soft ? 0.07 : 0.16) * masterVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    oscillator.connect(filter).connect(gain).connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  } catch {}
}

function playSpark(index) {
  try {
    if (!audioContext || masterVolume <= 0) return
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const now = audioContext.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.value = FREQUENCIES[index] * 2
    gain.gain.setValueAtTime(0.045 * masterVolume, now + 0.035)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start(now + 0.035)
    oscillator.stop(now + 0.19)
  } catch {}
}

function playWin() {
  ;[0, 1, 2, 3, 2, 3].forEach((note, index) => {
    window.setTimeout(() => playTone(note, false), index * 115)
  })
}

function GameCanvas(props) {
  const canvasRef = useRef(null)
  const laneRef = useRef(props.lane)
  const progressRef = useRef(props.progress)
  const targetRef = useRef(props.target)
  const wonRef = useRef(props.won)
  const pulseRef = useRef(props.pulse)
  const patternRef = useRef(props.pattern)
  const sceneRef = useRef(props.scene)
  const carRef = useRef(props.car)
  const worldRef = useRef(props.world)
  const successRef = useRef(props.successPulse)
  const lastHitRef = useRef(props.lastHit)
  const actionRef = useRef(props.freeAction)
  const actionPulseRef = useRef(props.actionPulse)

  useEffect(() => { laneRef.current = props.lane }, [props.lane])
  useEffect(() => { progressRef.current = props.progress }, [props.progress])
  useEffect(() => { targetRef.current = props.target }, [props.target])
  useEffect(() => { wonRef.current = props.won }, [props.won])
  useEffect(() => { pulseRef.current = props.pulse }, [props.pulse])
  useEffect(() => { patternRef.current = props.pattern }, [props.pattern])
  useEffect(() => { sceneRef.current = props.scene }, [props.scene])
  useEffect(() => { carRef.current = props.car }, [props.car])
  useEffect(() => { worldRef.current = props.world }, [props.world])
  useEffect(() => { successRef.current = props.successPulse }, [props.successPulse])
  useEffect(() => { lastHitRef.current = props.lastHit }, [props.lastHit])
  useEffect(() => { actionRef.current = props.freeAction }, [props.freeAction])
  useEffect(() => { actionPulseRef.current = props.actionPulse }, [props.actionPulse])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frame = 0
    let start = performance.now()
    let carX = 0.5

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function roundedRect(x, y, w, h, r, fill, stroke, lineWidth) {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, r)
      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }
      if (stroke) {
        ctx.lineWidth = lineWidth || 1
        ctx.strokeStyle = stroke
        ctx.stroke()
      }
    }

    function drawCar(x, y, scale, t, pop, tilt = 0, extraY = 0) {
      ctx.save()
      ctx.translate(x, y + Math.sin(t * 0.006) * 2 - pop * 9 - extraY)
      ctx.rotate(tilt)
      ctx.scale(scale, scale)

      ctx.fillStyle = 'rgba(23,62,89,.28)'
      ctx.beginPath()
      ctx.ellipse(0, 27, 48, 11, 0, 0, Math.PI * 2)
      ctx.fill()

      const car = CARS[carRef.current] || CARS.blue
      roundedRect(-50, -24, 100, 54, 23, car.body, '#ffffff', 4)
      roundedRect(-31, -38, 62, 31, 15, car.roof, '#ffffff', 4)
      roundedRect(-23, -30, 19, 16, 7, '#dff7ff', null, 0)
      roundedRect(4, -30, 19, 16, 7, '#dff7ff', null, 0)

      ctx.fillStyle = '#0f3761'
      ctx.beginPath()
      ctx.arc(-13, -22, 4, 0, Math.PI * 2)
      ctx.arc(13, -22, 4, 0, Math.PI * 2)
      ctx.fill()

      const happyAge = performance.now() - successRef.current
      const happy = happyAge < 420
      ctx.strokeStyle = '#0f3761'
      ctx.lineWidth = happy ? 4 : 3
      ctx.beginPath()
      ctx.arc(0, happy ? -2 : -5, happy ? 17 : 12, 0.2, Math.PI - 0.2)
      ctx.stroke()

      ctx.fillStyle = '#ffef72'
      ctx.beginPath()
      ctx.arc(-37, 2, 7, 0, Math.PI * 2)
      ctx.arc(37, 2, 7, 0, Math.PI * 2)
      ctx.fill()

      roundedRect(-43, 23, 22, 17, 8, '#17324f', null, 0)
      roundedRect(21, 23, 22, 17, 8, '#17324f', null, 0)
      ctx.restore()
    }

    function draw(now) {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const t = now - start

      ctx.clearRect(0, 0, w, h)

      const forest = worldRef.current === 'forest'
      const mountain = worldRef.current === 'mountain'
      const space = worldRef.current === 'space'
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62)
      sky.addColorStop(0, space ? '#111942' : mountain ? '#7ab9f0' : forest ? '#496fd7' : '#48c9ff')
      sky.addColorStop(1, space ? '#43226f' : mountain ? '#e5f5ff' : forest ? '#9ed5e8' : '#c6f3ff')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      const cloudBase = ((t * 0.012) % (w + 220)) - 140
      ctx.fillStyle = space ? 'rgba(255,255,255,.24)' : forest ? 'rgba(244,252,255,.72)' : 'rgba(255,255,255,.92)'
      ;[0, w * 0.58].forEach((offset) => {
        const x = ((cloudBase + offset + w + 220) % (w + 220)) - 110
        ctx.beginPath()
        ctx.arc(x, h * 0.16, 31, 0, Math.PI * 2)
        ctx.arc(x + 37, h * 0.145, 41, 0, Math.PI * 2)
        ctx.arc(x + 77, h * 0.165, 29, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.fillStyle = space ? '#242548' : mountain ? '#78926f' : forest ? '#347f48' : '#67cf56'
      ctx.fillRect(0, h * 0.55, w, h * 0.45)

      if (space) {
        for (let i = 0; i < 26; i += 1) {
          const x = (i * 83 + 31) % w
          const y = (i * 47 + 29) % (h * 0.52)
          ctx.beginPath()
          ctx.arc(x, y, i % 4 === 0 ? 2.6 : 1.4, 0, Math.PI * 2)
          ctx.fillStyle = i % 5 === 0 ? '#fff5a8' : '#ffffff'
          ctx.fill()
        }

        ctx.save()
        ctx.translate(w * 0.18, h * 0.31)
        ctx.fillStyle = '#5f64c9'
        ctx.beginPath()
        ctx.arc(0, 0, 33, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#d9b7ff'
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.ellipse(0, 0, 51, 14, -.18, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(w * 0.82, h * 0.22)
        ctx.fillStyle = '#f0c95d'
        ctx.beginPath()
        ctx.arc(0, 0, 24, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else if (mountain) {
        const peaks = [
          {x:w*.16,y:h*.56,wide:w*.28,tall:h*.25,color:'#8ca7b7'},
          {x:w*.44,y:h*.56,wide:w*.34,tall:h*.33,color:'#6f8b9d'},
          {x:w*.76,y:h*.56,wide:w*.30,tall:h*.27,color:'#91adbc'},
        ]
        peaks.forEach((p,i) => {
          ctx.beginPath()
          ctx.moveTo(p.x-p.wide/2,p.y)
          ctx.lineTo(p.x,p.y-p.tall)
          ctx.lineTo(p.x+p.wide/2,p.y)
          ctx.closePath()
          ctx.fillStyle=p.color
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(p.x,p.y-p.tall)
          ctx.lineTo(p.x-p.wide*.10,p.y-p.tall*.72)
          ctx.lineTo(p.x+p.wide*.08,p.y-p.tall*.78)
          ctx.lineTo(p.x+p.wide*.16,p.y-p.tall*.56)
          ctx.closePath()
          ctx.fillStyle='#f4fbff'
          ctx.fill()
        })
      } else if (forest) {
        for (let i = 0; i < 9; i += 1) {
          const x = (i + 0.5) * (w / 9)
          const treeH = h * (0.18 + (i % 3) * 0.035)
          roundedRect(x - 8, h * 0.55 - treeH * 0.48, 16, treeH * 0.55, 7, '#755033', null, 0)
          ctx.fillStyle = i % 2 ? '#2da65a' : '#3ebc65'
          ctx.beginPath()
          ctx.arc(x, h * 0.55 - treeH * 0.55, 34, 0, Math.PI * 2)
          ctx.arc(x - 20, h * 0.55 - treeH * 0.42, 24, 0, Math.PI * 2)
          ctx.arc(x + 20, h * 0.55 - treeH * 0.42, 24, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.save()
        ctx.fillStyle = '#fff5b8'
        ctx.beginPath()
        ctx.arc(w * 0.82, h * 0.13, 32, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else {
        const buildings = ['#ff6c77', '#5a9cff', '#ffd64f', '#9d5de6', '#ff61a4', '#4ec77d', '#ff9b43']
        buildings.forEach((color, i) => {
          const bw = w / buildings.length + 6
          const bh = h * (0.13 + ((i * 37) % 9) * 0.012)
          const x = i * (w / buildings.length) - 3
          roundedRect(x, h * 0.55 - bh, bw, bh + 4, 10, color, null, 0)
        })
      }

      const horizonY = h * 0.52
      ctx.fillStyle = '#7488a5'
      ctx.beginPath()
      ctx.moveTo(w * 0.39, horizonY)
      ctx.lineTo(w * 0.61, horizonY)
      ctx.lineTo(w * 0.98, h)
      ctx.lineTo(w * 0.02, h)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,.45)'
      ctx.lineWidth = 2
      for (let i = 1; i < 4; i += 1) {
        ctx.beginPath()
        ctx.moveTo(w * (0.39 + 0.22 * (i / 4)), horizonY)
        ctx.lineTo(w * (0.02 + 0.96 * (i / 4)), h)
        ctx.stroke()
      }

      const scene = sceneRef.current
      const completed = progressRef.current

      if (scene === 'lights') {
        const lampXs = [w * 0.12, w * 0.30, w * 0.70, w * 0.88]
        lampXs.forEach((x, i) => {
          const y = h * (i === 1 || i === 2 ? 0.53 : 0.61)
          ctx.fillStyle = '#38516f'
          roundedRect(x - 4, y, 8, 78, 5, '#38516f', '#ffffff', 2)
          ctx.beginPath()
          ctx.arc(x, y - 5, 15, 0, Math.PI * 2)
          ctx.fillStyle = i < completed ? '#ffe052' : '#7f90a4'
          ctx.fill()
          ctx.lineWidth = 3
          ctx.strokeStyle = '#fff'
          ctx.stroke()
          if (i < completed) {
            ctx.save()
            ctx.shadowColor = '#ffe052'
            ctx.shadowBlur = 24
            ctx.beginPath()
            ctx.arc(x, y - 5, 12, 0, Math.PI * 2)
            ctx.fillStyle = '#fff18a'
            ctx.fill()
            ctx.restore()
          }
        })
      }

      if (scene === 'bridge') {
        const open = Math.min(1, completed / Math.max(1, patternRef.current.length))
        ctx.save()
        ctx.translate(w * 0.5, h * 0.56)
        ctx.fillStyle = '#f3ddb3'
        roundedRect(-w * 0.24, -42, 24, 92, 8, '#f3ddb3', '#ffffff', 3)
        roundedRect(w * 0.24 - 24, -42, 24, 92, 8, '#f3ddb3', '#ffffff', 3)
        ctx.save()
        ctx.translate(-w * 0.22, 10)
        ctx.rotate(-open * 0.55)
        roundedRect(0, -10, w * 0.22, 20, 7, '#2f75d0', '#ffd43d', 4)
        ctx.restore()
        ctx.save()
        ctx.translate(w * 0.22, 10)
        ctx.rotate(open * 0.55)
        roundedRect(-w * 0.22, -10, w * 0.22, 20, 7, '#2f75d0', '#ffd43d', 4)
        ctx.restore()
        ctx.restore()
      }

      if (scene === 'tunnel') {
        ctx.save()
        ctx.strokeStyle = '#5b46a5'
        ctx.lineWidth = 18
        ctx.beginPath()
        ctx.arc(w * 0.5, h * 0.57, w * 0.21, Math.PI, 0)
        ctx.stroke()
        const ringXs = [0.38, 0.46, 0.54, 0.62]
        ringXs.forEach((fraction, i) => {
          ctx.beginPath()
          ctx.arc(w * fraction, h * 0.55, 11, 0, Math.PI * 2)
          ctx.fillStyle = i < completed ? COLORS[i] : '#7f82a7'
          ctx.fill()
          ctx.lineWidth = 3
          ctx.strokeStyle = '#fff'
          ctx.stroke()
        })
        ctx.restore()
      }

      if (scene === 'music') {
        const symbols = ['♪', '★', '♫', '♪', '★']
        for (let i = 0; i < Math.min(completed, symbols.length); i += 1) {
          const x = w * (0.16 + i * 0.17)
          const y = h * (0.43 - (i % 2) * 0.05)
          ctx.save()
          ctx.shadowColor = COLORS[i % COLORS.length]
          ctx.shadowBlur = 18
          ctx.fillStyle = COLORS[i % COLORS.length]
          ctx.font = '1000 34px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(symbols[i], x, y)
          ctx.restore()
        }
      }

      if (scene === 'rabbit') {
        const count = patternRef.current.length
        for (let i = 0; i < count; i += 1) {
          const x = w * (0.18 + i * 0.17)
          const y = h * (0.47 - (i % 2) * 0.035)
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, Math.PI * 2)
          ctx.fillStyle = i < completed ? '#fff5dc' : '#6ca77a'
          ctx.fill()
          if (i < completed) {
            ctx.fillStyle = '#ff8caf'
            ctx.fillRect(x - 3, y - 18, 6, 12)
          }
        }
      }

      if (scene === 'fireflies') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.16 + i * 0.18)
          const y = h * (0.40 + (i % 2) * 0.08)
          ctx.save()
          ctx.shadowColor = '#fff16b'
          ctx.shadowBlur = i < completed ? 25 : 0
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fillStyle = i < completed ? '#fff16b' : '#61806a'
          ctx.fill()
          ctx.restore()
        }
      }

      if (scene === 'drums') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.16 + i * 0.20)
          const y = h * 0.50
          roundedRect(x - 19, y - 10, 38, 28, 9, i < completed ? '#e49a48' : '#825f42', '#fff3d0', 3)
          ctx.beginPath()
          ctx.ellipse(x, y - 10, 19, 7, 0, 0, Math.PI * 2)
          ctx.fillStyle = i < completed ? '#ffd379' : '#a98766'
          ctx.fill()
        }
      }

      if (scene === 'owl') {
        ctx.save()
        ctx.translate(w * 0.5, h * 0.43)
        ctx.fillStyle = '#8358a9'
        ctx.beginPath()
        ctx.arc(0, 0, 52, 0, Math.PI * 2)
        ctx.fill()
        ;[-20, 20].forEach((x, i) => {
          ctx.beginPath()
          ctx.arc(x, -5, 16, 0, Math.PI * 2)
          ctx.fillStyle = completed > i ? '#fff16b' : '#e7e4ef'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, -5, 6, 0, Math.PI * 2)
          ctx.fillStyle = '#22314f'
          ctx.fill()
        })
        ctx.fillStyle = '#ffb949'
        ctx.beginPath()
        ctx.moveTo(-7, 12);ctx.lineTo(7, 12);ctx.lineTo(0, 24);ctx.closePath();ctx.fill()
        ctx.restore()
      }

      if (scene === 'parade') {
        const lanterns = Math.min(completed, patternRef.current.length)
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.12 + i * 0.15)
          const y = h * (0.39 + (i % 2) * 0.06)
          ctx.beginPath()
          ctx.arc(x, y, 11, 0, Math.PI * 2)
          ctx.fillStyle = i < lanterns ? COLORS[i % COLORS.length] : '#718b7a'
          ctx.fill()
          if (i < lanterns) {
            ctx.save()
            ctx.shadowColor = COLORS[i % COLORS.length]
            ctx.shadowBlur = 20
            ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle='#fff7c8';ctx.fill();ctx.restore()
          }
        }
      }

      if (scene === 'rocks') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.17 + i * 0.20)
          const y = h * (0.50 - (i % 2) * 0.035)
          ctx.beginPath()
          ctx.moveTo(x-17,y+10)
          ctx.lineTo(x-8,y-12)
          ctx.lineTo(x+14,y-8)
          ctx.lineTo(x+19,y+11)
          ctx.closePath()
          ctx.fillStyle = i < completed ? '#ffd05b' : '#768694'
          ctx.fill()
          ctx.lineWidth=3
          ctx.strokeStyle='#fff'
          ctx.stroke()
        }
      }

      if (scene === 'waterfall') {
        const flow = Math.min(1, completed / Math.max(1, patternRef.current.length))
        const x = w * 0.50
        const y = h * 0.33
        roundedRect(x-42,y,84,h*.22,24,'#7e95a3','#fff',3)
        ctx.save()
        ctx.globalAlpha = 0.25 + flow * 0.75
        ctx.fillStyle='#6ed8ff'
        roundedRect(x-26,y+10,52,h*.20,22,'#6ed8ff',null,0)
        ctx.restore()
        for(let i=0;i<completed;i+=1){
          ctx.beginPath()
          ctx.arc(x-22+i*15,y+h*.21,8,0,Math.PI*2)
          ctx.fillStyle=COLORS[i%COLORS.length]
          ctx.fill()
        }
      }

      if (scene === 'crystals') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.18 + i * 0.20)
          const y = h * 0.48
          ctx.save()
          if(i<completed){ctx.shadowColor=COLORS[i%COLORS.length];ctx.shadowBlur=24}
          ctx.beginPath()
          ctx.moveTo(x,y-28)
          ctx.lineTo(x+15,y)
          ctx.lineTo(x,y+22)
          ctx.lineTo(x-15,y)
          ctx.closePath()
          ctx.fillStyle = i < completed ? COLORS[i%COLORS.length] : '#8291a5'
          ctx.fill()
          ctx.lineWidth=3
          ctx.strokeStyle='#fff'
          ctx.stroke()
          ctx.restore()
        }
      }

      if (scene === 'beacons') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.12 + i * 0.19)
          const y = h * (0.47 - (i%2)*0.05)
          roundedRect(x-4,y,8,45,4,'#5f6f7d','#fff',2)
          ctx.beginPath()
          ctx.arc(x,y-5,11,0,Math.PI*2)
          ctx.fillStyle=i<completed?'#ffe15d':'#71808c'
          ctx.fill()
          if(i<completed){
            ctx.save()
            ctx.shadowColor='#ffe15d';ctx.shadowBlur=22
            ctx.beginPath();ctx.arc(x,y-5,8,0,Math.PI*2);ctx.fillStyle='#fff7a4';ctx.fill()
            ctx.restore()
          }
        }
      }

      if (scene === 'summit') {
        const summitY = h * 0.42
        ctx.fillStyle='#ffffff'
        roundedRect(w*.31,summitY-30,w*.38,34,10,'#ffffff','#f0a52b',4)
        ctx.fillStyle='#a96c0d'
        ctx.font='1000 17px Arial'
        ctx.textAlign='center'
        ctx.fillText('SUMMIT',w*.5,summitY-8)

        for(let i=0;i<Math.min(completed,patternRef.current.length);i+=1){
          const x=w*(0.14+i*.14)
          const y=h*(0.32-(i%2)*.05)
          ctx.save()
          ctx.shadowColor=COLORS[i%COLORS.length];ctx.shadowBlur=18
          ctx.fillStyle=COLORS[i%COLORS.length]
          ctx.font='1000 28px Arial';ctx.textAlign='center'
          ctx.fillText(i%2?'★':'♪',x,y)
          ctx.restore()
        }
      }

      if (scene === 'launch') {
        const power = Math.min(1, completed / Math.max(1, patternRef.current.length))
        const x = w * 0.50
        const y = h * 0.44
        ctx.save()
        ctx.translate(x, y - power * 18)
        ctx.fillStyle = '#f2f7ff'
        ctx.beginPath()
        ctx.moveTo(0, -34);ctx.lineTo(18, 10);ctx.lineTo(10, 28);ctx.lineTo(-10, 28);ctx.lineTo(-18, 10);ctx.closePath();ctx.fill()
        ctx.fillStyle='#ff5a73'
        ctx.fillRect(-7,-4,14,20)
        ctx.fillStyle = power > 0 ? '#ffd45d' : '#7f8498'
        ctx.beginPath();ctx.moveTo(-8,28);ctx.lineTo(0,28+34*power);ctx.lineTo(8,28);ctx.closePath();ctx.fill()
        ctx.restore()
      }

      if (scene === 'stars') {
        for (let i = 0; i < patternRef.current.length; i += 1) {
          const x = w * (0.17 + i * 0.20)
          const y = h * (0.36 + (i % 2) * 0.08)
          ctx.save()
          if(i<completed){ctx.shadowColor='#ffe46c';ctx.shadowBlur=22}
          ctx.fillStyle=i<completed?'#ffe46c':'#74799b'
          ctx.font='1000 30px Arial'
          ctx.textAlign='center'
          ctx.fillText('★',x,y)
          ctx.restore()
        }
      }

      if (scene === 'rings') {
        const planets = [
          {x:w*.28,y:h*.40,c:'#ff8a6b'},
          {x:w*.50,y:h*.34,c:'#66c9ff'},
          {x:w*.72,y:h*.43,c:'#b77aff'},
          {x:w*.50,y:h*.49,c:'#7ee083'},
        ]
        planets.forEach((p,i)=>{
          ctx.save()
          ctx.translate(p.x,p.y)
          ctx.fillStyle=i<completed?p.c:'#6f718b'
          ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill()
          ctx.strokeStyle=i<completed?'#fff4b2':'#9b9db0';ctx.lineWidth=4
          ctx.beginPath();ctx.ellipse(0,0,27,8,-.25,0,Math.PI*2);ctx.stroke()
          ctx.restore()
        })
      }

      if (scene === 'comets') {
        for(let i=0;i<patternRef.current.length;i+=1){
          const x=w*(0.13+i*.17)
          const y=h*(0.34+(i%2)*.07)
          ctx.strokeStyle=i<completed?COLORS[i%COLORS.length]:'#656982'
          ctx.lineWidth=5
          ctx.beginPath();ctx.moveTo(x-24,y-14);ctx.lineTo(x,y);ctx.stroke()
          ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2)
          ctx.fillStyle=i<completed?'#fff2a8':'#74788f';ctx.fill()
        }
      }

      if (scene === 'moonconcert') {
        const moonX=w*.5, moonY=h*.39
        ctx.fillStyle='#e9ecff'
        ctx.beginPath();ctx.arc(moonX,moonY,46,0,Math.PI*2);ctx.fill()
        for(let i=0;i<Math.min(completed,patternRef.current.length);i+=1){
          const angle=(-2.5)+(i*.85)
          const x=moonX+Math.cos(angle)*82
          const y=moonY+Math.sin(angle)*50
          ctx.save()
          ctx.shadowColor=COLORS[i%COLORS.length];ctx.shadowBlur=18
          ctx.fillStyle=COLORS[i%COLORS.length]
          ctx.font='1000 28px Arial';ctx.textAlign='center'
          ctx.fillText(i%2?'★':'♪',x,y)
          ctx.restore()
        }
      }

      if (scene === 'finish') {
        const bannerY = h * 0.55
        ctx.fillStyle = '#ffffff'
        roundedRect(w * 0.25, bannerY - 30, w * 0.50, 36, 10, '#ffffff', '#2467b5', 4)
        ctx.fillStyle = '#2467b5'
        ctx.font = '1000 18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('FINISH', w * 0.5, bannerY - 6)
        if (completed > 0) {
          for (let i = 0; i < completed * 3; i += 1) {
            const x = (i * 71 + t * 0.04) % w
            const y = ((i * 43 + t * 0.08) % (h * 0.42)) + 60
            ctx.fillStyle = COLORS[i % COLORS.length]
            ctx.fillRect(x, y, 7, 12)
          }
        }
      }

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 5
      ctx.setLineDash([28, 32])
      const roadBoostAge = performance.now() - successRef.current
      const actionAgeForRoad = performance.now() - actionPulseRef.current
      const turboing = actionRef.current === 'turbo' && actionAgeForRoad < 700
      const roadSpeed = turboing ? 0.72 : roadBoostAge < 430 ? 0.42 : 0.16
      ctx.lineDashOffset = (t * roadSpeed) % 80
      ctx.beginPath()
      ctx.moveTo(w * 0.5, horizonY)
      ctx.lineTo(w * 0.5, h)
      ctx.stroke()
      ctx.setLineDash([])

      if (!wonRef.current) {
        const targetLane = [0.24, 0.41, 0.59, 0.76][targetRef.current]
        const targetY = h * 0.38 + Math.sin(t * 0.008) * 5
        ctx.save()
        ctx.translate(w * targetLane, targetY)
        ctx.shadowColor = COLORS[targetRef.current]
        ctx.shadowBlur = 24
        ctx.beginPath()
        ctx.arc(0, 0, 34, 0, Math.PI * 2)
        ctx.fillStyle = COLORS[targetRef.current]
        ctx.fill()
        ctx.lineWidth = 5
        ctx.strokeStyle = '#fff'
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = '1000 31px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(NOTES[targetRef.current], 0, 2)
        ctx.restore()
      }

      const desiredX = [0.24, 0.41, 0.59, 0.76][laneRef.current]
      carX += (desiredX - carX) * 0.12
      const pulseAge = performance.now() - pulseRef.current
      const pop = pulseAge < 240 ? Math.max(0, 1 - pulseAge / 240) : 0
      const successAge = performance.now() - successRef.current
      const successPop = successAge < 420 ? Math.max(0, 1 - successAge / 420) : 0
      const carScale = Math.min(w / 430, 1.1) * (1 + successPop * 0.06)

      if (successPop > 0) {
        const boostColor = COLORS[lastHitRef.current] || '#fff27a'

        ctx.save()
        ctx.globalAlpha = successPop * 0.72
        ctx.strokeStyle = boostColor
        ctx.lineWidth = 9
        ctx.lineCap = 'round'
        ctx.shadowColor = boostColor
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.moveTo(w * carX - 20, h * 0.85)
        ctx.lineTo(w * carX - 28, h * 0.91 + (1 - successPop) * 18)
        ctx.moveTo(w * carX + 20, h * 0.85)
        ctx.lineTo(w * carX + 28, h * 0.91 + (1 - successPop) * 18)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = successPop
        ctx.shadowColor = boostColor
        ctx.shadowBlur = 24
        ctx.fillStyle = boostColor
        for (let i = 0; i < 9; i += 1) {
          const angle = (Math.PI * 2 * i) / 9
          const distance = 52 + (1 - successPop) * 34
          const sx = w * carX + Math.cos(angle) * distance
          const sy = h * 0.82 + Math.sin(angle) * distance * 0.55
          ctx.beginPath()
          ctx.arc(sx, sy, 3 + (i % 3), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      const actionAge = performance.now() - actionPulseRef.current
      const actionProgress = Math.min(1, Math.max(0, actionAge / 560))
      const jumpHeight = actionRef.current === 'jump' && actionAge < 560 ? Math.sin(actionProgress * Math.PI) * 54 : 0
      const spinTilt = actionRef.current === 'spin' && actionAge < 560 ? actionProgress * Math.PI * 2 : 0

      drawCar(w * carX, h * 0.82, carScale, t, Math.max(pop, successPop), spinTilt, jumpHeight)

      const pattern = patternRef.current
      for (let i = 0; i < pattern.length; i += 1) {
        const px = w * 0.5 + (i - (pattern.length - 1) / 2) * 20
        ctx.beginPath()
        ctx.arc(px, 24, 6, 0, Math.PI * 2)
        ctx.fillStyle = i < completed ? '#ffd43d' : 'rgba(255,255,255,.7)'
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="game-canvas" />
}

function Home(props) {
  const car = CARS[props.car] || CARS.blue
  const holdRef = useRef(null)

  function holdStart() {
    window.clearTimeout(holdRef.current)
    holdRef.current = window.setTimeout(props.onParents, 900)
  }

  function holdEnd() {
    window.clearTimeout(holdRef.current)
  }

  return (
    <section className="home-screen">
      <div className="home-scene">
        <div
          className="logo"
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerCancel={holdEnd}
          onPointerLeave={holdEnd}
        ><span>♪</span>CarKeys</div>
        <div className="home-copy">Tap the keys. Drive the car.</div>
        <div className="home-road" />
        <div className="home-car">
          <div className="mini-car" style={{ '--car-body': car.body, '--car-roof': car.roof }}>
            <div className="mini-window left" />
            <div className="mini-window right" />
            <div className="mini-eye left" />
            <div className="mini-eye right" />
            <div className="mini-smile" />
          </div>
        </div>
      </div>

      <button className="play-button" onClick={props.onPlay}>
        <span>▶</span>
        <div><b>{props.hasContinue ? 'CONTINUE' : 'PLAY'}</b>{props.hasContinue && <small>Level {props.savedLevel + 1}</small>}</div>
      </button>

      {props.pinkUnlocked && (
        <div className="home-actions">
          <button onClick={props.onFreeDrive}><b>∞</b><span>FREE DRIVE</span></button>
          <button onClick={props.onWorlds}><b>◎</b><span>WORLDS</span></button>
        </div>
      )}

      {props.pinkUnlocked && (
        <div className="car-picker">
          <span>YOUR CAR</span>
          <div>
            <button className={props.car === 'blue' ? 'selected blue' : 'blue'} onClick={() => props.onCar('blue')}>●</button>
            <button className={props.car === 'pink' ? 'selected pink' : 'pink'} onClick={() => props.onCar('pink')}>●</button>
            {props.greenUnlocked && <button className={props.car === 'green' ? 'selected green' : 'green'} onClick={() => props.onCar('green')}>●</button>}
            {props.goldUnlocked && <button className={props.car === 'gold' ? 'selected gold' : 'gold'} onClick={() => props.onCar('gold')}>●</button>}
            {props.purpleUnlocked && <button className={props.car === 'purple' ? 'selected purple' : 'purple'} onClick={() => props.onCar('purple')}>●</button>}
          </div>
        </div>
      )}
    </section>
  )
}

function WorldSelect({ unlocked, onWorld, onBack }) {
  const worlds = ['city', 'forest', 'mountain', 'space']

  return (
    <section className="menu-screen world-screen">
      <button className="menu-back" onClick={onBack}>‹</button>
      <div className="menu-title"><small>CHOOSE A WORLD</small><h1>Where to?</h1></div>
      <div className="world-grid">
        {worlds.map((world) => {
          const open = unlocked[world]
          const meta = WORLD_META[world]
          return (
            <button
              key={world}
              className={'world-card '+world+(open ? '' : ' locked')}
              onClick={() => open && onWorld(world)}
              disabled={!open}
            >
              <span className="world-icon">{open ? meta.icon : '●'}</span>
              <b>{WORLD_NAMES[world]}</b>
              <small>{open ? 'PLAY' : 'LOCKED'}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function FreeDrive({ car, world, haptics, onBack }) {
  const [lane, setLane] = useState(1)
  const [pulse, setPulse] = useState(0)
  const [successPulse, setSuccessPulse] = useState(0)
  const [lastHit, setLastHit] = useState(0)
  const [action, setAction] = useState('')
  const [actionPulse, setActionPulse] = useState(0)
  const actions = ['JUMP', 'SWERVE', 'TURBO', 'SPIN']

  useEffect(() => {
    startWorldMusic(world)
    return () => stopWorldMusic()
  }, [world])

  function tap(index) {
    const now = performance.now()
    playTone(index, false)
    playSpark(index)
    setLastHit(index)
    setPulse(now)
    setSuccessPulse(now)
    setActionPulse(now)
    setAction(['jump', 'swerve', 'turbo', 'spin'][index])

    if (index === 1) setLane((value) => (value + 1) % 4)
    if (haptics) {
      try { navigator.vibrate?.(index === 2 ? 26 : 14) } catch {}
    }
  }

  return (
    <section className="play-screen free-drive-screen">
      <div className="stage-wrap">
        <GameCanvas
          lane={lane}
          pulse={pulse}
          successPulse={successPulse}
          lastHit={lastHit}
          progress={0}
          target={0}
          won
          pattern={[]}
          scene="drive"
          world={world}
          car={car}
          freeAction={action}
          actionPulse={actionPulse}
        />
        <div className={'level-badge '+world}>FREE DRIVE · {WORLD_NAMES[world]}</div>
        <button className="home-button" onClick={onBack}>⌂</button>
        <div className="free-hint">PLAY WITH THE CAR!</div>
      </div>
      <div className="controller free-controller">
        {NOTES.map((note, index) => (
          <button
            key={note}
            onPointerDown={() => tap(index)}
            style={{ '--key-color': COLORS[index] }}
          >
            <b>{note}</b>
            <small>{actions[index]}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

function AdventureComplete({ onFreeDrive, onWorlds, onReplay }) {
  return (
    <section className="complete-screen">
      <div className="complete-stars" aria-hidden="true">★ ♪ ★ ♪ ★</div>
      <div className="complete-card">
        <small>CARKEYS</small>
        <h1>YOU FINISHED<br/>THE ADVENTURE!</h1>
        <p>City. Forest. Mountain. Space.</p>
        <div className="complete-cars">
          {Object.entries(CARS).map(([id, car]) => (
            <span key={id} style={{ '--car': car.body }} title={car.name}>●</span>
          ))}
        </div>
        <button className="complete-primary" onClick={onFreeDrive}>∞ FREE DRIVE</button>
        <button onClick={onWorlds}>◎ CHOOSE A WORLD</button>
        <button className="complete-quiet" onClick={onReplay}>↻ PLAY AGAIN</button>
      </div>
    </section>
  )
}

function ParentControls({ volume, haptics, onVolume, onHaptics, onReset, onClose }) {
  return (
    <div className="parent-overlay">
      <div className="parent-card">
        <div className="parent-head"><b>PARENT CONTROLS</b><button onClick={onClose}>×</button></div>
        <label>
          <span>SOUND</span>
          <input type="range" min="0" max="1" step="0.25" value={volume} onChange={(e) => onVolume(Number(e.target.value))} />
        </label>
        <button className="parent-toggle" onClick={() => onHaptics(!haptics)}>
          <span>HAPTICS</span><b>{haptics ? 'ON' : 'OFF'}</b>
        </button>
        <button className="reset-progress" onClick={onReset}>RESET PROGRESS</button>
        <small>Hold the CarKeys logo to open this menu.</small>
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const initialSavedLevel = () => {
    const stored = Math.min(LEVELS.length - 1, Number(localStorage.getItem('carkeys-level') || '0'))
    const finishedOldCity = localStorage.getItem('carkeys-complete') === '1'
    const finishedForest = localStorage.getItem('carkeys-all-complete') === '1'
    const finishedMountain = localStorage.getItem('carkeys-mountain-complete') === '1'
    const finishedSpace = localStorage.getItem('carkeys-space-complete') === '1'
    if (finishedSpace) return 0
    if (finishedMountain && stored <= 19) return 20
    if (finishedForest && stored <= 14) return 15
    if (finishedOldCity && stored <= 9) return 10
    return stored
  }

  const [savedLevel, setSavedLevel] = useState(initialSavedLevel)
  const [adventureComplete, setAdventureComplete] = useState(() => localStorage.getItem('carkeys-space-complete') === '1')
  const [pinkUnlocked, setPinkUnlocked] = useState(() => localStorage.getItem('carkeys-pink') === '1')
  const [greenUnlocked, setGreenUnlocked] = useState(() => localStorage.getItem('carkeys-green') === '1')
  const [goldUnlocked, setGoldUnlocked] = useState(() => localStorage.getItem('carkeys-gold') === '1')
  const [purpleUnlocked, setPurpleUnlocked] = useState(() => localStorage.getItem('carkeys-purple') === '1')
  const [car, setCar] = useState(() => localStorage.getItem('carkeys-car') || 'blue')
  const [level, setLevel] = useState(initialSavedLevel)
  const [step, setStep] = useState(0)
  const [lane, setLane] = useState(1)
  const [pulse, setPulse] = useState(0)
  const [successPulse, setSuccessPulse] = useState(0)
  const [lastHit, setLastHit] = useState(0)
  const [introId, setIntroId] = useState(1)
  const [worldSplash, setWorldSplash] = useState('')
  const [cheer, setCheer] = useState('')
  const [won, setWon] = useState(false)
  const [wrong, setWrong] = useState(false)

  const currentLevel = LEVELS[level]
  const pattern = currentLevel.pattern
  const target = pattern[Math.min(step, pattern.length - 1)]
  const isLastLevel = level === LEVELS.length - 1

  useEffect(() => {
    if (screen !== 'play' || won) return undefined
    const id = window.setTimeout(() => playTone(target, true), 180)
    return () => window.clearTimeout(id)
  }, [screen, target, won])

  function start() {
    const nextLevel = adventureComplete ? 0 : savedLevel
    if (adventureComplete) {
      setAdventureComplete(false)
      setSavedLevel(0)
      localStorage.setItem('carkeys-space-complete', '0')
      localStorage.setItem('carkeys-level', '0')
    }
    setLevel(nextLevel)
    startWorldMusic(LEVELS[nextLevel].world)
    setStep(0)
    setLane(1)
    setPulse(0)
    setSuccessPulse(0)
    setWorldSplash('')
    setCheer('')
    setIntroId((value) => value + 1)
    setWon(false)
    setWrong(false)
    setScreen('play')
  }

  function chooseCar(id) {
    setCar(id)
    localStorage.setItem('carkeys-car', id)
  }

  function nextLevel() {
    if (isLastLevel) {
      stopWorldMusic()
      setScreen('home')
      return
    }

    const next = level + 1
    const nextWorld = LEVELS[next].world
    const changingWorld = nextWorld !== currentLevel.world

    if (changingWorld) {
      setWorldSplash(WORLD_NAMES[nextWorld])
      playWorldStinger(nextWorld)
      window.setTimeout(() => setWorldSplash(''), 1250)
      startWorldMusic(nextWorld)
    }

    setLevel(next)
    setSavedLevel(next)
    localStorage.setItem('carkeys-level', String(next))
    setStep(0)
    setLane(1)
    setPulse(performance.now())
    setSuccessPulse(0)
    if (!changingWorld) setWorldSplash('')
    setCheer('')
    setIntroId((value) => value + 1)
    setWon(false)
    setWrong(false)
  }

  function replayLevel() {
    setStep(0)
    setLane(1)
    setPulse(performance.now())
    setSuccessPulse(0)
    setWorldSplash('')
    setCheer('')
    setIntroId((value) => value + 1)
    setWon(false)
    setWrong(false)
  }

  function goHome() {
    stopWorldMusic()
    setWorldSplash('')
    setScreen('home')
  }

  function press(index) {
    if (won) return
    setLane(index)
    setPulse(performance.now())
    setWrong(false)
    playTone(index, false)
    try { navigator.vibrate?.(14) } catch {}

    if (index !== target) {
      setWrong(true)
      window.setTimeout(() => setWrong(false), 220)
      return
    }

    const now = performance.now()
    setSuccessPulse(now)
    setLastHit(index)
    playSpark(index)
    setCheer(step % 3 === 0 ? 'NICE!' : step % 3 === 1 ? 'YEAH!' : 'GO!')
    window.setTimeout(() => setCheer(''), 330)

    const next = step + 1
    setStep(next)

    if (next >= pattern.length) {
      setWon(true)
      window.setTimeout(playWin, 120)

      if (level === 9) {
        setPinkUnlocked(true)
        localStorage.setItem('carkeys-pink', '1')
        localStorage.setItem('carkeys-complete', '1')
      }

      if (level === 14) {
        setGreenUnlocked(true)
        localStorage.setItem('carkeys-green', '1')
        localStorage.setItem('carkeys-all-complete', '1')
      }

      if (level === 19) {
        setGoldUnlocked(true)
        localStorage.setItem('carkeys-gold', '1')
        localStorage.setItem('carkeys-mountain-complete', '1')
      }

      if (isLastLevel) {
        setPurpleUnlocked(true)
        setAdventureComplete(true)
        localStorage.setItem('carkeys-purple', '1')
        localStorage.setItem('carkeys-space-complete', '1')
      } else {
        const upcoming = level + 1
        setSavedLevel(upcoming)
        localStorage.setItem('carkeys-level', String(upcoming))
      }
    }
  }

  if (screen === 'home') return <Home onPlay={start} hasContinue={!adventureComplete && savedLevel > 0} savedLevel={savedLevel} pinkUnlocked={pinkUnlocked} greenUnlocked={greenUnlocked} goldUnlocked={goldUnlocked} purpleUnlocked={purpleUnlocked} car={car} onCar={chooseCar} />

  return (
    <section className="play-screen">
      <div className="stage-wrap">
        <GameCanvas lane={lane} pulse={pulse} successPulse={successPulse} lastHit={lastHit} progress={step} target={target} won={won} pattern={pattern} scene={currentLevel.scene} world={currentLevel.world} car={car} />
        <div className={'level-badge '+currentLevel.world}>{WORLD_NAMES[currentLevel.world]} · LEVEL {level + 1} · {currentLevel.name}</div>
        {worldSplash ? (
          <div className={'world-splash '+currentLevel.world}>
            <small>NEW WORLD</small>
            <b>{worldSplash}</b>
            <span>{currentLevel.name}</span>
          </div>
        ) : (
          <div key={introId} className={'level-intro '+currentLevel.world}>
            <small>{WORLD_NAMES[currentLevel.world]}</small>
            <b>{currentLevel.name}</b>
            <span>GO!</span>
          </div>
        )}
        {cheer && <div key={successPulse} className="hit-pop">{cheer}</div>}
        <button className="home-button" onClick={goHome}>⌂</button>
        {!won && (
          <div className={wrong ? 'prompt wrong' : 'prompt'}>
            {wrong ? 'TRY AGAIN' : <span>TAP <b>{NOTES[target]}</b></span>}
          </div>
        )}
        {won && (
          <div className="win-card">
            <div className="win-confetti" aria-hidden="true">
              {Array.from({length: 14}, (_, i) => <i key={i} style={{ '--i': i }} />)}
            </div>
            <div className="big-star">★</div>
            <div className="level-complete">LEVEL {level + 1} COMPLETE</div>
            <h2>{level === 9 || level === 14 || level === 19 || isLastLevel ? 'NEW CAR!' : 'NICE DRIVE!'}</h2>
            {level === 9 && <div className="unlock-car">★ PINK POP ★</div>}
            {level === 14 && <div className="unlock-car green-reward">★ FOREST FLASH ★</div>}
            {level === 19 && <div className="unlock-car gold-reward">★ SUMMIT SPARK ★</div>}
            {isLastLevel && <div className="unlock-car purple-reward">★ GALAXY GLIDE ★</div>}
            <button onClick={nextLevel}>{isLastLevel ? 'GO HOME' : level === 9 || level === 14 || level === 19 ? 'NEXT WORLD ▶' : 'NEXT ▶'}</button>
            <button className="secondary" onClick={replayLevel}>AGAIN</button>
            {!isLastLevel && <button className="tertiary" onClick={goHome}>HOME</button>}
          </div>
        )}
      </div>

      <div className="controller">
        {NOTES.map((note, index) => (
          <button
            key={note}
            onPointerDown={() => press(index)}
            className={index === target && !won ? 'hint' : ''}
            style={{ '--key-color': COLORS[index] }}
          >
            {note}
          </button>
        ))}
      </div>
    </section>
  )
}
