import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [complaintImages, setComplaintImages] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // FETCH ASSIGNED COMPLAINTS
  useEffect(() => {
    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/staff/${user.id}/complaints`
        );

        if (response.data.error) {
          setMessage(response.data.error);
          return;
        }

        setComplaints(response.data.complaints || []);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load assigned complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // FETCH COMPLAINT IMAGES
  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadImages = async () => {
      const complaintsWithImages = complaints.filter(
        (complaint) => complaint.image_file_id
      );

      const results = await Promise.all(
        complaintsWithImages.map(async (complaint) => {
          try {
            const response = await api.get(
              `/complaints/${complaint.id}/image`,
              { responseType: "blob" }
            );

            const imageUrl = URL.createObjectURL(response.data);
            objectUrls.push(imageUrl);

            return [complaint.id, imageUrl];
          } catch (error) {
            console.error(
              `Unable to load image for complaint ${complaint.id}:`,
              error
            );

            return [complaint.id, null];
          }
        })
      );

      if (active) {
        setComplaintImages(Object.fromEntries(results));
      }
    };

    loadImages();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [complaints]);

  // UPDATE COMPLAINT STATUS
  const updateStatus = async (complaintId, newStatus) => {
    try {
      const response = await api.put(
        `/complaints/${complaintId}/status`,
        { status: newStatus }
      );

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      setMessage("Complaint status updated successfully! 🎉");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update complaint status.");
    }
  };

  // STATISTICS
  const totalCount = complaints.length;

  const pendingCount = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const progressCount = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  // SEARCH AND FILTER
  const filteredComplaints = complaints.filter((complaint) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      `${complaint.title} ${complaint.description} ${complaint.category} ${complaint.user_name || ""}`
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <div className="cs-staff-page">

      {/* NAVIGATION */}
      <nav className="cs-staff-nav">

        <Link to="/dashboard" className="cs-staff-brand">
          <span className="cs-brand-icon">🎓</span>
          <span>Campus<span>Care</span></span>
        </Link>

        <div className="cs-staff-nav-links">
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/staff-complaints" className="active">
            Staff Complaints
          </Link>
        </div>

        <div className="cs-staff-profile">
          <span>🛠️</span>
          <div>
            <strong>Staff Workspace</strong>
            <small>Complaint Management</small>
          </div>
        </div>

      </nav>

      <main className="cs-staff-container">

        {/* PAGE HEADER */}
        <section className="cs-staff-heading">

          <div>
            <span className="cs-staff-eyebrow">
              CAMPUSCARE • STAFF WORKSPACE
            </span>

            <h1>
              Assigned <span>Complaints</span>
            </h1>

            <p>
              Review student concerns, manage your assigned
              tasks and keep complaints moving towards resolution.
            </p>
          </div>

          <div className="cs-staff-heading-icon">
            🛠️
          </div>

        </section>

        {/* STATISTICS */}
        <section className="cs-staff-stats">

          <div className="cs-staff-stat-card">
            <div className="cs-staff-stat-icon purple">📋</div>
            <div>
              <p>Total Assigned</p>
              <h2>{totalCount}</h2>
              <small>Your assigned complaints</small>
            </div>
          </div>

          <div className="cs-staff-stat-card">
            <div className="cs-staff-stat-icon orange">⏳</div>
            <div>
              <p>Pending</p>
              <h2>{pendingCount}</h2>
              <small>Awaiting action</small>
            </div>
          </div>

          <div className="cs-staff-stat-card">
            <div className="cs-staff-stat-icon blue">⚙️</div>
            <div>
              <p>In Progress</p>
              <h2>{progressCount}</h2>
              <small>Currently handling</small>
            </div>
          </div>

          <div className="cs-staff-stat-card">
            <div className="cs-staff-stat-icon green">✓</div>
            <div>
              <p>Resolved</p>
              <h2>{resolvedCount}</h2>
              <small>Successfully completed</small>
            </div>
          </div>

        </section>

        {/* NOTIFICATION */}
        {message && (
          <div className="cs-staff-message">
            <span>ℹ️</span>
            {message}
            <button onClick={() => setMessage("")}>✕</button>
          </div>
        )}

        {/* FILTER SECTION */}
        <section className="cs-staff-filter-card">

          <div className="cs-staff-filter-heading">
            <div>
              <span className="cs-filter-icon">🔎</span>
              <div>
                <h2>Find Assigned Complaints</h2>
                <p>Search and filter your assigned tasks.</p>
              </div>
            </div>

            <button onClick={clearFilters}>
              ↻ Clear Filters
            </button>
          </div>

          <div className="cs-staff-filter-grid">

            <div className="cs-staff-filter-group">
              <label>Search complaints</label>

              <input
                type="text"
                placeholder="Search by title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="cs-staff-filter-group">
              <label>Complaint status</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

          </div>

          <div className="cs-staff-filter-results">
            Showing <strong>{filteredComplaints.length}</strong> of{" "}
            <strong>{totalCount}</strong> assigned complaints
          </div>

        </section>

        {/* COMPLAINT LIST */}
        <section className="cs-staff-list-section">

          <div className="cs-staff-list-heading">
            <div>
              <span className="cs-staff-eyebrow">
                YOUR WORKSPACE
              </span>
              <h2>My Assigned Tasks</h2>
            </div>

            <span className="cs-staff-record-count">
              {filteredComplaints.length} Records
            </span>
          </div>

          {loading ? (

            <div className="cs-staff-empty">
              <div>⏳</div>
              <h2>Loading assigned complaints...</h2>
            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="cs-staff-empty">
              <div>📭</div>
              <h2>No complaints found</h2>
              <p>
                You currently have no matching assigned complaints.
              </p>
            </div>

          ) : (

            <div className="cs-staff-complaint-list">

              {filteredComplaints.map((complaint) => (

                <article
                  className="cs-staff-complaint-card"
                  key={complaint.id}
                >

                  {/* CARD HEADER */}
                  <div className="cs-staff-card-top">

                    <span className="cs-staff-complaint-id">
                      COMPLAINT #{complaint.id}
                    </span>

                    <span
                      className={`cs-staff-status ${complaint.status}`}
                    >
                      {complaint.status === "in_progress"
                        ? "In Progress"
                        : complaint.status}
                    </span>

                  </div>

                  {/* TITLE */}
                  <h3>{complaint.title}</h3>

                  {/* STUDENT INFORMATION */}
                  <div className="cs-staff-student-info">

                    <div>
                      <span>Submitted By</span>
                      <strong>
                        👤 {complaint.user_name || "Student"}
                      </strong>
                    </div>

                    <div>
                      <span>Email Address</span>
                      <strong>
                        {complaint.user_email || "Not available"}
                      </strong>
                    </div>

                  </div>

                  {/* DESCRIPTION */}
                  <p className="cs-staff-description">
                    {complaint.description}
                  </p>

                  {/* IMAGE */}
                  {complaint.image_file_id && (
                    <div className="cs-staff-image-section">

                      <h4>📷 Complaint Attachment</h4>

                      {complaintImages[complaint.id] ? (
                        <a
                          href={complaintImages[complaint.id]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={complaintImages[complaint.id]}
                            alt={`Complaint ${complaint.id}`}
                            className="cs-staff-complaint-image"
                          />
                        </a>
                      ) : (
                        <p>Loading image...</p>
                      )}

                    </div>
                  )}

                  {/* DETAILS */}
                  <div className="cs-staff-details">

                    <div>
                      <span>Category</span>
                      <strong>📁 {complaint.category}</strong>
                    </div>

                    <div>
                      <span>Priority</span>
                      <strong className={`cs-staff-priority ${complaint.priority}`}>
                        ⚡ {complaint.priority}
                      </strong>
                    </div>

                    <div className="cs-staff-status-control">
                      <label htmlFor={`status-${complaint.id}`}>
                        Update Status
                      </label>

                      <select
                        id={`status-${complaint.id}`}
                        value={complaint.status}
                        onChange={(event) =>
                          updateStatus(
                            complaint.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        <Link to="/dashboard" className="cs-staff-back">
          ← Back to Dashboard
        </Link>

      </main>

      <footer className="cs-staff-footer">
        <strong>CampusCare</strong>
        <span>AI-Powered Complaint Management System</span>
        <span>Staff Workspace</span>
      </footer>

    </div>
  );
}

export default StaffComplaints;