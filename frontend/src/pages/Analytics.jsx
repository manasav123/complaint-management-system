import React, { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/complaints")
      .then((response) => {
        const data = response.data;

        setComplaints(
          Array.isArray(data)
            ? data
            : data.complaints || []
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error("Analytics error:", error);
        setComplaints([]);
        setLoading(false);
      });
  }, []);

  // STATISTICS

  const total = complaints.length;

  const pending = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  const highPriority = complaints.filter(
    (c) => c.priority === "high"
  ).length;

  // PERCENTAGES

  const resolvedPercentage = total
    ? Math.round((resolved / total) * 100)
    : 0;

  const pendingPercentage = total
    ? Math.round((pending / total) * 100)
    : 0;

  const progressPercentage = total
    ? Math.round((inProgress / total) * 100)
    : 0;

  const highPercentage = total
    ? Math.round((highPriority / total) * 100)
    : 0;

  // CATEGORY ANALYSIS

  const categoryCounts = {};

  complaints.forEach((complaint) => {
    const category = complaint.category || "Other";

    categoryCounts[category] =
      (categoryCounts[category] || 0) + 1;
  });

  const categoryEntries = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  const topCategory = categoryEntries.length
    ? categoryEntries[0][0]
    : "No category";

  // LOADING

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-loader"></div>
        <h2>Preparing your analytics...</h2>
        <p>Loading complaint statistics</p>
      </div>
    );
  }

  return (
    <div className="campus-analytics">

      {/* NAVBAR */}

      <nav className="analytics-nav">

        <a href="/dashboard" className="analytics-brand">
          <span className="analytics-brand-icon">🏛️</span>

          <span>
            <strong>CampusCare</strong>
            <small>SMART CAMPUS SOLUTIONS</small>
          </span>
        </a>

        <div className="analytics-nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/admin-complaints">Complaints</a>
          <a href="/analytics" className="selected">
            Analytics
          </a>
        </div>

      </nav>

      <main className="analytics-main">

        {/* PAGE HEADER */}

        <section className="analytics-hero">

          <div>
            <span className="analytics-eyebrow">
              CAMPUSCARE • ADMIN INSIGHTS
            </span>

            <h1>
              Analytics <span>Overview.</span>
            </h1>

            <p>
              Understand complaint activity, monitor performance
              and discover areas that need attention.
            </p>
          </div>

          <div className="analytics-hero-icon">
            📊
          </div>

        </section>

        {/* STATISTICS */}

        <section className="analytics-stats-grid">

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon purple">
              📋
            </div>
            <p>Total Complaints</p>
            <h2>{total}</h2>
            <span>All submitted complaints</span>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon orange">
              ⏳
            </div>
            <p>Pending</p>
            <h2>{pending}</h2>
            <span>{pendingPercentage}% of total complaints</span>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon blue">
              ⚙️
            </div>
            <p>In Progress</p>
            <h2>{inProgress}</h2>
            <span>{progressPercentage}% currently being handled</span>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon green">
              ✓
            </div>
            <p>Resolved</p>
            <h2>{resolved}</h2>
            <span>{resolvedPercentage}% resolution rate</span>
          </div>

        </section>

        {/* CHARTS */}

        <section className="analytics-chart-grid">

          {/* STATUS CHART */}

          <div className="analytics-panel">

            <div className="analytics-panel-heading">
              <div>
                <span>COMPLAINT STATUS</span>
                <h2>Resolution Overview</h2>
              </div>

              <div className="analytics-panel-icon">
                📈
              </div>
            </div>

            <div className="analytics-status-chart">

              <div
                className="analytics-donut"
                style={{
                  background: `conic-gradient(
                    #20b982 0% ${resolvedPercentage}%,
                    #5685f5 ${resolvedPercentage}% ${resolvedPercentage + progressPercentage}%,
                    #f5a742 ${resolvedPercentage + progressPercentage}% 100%
                  )`
                }}
              >

                <div className="analytics-donut-inner">
                  <strong>{total}</strong>
                  <span>Complaints</span>
                </div>

              </div>

              <div className="analytics-legend">

                <div>
                  <span className="legend-dot green-dot"></span>
                  <span>Resolved</span>
                  <strong>{resolved}</strong>
                </div>

                <div>
                  <span className="legend-dot blue-dot"></span>
                  <span>In Progress</span>
                  <strong>{inProgress}</strong>
                </div>

                <div>
                  <span className="legend-dot orange-dot"></span>
                  <span>Pending</span>
                  <strong>{pending}</strong>
                </div>

              </div>

            </div>

          </div>

          {/* PRIORITY PANEL */}

          <div className="analytics-panel">

            <div className="analytics-panel-heading">
              <div>
                <span>PRIORITY ANALYSIS</span>
                <h2>Complaint Priorities</h2>
              </div>

              <div className="analytics-panel-icon">
                🚨
              </div>
            </div>

            <div className="priority-highlight">

              <div>
                <p>High Priority Complaints</p>
                <h2>{highPriority}</h2>
                <span>Require special attention</span>
              </div>

              <div className="priority-percentage">
                {highPercentage}%
              </div>

            </div>

            <div className="priority-progress-track">
              <div
                className="priority-progress-fill"
                style={{ width: `${highPercentage}%` }}
              ></div>
            </div>

            <p className="priority-note">
              {highPriority} out of {total} complaints
              are marked as high priority.
            </p>

          </div>

        </section>

        {/* CATEGORY ANALYSIS */}

        <section className="analytics-panel category-panel">

          <div className="analytics-panel-heading">
            <div>
              <span>CATEGORY BREAKDOWN</span>
              <h2>Most Reported Issues</h2>
            </div>

            <div className="analytics-panel-icon">
              📂
            </div>
          </div>

          {categoryEntries.length === 0 ? (

            <div className="analytics-no-data">
              No category data available.
            </div>

          ) : (

            <div className="category-bars">

              {categoryEntries.map(([category, count]) => {

                const percentage = total
                  ? Math.round((count / total) * 100)
                  : 0;

                return (
                  <div
                    className="category-bar-item"
                    key={category}
                  >

                    <div className="category-bar-heading">
                      <strong>{category}</strong>

                      <span>
                        {count} complaints ({percentage}%)
                      </span>
                    </div>

                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                  </div>
                );

              })}

            </div>

          )}

        </section>

        {/* INSIGHTS */}

        <section className="analytics-insights">

          <div className="analytics-insights-header">

            <div className="analytics-stat-icon purple">
              ✨
            </div>

            <div>
              <span>RULE-BASED DATA INSIGHTS</span>
              <h2>Complaint Insights</h2>
            </div>

          </div>

          <div className="analytics-insight-grid">

            <div className="analytics-insight-card">
              <span>📌</span>
              <p>Most Reported Category</p>
              <h3>{topCategory}</h3>
              <small>
                Category with the most complaints
              </small>
            </div>

            <div className="analytics-insight-card">
              <span>✅</span>
              <p>Resolution Rate</p>
              <h3>{resolvedPercentage}%</h3>
              <small>
                {resolved} complaints resolved
              </small>
            </div>

            <div className="analytics-insight-card">
              <span>⏳</span>
              <p>Awaiting Attention</p>
              <h3>{pending}</h3>
              <small>
                Complaints still pending
              </small>
            </div>

          </div>

        </section>

        {/* COMPLAINT RECORDS */}

        <section className="analytics-panel records-panel">

          <div className="analytics-panel-heading">

            <div>
              <span>COMPLAINT DATABASE</span>
              <h2>Recent Complaint Records</h2>
            </div>

            <span className="records-count">
              {total} Records
            </span>

          </div>

          {complaints.length === 0 ? (

            <div className="analytics-no-data">
              No complaints available.
            </div>

          ) : (

            <div className="analytics-table-scroll">

              <table className="analytics-records-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Complaint</th>
                    <th>Student Email</th>
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

                      <td className="record-title">
                        {complaint.title}
                      </td>

                      {/* STUDENT EMAIL */}

                      <td className="record-email">
                        📧 {complaint.user_email || "Email unavailable"}
                      </td>

                      <td>
                        {complaint.category}
                      </td>

                      <td>
                        <span
                          className={`record-priority ${complaint.priority}`}
                        >
                          {complaint.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`record-status ${complaint.status}`}
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

        </section>

      </main>

      {/* FOOTER */}

      <footer className="analytics-footer">
        <strong>CampusCare</strong>
        <span>Report. Resolve. Improve. 💜</span>
      </footer>

    </div>
  );
}

export default Analytics;