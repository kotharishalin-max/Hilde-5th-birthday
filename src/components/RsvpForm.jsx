import { useState, useEffect, useRef } from 'react'
import { ref, push, update, get, query, orderByChild, equalTo } from 'firebase/database'
import emailjs from '@emailjs/browser'
import { database } from '../firebase'
import BoardingSequence from './BoardingSequence'

const STORAGE_KEY = 'hilde-bday-rsvp-email'
const OLD_STORAGE_KEY = 'hilde-bday-rsvp-id'

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_fj9hsv4'
const EMAILJS_TEMPLATE_ID = 'template_owqftfa'
const EMAILJS_HOST_TEMPLATE_ID = 'template_phzyykv'
const EMAILJS_PUBLIC_KEY = 'Idi5oE7BUkpUXFNOU'

// Party details for email
const VENUE_ADDRESS = '511 Warburton Ave, Yonkers, NY 10701'
const MAPS_URL = 'https://maps.google.com/?q=Hudson+River+Museum+511+Warburton+Ave+Yonkers+NY+10701'
const WEBSITE_URL = 'https://kotharishalin-max.github.io/Hilde-5th-birthday/'

// Generate Google Calendar URL
const generateGoogleCalendarUrl = () => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: "Hilde's 5th Birthday - Space Mission!",
    dates: '20260208T150000Z/20260208T170000Z',
    details: "Hudson River Museum Planetarium\n\n10:00 AM - Party starts, creative activity\n10:30 AM - Planetarium show\n11:00 AM - Refreshments & cake\n11:45 AM - Party concludes\n\nPlease arrive by 10 AM - late entry to the planetarium isn't possible!",
    location: VENUE_ADDRESS
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Generate ICS download URL (direct link to hosted file)
const generateIcsUrl = () => {
  return `${WEBSITE_URL}hilde-birthday.ics`
}

// Confetti animation
function Confetti({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const colors = ['#ff6b9d', '#ffd700', '#74b9ff', '#ff8c42', '#a29bfe', '#00cec9']

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 4 - 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      })
    }

    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let activeParticles = 0
      particles.forEach(p => {
        if (p.y < canvas.height + 50) {
          activeParticles++
          p.y += p.speedY
          p.x += p.speedX
          p.rotation += p.rotationSpeed
          p.speedY += 0.1 // gravity

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation * Math.PI / 180)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        }
      })

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  )
}

