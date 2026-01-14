import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'

function GuestList() {
  const [guests, setGuests] = useState([])
  const [totals, setTotals] = useState({ adults: 0, kids: 0 })

  useEffect(() => {
    const rsvpsRef = ref(database, 'rsvps')
    const unsubscribe = onValue(rsvpsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const guestList = Object.entries(data)
          .map(([id, rsvp]) => ({ id, ...rsvp }))
          .filter(rsvp => rsvp.attending)
          .sort((a, b) => a.name.localeCompare(b.name))

        setGuests(guestList)

        const totalAdults = guestList.reduce((sum, g) => sum + (g.adultCount || g.guestCount || 1), 0)
        const totalKids = guestList.reduce((sum, g) => sum + (g.kidCount || 0), 0)
        setTotals({ adults: totalAdults, kids: totalKids })
      }
    })

    return () => unsubscribe()
  }, [])

  if (guests.length === 0) {
    return (
      <section className="guest-list">
        <h2>Mission Crew</h2>
        <p className="guest-list-subtitle">No confirmed astronauts yet. Be the first!</p>
      </section>
    )
  }

  return (
    <section className="guest-list">
      <h2>Mission Crew</h2>
      <p className="guest-list-subtitle">
        {totals.adults + totals.kids} astronauts confirmed ({totals.adults} adults, {totals.kids} kids)
      </p>

      <div className="guest-cards">
        {guests.map((guest) => (
          <div key={guest.id} className="guest-card">
            <span className="guest-name">{guest.name}</span>
            <span className="guest-count">
              {guest.adultCount || guest.guestCount || 1} 👨‍🚀
              {(guest.kidCount || 0) > 0 && ` ${guest.kidCount} 👶`}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default GuestList
