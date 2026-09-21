import React from "react";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user && user.role === "admin";
  const isStaff = user && user.role === "staff";

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-page">

      {/* Navigation */}
      <nav className="main-nav">
        <div className="brand">
          <div className="brand-icon">🏫</div>

          <div>
            <h2>AI-Powered Complaint System</h2>
            <p>Your Voice, A Better Campus</p>
          </div>
        </div>

        <div className="nav-links">

          <a href="/dashboard" className="nav-link active">
            Dashboard
          </a>

          {user && user.role === "student" && (
            <>
              <a href="/complaint" className="nav-link">
                Submit Complaint
              </a>

              <a href="/my-complaints" className="nav-link">
                My Complaints
              </a>
            </>
          )}

          {isStaff && (
            <a href="/staff-complaints" className="nav-link">
              Staff Complaints
            </a>
          )}

          {isAdmin && (
            <>
              <a href="/admin-complaints" className="nav-link">
                Admin Complaints
              </a>

              <a href="/analytics" className="nav-link">
                Analytics
              </a>
            </>
          )}

          <button className="nav-logout" onClick={logout}>
            Logout
          </button>

        </div>
      </nav>


      <div className="dashboard-container">

        {/* Hero */}
        <section className="hero-section">
          <div>
            <p className="hero-label">WELCOME TO</p>

            <h1>
              Your Voice <span>Matters</span>
            </h1>

            <p>
              Report issues, track progress, and help us build
              a better campus together.
            </p>
          </div>

          <div className="hero-emoji">
            🏫
          </div>
        </section>


        {user ? (
          <>
            {/* Welcome Card */}
            <div className="welcome-card">

              <div className="profile-icon">
                👤
              </div>

              <div className="profile-info">

                <p className="welcome-label">
                  WELCOME BACK
                </p>

                <h2>
                  {user.name}
                </h2>

                <p>
                  {user.email}
                </p>

                <p className="profile-role">
                  🎓 Role: {user.role}
                </p>

              </div>

              <div className="welcome-message">
                <p>
                  “Good ideas start with open conversations.”
                </p>
              </div>

            </div>


            {/* Quick Actions */}
            <div className="dashboard-section">

              <h2>
                Quick Actions
              </h2>

              <p className="section-subtitle">
                Choose an option to get started
              </p>


              <div className="dashboard-cards">

                {/* Student */}
                {user.role === "student" && (
                  <>
                    <a
                      href="/complaint"
                      className="dashboard-card student-card"
                    >
                      <div className="card-icon">
                        📝
                      </div>

                      <h3>
                        Submit Complaint
                      </h3>

                      <p>
                        Report a new issue or problem
                        to the college.
                      </p>

                      <span className="card-button">
                        Submit Now →
                      </span>
                    </a>


                    <a
                      href="/my-complaints"
                      className="dashboard-card complaints-card"
                    >
                      <div className="card-icon">
                        📋
                      </div>

                      <h3>
                        My Complaints
                      </h3>

                      <p>
                        Track your submitted complaints
                        and their status.
                      </p>

                      <span className="card-button">
                        View Complaints →
                      </span>
                    </a>
                  </>
                )}


                {/* Staff */}
                {isStaff && (
                  <a
                    href="/staff-complaints"
                    className="dashboard-card"
                  >
                    <div className="card-icon">
                      🛠️
                    </div>

                    <h3>
                      Staff Complaints
                    </h3>

                    <p>
                      View assigned complaints and
                      update their status.
                    </p>

                    <span className="card-button">
                      View Assigned →
                    </span>
                  </a>
                )}


                {/* Admin */}
                {isAdmin && (
                  <>
                    <a
                      href="/admin-complaints"
                      className="dashboard-card"
                    >
                      <div className="card-icon">
                        ⚙️
                      </div>

                      <h3>
                        Admin Complaints
                      </h3>

                      <p>
                        Manage complaints and assign
                        them to staff.
                      </p>

                      <span className="card-button">
                        Manage Complaints →
                      </span>
                    </a>


                    <a
                      href="/analytics"
                      className="dashboard-card"
                    >
                      <div className="card-icon">
                        📊
                      </div>

                      <h3>
                        Analytics
                      </h3>

                      <p>
                        View complaint statistics
                        and resolution progress.
                      </p>

                      <span className="card-button">
                        View Analytics →
                      </span>
                    </a>
                  </>
                )}

              </div>
            </div>

          </>
        ) : (

          /* No User */
          <div className="welcome-card">

            <h2>
              No user is logged in.
            </h2>

            <a
              href="/login"
              className="primary-button"
            >
              Go to Login
            </a>

          </div>

        )}

      </div>


      {/* Footer */}
      <footer className="main-footer">

        <strong>
          AI-Powered Complaint System
        </strong>

        <span>
          Report &nbsp; | &nbsp; Resolve &nbsp; | &nbsp; Improve ❤️
        </span>

      </footer>

    </div>
  );
}

export default Dashboard;