import { forwardRef } from 'react'
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
        <div className="pass-section-title">YOUR MISSION OBJECTIVES</div>
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
      </div>

      {/* Signature line */}
      <div className="pass-signature-section">
        <div className="pass-signature-label">Signed:</div>
        <div className="pass-signature-line" />
      </div>
    </div>
  )
})

export default BoardingPassBack
