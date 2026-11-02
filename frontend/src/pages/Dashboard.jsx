import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const isStudent = user?.role === "student";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="modern-dashboard">

      {/* NAVIGATION */}

      <nav className="dashboard-navbar">

        <Link to="/dashboard" className="dashboard-brand">
          <div className="dashboard-brand-icon">🏛️</div>

          <div>
            <h2>CampusCare</h2>
            <p>SMART CAMPUS SOLUTIONS</p>
          </div>
        </Link>

        <div className="dashboard-nav-links">

          <Link to="/dashboard" className="dashboard-nav-link active">
            Dashboard
          </Link>

          {isStudent && (
            <>
              <Link to="/complaint" className="dashboard-nav-link">
                Submit Complaint
              </Link>

              <Link to="/my-complaints" className="dashboard-nav-link">
                My Complaints
              </Link>
            </>
          )}

          {isStaff && (
            <Link to="/staff-complaints" className="dashboard-nav-link">
              Staff Complaints
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/admin-complaints" className="dashboard-nav-link">
                Admin Complaints
              </Link>

              <Link to="/analytics" className="dashboard-nav-link">
                Analytics
              </Link>
            </>
          )}

          <button
            className="dashboard-logout"
            onClick={logout}
          >
            Logout ↗
          </button>

        </div>

      </nav>


      <main className="dashboard-main">

        {user ? (
          <>

            {/* WELCOME HERO */}

            <section className="dashboard-hero">

              <div className="dashboard-hero-content">

                <span className="dashboard-hero-badge">
                  ✨ YOUR CAMPUS, YOUR VOICE
                </span>

                <h1>
                  Welcome to a
                  <br />
                  <span>Better Campus.</span>
                </h1>

                <p>
                  Report issues, track complaint progress
                  and help us build a smarter campus together.
                </p>

                {isStudent && (
                  <Link
                    to="/complaint"
                    className="dashboard-hero-button"
                  >
                    Submit a Complaint →
                  </Link>
                )}

                {isStaff && (
                  <Link
                    to="/staff-complaints"
                    className="dashboard-hero-button"
                  >
                    View Assigned Complaints →
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin-complaints"
                    className="dashboard-hero-button"
                  >
                    Manage Complaints →
                  </Link>
                )}

              </div>

              <div className="dashboard-hero-illustration">
                <div className="dashboard-illustration-circle">
                  🏫
                </div>

                <div className="dashboard-floating-card">
                  <span>✨</span>
                  <div>
                    <strong>CampusCare</strong>
                    <small>Making every voice count</small>
                  </div>
                </div>

              </div>

            </section>


            {/* USER PROFILE */}

            <section className="dashboard-profile-card">

              <div className="dashboard-profile-left">

                <div className="dashboard-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <span className="dashboard-small-label">
                    WELCOME BACK
                  </span>

                  <h2>{user.name}</h2>

                  <p>{user.email}</p>
                </div>

              </div>

              <div className="dashboard-role-badge">
                <span>●</span>
                {user.role?.charAt(0).toUpperCase() +
                  user.role?.slice(1)}
              </div>

            </section>


            {/* QUICK ACTIONS */}

            <section className="dashboard-actions-section">

              <div className="dashboard-section-heading">

                <div>
                  <span className="dashboard-small-label">
                    GET STARTED
                  </span>

                  <h2>Quick Actions</h2>

                  <p>
                    Choose an option to continue.
                  </p>
                </div>

                <span className="dashboard-action-sparkle">
                  ✨
                </span>

              </div>


              <div className="modern-dashboard-cards">

                {/* STUDENT CARDS */}

                {isStudent && (
                  <>

                    <Link
                      to="/complaint"
                      className="modern-dashboard-card"
                    >

                      <div className="modern-card-icon icon-purple">
                        📝
                      </div>

                      <span className="modern-card-label">
                        REPORT AN ISSUE
                      </span>

                      <h3>Submit Complaint</h3>

                      <p>
                        Have an issue on campus?
                        Submit a complaint and let us know.
                      </p>

                      <div className="modern-card-link">
                        Submit Now <span>→</span>
                      </div>

                    </Link>


                    <Link
                      to="/my-complaints"
                      className="modern-dashboard-card"
                    >

                      <div className="modern-card-icon icon-blue">
                        📋
                      </div>

                      <span className="modern-card-label">
                        TRACK PROGRESS
                      </span>

                      <h3>My Complaints</h3>

                      <p>
                        View your submitted complaints
                        and check their latest status.
                      </p>

                      <div className="modern-card-link">
                        View Complaints <span>→</span>
                      </div>

                    </Link>

                  </>
                )}


                {/* STAFF CARD */}

                {isStaff && (
                  <Link
                    to="/staff-complaints"
                    className="modern-dashboard-card"
                  >

                    <div className="modern-card-icon icon-orange">
                      🛠️
                    </div>

                    <span className="modern-card-label">
                      STAFF WORKSPACE
                    </span>

                    <h3>Assigned Complaints</h3>

                    <p>
                      Review assigned complaints and
                      update their resolution status.
                    </p>

                    <div className="modern-card-link">
                      View Assigned <span>→</span>
                    </div>

                  </Link>
                )}


                {/* ADMIN CARDS */}

                {isAdmin && (
                  <>

                    <Link
                      to="/admin-complaints"
                      className="modern-dashboard-card"
                    >

                      <div className="modern-card-icon icon-purple">
                        ⚙️
                      </div>

                      <span className="modern-card-label">
                        ADMIN WORKSPACE
                      </span>

                      <h3>Manage Complaints</h3>

                      <p>
                        Review complaints, assign staff
                        and manage their progress.
                      </p>

                      <div className="modern-card-link">
                        Manage Now <span>→</span>
                      </div>

                    </Link>


                    <Link
                      to="/analytics"
                      className="modern-dashboard-card"
                    >

                      <div className="modern-card-icon icon-green">
                        📊
                      </div>

                      <span className="modern-card-label">
                        PERFORMANCE OVERVIEW
                      </span>

                      <h3>Analytics</h3>

                      <p>
                        Explore complaint statistics
                        and resolution progress.
                      </p>

                      <div className="modern-card-link">
                        View Analytics <span>→</span>
                      </div>

                    </Link>

                  </>
                )}

              </div>

            </section>

          </>

        ) : (

          <section className="dashboard-no-user">
            <div>🔐</div>
            <h2>No user is logged in.</h2>
            <p>Please login to access your dashboard.</p>

            <Link to="/login" className="dashboard-hero-button">
              Go to Login →
            </Link>
          </section>

        )}

      </main>


      {/* FOOTER */}

      <footer className="dashboard-footer">

        <div>
          <strong>CampusCare</strong>
          <p>SMART CAMPUS SOLUTIONS</p>
        </div>

        <span>
          Report. Resolve. Improve. ❤️
        </span>

      </footer>

    </div>
  );
}

export default Dashboard;