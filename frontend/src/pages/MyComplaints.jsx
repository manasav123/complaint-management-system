import React, { useEffect, useState } from "react";
import api from "../services/api";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});

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

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.complaints || [];

        setComplaints(data);
      } catch (error) {
        setMessage("Failed to load complaints.");
        console.error(error);
      }
    };

    fetchComplaints();
  }, []);

  // ---------------------------------------------------------
  // STATUS CLASS
  // ---------------------------------------------------------

  const getStatusClass = (status) => {
    if (status === "resolved") {
      return "status-resolved";
    }

    if (status === "in_progress") {
      return "status-progress";
    }

    return "status-pending";
  };

  // ---------------------------------------------------------
  // SELECT RATING
  // ---------------------------------------------------------

  const handleRatingChange = (complaintId, rating) => {
    setRatings((previous) => ({
      ...previous,
      [complaintId]: rating,
    }));
  };

  // ---------------------------------------------------------
  // ENTER COMMENT
  // ---------------------------------------------------------

  const handleCommentChange = (complaintId, comment) => {
    setComments((previous) => ({
      ...previous,
      [complaintId]: comment,
    }));
  };

  // ---------------------------------------------------------
  // SUBMIT FEEDBACK
  // ---------------------------------------------------------

  const submitFeedback = async (complaintId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setFeedbackMessage((previous) => ({
        ...previous,
        [complaintId]: "Please login first.",
      }));
      return;
    }

    const rating = ratings[complaintId];
    const comment = comments[complaintId] || "";

    if (!rating) {
      setFeedbackMessage((previous) => ({
        ...previous,
        [complaintId]: "Please select a rating first.",
      }));
      return;
    }

    try {
      const response = await api.post(
        `/complaints/${complaintId}/feedback`,
        {
          user_id: user.id,
          rating: Number(rating),
          comment: comment,
        }
      );

      if (response.data.error) {
        setFeedbackMessage((previous) => ({
          ...previous,
          [complaintId]: response.data.error,
        }));
        return;
      }

      setFeedbackMessage((previous) => ({
        ...previous,
        [complaintId]: "Thank you! Your feedback was submitted successfully.",
      }));

      setRatings((previous) => ({
        ...previous,
        [complaintId]: "",
      }));

      setComments((previous) => ({
        ...previous,
        [complaintId]: "",
      }));
    } catch (error) {
      console.error("Feedback submission error:", error);

      setFeedbackMessage((previous) => ({
        ...previous,
        [complaintId]: "Failed to submit feedback.",
      }));
    }
  };

  return (
    <div className="complaints-page">

      <div className="complaints-container">

        {/* -------------------------------------------------
            PAGE HEADER
        ------------------------------------------------- */}

        <div className="page-heading">

          <p className="dashboard-label">
            COMPLAINT MANAGEMENT
          </p>

          <h1>
            My Complaints
          </h1>

          <p>
            Track your submitted complaints and monitor
            their progress.
          </p>

        </div>

        {/* -------------------------------------------------
            GENERAL MESSAGE
        ------------------------------------------------- */}

        {message && (
          <div className="complaint-message">
            {message}
          </div>
        )}

        {/* -------------------------------------------------
            EMPTY STATE
        ------------------------------------------------- */}

        {complaints.length === 0 && !message ? (

          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h2>
              No complaints yet
            </h2>

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

                {/* -------------------------------------------------
                    COMPLAINT HEADER
                ------------------------------------------------- */}

                <div className="complaint-card-header">

                  <div>

                    <p className="complaint-number">
                      COMPLAINT #{complaint.id}
                    </p>

                    <h2>
                      {complaint.title}
                    </h2>

                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>

                </div>

                {/* -------------------------------------------------
                    DESCRIPTION
                ------------------------------------------------- */}

                <p className="complaint-description">
                  {complaint.description}
                </p>

                {/* -------------------------------------------------
                    DETAILS
                ------------------------------------------------- */}

                <div className="complaint-details">

                  <div>

                    <span>
                      Category
                    </span>

                    <strong>
                      {complaint.category}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Priority
                    </span>

                    <strong>
                      {complaint.priority}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      {complaint.status.replace("_", " ")}
                    </strong>

                  </div>

                </div>

                {/* -------------------------------------------------
                    FEEDBACK - ONLY FOR RESOLVED COMPLAINTS
                ------------------------------------------------- */}

                {complaint.status === "resolved" && (

                  <div className="feedback-section">

                    <div className="feedback-heading">

                      <span className="feedback-icon">
                        ⭐
                      </span>

                      <div>

                        <h3>
                          How was your experience?
                        </h3>

                        <p>
                          Your feedback helps us improve
                          complaint resolution.
                        </p>

                      </div>

                    </div>

                    {/* RATING */}

                    <div className="rating-group">

                      <label>
                        Rate the resolution
                      </label>

                      <div className="rating-buttons">

                        {[1, 2, 3, 4, 5].map((rating) => (

                          <button
                            type="button"
                            key={rating}
                            className={
                              ratings[complaint.id] === rating
                                ? "rating-button selected"
                                : "rating-button"
                            }
                            onClick={() =>
                              handleRatingChange(
                                complaint.id,
                                rating
                              )
                            }
                          >
                            {rating} ⭐
                          </button>

                        ))}

                      </div>

                    </div>

                    {/* COMMENT */}

                    <div className="feedback-comment">

                      <label>
                        Additional comments
                      </label>

                      <textarea
                        value={
                          comments[complaint.id] || ""
                        }
                        onChange={(event) =>
                          handleCommentChange(
                            complaint.id,
                            event.target.value
                          )
                        }
                        placeholder="Tell us about your experience..."
                      />

                    </div>

                    {/* SUBMIT */}

                    <button
                      type="button"
                      className="feedback-submit-button"
                      onClick={() =>
                        submitFeedback(complaint.id)
                      }
                    >
                      ⭐ Submit Feedback
                    </button>

                    {/* FEEDBACK MESSAGE */}

                    {feedbackMessage[complaint.id] && (

                      <div className="feedback-message">

                        {feedbackMessage[complaint.id]}

                      </div>

                    )}

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

        {/* -------------------------------------------------
            BACK BUTTON
        ------------------------------------------------- */}

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