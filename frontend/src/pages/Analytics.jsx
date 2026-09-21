import React, { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/complaints")
      .then((response) => {
        console.log("Analytics response:", response.data);

        const data = response.data;

        if (Array.isArray(data)) {
          setComplaints(data);
        } else if (Array.isArray(data.complaints)) {
          setComplaints(data.complaints);
        } else {
          setComplaints([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading analytics:", error);
        setComplaints([]);
        setLoading(false);
      });
  }, []);

  const total = complaints.length;

  const pending = complaints.filter(
    (complaint) => complaint.status === "pending"
  ).length;

  const inProgress = complaints.filter(
    (complaint) => complaint.status === "in_progress"
  ).length;

  const resolved = complaints.filter(
    (complaint) => complaint.status === "resolved"
  ).length;

  const highPriority = complaints.filter(
    (complaint) => complaint.priority === "high"
  ).length;

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">
          <div className="analytics-header">
            <p className="hero-label">ADMIN ANALYTICS</p>
            <h1>Loading Analytics...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

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
          <a href="/dashboard" className="nav-link">
            Dashboard
          </a>

          <a href="/admin-complaints" className="nav-link">
            Admin Complaints
          </a>

          <a href="/analytics" className="nav-link active">
            Analytics
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="analytics-container">

        <div className="analytics-header">
          <p className="hero-label">ADMIN ANALYTICS</p>

          <h1>
            Complaint <span>Overview 📊</span>
          </h1>

          <p>
            Monitor complaint activity and resolution progress.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="analytics-cards">

          <div className="analytics-card">
            <div className="analytics-icon">📋</div>
            <h3>Total Complaints</h3>
            <strong>{total}</strong>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">⏳</div>
            <h3>Pending</h3>
            <strong>{pending}</strong>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">🔄</div>
            <h3>In Progress</h3>
            <strong>{inProgress}</strong>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">✅</div>
            <h3>Resolved</h3>
            <strong>{resolved}</strong>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">🚨</div>
            <h3>High Priority</h3>
            <strong>{highPriority}</strong>
          </div>

        </div>

        {/* Complaint Details */}
        <div className="analytics-table-card">

          <h2>Complaint Details</h2>

          {complaints.length === 0 ? (
            <div className="analytics-empty">
              <div>📭</div>
              <p>No complaints available.</p>
            </div>
          ) : (
            <div className="analytics-table-wrapper">

              <table className="analytics-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>

                      <td>
                        #{complaint.id}
                      </td>

                      <td>
                        {complaint.title}
                      </td>

                      <td>
                        {complaint.category}
                      </td>

                      <td>
                        {complaint.priority}
                      </td>

                      <td>
                        <span
                          className={`analytics-status analytics-${complaint.status}`}
                        >
                          {complaint.status?.replace("_", " ")}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <footer className="main-footer">
        <strong>AI-Powered Complaint System</strong>

        <span>
          Report &nbsp; | &nbsp; Resolve &nbsp; | &nbsp; Improve ❤️
        </span>
      </footer>

    </div>
  );
}

export default Analytics;