function PartyDetails() {
  return (
    <section className="details">
      <h2>Mission Briefing</h2>
      <div className="detail-cards">
        <div className="detail-card">
          <span className="icon" role="img" aria-label="calendar">📅</span>
          <h3>Launch Date</h3>
          <p>Saturday, February 8th, 2026</p>
        </div>
        <div className="detail-card">
          <span className="icon" role="img" aria-label="clock">🕙</span>
          <h3>Countdown Begins</h3>
          <p>10:00 AM</p>
        </div>
        <div className="detail-card">
          <span className="icon" role="img" aria-label="location">🪐</span>
          <h3>Mission Control</h3>
          <p>Stamford Museum & Nature Center</p>
          <p className="address">Planetarium</p>
          <p className="address">39 Scofieldtown Rd, Stamford, CT</p>
        </div>
      </div>
    </section>
  )
}

export default PartyDetails
