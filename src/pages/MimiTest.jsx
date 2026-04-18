/**
 * /mimi-test — dev-only page to test all Mimi character animations
 */
import { useState, useRef } from 'react'
import MimiCharacter from '../components/mimi/MimiCharacter'
import useMimiCustomizer, { BACKGROUNDS, OUTFITS } from '../hooks/useMimiCustomizer'

const BTN = ({ label, color, onClick, active, small }) => (
  <button
    onClick={onClick}
    style={{
      padding: small ? '6px 12px' : '10px 18px',
      borderRadius: 12,
      border: `2px solid ${active ? color : 'rgba(0,0,0,0.1)'}`,
      background: active ? color : 'white',
      color: active ? 'white' : '#374151',
      fontWeight: 700,
      fontSize: small ? 12 : 13,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
)

const EXPRESSIONS = [
  { key: 'neutral',  emoji: '😐', label: 'Neutral',  color: '#6b7280' },
]

export default function MimiTest() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakTimer, setSpeakTimer] = useState(null)
  const [expression, setExpression] = useState('neutral')
  const modelRef = useRef(null)
  const { selectedClothes, setSelectedClothes, currentBgStyle, setSelectedBg } = useMimiCustomizer()

  const testSpeak = (ms) => {
    if (speakTimer) clearTimeout(speakTimer)
    setIsSpeaking(true)
    const t = setTimeout(() => setIsSpeaking(false), ms)
    setSpeakTimer(t)
  }

  const stopSpeak = () => {
    if (speakTimer) clearTimeout(speakTimer)
    setIsSpeaking(false)
  }

  // Manually set a param via console ref
  const setParam = (id, val) => {
    modelRef.current?.internalModel?.coreModel?.setParameterValueById(id, val)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      gap: 0,
      fontFamily: "'Nunito', sans-serif",
      backgroundImage: currentBgStyle,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }}>

      {/* ── Character Panel ── */}
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: 380,
        height: '100vh',
      }}>
        <MimiCharacter
          modelRef={modelRef}
          isSpeaking={isSpeaking}
          outfit={selectedClothes}
          expression={expression}
        />
      </div>

      {/* ── Controls Panel ── */}
      <div style={{
        flex: 1,
        padding: '20px 24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
      }}>

        <h2 style={{ margin: 0, fontSize: 20, color: '#1e1b4b' }}>
          🧪 Mimi Animation Tester
        </h2>

        {/* ── Speaking ── */}
        <section style={sectionStyle}>
          <p style={labelStyle}>🗣️ Speaking</p>
          <div style={rowStyle}>
            <BTN
              label={isSpeaking ? '🔴 Stop' : '▶ Start'}
              color="#6366f1"
              active={isSpeaking}
              onClick={() => isSpeaking ? stopSpeak() : testSpeak(60000)}
            />
            <BTN label="2s"  color="#8b5cf6" onClick={() => testSpeak(2000)} />
            <BTN label="5s"  color="#8b5cf6" onClick={() => testSpeak(5000)} />
            <BTN label="10s" color="#8b5cf6" onClick={() => testSpeak(10000)} />
            <BTN label="30s" color="#8b5cf6" onClick={() => testSpeak(30000)} />
          </div>
        </section>

        {/* ── Outfit ── */}
        <section style={sectionStyle}>
          <p style={labelStyle}>👗 Outfit</p>
          <div style={rowStyle}>
            {Object.values(OUTFITS).map(o => (
              <BTN
                key={o.key}
                label={`${o.emoji} ${o.label}`}
                color="#ec4899"
                active={selectedClothes === o.key}
                onClick={() => setSelectedClothes(o.key)}
              />
            ))}
          </div>
        </section>

        {/* ── Background ── */}
        <section style={sectionStyle}>
          <p style={labelStyle}>🌄 Background</p>
          <div style={rowStyle}>
            {Object.values(BACKGROUNDS).map(bg => (
              <BTN
                key={bg.key}
                label={`${bg.emoji} ${bg.label}`}
                color="#0ea5e9"
                onClick={() => setSelectedBg(bg.key)}
              />
            ))}
          </div>
        </section>
       

        {/* ── Status ── */}
        <section style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 16,
          padding: '14px 18px',
          fontSize: 13,
          color: '#374151',
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 800 }}>📊 Current State</p>
          <p style={{ margin: '2px 0' }}>
            Speaking: <b style={{ color: isSpeaking ? '#16a34a' : '#dc2626' }}>
              {isSpeaking ? 'YES' : 'NO'}
            </b>
          </p>
          <p style={{ margin: '2px 0' }}>Expression: <b>{expression}</b></p>
          <p style={{ margin: '2px 0' }}>Outfit: <b>{selectedClothes}</b></p>
          <p style={{ margin: '2px 0', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Tip: Use sliders above to test individual parameters in real-time
          </p>
        </section>

      </div>
    </div>
  )
}

const sectionStyle = {
  background: 'rgba(255,255,255,0.85)',
  borderRadius: 16,
  padding: '14px 18px',
}

const labelStyle = {
  margin: '0 0 10px',
  fontWeight: 800,
  fontSize: 12,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}