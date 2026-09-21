import React, { useEffect, useState } from "react";
import api from "../services/api";

function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const response = await api.put(
        `/complaints/${complaintId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      setMessage("Complaint status updated successfully!");
    } catch (error) {
      setMessage("Failed to update complaint status.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Please login first.");
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

        setComplaints(response.data.complaints);
      } catch (error) {
        setMessage("Failed to load assigned complaints.");
        console.error(error);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusClass = (status) => {
    if (status === "resolved") {
      return "status-resolved";
    }

    if (status === "in_progress") {
      return "status-progress";
    }

    return "status-pending";
  };

  return (
    <div className="complaints-page">
      <div className="complaints-container">

        <div className="page-heading">
          <p className="dashboard-label">
            STAFF WORKSPACE
          </p>

          <h1>Assigned Complaints</h1>

          <p>
            Review complaints assigned to you and
            update their progress.
          </p>
        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {complaints.length === 0 && !message ? (
          <div className="empty-state">
            <div className="empty-icon">🛠️</div>

            <h2>No assigned complaints</h2>

            <p>
              You currently have no complaints assigned to you.
            </p>
          </div>
        ) : (
          <div className="complaints-list">

            {complaints.map((complaint) => (
              <div
                className="complaint-card admin-card"
                key={complaint.id}
              >

                <div className="complaint-card-header">

                  <div>
                    <p className="complaint-number">
                      COMPLAINT #{complaint.id}
                    </p>

                    <h2>{complaint.title}</h2>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>

                </div>

                <div className="admin-user-info">

                  <div>
                    <span>Submitted By</span>
                    <strong>{complaint.user_name}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{complaint.user_email}</strong>
                  </div>

                </div>

                <p className="complaint-description">
                  {complaint.description}
                </p>

                <div className="complaint-details">

                  <div>
                    <span>Category</span>
                    <strong>{complaint.category}</strong>
                  </div>

                  <div>
                    <span>Priority</span>
                    <strong>{complaint.priority}</strong>
                  </div>

                  <div>
                    <span>Update Status</span>

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
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

        <a
          href="/dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </a>

      </div>
    </div>
  );
}

export default StaffComplaints;