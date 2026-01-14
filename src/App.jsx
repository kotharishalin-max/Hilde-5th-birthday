import Hero from './components/Hero'
import PartyDetails from './components/PartyDetails'
import RsvpForm from './components/RsvpForm'
import Guestbook from './components/Guestbook'

function App() {
  return (
    <div className="app">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <main>
        <Hero />
        <PartyDetails />
        <RsvpForm />
        <Guestbook />
      </main>
      <footer>
        <p>See you among the stars!</p>
      </footer>
    </div>
  )
}

export default App