function RsvpForm() {
  const [mode, setMode] = useState('lookup') // 'lookup', 'form', 'submitted'
  const [email, setEmail] = useState('')
  const [childName, setChildName] = useState('')
  const [attending, setAttending] = useState(null)
  const [adultCount, setAdultCount] = useState(1)
  const [kidCount, setKidCount] = useState(1)
  const [existingRsvpId, setExistingRsvpId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lookingUp, setLookingUp] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBoardingSequence, setShowBoardingSequence] = useState(false)
  const [submittedData, setSubmittedData] = useState(null) // Store data for boarding sequence

  // Optional message after RSVP
  const [optionalMessage, setOptionalMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const init = async () => {
      localStorage.removeItem(OLD_STORAGE_KEY)

      const savedEmail = localStorage.getItem(STORAGE_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        const found = await lookupByEmail(savedEmail)
        if (found) {
          setMode('submitted')
        } else {
          setMode('lookup')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const lookupByEmail = async (emailToLookup) => {
    if (!emailToLookup.trim()) return null

    try {
      const rsvpsRef = ref(database, 'rsvps')
      const emailQuery = query(rsvpsRef, orderByChild('email'), equalTo(emailToLookup.toLowerCase().trim()))
      const snapshot = await get(emailQuery)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const [id, rsvp] = Object.entries(data)[0]
        setChildName(rsvp.childName || rsvp.name || '')
        setAttending(rsvp.attending)
        setAdultCount(rsvp.adultCount || rsvp.guestCount || 1)
        setKidCount(rsvp.kidCount || 1)
        setExistingRsvpId(id)
        return rsvp
      }
    } catch (err) {
      console.log('Email lookup error:', err.message)
    }
    return null
  }

  const handleLookup = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setLookingUp(true)
    const found = await lookupByEmail(email)
    setLookingUp(false)

    if (found) {
      localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim())
      setMode('submitted')
    } else {
      setMode('form')
    }
  }

  // Send confirmation email via EmailJS
  const sendConfirmationEmail = async (toEmail, name, isAttending, adults, kids) => {
    const templateParams = {
      to_email: toEmail,
      child_name: name,
      status_bg_color: isAttending ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      status_text_color: isAttending ? '#00b894' : '#b8c5d6',
      status_text: isAttending ? "✅ You're Coming!" : "😢 Can't Make It",
      guest_info: isAttending ? `${adults} adult${adults !== 1 ? 's' : ''}, ${kids} kid${kids !== 1 ? 's' : ''}` : '',
      google_calendar_url: generateGoogleCalendarUrl(),
      ics_url: generateIcsUrl(),
      maps_url: MAPS_URL
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
    } catch (err) {
      console.error('Failed to send confirmation email:', err)
    }
  }

  // Send notification to host when someone RSVPs
  const sendHostNotification = async (guestEmail, name, isAttending, adults, kids) => {
    const templateParams = {
      guest_email: guestEmail,
      child_name: name,
      status_text_color: isAttending ? '#00b894' : '#b8c5d6',
      status_text: isAttending ? "✅ Coming!" : "😢 Can't Make It",
      guest_info: isAttending ? `${adults} adult${adults !== 1 ? 's' : ''}, ${kids} kid${kids !== 1 ? 's' : ''}` : 'N/A'
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_HOST_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
    } catch (err) {
      console.error('Failed to send host notification:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!childName.trim()) {
      setError("Please enter your child's name")
      return
    }
    if (attending === null) {
      setError('Please let us know if you can make it')
      return
    }

    const rsvpData = {
      email: email.toLowerCase().trim(),
      childName: childName.trim(),
      name: childName.trim(), // Keep for backwards compatibility
      attending,
      adultCount: attending ? adultCount : 0,
      kidCount: attending ? kidCount : 0,
      timestamp: Date.now()
    }

    try {
      if (existingRsvpId) {
        await update(ref(database, `rsvps/${existingRsvpId}`), rsvpData)
      } else {
        const newRef = await push(ref(database, 'rsvps'), rsvpData)
        setExistingRsvpId(newRef.key)
      }

      localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim())

      // Send confirmation email to guest
      sendConfirmationEmail(
        email.toLowerCase().trim(),
        childName.trim(),
        attending,
        attending ? adultCount : 0,
        attending ? kidCount : 0
      )

      // Send notification to host
      sendHostNotification(
        email.toLowerCase().trim(),
        childName.trim(),
        attending,
        attending ? adultCount : 0,
        attending ? kidCount : 0
      )

      // Store submitted data for boarding sequence
      setSubmittedData({
        childName: childName.trim(),
        attending,
        adultCount: attending ? adultCount : 0,
        kidCount: attending ? kidCount : 0
      })

      // Show boarding sequence instead of immediate confetti
      setShowBoardingSequence(true)
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.')
      console.error(err)
    }
  }

  // Handle boarding sequence completion
  const handleBoardingComplete = () => {
    setShowBoardingSequence(false)

    if (submittedData?.attending) {
      // Show confetti for attendees
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }

    setMode('submitted')
  }

  const handleSendMessage = async () => {
    if (!optionalMessage.trim()) return

    setSendingMessage(true)
    try {
      await push(ref(database, 'messages'), {
        name: childName.trim() + "'s family",
        message: optionalMessage.trim(),
        timestamp: Date.now()
      })
      setMessageSent(true)
      setOptionalMessage('')
    } catch (err) {
      console.error(err)
    }
    setSendingMessage(false)
  }

  const handleEdit = () => {
    setMode('form')
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setEmail('')
    setChildName('')
    setAttending(null)
    setAdultCount(1)
    setKidCount(1)
    setExistingRsvpId(null)
    setMessageSent(false)
    setOptionalMessage('')
    setMode('lookup')
  }

  if (loading) {
    return (
      <section className="rsvp" id="rsvp-section">
        <h2>Mission Log</h2>
        <p className="rsvp-subtitle">Loading...</p>
      </section>
    )
  }

  // LOOKUP MODE - Single entry point for all users
  if (mode === 'lookup') {
    return (
      <section className="rsvp" id="rsvp-section">
        <h2>Mission Log</h2>
        <p className="rsvp-subtitle">Enter your email to RSVP or update your response</p>

        <form onSubmit={handleLookup} className="lookup-form">
          <div className="form-group">
            <label htmlFor="lookup-email">Your Email</label>
            <input
              type="email"
              id="lookup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="astronaut@email.com"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={lookingUp}>
            {lookingUp ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </section>
    )
  }

  // SUBMITTED MODE - Show confirmation with edit option and optional message
  if (mode === 'submitted') {
    return (
      <section className="rsvp" id="rsvp-section">
        <Confetti active={showConfetti} />
        {showBoardingSequence && submittedData && (
          <BoardingSequence
            childName={submittedData.childName}
            attending={submittedData.attending}
            adultCount={submittedData.adultCount}
            kidCount={submittedData.kidCount}
            onComplete={handleBoardingComplete}
          />
        )}
        <h2>Mission Log</h2>
        <div className="success-message">
          <span className="success-icon">⭐</span>
          <p className="success-name">Thanks, {childName}'s family!</p>
          <p className="success-status">
            {attending
              ? "We're excited to see you at the launch!"
              : "We'll miss you! Thanks for letting us know."}
          </p>
          {attending && (
            <p className="guest-summary">
              {adultCount} {adultCount === 1 ? 'adult' : 'adults'}
              {kidCount > 0 && `, ${kidCount} ${kidCount === 1 ? 'kid' : 'kids'}`}
            </p>
          )}

          {/* Optional message section */}
          {!messageSent ? (
            <div className="optional-message">
              <p className="optional-message-prompt">Want to send a message to Hilde?</p>
              <textarea
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Write a birthday wish or note..."
                rows={3}
                className="optional-message-input"
              />
              {optionalMessage.trim() && (
                <button
                  onClick={handleSendMessage}
                  className="send-message-btn"
                  disabled={sendingMessage}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              )}
            </div>
          ) : (
            <p className="message-sent-confirmation">Message sent! Thank you!</p>
          )}

          <div className="rsvp-actions">
            <button onClick={handleEdit} className="edit-btn">
              Edit RSVP
            </button>
            <button onClick={handleReset} className="reset-link">
              Not you? Start fresh
            </button>
          </div>
        </div>
      </section>
    )
  }

  // FORM MODE - New or editing RSVP
  return (
    <section className="rsvp" id="rsvp-section">
      {showBoardingSequence && submittedData && (
        <BoardingSequence
          childName={submittedData.childName}
          attending={submittedData.attending}
          adultCount={submittedData.adultCount}
          kidCount={submittedData.kidCount}
          onComplete={handleBoardingComplete}
        />
      )}
      <h2>Mission Log</h2>
      <p className="rsvp-subtitle">
        {existingRsvpId ? 'Update your RSVP' : 'Will you be joining our space adventure?'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="astronaut@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="childName">Child's Name</label>
          <input
            type="text"
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Little astronaut's name..."
          />
        </div>

        <div className="form-group">
          <label>Can you make it?</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={`toggle-btn ${attending === true ? 'active yes' : ''}`}
              onClick={() => setAttending(true)}
            >
              Yes, count us in!
            </button>
            <button
              type="button"
              className={`toggle-btn ${attending === false ? 'active no' : ''}`}
              onClick={() => setAttending(false)}
            >
              Can't make it
            </button>
          </div>
        </div>

        {attending && (
          <>
            <div className="form-group">
              <label>Adults</label>
              <div className="count-selector">
                {[1, 2].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`count-btn ${adultCount === n ? 'active' : ''}`}
                    onClick={() => setAdultCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Kids</label>
              <div className="count-selector">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`count-btn ${kidCount === n ? 'active' : ''}`}
                    onClick={() => setKidCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          {existingRsvpId ? 'Update RSVP' : 'Submit RSVP'}
        </button>

        {!existingRsvpId && (
          <button type="button" onClick={handleReset} className="reset-link">
            ← Use a different email
          </button>
        )}
      </form>
    </section>
  )
}

export default RsvpForm
