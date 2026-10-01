import { useEffect, useRef, useState } from 'react'

const NOTES = ['C', 'D', 'E', 'F']
const COLORS = ['#ff4f88', '#ffd43d', '#55d84a', '#9b4cf0']
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23]
const ROUND = [0, 0, 1, 2, 1, 3, 2, 0, 3, 1]

let audioContext

function playTone(index, soft) {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === 'suspended') audioContext.resume()

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()
    const now = audioContext.currentTime

    oscillator.type = soft ? 'sine' : 'triangle'
    oscillator.frequency.value = FREQUENCIES[index]
    filter.type = 'lowpass'
    filter.frequency.value = soft ? 1200 : 1900

    gain.gain.setValueAtTime(soft ? 0.07 : 0.16, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    oscillator.connect(filter).connect(gain).connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.3)
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

  useEffect(() => { laneRef.current = props.lane }, [props.lane])
  useEffect(() => { progressRef.current = props.progress }, [props.progress])
  useEffect(() => { targetRef.current = props.target }, [props.target])
  useEffect(() => { wonRef.current = props.won }, [props.won])
  useEffect(() => { pulseRef.current = props.pulse }, [props.pulse])

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

    function drawCar(x, y, scale, t, pop) {
      ctx.save()
      ctx.translate(x, y + Math.sin(t * 0.006) * 2 - pop * 9)
      ctx.scale(scale, scale)

      ctx.fillStyle = 'rgba(23,62,89,.28)'
      ctx.beginPath()
      ctx.ellipse(0, 27, 48, 11, 0, 0, Math.PI * 2)
      ctx.fill()

      roundedRect(-50, -24, 100, 54, 23, '#1d9cf0', '#ffffff', 4)
      roundedRect(-31, -38, 62, 31, 15, '#5fc8ff', '#ffffff', 4)
      roundedRect(-23, -30, 19, 16, 7, '#dff7ff', null, 0)
      roundedRect(4, -30, 19, 16, 7, '#dff7ff', null, 0)

      ctx.fillStyle = '#0f3761'
      ctx.beginPath()
      ctx.arc(-13, -22, 4, 0, Math.PI * 2)
      ctx.arc(13, -22, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#0f3761'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, -5, 12, 0.2, Math.PI - 0.2)
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

      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62)
      sky.addColorStop(0, '#48c9ff')
      sky.addColorStop(1, '#c6f3ff')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      const cloudBase = ((t * 0.012) % (w + 220)) - 140
      ctx.fillStyle = 'rgba(255,255,255,.92)'
      ;[0, w * 0.58].forEach((offset) => {
        const x = ((cloudBase + offset + w + 220) % (w + 220)) - 110
        ctx.beginPath()
        ctx.arc(x, h * 0.16, 31, 0, Math.PI * 2)
        ctx.arc(x + 37, h * 0.145, 41, 0, Math.PI * 2)
        ctx.arc(x + 77, h * 0.165, 29, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.fillStyle = '#67cf56'
      ctx.fillRect(0, h * 0.55, w, h * 0.45)

      const buildings = ['#ff6c77', '#5a9cff', '#ffd64f', '#9d5de6', '#ff61a4', '#4ec77d', '#ff9b43']
      buildings.forEach((color, i) => {
        const bw = w / buildings.length + 6
        const bh = h * (0.13 + ((i * 37) % 9) * 0.012)
        const x = i * (w / buildings.length) - 3
        roundedRect(x, h * 0.55 - bh, bw, bh + 4, 10, color, null, 0)
      })

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

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 5
      ctx.setLineDash([28, 32])
      ctx.lineDashOffset = (t * 0.16) % 80
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
      drawCar(w * carX, h * 0.82, Math.min(w / 430, 1.1), t, pop)

      const completed = progressRef.current
      for (let i = 0; i < ROUND.length; i += 1) {
        const px = w * 0.5 + (i - (ROUND.length - 1) / 2) * 20
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
  return (
    <section className="home-screen">
      <div className="home-scene">
        <div className="logo"><span>♪</span>CarKeys</div>
        <div className="home-copy">Tap the keys. Drive the car.</div>
        <div className="home-road" />
        <div className="home-car">
          <div className="mini-car">
            <div className="mini-window left" />
            <div className="mini-window right" />
            <div className="mini-eye left" />
            <div className="mini-eye right" />
            <div className="mini-smile" />
          </div>
        </div>
      </div>
      <button className="play-button" onClick={props.onPlay}><span>▶</span>PLAY</button>
    </section>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [step, setStep] = useState(0)
  const [lane, setLane] = useState(1)
  const [pulse, setPulse] = useState(0)
  const [won, setWon] = useState(false)
  const [wrong, setWrong] = useState(false)

  const target = ROUND[Math.min(step, ROUND.length - 1)]

  useEffect(() => {
    if (screen !== 'play' || won) return undefined
    const id = window.setTimeout(() => playTone(target, true), 180)
    return () => window.clearTimeout(id)
  }, [screen, target, won])

  function start() {
    setStep(0)
    setLane(1)
    setPulse(0)
    setWon(false)
    setWrong(false)
    setScreen('play')
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

    const next = step + 1
    setStep(next)

    if (next >= ROUND.length) {
      setWon(true)
      window.setTimeout(playWin, 120)
    }
  }

  if (screen === 'home') return <Home onPlay={start} />

  return (
    <section className="play-screen">
      <div className="stage-wrap">
        <GameCanvas lane={lane} pulse={pulse} progress={step} target={target} won={won} />
        <button className="home-button" onClick={() => setScreen('home')}>⌂</button>
        {!won && (
          <div className={wrong ? 'prompt wrong' : 'prompt'}>
            {wrong ? 'TRY AGAIN' : <span>TAP <b>{NOTES[target]}</b></span>}
          </div>
        )}
        {won && (
          <div className="win-card">
            <div className="big-star">★</div>
            <h2>NICE DRIVE!</h2>
            <button onClick={start}>AGAIN</button>
            <button className="secondary" onClick={() => setScreen('home')}>HOME</button>
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
