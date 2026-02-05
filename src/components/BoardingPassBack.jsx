import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { neptuneFacts, missionObjectives, astronautOath } from '../data/spaceFacts'

// Back side of the Junior Astronaut boarding pass
// Size: 350×500px base, renders at 3x (1050×1500px) for ~3.5"×5" print
const BoardingPassBack = forwardRef(function BoardingPassBack(props, ref) {
  // Select first 4 facts for display
  const displayFacts = neptuneFacts.slice(0, 4)

  return (
    <div ref={ref} className="boarding-pass-new boarding-pass-back">
      {/* Decorative stars */}
      <div className="pass-stars">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="pass-star"
            style={{
              left: `${(i * 41 + 15) % 100}%`,
              top: `${(i * 29 + 8) % 100}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Lanyard hole alignment mark */}
      <div className="pass-lanyard-hole">
        <div className="pass-lanyard-hole-inner" />
      </div>

      {/* Field guide header */}
      <div className="pass-back-header">
        <div className="pass-field-guide-title">SPACE EXPLORER FIELD GUIDE</div>
      </div>

      {/* Neptune facts section */}
      <div className="pass-facts-section">
        <div className="pass-section-title">
          <span className="pass-section-emoji">🪐</span> DID YOU KNOW?
        </div>
        <div className="pass-facts-list">
          {displayFacts.map((fact, i) => (
            <div key={i} className="pass-fact-item">
              <span className="pass-fact-star">★</span> {fact}
            </div>
          ))}
        </div>
      </div>

      {/* Mission objectives section */}
      <div className="pass-objectives-section">
        <div className="pass-section-title">HUDSON RIVER MUSEUM OBJECTIVES</div>
        <div className="pass-objectives-list">
          {missionObjectives.map((objective, i) => (
            <div key={i} className="pass-objective-item">
              <span className="pass-checkbox">□</span> {objective.text}
            </div>
          ))}
        </div>
      </div>

      {/* Astronaut oath section */}
      <div className="pass-oath-section">
        <div className="pass-section-title">ASTRONAUT OATH</div>
        <div className="pass-oath-text">{astronautOath}</div>
        <div className="pass-registration-field">
          <span className="pass-registration-label">SIGNED:</span>
          <div className="pass-registration-line" />
        </div>
      </div>

      {/* Secret Mission QR section */}
      <div className="pass-transmission-section">
        <QRCodeSVG
          value="https://kotharishalin-max.github.io/Hilde-5th-birthday/transmission.html"
          size={40}
          bgColor="transparent"
          fgColor="#2D3561"
          level="M"
        />
        <div className="pass-transmission-label">SECRET MISSION</div>
      </div>
    </div>
  )
})

export default BoardingPassBack
