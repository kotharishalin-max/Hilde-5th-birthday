import { useState, useEffect } from 'react'

const TERMINAL_LINES_YES = [
  '> INCOMING TRANSMISSION...',
  '> CREW APPLICATION RECEIVED',
  '> VERIFYING CREDENTIALS...',
  '> WELCOME ABOARD, {NAME}!',
  '> STATUS: CLEARED FOR LAUNCH ✓'
]

const TERMINAL_LINES_NO = [
  '> INCOMING TRANSMISSION...',
  '> MESSAGE RECEIVED',
  '> PROCESSING...',
  '> ACKNOWLEDGED, {NAME}',
  '> MISSION LOG UPDATED ✓'
]

function TerminalText({ lines, name, onComplete }) {
  const [displayedLines, setDisplayedLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      // All lines complete, wait a moment then call onComplete
      const timer = setTimeout(onComplete, 600)
      return () => clearTimeout(timer)
    }

    const currentLine = lines[currentLineIndex].replace('{NAME}', name)

    if (currentCharIndex < currentLine.length) {
      // Type next character
      const timer = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev]
          newLines[currentLineIndex] = currentLine.substring(0, currentCharIndex + 1)
          return newLines
        })
        setCurrentCharIndex(prev => prev + 1)
      }, 20) // Faster typing speed
      return () => clearTimeout(timer)
    } else {
      // Line complete, move to next
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
        setCurrentCharIndex(0)
      }, 100) // Faster line transition
      return () => clearTimeout(timer)
    }
  }, [currentLineIndex, currentCharIndex, lines, name, onComplete])

  return (
    <div className="terminal-text">
      {displayedLines.map((line, i) => (
        <div key={i} className="terminal-line">
          {line}
          {i === currentLineIndex && currentCharIndex < lines[currentLineIndex]?.replace('{NAME}', name).length && (
            <span className="terminal-cursor">▋</span>
          )}
        </div>
      ))}
      {currentLineIndex < lines.length && displayedLines.length <= currentLineIndex && (
        <div className="terminal-line">
          <span className="terminal-cursor">▋</span>
        </div>
      )}
    </div>
  )
}

function BoardingPass({ name, adultCount, kidCount, onComplete }) {
  const [showStamp, setShowStamp] = useState(false)

  useEffect(() => {
    // Show stamp after card appears (faster)
    const stampTimer = setTimeout(() => setShowStamp(true), 500)
    // Complete after stamp animation (faster)
    const completeTimer = setTimeout(onComplete, 1800)
    return () => {
      clearTimeout(stampTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="boarding-pass-container">
      <div className="boarding-pass">
        <div className="boarding-header">
          <span className="boarding-icon">🚀</span>
          <span className="boarding-title">BOARDING PASS</span>
        </div>

        <div className="boarding-divider"></div>

        <div className="boarding-section">
          <span className="boarding-label">ASTRONAUT</span>
          <span className="boarding-value boarding-name">{name}'s Family</span>
        </div>

        <div className="boarding-section">
          <span className="boarding-label">CREW</span>
          <span className="boarding-value">
            {adultCount} {adultCount === 1 ? 'adult' : 'adults'}
            {kidCount > 0 && `, ${kidCount} ${kidCount === 1 ? 'kid' : 'kids'}`}
          </span>
        </div>

        <div className="boarding-divider dashed"></div>

        <div className="boarding-details">
          <div className="boarding-detail">
            <span className="boarding-label">MISSION</span>
            <span className="boarding-value">Hilde's 5th Birthday</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-label">DATE</span>
            <span className="boarding-value">Sun, Feb 8, 2026</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-label">LAUNCH</span>
            <span className="boarding-value">10:00 AM</span>
          </div>
          <div className="boarding-detail">
            <span className="boarding-label">BASE</span>
            <span className="boarding-value">Hudson River Museum</span>
          </div>
        </div>

        <div className="boarding-barcode">
          <div className="barcode-lines">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="barcode-line"
                style={{
                  width: `${Math.random() * 3 + 2}px`,
                  marginRight: `${Math.random() * 2 + 1}px`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {showStamp && (
        <div className="boarding-stamp">
          <span>★ APPROVED ★</span>
        </div>
      )}
    </div>
  )
}

function TransmissionCard({ name, onComplete }) {
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    const checkTimer = setTimeout(() => setShowCheck(true), 500)
    const completeTimer = setTimeout(onComplete, 1800)
    return () => {
      clearTimeout(checkTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="transmission-card-container">
      <div className="transmission-card">
        <div className="transmission-header">
          <span className="transmission-icon">📡</span>
          <span className="transmission-title">TRANSMISSION RECEIVED</span>
        </div>

        <div className="transmission-divider"></div>

        <div className="transmission-section">
          <span className="transmission-label">FROM</span>
          <span className="transmission-value transmission-name">{name}'s Family</span>
        </div>

        <div className="transmission-divider dashed"></div>

        <div className="transmission-message">
          <p>We'll miss you at the launch!</p>
          <p>Thanks for letting us know.</p>
          <p className="transmission-emoji">Maybe next mission? 🌟</p>
        </div>
      </div>

      {showCheck && (
        <div className="transmission-check">
          <span>✓ RECEIVED</span>
        </div>
      )}
    </div>
  )
}

function BoardingSequence({ childName, attending, adultCount, kidCount, onComplete }) {
  const [phase, setPhase] = useState('terminal') // 'terminal' | 'card' | 'done'

  const handleTerminalComplete = () => {
    setPhase('card')
  }

  const handleCardComplete = () => {
    setPhase('done')
    onComplete()
  }

  const terminalLines = attending ? TERMINAL_LINES_YES : TERMINAL_LINES_NO

  return (
    <div className={`boarding-sequence-overlay ${attending ? 'attending' : 'not-attending'}`}>
      <div className="boarding-sequence-content">
        {phase === 'terminal' && (
          <div className="terminal-container">
            <TerminalText
              lines={terminalLines}
              name={childName}
              onComplete={handleTerminalComplete}
            />
          </div>
        )}

        {phase === 'card' && attending && (
          <BoardingPass
            name={childName}
            adultCount={adultCount}
            kidCount={kidCount}
            onComplete={handleCardComplete}
          />
        )}

        {phase === 'card' && !attending && (
          <TransmissionCard
            name={childName}
            onComplete={handleCardComplete}
          />
        )}
      </div>
    </div>
  )
}

export default BoardingSequence
