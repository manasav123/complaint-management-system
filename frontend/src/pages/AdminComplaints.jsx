import React, { useEffect, useState } from "react";
import api from "../services/api";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // ---------------------------------------------------------
  // LOAD COMPLAINTS
  // ---------------------------------------------------------

  const loadComplaints = () => {
    api
      .get("/complaints")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.complaints || [];

        setComplaints(data);
        setFilteredComplaints(data);
      })
      .catch((error) => {
        console.error("Error loading complaints:", error);
        setMessage("Unable to load complaints.");
      });
  };

  // ---------------------------------------------------------
  // LOAD STAFF MEMBERS
  // ---------------------------------------------------------

  const loadStaff = () => {
    api
      .get("/staff")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setStaffMembers(data);
      })
      .catch((error) => {
        console.error("Error loading staff:", error);
        setMessage("Unable to load staff members.");
      });
  };

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    loadComplaints();
    loadStaff();
  }, []);

  // ---------------------------------------------------------
  // SEARCH + FILTER
  // ---------------------------------------------------------

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
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
    complaints,
  ]);

  // ---------------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------------

  const updateStatus = (complaintId, status) => {
    api
      .put(`/complaints/${complaintId}/status`, {
        status: status,
      })
      .then(() => {
        setMessage("Complaint status updated successfully.");
        loadComplaints();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        setMessage("Unable to update complaint status.");
      });
  };

  // ---------------------------------------------------------
  // SELECT STAFF
  // ---------------------------------------------------------

  const handleStaffChange = (complaintId, staffId) => {
    setSelectedStaff((previous) => ({
      ...previous,
      [complaintId]: staffId,
    }));
  };

  // ---------------------------------------------------------
  // ASSIGN COMPLAINT
  // ---------------------------------------------------------

  const assignComplaint = (complaintId) => {
    const staffId = selectedStaff[complaintId];

    if (!staffId) {
      setMessage("Please select a staff member first.");
      return;
    }

    api
      .post(`/complaints/${complaintId}/assign`, {
        staff_id: Number(staffId),
      })
      .then((response) => {
        if (response.data.error) {
          setMessage(response.data.error);
          return;
        }

        setMessage("Complaint assigned to staff successfully.");

        setSelectedStaff((previous) => ({
          ...previous,
          [complaintId]: "",
        }));

        loadComplaints();
      })
      .catch((error) => {
        console.error("Error assigning complaint:", error);
        setMessage("Unable to assign complaint.");
      });
  };

  // ---------------------------------------------------------
  // CLEAR FILTERS
  // ---------------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  // ---------------------------------------------------------
  // GET CATEGORIES
  // ---------------------------------------------------------

  const categories = [
    ...new Set(
      complaints
        .map((complaint) => complaint.category)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="admin-page">

      {/* ---------------------------------------------------
          NAVBAR
      --------------------------------------------------- */}

      <nav className="main-nav">

        <div className="nav-brand">
          <span className="nav-logo">🎓</span>
          <span>Complaint Management System</span>
        </div>

        <div className="nav-links">

          <a href="/dashboard">
            Dashboard
          </a>

          <a href="/admin-complaints" className="active">
            Admin Complaints
          </a>

          <a href="/analytics">
            Analytics
          </a>

        </div>

      </nav>

      {/* ---------------------------------------------------
          MAIN CONTENT
      --------------------------------------------------- */}

      <div className="admin-container">

        <div className="admin-header">

          <div>
            <p className="page-eyebrow">
              ADMIN PANEL
            </p>

            <h1>
              Complaint Management
            </h1>

            <p>
              Review, filter, assign and manage student complaints.
            </p>
          </div>

          <div className="admin-header-icon">
            🛠️
          </div>

        </div>

        {/* -------------------------------------------------
            FILTER CARD
        ------------------------------------------------- */}

        <div className="filter-card">

          <div className="filter-title">
            <span>🔎</span>
            Search & Filter Complaints
          </div>

          <div className="filter-grid">

            {/* SEARCH */}

            <div className="filter-group search-group">

              <label>
                Search
              </label>

              <input
                type="text"
                placeholder="Search complaints..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            {/* STATUS */}

            <div className="filter-group">

              <label>
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >

                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

              </select>

            </div>

            {/* CATEGORY */}

            <div className="filter-group">

              <label>
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >

                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>

            {/* PRIORITY */}

            <div className="filter-group">

              <label>
                Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
              >

                <option value="all">
                  All Priorities
                </option>

                <option value="high">
                  High
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="low">
                  Low
                </option>

              </select>

            </div>

          </div>

          <div className="filter-bottom">

            <div className="filter-result">
              Showing{" "}
              <strong>
                {filteredComplaints.length}
              </strong>{" "}
              of{" "}
              <strong>
                {complaints.length}
              </strong>{" "}
              complaints
            </div>

            <button
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        </div>

        {/* -------------------------------------------------
            MESSAGE
        ------------------------------------------------- */}

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* -------------------------------------------------
            COMPLAINT LIST
        ------------------------------------------------- */}

        <div className="admin-list">

          {filteredComplaints.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                📭
              </div>

              <h2>
                No complaints found
              </h2>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          ) : (

            filteredComplaints.map((complaint) => (

              <div
                className="admin-card"
                key={complaint.id}
              >

                {/* CARD HEADER */}

                <div className="admin-card-header">

                  <span className="complaint-number">
                    Complaint #{complaint.id}
                  </span>

                  <span
                    className={`status-badge ${
                      complaint.status === "resolved"
                        ? "status-resolved"
                        : complaint.status === "in_progress"
                        ? "status-progress"
                        : "status-pending"
                    }`}
                  >
                    {complaint.status === "in_progress"
                      ? "In Progress"
                      : complaint.status}
                  </span>

                </div>

                {/* STUDENT */}

                <div className="admin-user-info">

                  👤 Student #{complaint.user_id}

                </div>

                {/* TITLE */}

                <h2>
                  {complaint.title}
                </h2>

                {/* DESCRIPTION */}

                <p className="complaint-description">
                  {complaint.description}
                </p>

                {/* DETAILS */}

                <div className="complaint-details">

                  <span>
                    📁 {complaint.category}
                  </span>

                  <span>
                    ⚡ {complaint.priority}
                  </span>

                  <span>
                    🆔 #{complaint.id}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="admin-actions">

                  {/* STATUS */}

                  <select
                    className="status-select"
                    value={complaint.status}
                    onChange={(event) =>
                      updateStatus(
                        complaint.id,
                        event.target.value
                      )
                    }
                  >

                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                  </select>

                  {/* STAFF SELECTION */}

                  <select
                    className="staff-select"
                    value={
                      selectedStaff[complaint.id] || ""
                    }
                    onChange={(event) =>
                      handleStaffChange(
                        complaint.id,
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Staff
                    </option>

                    {staffMembers.map((staff) => (

                      <option
                        key={staff.id}
                        value={staff.id}
                      >
                        {staff.name}
                      </option>

                    ))}

                  </select>

                  {/* ASSIGN */}

                  <button
                    className="assign-button"
                    onClick={() =>
                      assignComplaint(complaint.id)
                    }
                  >
                    👤 Assign to Staff
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

      {/* ---------------------------------------------------
          FOOTER
      --------------------------------------------------- */}

      <footer className="main-footer">

        <p>
          AI Powered Complaint Management System
        </p>

        <p>
          Admin Dashboard
        </p>

      </footer>

    </div>
  );
}

export default AdminComplaints;