import { useState, useEffect } from 'react'

const PARTY_DATE = new Date('2026-02-08T10:00:00-05:00') // Feb 8, 2026 10AM EST
const VENUE_NAME = 'Hudson River Museum'
const VENUE_LOCATION = 'Joyce Greene Education Center & Planetarium'
const VENUE_ADDRESS = '511 Warburton Ave, Yonkers, NY 10701'
const MAPS_URL = 'https://maps.google.com/?q=Hudson+River+Museum+511+Warburton+Ave+Yonkers+NY+10701'
const WEBSITE_URL = 'https://kotharishalin-max.github.io/Hilde-5th-birthday/'
const ACCESS_CODE = 'SPACE2026'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const now = new Date()
    const diff = PARTY_DATE - now

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false
    }
  }

  // Determine intensity level based on days remaining
  function getIntensityClass() {
    if (timeLeft.expired) return 'intensity-liftoff'
    if (timeLeft.days === 0) return 'intensity-today'
    if (timeLeft.days <= 1) return 'intensity-tomorrow'
    if (timeLeft.days <= 7) return 'intensity-week'
    if (timeLeft.days <= 14) return 'intensity-soon'
    return ''
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (timeLeft.expired) {
    return (
      <div className="countdown countdown-expired intensity-liftoff">
        <span className="countdown-title">🚀 Liftoff! 🚀</span>
        <p className="countdown-subtitle">The party is happening now!</p>
      </div>
    )
  }

  const intensityClass = getIntensityClass()

  return (
    <div className={`countdown ${intensityClass}`}>
      <span className="countdown-title">T-Minus</span>
      <div className="countdown-units">
        <div className="countdown-unit">
          <span className="countdown-number">{timeLeft.days}</span>
          <span className="countdown-label">days</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-number">{timeLeft.hours}</span>
          <span className="countdown-label">hrs</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-number">{timeLeft.minutes}</span>
          <span className="countdown-label">min</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-number">{timeLeft.seconds}</span>
          <span className="countdown-label">sec</span>
        </div>
      </div>
      {timeLeft.days <= 7 && timeLeft.days > 0 && (
        <p className="countdown-urgency">
          {timeLeft.days === 1 ? "Tomorrow's the big day!" : `Only ${timeLeft.days} days to go!`}
        </p>
      )}
      {timeLeft.days === 0 && !timeLeft.expired && (
        <p className="countdown-urgency countdown-today">Today's the day! See you soon!</p>
      )}
    </div>
  )
}

function CalendarButtons() {
  const eventTitle = "Hilde's 5th Birthday - Space Mission!"
  const eventDescription = `Join us for an out-of-this-world birthday celebration at the Hudson River Museum Planetarium!

10:00 AM - Party starts, creative activity
10:30 AM - Planetarium show (please arrive by 10!)
11:00 AM - Refreshments and cake
11:45 AM - Party concludes

RSVP & Details: ${WEBSITE_URL}
Access Code: ${ACCESS_CODE}

See you among the stars!`
  const startDate = '20260208T150000Z' // UTC time for 10AM EST
  const endDate = '20260208T170000Z'   // 2 hours (10AM-12PM EST)

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(VENUE_ADDRESS)}`

  // ICS file for Apple/Outlook - use escaped newlines for ICS format
  const icsDescription = eventDescription.replace(/\n/g, '\\n')

  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hilde Birthday//EN
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventTitle}
DESCRIPTION:${icsDescription}
LOCATION:${VENUE_ADDRESS}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'hilde-birthday.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="calendar-buttons">
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="calendar-btn google">
        <svg viewBox="0 0 24 24" className="calendar-icon">
          <path fill="currentColor" d="M19,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H5A2,2,0,0,0,3,6V20a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V6A2,2,0,0,0,19,4Zm0,16H5V10H19ZM9,14H7V12H9Zm4,0H11V12h2Zm4,0H15V12h2Zm-8,4H7V16H9Zm4,0H11V16h2Zm4,0H15V16h2Z"/>
        </svg>
        Google Calendar
      </a>
      <button onClick={generateICS} className="calendar-btn ics">
        <svg viewBox="0 0 24 24" className="calendar-icon">
          <path fill="currentColor" d="M19,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H5A2,2,0,0,0,3,6V20a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V6A2,2,0,0,0,19,4Zm0,16H5V10H19ZM9,14H7V12H9Zm4,0H11V12h2Zm4,0H15V12h2Zm-8,4H7V16H9Zm4,0H11V16h2Zm4,0H15V16h2Z"/>
        </svg>
        Apple / Outlook
      </button>
    </div>
  )
}

function PartyDetails() {
  return (
    <section className="details">
      <h2>Mission Briefing</h2>

      <Countdown />

      <div className="detail-cards">
        <div className="detail-card date-time-card">
          <span className="icon" role="img" aria-label="rocket">🚀</span>
          <h3>Launch Date</h3>
          <p>Sunday, February 8th, 2026</p>
          <p>Countdown Begins at 10:00 AM</p>
        </div>
        <div className="detail-card location-card">
          <span className="icon" role="img" aria-label="location">🪐</span>
          <h3>Mission Control</h3>
          <p>{VENUE_NAME}</p>
          <p className="address">{VENUE_LOCATION}</p>
          <p className="address">{VENUE_ADDRESS}</p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="maps-link"
          >
            <svg viewBox="0 0 24 24" className="maps-icon">
              <path fill="currentColor" d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2zm0,9.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/>
            </svg>
            Open in Maps
          </a>
        </div>
        <div className="detail-card schedule-card">
          <span className="icon" role="img" aria-label="clipboard">📋</span>
          <h3>Flight Plan</h3>
          <div className="schedule-timeline">
            <div className="schedule-item">
              <span className="schedule-time">10:00 AM</span>
              <span className="schedule-desc">Party starts, creative activity</span>
            </div>
            <div className="schedule-item highlight">
              <span className="schedule-time">10:30 AM</span>
              <span className="schedule-desc">Planetarium show (late entry not allowed)</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">11:00 AM</span>
              <span className="schedule-desc">Refreshments & cake</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">11:45 AM</span>
              <span className="schedule-desc">Mission complete</span>
            </div>
          </div>
        </div>
      </div>

      <CalendarButtons />
    </section>
  )
}

export default PartyDetails
