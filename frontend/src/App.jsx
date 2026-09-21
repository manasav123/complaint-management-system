import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Complaint from "./pages/Complaint";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import StaffComplaints from "./pages/StaffComplaints";
import Analytics from "./pages/Analytics";
function Home() {
  return (
    <div className="home-page">
      <nav className="main-nav">
        <div className="brand">
          <div className="brand-icon">🏫</div>
          <div>
            <h2>AI-Powered Complaint System</h2>
            <p>Your Voice, A Better Campus</p>
          </div>
        </div>

        <div className="nav-links">
          <a href="/" className="nav-link active">Home</a>
          <a href="/login" className="nav-link">Login</a>
          <a href="/register" className="nav-link">Register</a>
        </div>
      </nav>

      <main className="home-container">
        <section className="home-hero">
          <div className="home-content">
            <p className="hero-label">WELCOME TO</p>

            <h1>
              AI-Powered <span>Complaint Management</span>
            </h1>

            <p className="home-description">
              A smart and simple platform for students to report issues,
              track complaints, and help build a better campus.
            </p>

            <div className="home-buttons">
              <a href="/login" className="home-primary-button">
                Login to Continue →
              </a>

              <a href="/register" className="home-secondary-button">
                Create Account
              </a>
            </div>
          </div>

          <div className="home-illustration">
            <div className="home-icon">🏫</div>
            <div className="floating-icon icon-one">📝</div>
            <div className="floating-icon icon-two">📋</div>
            <div className="floating-icon icon-three">✨</div>
          </div>
        </section>

        <section className="home-features">
          <h2>How It Works</h2>
          <p>Simple, transparent, and easy to use</p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Submit</h3>
              <p>Report your college issue quickly and easily.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Track</h3>
              <p>Check the progress of your complaint anytime.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Resolve</h3>
              <p>Staff can manage and resolve reported issues.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <strong>AI-Powered Complaint System</strong>
        <span>Report &nbsp; | &nbsp; Resolve &nbsp; | &nbsp; Improve ❤️</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/admin-complaints" element={<AdminComplaints />} />
        <Route path="/staff-complaints" element={<StaffComplaints />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;