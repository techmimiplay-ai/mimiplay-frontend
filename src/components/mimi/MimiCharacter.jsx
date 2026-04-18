import { useEffect, useRef } from 'react'

const ALL_OUTFITS = [
  'Part3',
  'outfit_overall',
  'outfit_tshirt_casual',
  'outfit_shirt_pant',
]

const OUTFIT_MAP = {
  uniform:    'Part3',
  overall:    'outfit_overall',
  casual:     'outfit_tshirt_casual',
  shirt_pant: 'outfit_shirt_pant',
}

export default function MimiCharacter({ modelRef, isSpeaking, outfit, expression }) {
  const canvasRef      = useRef(null)
  const containerRef   = useRef(null)
  const appRef         = useRef(null)
  const stateRef       = useRef({
    isSpeaking:  false,
    outfit:      null,
    lastOutfit:  null,
    expression:  'neutral',
    blinkOpen:   true,
    nextBlink:   0,
    breathVal:   0,
    breathDir:   1,
  })

  useEffect(() => { stateRef.current.isSpeaking = isSpeaking              }, [isSpeaking])
  useEffect(() => { stateRef.current.outfit      = outfit                  }, [outfit])
  useEffect(() => { stateRef.current.expression  = expression || 'neutral' }, [expression])

  useEffect(() => {
    let destroyed = false

    async function init() {
      const PIXI = await import('pixi.js')
      window.PIXI = PIXI
      const { Live2DModel } = await import('pixi-live2d-display/cubism4')
      Live2DModel.registerTicker(PIXI.Ticker)

      // Match canvas exactly to container size to avoid blur
      const container = containerRef.current
      const W = 420
      const H = window.innerHeight

      const app = new PIXI.Application({
        view:            canvasRef.current,
        width:           W,
        height:          H,
        backgroundAlpha: 0,
        autoDensity:     true,
        resolution:      window.devicePixelRatio || 1,
        antialias:       true,
      })
      appRef.current = app

      const model = await Live2DModel.from(
        '/mimi-rigged-animate/mimi2.model3.json'
      )
      if (destroyed) return

      app.stage.addChild(model)

      // Scale to fit container height
      const scale = (H * 0.75) / 3000
      model.scale.set(scale)
      model.anchor.set(0.5, 1)
      model.x = W / 2
      model.y = H

      if (modelRef) modelRef.current = model
      window.mimiModel = model

      const im        = model.internalModel
      const coreModel = im.coreModel

      // Disable built-in controllers — we drive everything
      if (im.eyeBlink) im.eyeBlink = null
      if (im.breath)   im.breath   = null

      // Hook motionManager — runs every frame after param reset
      const mm = im.motionManager
      const origMMUpdate = mm.update.bind(mm)
      mm.update = (model, now) => {
        const result = origMMUpdate(model, now)
        if (!destroyed) applyParams()
        return result
      }

      const set = (id, v) => coreModel.setParameterValueById(id, v)

      function applyParams() {
        const s   = stateRef.current
        const now = Date.now()
        const t   = now / 1000

        // ── Breathing ─────────────────────────────────────────────────
        s.breathVal += 0.005 * s.breathDir
        if (s.breathVal >= 1) { s.breathVal = 1; s.breathDir = -1 }
        if (s.breathVal <= 0) { s.breathVal = 0; s.breathDir =  1 }
        set('ParamBreath', s.breathVal)

        // ── Idle head sway ────────────────────────────────────────────
        set('ParamAngleX', Math.sin(t * 0.4) * 4)
        set('ParamAngleY', Math.sin(t * 0.3) * 2)

        // ── Blink ─────────────────────────────────────────────────────
        if (now >= s.nextBlink) {
          s.blinkOpen = false
          s.nextBlink = now + 3000 + Math.random() * 2000
          setTimeout(() => { s.blinkOpen = true }, 180)
        }
        set('ParamEyeLOpen', s.blinkOpen ? 1 : 0)
        set('ParamEyeROpen', s.blinkOpen ? 1 : 0)

        // ── Expression ────────────────────────────────────────────────
        switch (s.expression) {
          case 'happy':
            set('ParamBrowLY',    1)
            set('ParamBrowRY',    1)
            set('ParamCheek',     0.6)
            set('ParamMouthForm', 1)
            break
          case 'excited':
            set('ParamBrowLY',    1)
            set('ParamBrowRY',    1)
            set('ParamCheek',     1)
            set('ParamMouthForm', 1)
            break
          case 'sad':
            set('ParamBrowLY',   -1)
            set('ParamBrowRY',   -1)
            set('ParamCheek',     0)
            set('ParamMouthForm', -1)
            break
          default: // neutral — soft friendly default
            set('ParamBrowLY',    0.3)
            set('ParamBrowRY',    0.3)
            set('ParamCheek',     0.2)
            set('ParamMouthForm', 0)
            break
        }

        // ── Mouth talking ─────────────────────────────────────────────
        // Cubism keyframes should be:
        // ParamMouthOpenY 0   → mouth_smile   (closed, default)
        // ParamMouthOpenY 0.5 → mouth_small   (slightly open)
        // ParamMouthOpenY 1   → mouth_smile_open (fully open)
        // mouth_open is NOT used in talking — remove it from ParamMouthOpenY in Cubism
        if (s.isSpeaking) {
          // Smooth triangle wave: 0 → 1 → 0 every 400ms
          // const cycle = (now % 400) / 400
          const cycle = (now % 700) / 700
          const val   = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2
          set('ParamMouthOpenY', val)
        } else {
          // Default — show mouth_smile (closed smile at value 0)
          set('ParamMouthOpenY', 0)
        }
      }

      // ── Outfit switch ──────────────────────────────────────────────────
      app.ticker.add(() => {
        if (destroyed) return
        const s = stateRef.current
        if (s.outfit !== s.lastOutfit) {
          const active = OUTFIT_MAP[s.outfit] || 'outfit_overall'
          ALL_OUTFITS.forEach(id => {
            coreModel.setPartOpacityById(id, id === active ? 1 : 0)
          })
          s.lastOutfit = s.outfit
          console.log('[Mimi] Outfit →', active)
        }
      })

      // ── Initial state ──────────────────────────────────────────────────
      const s      = stateRef.current
      s.outfit     = outfit
      s.lastOutfit = outfit
      s.nextBlink  = Date.now() + 2000

      const activeOutfit = OUTFIT_MAP[outfit] || 'outfit_overall'
      ALL_OUTFITS.forEach(id => {
        coreModel.setPartOpacityById(id, id === activeOutfit ? 1 : 0)
      })

      console.log('[Mimi] ✅ Ready')
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}