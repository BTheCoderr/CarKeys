import { useEffect, useRef, useState } from 'react'

const RHYTHM_START_LEVEL = 10

export default function RhythmRoad() {
  const [playing, setPlaying] = useState(false)
  const [level, setLevel] = useState(0)
  const [beat, setBeat] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [combo, setCombo] = useState(0)
  const [pulse, setPulse] = useState(0)
  const lastLevelRef = useRef(-1)
  const beatAtRef = useRef(performance.now())
  const timerRef = useRef(null)

  useEffect(() => {
    const sync = () => {
      setPlaying(Boolean(document.querySelector('.play-screen .controller')))
      const label = document.querySelector('.hud-copy b')?.textContent || ''
      const match = label.match(/LEVEL\s+(\d+)/i)
      if (!match) return
      const next = Math.max(0, Number(match[1]) - 1)
      if (next !== lastLevelRef.current) {
        lastLevelRef.current = next
        setLevel(next)
        setCombo(0)
        setFeedback('')
      }
    }

    const onCorrectPress = (event) => {
      const button = event.target.closest?.('.controller button')
      if (!button || button.disabled || !button.classList.contains('hint') || lastLevelRef.current < RHYTHM_START_LEVEL) return
      const elapsed = performance.now() - beatAtRef.current
      const bpm = Math.min(112, 76 + (lastLevelRef.current - RHYTHM_START_LEVEL) * 3)
      const interval = 60000 / bpm
      const distance = Math.min(elapsed % interval, interval - (elapsed % interval))
      const perfect = distance < 115
      const good = distance < 210
      if (perfect) {
        setFeedback('PERFECT!')
        setCombo((value) => value + 1)
        try { navigator.vibrate?.([8, 18, 8]) } catch {}
      } else if (good) {
        setFeedback('ON BEAT!')
        setCombo((value) => value + 1)
      } else {
        setFeedback('KEEP THE BEAT')
        setCombo(0)
      }
      window.setTimeout(() => setFeedback(''), 520)
    }

    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList:true, subtree:true, characterData:true })
    document.addEventListener('pointerdown', onCorrectPress, true)
    sync()
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', onCorrectPress, true)
    }
  }, [])

  useEffect(() => {
    window.clearInterval(timerRef.current)
    if (!playing || level < RHYTHM_START_LEVEL) return undefined
    const bpm = Math.min(112, 76 + (level - RHYTHM_START_LEVEL) * 3)
    const interval = 60000 / bpm
    const fire = () => {
      beatAtRef.current = performance.now()
      setPulse((value) => value + 1)
      setBeat(true)
      window.setTimeout(() => setBeat(false), 145)
    }
    fire()
    timerRef.current = window.setInterval(fire, interval)
    return () => window.clearInterval(timerRef.current)
  }, [playing, level])

  if (!playing || level < RHYTHM_START_LEVEL) return null

  return (
    <div key={pulse} aria-label="Rhythm Road beat" style={{
      position:'fixed', left:'50%', top:118, transform:'translateX(-50%)', zIndex:44,
      display:'flex', alignItems:'center', gap:7, padding:'5px 10px', borderRadius:999,
      border:'3px solid white', background:beat ? '#ffcf45' : 'rgba(23,74,143,.88)',
      color:beat ? '#214d89' : '#fff', boxShadow:beat ? '0 0 24px #fff06a,0 4px 0 #ba7c12' : '0 4px 0 #0b376e',
      transition:'transform .1s ease, background .1s ease', pointerEvents:'none',
      scale:beat ? '1.08' : '1'
    }}>
      <span style={{fontSize:15,fontWeight:1000}}>♪</span>
      <span style={{fontSize:10,fontWeight:1000,letterSpacing:'.06em'}}>RHYTHM ROAD</span>
      <span style={{fontSize:12,fontWeight:1000,minWidth:58,textAlign:'center'}}>{feedback || (combo > 1 ? `${combo}×` : 'BEAT')}</span>
    </div>
  )
}
