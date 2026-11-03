import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [complaintImages, setComplaintImages] = useState({});
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  // LOAD COMPLAINTS
  const loadComplaints = () => {
    api.get("/complaints")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.complaints || [];

        setComplaints(data);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to load complaints.");
      })
      .finally(() => setLoading(false));
  };

  // LOAD STAFF
  const loadStaff = () => {
    api.get("/staff")
      .then((response) => {
        setStaffMembers(
          Array.isArray(response.data) ? response.data : []
        );
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to load staff members.");
      });
  };

  useEffect(() => {
    loadComplaints();
    loadStaff();
  }, []);

  // LOAD COMPLAINT IMAGES
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

  // SEARCH AND FILTER
  useEffect(() => {
    let result = [...complaints];

    const searchText = search.toLowerCase().trim();

    if (searchText) {
      result = result.filter((complaint) =>
        `${complaint.title} ${complaint.description} ${complaint.category}`
          .toLowerCase()
          .includes(searchText)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (complaint) => complaint.status === statusFilter
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (complaint) => complaint.category === categoryFilter
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter(
        (complaint) => complaint.priority === priorityFilter
      );
    }

    setFilteredComplaints(result);
  }, [
    complaints,
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
  ]);

  // STATISTICS
  const totalComplaints = complaints.length;

  const pendingCount = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const progressCount = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  // UPDATE STATUS
  const updateStatus = (complaintId, status) => {
    api.put(`/complaints/${complaintId}/status`, { status })
      .then(() => {
        setMessage("Complaint status updated successfully.");
        loadComplaints();
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to update complaint status.");
      });
  };

  // SELECT STAFF
  const handleStaffChange = (complaintId, staffId) => {
    setSelectedStaff((previous) => ({
      ...previous,
      [complaintId]: staffId,
    }));
  };

  // ASSIGN COMPLAINT
  const assignComplaint = (complaintId) => {
    const staffId = selectedStaff[complaintId];

    if (!staffId) {
      setMessage("Please select a staff member first.");
      return;
    }

    api.post(`/complaints/${complaintId}/assign`, {
      staff_id: Number(staffId),
    })
      .then((response) => {
        if (response.data.error) {
          setMessage(response.data.error);
          return;
        }

        setMessage("Complaint assigned successfully! 🎉");

        setSelectedStaff((previous) => ({
          ...previous,
          [complaintId]: "",
        }));

        loadComplaints();
      })
      .catch((error) => {
        console.error(error);
        setMessage("Unable to assign complaint.");
      });
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  // CATEGORIES
  const categories = [
    ...new Set(
      complaints.map((c) => c.category).filter(Boolean)
    ),
  ];

  return (
    <div className="ca-admin-page">

      {/* NAVIGATION */}
      <nav className="ca-admin-nav">

        <Link to="/dashboard" className="ca-admin-brand">
          <span className="ca-brand-icon">🎓</span>
          <span>Campus<span>Care</span></span>
        </Link>

        <div className="ca-admin-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/admin-complaints" className="active">
            Complaints
          </Link>
          <Link to="/analytics">Analytics</Link>
        </div>

        <div className="ca-admin-profile">
          <span>🛡️</span>
          <div>
            <strong>Administrator</strong>
            <small>Management Panel</small>
          </div>
        </div>

      </nav>

      <main className="ca-admin-container">

        {/* PAGE HEADING */}
        <section className="ca-admin-heading">

          <div>
            <span className="ca-admin-eyebrow">
              CAMPUSCARE • ADMINISTRATION
            </span>

            <h1>Complaint <span>Management</span></h1>

            <p>
              Monitor student concerns, manage assignments
              and keep campus operations running smoothly.
            </p>
          </div>

          <div className="ca-admin-heading-icon">
            🛠️
          </div>

        </section>

        {/* STATISTICS */}
        <section className="ca-admin-stats">

          <div className="ca-stat-card">
            <div className="ca-stat-icon purple">📋</div>
            <div>
              <p>Total Complaints</p>
              <h2>{totalComplaints}</h2>
              <small>All submitted complaints</small>
            </div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-icon orange">⏳</div>
            <div>
              <p>Pending</p>
              <h2>{pendingCount}</h2>
              <small>Awaiting attention</small>
            </div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-icon blue">⚙️</div>
            <div>
              <p>In Progress</p>
              <h2>{progressCount}</h2>
              <small>Currently being handled</small>
            </div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-icon green">✓</div>
            <div>
              <p>Resolved</p>
              <h2>{resolvedCount}</h2>
              <small>Successfully completed</small>
            </div>
          </div>

        </section>

        {/* FILTER SECTION */}
        <section className="ca-filter-card">

          <div className="ca-filter-heading">
            <div>
              <span>🔎</span>
              <div>
                <h2>Find Complaints</h2>
                <p>Search and filter submitted complaints.</p>
              </div>
            </div>

            <button onClick={clearFilters}>
              ↻ Clear Filters
            </button>
          </div>

          <div className="ca-filter-grid">

            <div className="ca-filter-group">
              <label>Search complaints</label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="ca-filter-group">
              <label>Status</label>
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

            <div className="ca-filter-group">
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="ca-filter-group">
              <label>Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

          </div>

          <div className="ca-filter-results">
            Showing <strong>{filteredComplaints.length}</strong> of{" "}
            <strong>{totalComplaints}</strong> complaints
          </div>

        </section>

        {/* NOTIFICATION */}
        {message && (
          <div className="ca-admin-message">
            <span>ℹ️</span>
            {message}
            <button onClick={() => setMessage("")}>✕</button>
          </div>
        )}

        {/* COMPLAINT LIST */}
        <section className="ca-complaints-section">

          <div className="ca-list-heading">
            <div>
              <span className="ca-admin-eyebrow">
                COMPLAINT RECORDS
              </span>
              <h2>All Complaints</h2>
            </div>

            <span className="ca-record-count">
              {filteredComplaints.length} Records
            </span>
          </div>

          {loading ? (

            <div className="ca-empty-state">
              <div>⏳</div>
              <h2>Loading complaints...</h2>
            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="ca-empty-state">
              <div>📭</div>
              <h2>No complaints found</h2>
              <p>Try changing your search or filter settings.</p>
            </div>

          ) : (

            <div className="ca-complaint-list">

              {filteredComplaints.map((complaint) => (

                <article className="ca-complaint-card" key={complaint.id}>

                  {/* CARD HEADER */}
                  <div className="ca-card-top">

                    <span className="ca-complaint-id">
                      COMPLAINT #{complaint.id}
                    </span>

                    <span className={`ca-status-badge ${complaint.status}`}>
                      {complaint.status === "in_progress"
                        ? "In Progress"
                        : complaint.status}
                    </span>

                  </div>

                  {/* TITLE AND STUDENT */}
                  <div className="ca-card-title">
                    <h3>{complaint.title}</h3>
                    <span>👤 Student #{complaint.user_id}</span>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="ca-card-description">
                    {complaint.description}
                  </p>

                  {/* IMAGE */}
                  {complaint.image_file_id && (
                    <div className="ca-card-image-section">

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
                            className="ca-complaint-image"
                          />
                        </a>
                      ) : (
                        <p>Loading image...</p>
                      )}

                    </div>
                  )}

                  {/* DETAILS */}
                  <div className="ca-card-details">

                    <span>📁 {complaint.category}</span>

                    <span className={`ca-priority ${complaint.priority}`}>
                      ⚡ {complaint.priority} priority
                    </span>

                  </div>

                  {/* ACTIONS */}
                  <div className="ca-card-actions">

                    <div className="ca-action-group">
                      <label>Update Status</label>

                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          updateStatus(complaint.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="ca-action-group">
                      <label>Assign Staff Member</label>

                      <select
                        value={selectedStaff[complaint.id] || ""}
                        onChange={(e) =>
                          handleStaffChange(complaint.id, e.target.value)
                        }
                      >
                        <option value="">Select Staff</option>

                        {staffMembers.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="ca-assign-button"
                      onClick={() => assignComplaint(complaint.id)}
                    >
                      👤 Assign Complaint
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        <Link to="/dashboard" className="ca-bottom-back">
          ← Back to Dashboard
        </Link>

      </main>

      <footer className="ca-admin-footer">
        <strong>CampusCare</strong>
        <span>AI-Powered Complaint Management System</span>
        <span>Admin Dashboard</span>
      </footer>

    </div>
  );
}

export default AdminComplaints;