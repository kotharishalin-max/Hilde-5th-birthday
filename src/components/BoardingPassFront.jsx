import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// Front side of the Junior Astronaut boarding pass
// Size: 350×500px base, renders at 3x (1050×1500px) for ~3.5"×5" print
const BoardingPassFront = forwardRef(function BoardingPassFront({ name, crewId }, ref) {
  // Generate crew ID from name if not provided
  const generatedCrewId = crewId || `NEPTUNE-${String(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000).padStart(3, '0')}`

  return (
    <div ref={ref} className="boarding-pass-new boarding-pass-front">
      {/* Decorative stars */}
      <div className="pass-stars">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="pass-star"
            style={{
              left: `${(i * 37 + 10) % 100}%`,
              top: `${(i * 23 + 5) % 100}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Lanyard hole indicator */}
      <div className="pass-lanyard-hole">
        <div className="pass-lanyard-hole-inner" />
      </div>

      {/* Academy header badge */}
      <div className="pass-header">
        <div className="pass-academy-badge">
          <div className="pass-academy-name">GALACTIC SPACE ACADEMY</div>
          <div className="pass-academy-title">
            <span className="pass-star-icon">★</span>
            JUNIOR ASTRONAUT
            <span className="pass-star-icon">★</span>
          </div>
        </div>
      </div>

      {/* Avatar section */}
      <div className="pass-avatar-section">
        <div className="pass-avatar">
          <span className="pass-avatar-emoji">👨‍🚀</span>
        </div>
      </div>

      {/* Child's name */}
      <div className="pass-name-section">
        <div className="pass-child-name">{name}</div>
      </div>

      {/* Credentials grid */}
      <div className="pass-credentials">
        <div className="pass-credential">
          <div className="pass-credential-label">RANK</div>
          <div className="pass-credential-value">Space Cadet</div>
        </div>
        <div className="pass-credential">
          <div className="pass-credential-label">MISSION</div>
          <div className="pass-credential-value">Neptune Explorer</div>
        </div>
        <div className="pass-credential">
          <div className="pass-credential-label">CREW ID</div>
          <div className="pass-credential-value">{generatedCrewId}</div>
        </div>
        <div className="pass-credential">
          <div className="pass-credential-label">TRAINING DATE</div>
          <div className="pass-credential-value">Feb 8, 2026</div>
        </div>
      </div>

      {/* QR Code section */}
      <div className="pass-qr-section">
        <div className="pass-qr-container">
          <QRCodeSVG
            value="https://www.nasa.gov/learning-resources/nasa-kids-club/"
            size={60}
            bgColor="transparent"
            fgColor="#2D3561"
            level="M"
          />
        </div>
        <div className="pass-qr-label">
          <span className="pass-qr-arrow">→</span> NASA Kids Club
        </div>
      </div>
    </div>
  )
})

export default BoardingPassFront
