import { useState, useEffect, useCallback } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'

const MILESTONES = [5, 10, 15, 20, 25, 30]
const MILESTONE_STORAGE_KEY = 'hilde-bday-seen-milestones'

// Toast notification for milestones
function MilestoneToast({ milestone, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="milestone-toast">
      <span className="milestone-icon">🎉</span>
      <div className="milestone-content">
        <span className="milestone-title">Crew Growing!</span>
        <span className="milestone-message">{milestone} astronauts ready for launch!</span>
      </div>
    </div>
  )
}

// Generate astronaut avatar with unique colors based on name
function AstronautAvatar({ name, index }) {
  const colors = [
    { suit: '#ff6b9d', visor: '#74b9ff' },
    { suit: '#ffd700', visor: '#a29bfe' },
    { suit: '#74b9ff', visor: '#ff8c42' },
    { suit: '#00cec9', visor: '#ff6b9d' },
    { suit: '#a29bfe', visor: '#ffd700' },
    { suit: '#ff8c42', visor: '#00cec9' },
  ]
  const color = colors[index % colors.length]

  return (
    <svg viewBox="0 0 60 80" className="astronaut-avatar">
      {/* Helmet */}
      <circle cx="30" cy="25" r="20" fill="white" />
      {/* Visor */}
      <ellipse cx="30" cy="27" rx="14" ry="12" fill={color.visor} opacity="0.8" />
      <ellipse cx="26" cy="24" rx="4" ry="3" fill="rgba(255,255,255,0.4)" />
      {/* Body */}
      <ellipse cx="30" cy="55" rx="18" ry="22" fill={color.suit} />
      {/* Helmet ring */}
      <ellipse cx="30" cy="40" rx="18" ry="4" fill="#dfe6e9" />
      {/* Arms */}
      <ellipse cx="10" cy="52" rx="7" ry="10" fill={color.suit} />
      <ellipse cx="50" cy="52" rx="7" ry="10" fill={color.suit} />
    </svg>
  )
}

// Mini astronaut for the headcount display
function MiniAstronaut({ delay = 0 }) {
  return (
    <svg
      viewBox="0 0 30 40"
      className="mini-astronaut"
      style={{ animationDelay: `${delay}ms` }}
    >
      <circle cx="15" cy="12" r="10" fill="white" />
      <ellipse cx="15" cy="14" rx="7" ry="6" fill="#74b9ff" opacity="0.8" />
      <ellipse cx="30" cy="27" rx="9" ry="11" fill="white" />
    </svg>
  )
}

function GuestList() {
  const [guests, setGuests] = useState([])
  const [totals, setTotals] = useState({ adults: 0, kids: 0 })
  const [milestoneToast, setMilestoneToast] = useState(null)
  const [highlightedName, setHighlightedName] = useState(null)

  const checkMilestones = useCallback((totalGuests) => {
    const seenMilestones = JSON.parse(localStorage.getItem(MILESTONE_STORAGE_KEY) || '[]')

    for (const milestone of MILESTONES) {
      if (totalGuests >= milestone && !seenMilestones.includes(milestone)) {
        // Found a new milestone!
        seenMilestones.push(milestone)
        localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(seenMilestones))
        setMilestoneToast(milestone)
        break // Show one at a time
      }
    }
  }, [])

  useEffect(() => {
    const rsvpsRef = ref(database, 'rsvps')
    const unsubscribe = onValue(rsvpsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const guestList = Object.entries(data)
          .map(([id, rsvp]) => ({ id, ...rsvp }))
          .filter(rsvp => rsvp.attending)
          .sort((a, b) => (a.childName || a.name || '').localeCompare(b.childName || b.name || ''))

        setGuests(guestList)

        const totalAdults = guestList.reduce((sum, g) => sum + (g.adultCount || g.guestCount || 1), 0)
        const totalKids = guestList.reduce((sum, g) => sum + (g.kidCount || 0), 0)
        setTotals({ adults: totalAdults, kids: totalKids })

        // Check for milestones
        checkMilestones(totalAdults + totalKids)
      }
    })

    return () => unsubscribe()
  }, [checkMilestones])

  // Listen for highlight event from RSVP form
  useEffect(() => {
    const handleHighlight = (event) => {
      const { name } = event.detail
      setHighlightedName(name)
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedName(null), 3000)
    }

    window.addEventListener('highlightGuest', handleHighlight)
    return () => window.removeEventListener('highlightGuest', handleHighlight)
  }, [])

  const totalGuests = totals.adults + totals.kids

  if (guests.length === 0) {
    return (
      <section className="guest-list">
        <h2>Mission Crew</h2>
        <div className="crew-status empty">
          <div className="astronaut-row">
            <MiniAstronaut delay={0} />
            <MiniAstronaut delay={100} />
            <MiniAstronaut delay={200} />
          </div>
          <p className="crew-message">Awaiting crew members...</p>
          <p className="crew-cta">Be the first to join the mission!</p>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Milestone toast notification */}
      {milestoneToast && (
        <MilestoneToast
          milestone={milestoneToast}
          onClose={() => setMilestoneToast(null)}
        />
      )}

      <section className="guest-list">
        <h2>Mission Crew</h2>

        {/* Visual headcount banner */}
        <div className="crew-status">
        <div className="astronaut-row">
          {[...Array(Math.min(totalGuests, 12))].map((_, i) => (
            <MiniAstronaut key={i} delay={i * 50} />
          ))}
          {totalGuests > 12 && <span className="more-astronauts">+{totalGuests - 12}</span>}
        </div>
        <p className="crew-count">
          <span className="crew-number">{totalGuests}</span>
          <span className="crew-text">
            {totalGuests === 1 ? 'astronaut' : 'astronauts'} ready for launch!
          </span>
        </p>
        <p className="crew-breakdown">
          {totals.adults} {totals.adults === 1 ? 'adult' : 'adults'} &bull; {totals.kids} {totals.kids === 1 ? 'kid' : 'kids'}
        </p>
      </div>

      {/* Guest cards with avatars */}
      <div className="guest-cards">
        {guests.map((guest, index) => {
          const guestName = guest.childName || guest.name
          const isHighlighted = highlightedName && guestName.toLowerCase() === highlightedName.toLowerCase()
          return (
          <div
            key={guest.id}
            className={`guest-card ${isHighlighted ? 'guest-card-highlighted' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <AstronautAvatar name={guestName} index={index} />
            <div className="guest-info">
              <span className="guest-name">{guestName}</span>
              <span className="guest-count">
                {(guest.adultCount || guest.guestCount || 1)} adult{(guest.adultCount || 1) !== 1 ? 's' : ''}
                {(guest.kidCount || 0) > 0 && `, ${guest.kidCount} kid${guest.kidCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        )})}
      </div>
      </section>
    </>
  )
}

export default GuestList
