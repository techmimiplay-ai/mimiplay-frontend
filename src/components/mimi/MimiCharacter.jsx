import { useEffect, useRef } from 'react'

export default function MimiCharacter({ modelRef, stateRef: stateRefProp, isSpeaking, sessionState }) {
  const canvasRef   = useRef(null)
  const appRef      = useRef(null)
  const stateRef    = useRef({
    ready:        false,
    isSpeaking:   false,
    sessionState: 'idle',
    blinkOpen:    true,
    blinkTimer:   0,
    breathT:      0,
    mouthOpen:    false,
    mouthTimer:   0,
    mouseX:       0,
    mouseY:       0,
    overrides:    {},   // { paramId: value } — ticker skips these params while set
  })

  // keep stateRef in sync with props so the ticker always sees latest values
  useEffect(() => { stateRef.current.isSpeaking   = isSpeaking   }, [isSpeaking])
  useEffect(() => { stateRef.current.sessionState = sessionState }, [sessionState])

  // ── Mouse tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const r = canvas.getBoundingClientRect()
      stateRef.current.mouseX = ((e.clientX - r.left)  / r.width  - 0.5) * 2
      stateRef.current.mouseY = ((e.clientY - r.top)   / r.height - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false

    async function init() {
      const PIXI = await import('pixi.js')
      const { Live2DModel } = await import('pixi-live2d-display/cubism4')
      Live2DModel.registerTicker(PIXI.Ticker)

      appRef.current = new PIXI.Application({
        view: canvasRef.current,
        width: 440,
        height: 540,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: Math.max(window.devicePixelRatio || 1, 1),
      })

      const model = await Live2DModel.from(
        '/mimi-rigged-animate/mimi.model3.json'
      )
      if (destroyed) return

      appRef.current.stage.addChild(model)
      model.scale.set(0.18)
      model.x = 220
      model.y = 520
      model.anchor.set(0.5, 1)

      if (modelRef) modelRef.current = model
      if (stateRefProp) stateRefProp.current = stateRef.current
      stateRef.current.ready = true

      // Build index map once for fast lookup
      const ids = model.internalModel.coreModel._parameterIds
      const idx = {}
      ids.forEach((id, i) => { idx[id] = i })
      const vals = model.internalModel.coreModel._parameterValues
      const set  = (id, v) => { if (idx[id] !== undefined) vals[idx[id]] = v }

      // ── Ticker: drive ALL parameters here so nothing gets overwritten ──
      appRef.current.ticker.add(() => {
        const s = stateRef.current
        if (!s.ready) return
        const now = Date.now()

        const ov = s.overrides
        const sv = (id, v) => { if (!(id in ov)) set(id, v) }

        // Breathing
        s.breathT += 0.002
        sv('ParamBreath', (Math.sin(s.breathT) + 1) / 2)

        // Blink
        if (now - s.blinkTimer > 3500) {
          s.blinkTimer = now
          s.blinkOpen  = false
          setTimeout(() => { s.blinkOpen = true }, 150)
        }
        sv('ParamEyeLOpen', s.blinkOpen ? 1 : 0)
        sv('ParamEyeROpen', s.blinkOpen ? 1 : 0)

        // Mouth
        if (s.isSpeaking) {
          if (now - s.mouthTimer > 180) {
            s.mouthTimer = now
            s.mouthOpen  = !s.mouthOpen
          }
        } else {
          s.mouthOpen = false
        }
        sv('ParamMouthOpenY', s.mouthOpen ? 1 : 0)

        // Head tilt
        sv('ParamAngleZ', s.sessionState === 'running' ? -8 : 0)

        // Mouse → head + eyes + body
        sv('ParamAngleX',     s.mouseX *  20)
        sv('ParamAngleY',    -s.mouseY *  15)
        sv('ParamEyeBallX',   s.mouseX *  0.8)
        sv('ParamEyeBallY',  -s.mouseY *  0.8)
        sv('ParamBodyAngleX', s.mouseX *  8)
      })
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      stateRef.current.ready = false
      if (appRef.current) {
        appRef.current.destroy(false, { children: true })
        appRef.current = null
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ width: '440px', height: '540px' }} />
  )
}
