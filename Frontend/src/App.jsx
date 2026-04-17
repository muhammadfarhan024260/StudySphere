import { useState, useEffect } from 'react'
import './App.css'
import api from './services/api'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Test API connection - replace this with your actual endpoint
        const response = await api.get('/test')
        setData(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Uncomment when your backend API is ready
    // fetchData()
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>StudySphere - Module 1</h1>
        <p>Database Management System Course Project</p>
      </header>

      <main className="main-content">
        <section className="welcome">
          <h2>Welcome to StudySphere!</h2>
          <p>Frontend: React ✅</p>
          <p>Backend: ASP.NET Core ✅</p>
          <p>Database: PostgreSQL (Neon) ✅</p>
        </section>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        {data && <p className="success">Connected to backend! {JSON.stringify(data)}</p>}

        <section className="components">
          <h2>Module 1 Components</h2>
          <div className="placeholder">
            <p>Your components will go here...</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
