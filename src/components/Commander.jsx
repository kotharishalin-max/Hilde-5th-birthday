import { useState, useRef, useCallback } from 'react'

function Commander() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const containerRef = useRef(null)
  const portholeRef = useRef(null)

  const calculateTilt = (clientX, clientY, element, sensitivity = 15) => {
    if (!element) return { x: 0, y: 0 }

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = (clientX - centerX) / (rect.width / 2)
    const y = (clientY - centerY) / (rect.height / 2)

    return {
      x: Math.max(-sensitivity, Math.min(sensitivity, y * sensitivity)),
      y: Math.max(-sensitivity, Math.min(sensitivity, -x * sensitivity))
    }
  }

  // Mouse handlers - use React state (smooth enough for desktop)
  const handleMouseMove = (e) => {
    const newTilt = calculateTilt(e.clientX, e.clientY, containerRef.current, 15)
    setTilt(newTilt)
  }

  const handleMouseEnter = () => setIsHovering(true)

  const handleMouseLeave = () => {
    setIsHovering(false)
    setTilt({ x: 0, y: 0 })
  }

  // Touch handlers - use direct DOM manipulation for smooth 60fps
  const applyTiltDirectly = useCallback((tiltX, tiltY) => {
    if (portholeRef.current) {
      portholeRef.current.style.transform =
        `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const newTilt = calculateTilt(touch.clientX, touch.clientY, portholeRef.current, 25)
      // Direct DOM update - no React re-render
      applyTiltDirectly(newTilt.x, newTilt.y)
    }
  }, [applyTiltDirectly])

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTouching(true)

    // Disable transition for immediate response
    if (portholeRef.current) {
      portholeRef.current.style.transition = 'none'
    }

    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const newTilt = calculateTilt(touch.clientX, touch.clientY, portholeRef.current, 25)
      applyTiltDirectly(newTilt.x, newTilt.y)
    }
  }, [applyTiltDirectly])

  const handleTouchEnd = useCallback((e) => {
    e.stopPropagation()
    setIsTouching(false)

    // Re-enable transition for smooth return
    if (portholeRef.current) {
      portholeRef.current.style.transition = 'transform 0.3s ease-out'
      portholeRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    }

    setTilt({ x: 0, y: 0 })
  }, [])

  // On touch, only apply tilt (no scale). On mouse hover, apply both.
  const shouldScale = isHovering && !isTouching

  return (
    <section className="commander-section">
      <h2>Meet Your Mission Commander</h2>

      <div
        className="commander-frame-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Orbiting elements */}
        <div className="orbit orbit-1">
          <div className="orbit-dot"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="orbit-dot star"></div>
        </div>
        <div className="orbit orbit-3">
          <div className="orbit-dot planet"></div>
        </div>

        {/* Porthole frame with parallax - touch events only on this element */}
        <div
          ref={portholeRef}
          className={`commander-porthole ${shouldScale ? 'hovering' : ''}`}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${shouldScale ? 1.05 : 1})`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Outer ring glow */}
          <div className="porthole-glow"></div>

          {/* Metal frame */}
          <div className="porthole-frame">
            {/* Bolts */}
            <div className="bolt bolt-1"></div>
            <div className="bolt bolt-2"></div>
            <div className="bolt bolt-3"></div>
            <div className="bolt bolt-4"></div>

            {/* Inner glass effect */}
            <div className="porthole-glass">
              <img
                src={`${import.meta.env.BASE_URL}hilde-commander.jpg`}
                alt="Commander Hilde in her astronaut suit"
                className="commander-photo"
              />
              {/* Glass reflection overlay */}
              <div className="glass-reflection"></div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="space-particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="commander-info">
        <p className="commander-title">Commander Hilde</p>
        <p className="commander-subtitle">Leading the mission to turn 5!</p>
      </div>
    </section>
  )
}

export default Commander
