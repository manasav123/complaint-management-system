import React, { useEffect, useState } from "react";
import api from "../services/api";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      try {
        const response = await api.get(
          `/complaints/user/${user.id}`
        );

        if (response.data.error) {
          setMessage(response.data.error);
          return;
        }

        setComplaints(response.data.complaints);
      } catch (error) {
        setMessage("Failed to load complaints.");
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
            COMPLAINT MANAGEMENT
          </p>

          <h1>My Complaints</h1>

          <p>
            Track your submitted complaints and monitor
            their progress.
          </p>
        </div>

        {message && (
          <div className="complaint-message">
            {message}
          </div>
        )}

        {complaints.length === 0 && !message ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>

            <h2>No complaints yet</h2>

            <p>
              You haven't submitted any complaints yet.
            </p>

            <a
              href="/complaint"
              className="empty-button"
            >
              Submit a Complaint
            </a>
          </div>
        ) : (
          <div className="complaints-list">

            {complaints.map((complaint) => (
              <div
                className="complaint-card"
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
                    <span>Status</span>
                    <strong>
                      {complaint.status.replace("_", " ")}
                    </strong>
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

export default MyComplaints;