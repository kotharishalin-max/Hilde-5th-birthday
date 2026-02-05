import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, onValue, remove } from 'firebase/database'
import { database } from '../firebase'
import JSZip from 'jszip'
import BoardingPassFront from './BoardingPassFront'
import BoardingPassBack from './BoardingPassBack'
import { downloadElementAsImage, downloadBothSides, sanitizeFilename, captureElementAsBlob } from '../downloadBoardingPass'

// Split multi-child names like "Jacques and Luc" into ["Jacques", "Luc"]
const splitChildNames = (name) => {
  if (!name || !name.toLowerCase().includes(' and ')) return [name]
  return name.split(/ and /i).map(n => n.trim())
}

const ADMIN_CODE = 'HILDE-ADMIN-2026'
const STORAGE_KEY = 'hilde-bday-admin'

// Simple SVG Pie Chart
function PieChart({ attending, notAttending }) {
  const total = attending + notAttending
  if (total === 0) return null

  const attendingPercent = (attending / total) * 100
  const attendingAngle = (attending / total) * 360

  // Calculate SVG arc path
  const radius = 40
  const cx = 50
  const cy = 50

  const getArcPath = (startAngle, endAngle, r) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
  }

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    }
  }

  return (
    <div className="chart-container pie-chart-container">
      <h3>Response Breakdown</h3>
      <svg viewBox="0 0 100 100" className="pie-chart">
        {/* Attending slice */}
        {attending > 0 && (
          <path
            d={attendingAngle >= 360 ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z` : getArcPath(0, attendingAngle, radius)}
            fill="#4caf50"
          />
        )}
        {/* Not attending slice */}
        {notAttending > 0 && (
          <path
            d={attendingAngle <= 0 ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z` : getArcPath(attendingAngle, 360, radius)}
            fill="#f44336"
          />
        )}
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#4caf50' }}></span>
          <span>Attending ({attending}) - {attendingPercent.toFixed(0)}%</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#f44336' }}></span>
          <span>Can't Make It ({notAttending}) - {(100 - attendingPercent).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

// Bar Chart for Adults vs Kids
function BarChart({ adults, kids }) {
  const max = Math.max(adults, kids, 1)
  const adultsPercent = (adults / max) * 100
  const kidsPercent = (kids / max) * 100

  return (
    <div className="chart-container bar-chart-container">
      <h3>Guest Breakdown</h3>
      <div className="bar-chart">
        <div className="bar-row">
          <span className="bar-label">Adults</span>
          <div className="bar-track">
            <div
              className="bar-fill adults"
              style={{ width: `${adultsPercent}%` }}
            >
              <span className="bar-value">{adults}</span>
            </div>
          </div>
        </div>
        <div className="bar-row">
          <span className="bar-label">Kids</span>
          <div className="bar-track">
            <div
              className="bar-fill kids"
              style={{ width: `${kidsPercent}%` }}
            >
              <span className="bar-value">{kids}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminPage({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [rsvps, setRsvps] = useState([])
  const [messages, setMessages] = useState([])
  const [totals, setTotals] = useState({ attending: 0, notAttending: 0, adults: 0, kids: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'attending', 'not-attending'
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteMessageConfirm, setDeleteMessageConfirm] = useState(null)
  const [activeTab, setActiveTab] = useState('rsvps') // 'rsvps' or 'messages'
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 })
  const [renderGuest, setRenderGuest] = useState(null)
  const [passSide, setPassSide] = useState('front') // 'front' or 'back'
  const boardingPassFrontRef = useRef(null)
  const boardingPassBackRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'granted') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const rsvpsRef = ref(database, 'rsvps')
    const unsubscribe = onValue(rsvpsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const rsvpList = Object.entries(data)
          .map(([id, rsvp]) => ({ id, ...rsvp }))
          .sort((a, b) => b.timestamp - a.timestamp)

        setRsvps(rsvpList)

        const attending = rsvpList.filter(r => r.attending)
        const notAttending = rsvpList.filter(r => !r.attending)
        const totalAdults = attending.reduce((sum, r) => sum + (r.adultCount || r.guestCount || 1), 0)
        const totalKids = attending.reduce((sum, r) => sum + (r.kidCount || 0), 0)

        setTotals({
          attending: attending.length,
          notAttending: notAttending.length,
          adults: totalAdults,
          kids: totalKids
        })
      } else {
        setRsvps([])
        setTotals({ attending: 0, notAttending: 0, adults: 0, kids: 0 })
      }
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  // Fetch messages
  useEffect(() => {
    if (!isAuthenticated) return

    const messagesRef = ref(database, 'messages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => b.timestamp - a.timestamp)
        setMessages(messageList)
      } else {
        setMessages([])
      }
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (code.toUpperCase() === ADMIN_CODE) {
      localStorage.setItem(STORAGE_KEY, 'granted')
      setIsAuthenticated(true)
    } else {
      setError('Invalid admin code')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Filter and search logic
  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = searchTerm === '' ||
      (rsvp.childName || rsvp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rsvp.email || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'attending' && rsvp.attending) ||
      (filterStatus === 'not-attending' && !rsvp.attending)

    return matchesSearch && matchesFilter
  })

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Attending', 'Adults', 'Kids', 'Date']
    const rows = rsvps.map(rsvp => [
      rsvp.childName || rsvp.name || '',
      rsvp.email || '',
      rsvp.attending ? 'Yes' : 'No',
      rsvp.attending ? (rsvp.adultCount || rsvp.guestCount || 1) : 0,
      rsvp.attending ? (rsvp.kidCount || 0) : 0,
      new Date(rsvp.timestamp).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `hilde-birthday-rsvps-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Delete RSVP
  const handleDelete = async (rsvpId) => {
    try {
      await remove(ref(database, `rsvps/${rsvpId}`))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Delete Message
  const handleDeleteMessage = async (messageId) => {
    try {
      await remove(ref(database, `messages/${messageId}`))
      setDeleteMessageConfirm(null)
    } catch (err) {
      console.error('Delete message error:', err)
    }
  }

  // Download single boarding pass (front only)
  const downloadBoardingPassFront = useCallback(async (guest) => {
    const guestName = guest.childName || guest.name
    setDownloadingId(guest.id)
    setRenderGuest(guest)
    setPassSide('front')

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100))

    if (boardingPassFrontRef.current) {
      const filename = `boarding-pass-${sanitizeFilename(guestName)}-front`
      await downloadElementAsImage(boardingPassFrontRef.current, filename)
    }

    setDownloadingId(null)
    setRenderGuest(null)
  }, [])

  // Download single boarding pass (back only)
  const downloadBoardingPassBack = useCallback(async (guest) => {
    const guestName = guest.childName || guest.name
    setDownloadingId(guest.id)
    setRenderGuest(guest)
    setPassSide('back')

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100))

    if (boardingPassBackRef.current) {
      const filename = `boarding-pass-${sanitizeFilename(guestName)}-back`
      await downloadElementAsImage(boardingPassBackRef.current, filename)
    }

    setDownloadingId(null)
    setRenderGuest(null)
  }, [])

  // Download both sides of a single boarding pass
  const downloadBoardingPassBoth = useCallback(async (guest) => {
    const guestName = guest.childName || guest.name
    setDownloadingId(guest.id)
    setRenderGuest(guest)

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100))

    await downloadBothSides(
      boardingPassFrontRef.current,
      boardingPassBackRef.current,
      guestName
    )

    setDownloadingId(null)
    setRenderGuest(null)
  }, [])

  // Download all boarding passes as a ZIP (both sides for each guest, auto-splits multi-child families)
  const downloadAllBoardingPasses = useCallback(async () => {
    const attendingGuests = rsvps.filter(r => r.attending)
    if (attendingGuests.length === 0) return

    // Expand multi-child families into individual passes
    const allPasses = []
    attendingGuests.forEach(guest => {
      const name = guest.childName || guest.name
      splitChildNames(name).forEach(childName => {
        allPasses.push({ guest, childName })
      })
    })

    const zip = new JSZip()
    setDownloadingAll(true)
    setDownloadProgress({ current: 0, total: allPasses.length })

    for (let i = 0; i < allPasses.length; i++) {
      const { guest, childName } = allPasses[i]
      setDownloadProgress({ current: i + 1, total: allPasses.length })
      setRenderGuest({ ...guest, displayChildName: childName })

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 150))

      // Capture front and back as blobs
      const frontBlob = await captureElementAsBlob(boardingPassFrontRef.current)
      const backBlob = await captureElementAsBlob(boardingPassBackRef.current)

      const safeName = sanitizeFilename(childName)
      zip.file(`${safeName}-front.png`, frontBlob)
      zip.file(`${safeName}-back.png`, backBlob)

      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(zipBlob)
    link.download = 'boarding-passes.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    setDownloadingAll(false)
    setDownloadProgress({ current: 0, total: 0 })
    setRenderGuest(null)
  }, [rsvps])

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h1>Mission Control</h1>
          <p>Enter admin code to access</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Admin code..."
              autoFocus
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Access</button>
          </form>
          <button className="back-link" onClick={onBack}>← Back to site</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Mission Control</h1>
        <div className="admin-header-actions">
          <button className="back-link" onClick={onBack}>← Back to site</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{totals.attending}</span>
          <span className="stat-label">Attending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.notAttending}</span>
          <span className="stat-label">Can't Make It</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.adults}</span>
          <span className="stat-label">Adults</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totals.kids}</span>
          <span className="stat-label">Kids</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-number">{totals.adults + totals.kids}</span>
          <span className="stat-label">Total Guests</span>
        </div>
      </div>

      {/* Charts */}
      <div className="admin-charts">
        <PieChart attending={totals.attending} notAttending={totals.notAttending} />
        <BarChart adults={totals.adults} kids={totals.kids} />
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'rsvps' ? 'active' : ''}`}
          onClick={() => setActiveTab('rsvps')}
        >
          RSVPs ({rsvps.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages ({messages.length})
        </button>
      </div>

      {/* RSVPs Tab Content */}
      {activeTab === 'rsvps' && (
        <>
          {/* Search, Filter, Export */}
          <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({rsvps.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'attending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('attending')}
          >
            Attending ({totals.attending})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'not-attending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('not-attending')}
          >
            Can't Make It ({totals.notAttending})
          </button>
        </div>

        <button className="export-btn" onClick={exportToCSV}>
          <svg viewBox="0 0 24 24" className="export-icon">
            <path fill="currentColor" d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8ZM12,18l-4-4h2.5V11h3v3H16Zm1-9V3.5L18.5,9Z"/>
          </svg>
          Export CSV
        </button>
        <button
          className="export-btn boarding-pass-btn"
          onClick={downloadAllBoardingPasses}
          disabled={downloadingAll || totals.attending === 0}
        >
          <svg viewBox="0 0 24 24" className="export-icon">
            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
          </svg>
          {downloadingAll
            ? `Downloading ${downloadProgress.current}/${downloadProgress.total}...`
            : `Download All Passes (${totals.attending})`
          }
        </button>
      </div>

      <div className="admin-table-container">
        <h2>All RSVPs {filteredRsvps.length !== rsvps.length && `(${filteredRsvps.length} of ${rsvps.length})`}</h2>
        {filteredRsvps.length === 0 ? (
          <p className="no-results">No RSVPs match your search/filter.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Response</th>
                <th>Adults</th>
                <th>Kids</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRsvps.map((rsvp) => (
                <tr key={rsvp.id} className={rsvp.attending ? 'attending' : 'not-attending'}>
                  <td>{rsvp.childName || rsvp.name}</td>
                  <td>{rsvp.email || '-'}</td>
                  <td>{rsvp.attending ? '✅ Yes' : '❌ No'}</td>
                  <td>{rsvp.attending ? (rsvp.adultCount || rsvp.guestCount || 1) : '-'}</td>
                  <td>{rsvp.attending ? (rsvp.kidCount || 0) : '-'}</td>
                  <td>{formatDate(rsvp.timestamp)}</td>
                  <td>
                    <div className="action-buttons">
                      {rsvp.attending && (
                        <div className="download-options">
                          <button
                            className="download-pass-btn"
                            onClick={() => downloadBoardingPassFront(rsvp)}
                            disabled={downloadingId === rsvp.id || downloadingAll}
                            title="Download Front"
                          >
                            {downloadingId === rsvp.id ? '⏳' : '🎫'}F
                          </button>
                          <button
                            className="download-pass-btn"
                            onClick={() => downloadBoardingPassBack(rsvp)}
                            disabled={downloadingId === rsvp.id || downloadingAll}
                            title="Download Back"
                          >
                            {downloadingId === rsvp.id ? '⏳' : '🎫'}B
                          </button>
                          <button
                            className="download-pass-btn"
                            onClick={() => downloadBoardingPassBoth(rsvp)}
                            disabled={downloadingId === rsvp.id || downloadingAll}
                            title="Download Both Sides"
                          >
                            {downloadingId === rsvp.id ? '⏳' : '🎫'}2
                          </button>
                        </div>
                      )}
                      {deleteConfirm === rsvp.id ? (
                        <div className="delete-confirm">
                          <span>Delete?</span>
                          <button className="confirm-yes" onClick={() => handleDelete(rsvp.id)}>Yes</button>
                          <button className="confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteConfirm(rsvp.id)}
                          title="Delete RSVP"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}

      {/* Messages Tab Content */}
      {activeTab === 'messages' && (
        <div className="admin-messages-section">
          <h2>All Messages ({messages.length})</h2>
          {messages.length === 0 ? (
            <p className="no-results">No messages yet.</p>
          ) : (
            <div className="admin-messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className="admin-message-card">
                  <div className="admin-message-avatar">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-message-content">
                    <div className="admin-message-header">
                      <span className="admin-message-author">{msg.name}</span>
                      <span className="admin-message-date">{formatDate(msg.timestamp)}</span>
                    </div>
                    <p className="admin-message-text">{msg.message}</p>
                  </div>
                  <div className="admin-message-actions">
                    {deleteMessageConfirm === msg.id ? (
                      <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="confirm-yes" onClick={() => handleDeleteMessage(msg.id)}>Yes</button>
                        <button className="confirm-no" onClick={() => setDeleteMessageConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteMessageConfirm(msg.id)}
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden container for boarding pass rendering */}
      {renderGuest && (
        <div className="boarding-pass-render-container">
          <BoardingPassFront
            ref={boardingPassFrontRef}
            name={renderGuest.displayChildName || renderGuest.childName || renderGuest.name}
          />
          <BoardingPassBack
            ref={boardingPassBackRef}
          />
        </div>
      )}
    </div>
  )
}

export default AdminPage
