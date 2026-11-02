import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Complaint from "./pages/Complaint";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import StaffComplaints from "./pages/StaffComplaints";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./ProtectedRoute";

function Home() {
return ( <div className="home-page">

  {/* NAVIGATION */}
  <nav className="main-nav">
    <Link to="/" className="brand">
      <div className="brand-icon">🏛️</div>
      <div>
        <h2>CampusCare</h2>
        <p>SMART CAMPUS SOLUTIONS</p>
      </div>
    </Link>

    <div className="nav-links">
      <Link to="/" className="nav-link active">Home</Link>
      <a href="#features" className="nav-link">Features</a>
      <a href="#how-it-works" className="nav-link">How It Works</a>
      <Link to="/login" className="nav-link">Login</Link>
      <Link to="/register" className="nav-register-button">
        Get Started →
      </Link>
    </div>
  </nav>

  {/* HERO SECTION */}
  <main className="home-container">

    <section className="home-hero">

      <div className="home-content">

        <div className="hero-badge">
          <span>✦</span> SMARTER CAMPUS. BETTER EXPERIENCE.
        </div>

        <h1>
          Your Voice Matters.
          <br />
          <span>Let's Improve Campus.</span>
        </h1>

        <p className="home-description">
          Experience a smarter way to report campus issues.
          Submit complaints, track progress and stay updated
          with our AI-powered complaint management platform.
        </p>

        <div className="home-buttons">
          <Link to="/register" className="home-primary-button">
            Get Started <span>→</span>
          </Link>

          <Link to="/login" className="home-secondary-button">
            Explore Dashboard ↗
          </Link>
        </div>

        <div className="hero-trust">
          <span>✓ Easy complaint submission</span>
          <span>✓ Transparent tracking</span>
        </div>

      </div>

      {/* HERO VISUAL */}
      <div className="home-illustration">

        <div className="hero-glow"></div>

        <div className="hero-dashboard-card">

          <div className="hero-card-top">
            <div>
              <span className="hero-small-label">CAMPUSCARE</span>
              <h3>Complaint Overview</h3>
            </div>
            <div className="hero-card-icon">📊</div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon">📝</div>
            <div>
              <span>Submit complaints</span>
              <strong>Simple & Fast</strong>
            </div>
            <span className="hero-check">✓</span>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon">🔍</div>
            <div>
              <span>Track progress</span>
              <strong>Real-time updates</strong>
            </div>
            <span className="hero-check">✓</span>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon">✨</div>
            <div>
              <span>AI assistance</span>
              <strong>Smart classification</strong>
            </div>
            <span className="hero-check">✓</span>
          </div>

          <div className="hero-card-footer">
            <span className="online-dot"></span>
            Your campus, better connected.
          </div>

        </div>

        <div className="floating-icon icon-one">📝</div>
        <div className="floating-icon icon-two">✨</div>
        <div className="floating-icon icon-three">🎓</div>

      </div>

    </section>

    {/* FEATURES */}
    <section className="home-features" id="features">

      <div className="section-heading">
        <span>WHY CAMPUSCARE?</span>
        <h2>Everything your campus needs</h2>
        <p>
          A simple and transparent platform designed
          to make campus communication better.
        </p>
      </div>

      <div className="feature-grid">

        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>Smart AI Assistance</h3>
          <p>
            Automatically identify complaint categories
            and priorities to simplify complaint management.
          </p>
          <span className="feature-number">01</span>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h3>Easy Complaint Tracking</h3>
          <p>
            Follow your complaint status and stay informed
            throughout the resolution process.
          </p>
          <span className="feature-number">02</span>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Efficient Resolution</h3>
          <p>
            Help administrators and staff manage,
            assign and resolve campus complaints.
          </p>
          <span className="feature-number">03</span>
        </div>

      </div>

    </section>

    {/* HOW IT WORKS */}
    <section className="how-section" id="how-it-works">

      <div className="section-heading">
        <span>SIMPLE PROCESS</span>
        <h2>How it works</h2>
        <p>Three simple steps towards a better campus.</p>
      </div>

      <div className="steps-grid">

        <div className="step-item">
          <div className="step-number">01</div>
          <h3>Submit</h3>
          <p>Describe your issue and attach an image if needed.</p>
        </div>

        <div className="step-item">
          <div className="step-number">02</div>
          <h3>Track</h3>
          <p>Follow your complaint as staff members review it.</p>
        </div>

        <div className="step-item">
          <div className="step-number">03</div>
          <h3>Resolve</h3>
          <p>Get updates when your complaint is resolved.</p>
        </div>

      </div>

      <div className="home-cta">
        <div>
          <span>READY TO MAKE A DIFFERENCE?</span>
          <h2>Let's build a better campus together.</h2>
        </div>
        <Link to="/register" className="home-primary-button">
          Join CampusCare →
        </Link>
      </div>

    </section>

  </main>

  {/* FOOTER */}
  <footer className="main-footer">
    <strong>🏛️ CampusCare</strong>
    <span>Report. Resolve. Improve. ❤️</span>
    <span>AI-Powered Complaint Management System</span>
  </footer>

</div>


);
}

function App() {
return ( <BrowserRouter>

  <Routes>

    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute allowedRoles={["student", "staff", "admin"]}>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/complaint"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <Complaint />
        </ProtectedRoute>
      }
    />

    <Route
      path="/my-complaints"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <MyComplaints />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin-complaints"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminComplaints />
        </ProtectedRoute>
      }
    />

    <Route
      path="/analytics"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <Analytics />
        </ProtectedRoute>
      }
    />

    <Route
      path="/staff-complaints"
      element={
        <ProtectedRoute allowedRoles={["staff"]}>
          <StaffComplaints />
        </ProtectedRoute>
      }
    />

  </Routes>

  <Chatbot />

</BrowserRouter>

);
}

export default App;
