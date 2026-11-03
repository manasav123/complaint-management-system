import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Complaint image states
  const [complaintImages, setComplaintImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  // Feedback states
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState({});

  // Fetch complaints and their attached images
  useEffect(() => {
    let active = true;
    const generatedImageUrls = [];

    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
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

        if (!active) return;

        setComplaints(data);

        // Fetch images for complaints that have attachments
        const imageRequests = data
          .filter((complaint) => complaint.image_file_id)
          .map(async (complaint) => {
            if (!active) return;

            setImageLoading((previous) => ({
              ...previous,
              [complaint.id]: true,
            }));

            try {
              const imageResponse = await api.get(
                `/complaints/${complaint.id}/image`,
                {
                  responseType: "blob",
                }
              );

              if (!active) return;

              const imageUrl = URL.createObjectURL(
                imageResponse.data
              );

              generatedImageUrls.push(imageUrl);

              setComplaintImages((previous) => ({
                ...previous,
                [complaint.id]: imageUrl,
              }));

            } catch (error) {
              console.error(
                `Failed to load image for complaint ${complaint.id}:`,
                error
              );

            } finally {
              if (active) {
                setImageLoading((previous) => ({
                  ...previous,
                  [complaint.id]: false,
                }));
              }
            }
          });

        await Promise.allSettled(imageRequests);

      } catch (error) {
        console.error("Complaint loading error:", error);
        setMessage("Failed to load complaints.");

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchComplaints();

    return () => {
      active = false;

      generatedImageUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Status styling
  const getStatusClass = (status) => {
    if (status === "resolved") {
      return "modern-status-resolved";
    }

    if (status === "in_progress") {
      return "modern-status-progress";
    }

    return "modern-status-pending";
  };

  const formatStatus = (status) => {
    return status?.replaceAll("_", " ") || "Pending";
  };

  // Rating handler
  const handleRatingChange = (complaintId, rating) => {
    setRatings((previous) => ({
      ...previous,
      [complaintId]: rating,
    }));
  };

  // Comment handler
  const handleCommentChange = (complaintId, comment) => {
    setComments((previous) => ({
      ...previous,
      [complaintId]: comment,
    }));
  };

  // Submit feedback
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
      setSubmittingFeedback((previous) => ({
        ...previous,
        [complaintId]: true,
      }));

      const response = await api.post(
        `/complaints/${complaintId}/feedback`,
        {
          user_id: user.id,
          rating: Number(rating),
          comment,
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
        [complaintId]:
          "Thank you! Your feedback was submitted successfully.",
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

    } finally {
      setSubmittingFeedback((previous) => ({
        ...previous,
        [complaintId]: false,
      }));
    }
  };

  // Complaint statistics
  const pendingCount = complaints.filter(
    (item) => item.status === "pending"
  ).length;

  const progressCount = complaints.filter(
    (item) => item.status === "in_progress"
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <div className="modern-my-complaints">

      {/* NAVIGATION */}

      <nav className="complaints-navbar">

        <Link to="/dashboard" className="complaints-brand">

          <div className="complaints-brand-icon">
            🏛️
          </div>

          <div>
            <h2>CampusCare</h2>
            <p>SMART CAMPUS SOLUTIONS</p>
          </div>

        </Link>

        <div className="complaints-nav-links">
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/complaint">
            Submit Complaint
          </Link>

          <Link to="/my-complaints" className="active">
            My Complaints
          </Link>
        </div>

      </nav>


      <main className="my-complaints-main">

        {/* PAGE HEADER */}

        <section className="my-complaints-hero">

          <div>

            <span className="my-complaints-tag">
              📋 STUDENT WORKSPACE
            </span>

            <h1>
              My <span>Complaints</span>
            </h1>

            <p>
              Keep track of your submitted complaints
              and stay updated on their progress.
            </p>

          </div>

          <div className="my-complaints-hero-icon">
            📑
          </div>

        </section>


        {/* STATISTICS */}

        {!loading && (

          <section className="complaint-statistics">

            <div className="complaint-stat-card">

              <div className="stat-icon stat-total">
                📋
              </div>

              <div>
                <span>TOTAL COMPLAINTS</span>
                <h2>{complaints.length}</h2>
              </div>

            </div>


            <div className="complaint-stat-card">

              <div className="stat-icon stat-pending">
                ⏳
              </div>

              <div>
                <span>PENDING</span>
                <h2>{pendingCount}</h2>
              </div>

            </div>


            <div className="complaint-stat-card">

              <div className="stat-icon stat-progress">
                🔄
              </div>

              <div>
                <span>IN PROGRESS</span>
                <h2>{progressCount}</h2>
              </div>

            </div>


            <div className="complaint-stat-card">

              <div className="stat-icon stat-resolved">
                ✅
              </div>

              <div>
                <span>RESOLVED</span>
                <h2>{resolvedCount}</h2>
              </div>

            </div>

          </section>

        )}


        {/* LOADING */}

        {loading && (

          <div className="complaints-loading">

            <div className="complaints-spinner"></div>

            <p>Loading your complaints...</p>

          </div>

        )}


        {/* ERROR MESSAGE */}

        {!loading && message && (

          <div className="modern-complaint-message">
            ⚠️ {message}
          </div>

        )}


        {/* EMPTY STATE */}

        {!loading && !message && complaints.length === 0 && (

          <div className="modern-empty-state">

            <div className="modern-empty-icon">
              📋
            </div>

            <h2>No complaints yet</h2>

            <p>
              You haven't submitted any complaints.
              Start by reporting an issue on your campus.
            </p>

            <Link
              to="/complaint"
              className="modern-empty-button"
            >
              + Submit a Complaint
            </Link>

          </div>

        )}


        {/* COMPLAINT LIST */}

        {!loading && complaints.length > 0 && (

          <section className="modern-complaints-list">

            <div className="complaints-list-heading">

              <div>
                <h2>Your Submitted Complaints</h2>
                <p>View details and monitor each complaint.</p>
              </div>

              <Link
                to="/complaint"
                className="new-complaint-button"
              >
                + New Complaint
              </Link>

            </div>


            {/* INDIVIDUAL COMPLAINT CARDS */}

            {complaints.map((complaint) => (

              <article
                className="modern-complaint-card"
                key={complaint.id}
              >

                {/* CARD HEADER */}

                <div className="modern-complaint-header">

                  <div>

                    <span className="modern-complaint-number">
                      COMPLAINT #{complaint.id}
                    </span>

                    <h3>{complaint.title}</h3>

                  </div>

                  <span
                    className={`modern-complaint-status ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {formatStatus(complaint.status)}
                  </span>

                </div>


                {/* DESCRIPTION */}

                <p className="modern-complaint-description">
                  {complaint.description}
                </p>


                {/* ATTACHED IMAGE */}

                {complaint.image_file_id && (

                  <div className="modern-complaint-image-section">

                    <h4>
                      📷 Attached Image
                    </h4>

                    {imageLoading[complaint.id] && (

                      <div className="complaint-image-loading">
                        Loading attached image...
                      </div>

                    )}

                    {complaintImages[complaint.id] && (

                      <a
                        href={complaintImages[complaint.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="modern-complaint-image-link"
                      >

                        <img
                          src={complaintImages[complaint.id]}
                          alt={`Image attached to complaint ${complaint.id}`}
                          className="modern-complaint-image"
                        />

                        <span>
                          Click to view full image
                        </span>

                      </a>

                    )}

                    {!imageLoading[complaint.id] &&
                      !complaintImages[complaint.id] && (

                        <p className="complaint-image-error">
                          Image could not be loaded.
                        </p>

                      )}

                  </div>

                )}


                {/* DETAILS */}

                <div className="modern-complaint-details">

                  <div>
                    <span>📂 CATEGORY</span>
                    <strong>{complaint.category}</strong>
                  </div>

                  <div>
                    <span>⚡ PRIORITY</span>
                    <strong>{complaint.priority}</strong>
                  </div>

                  <div>
                    <span>📌 STATUS</span>
                    <strong>
                      {formatStatus(complaint.status)}
                    </strong>
                  </div>

                </div>


                {/* FEEDBACK */}

                {complaint.status === "resolved" && (

                  <div className="modern-feedback-section">

                    <div className="modern-feedback-heading">

                      <div className="modern-feedback-icon">
                        ⭐
                      </div>

                      <div>
                        <h3>How was your experience?</h3>

                        <p>
                          Your feedback helps us improve
                          our complaint resolution process.
                        </p>
                      </div>

                    </div>


                    <div className="modern-rating-group">

                      <label>Rate the resolution</label>

                      <div className="modern-rating-buttons">

                        {[1, 2, 3, 4, 5].map((rating) => (

                          <button
                            type="button"
                            key={rating}
                            className={
                              ratings[complaint.id] === rating
                                ? "modern-rating-button selected"
                                : "modern-rating-button"
                            }
                            onClick={() =>
                              handleRatingChange(complaint.id, rating)
                            }
                          >
                            {rating} ⭐
                          </button>

                        ))}

                      </div>

                    </div>


                    <div className="modern-feedback-comment">

                      <label>Additional comments</label>

                      <textarea
                        value={comments[complaint.id] || ""}
                        onChange={(event) =>
                          handleCommentChange(
                            complaint.id,
                            event.target.value
                          )
                        }
                        placeholder="Tell us about your experience..."
                      />

                    </div>


                    <button
                      type="button"
                      className="modern-feedback-submit"
                      onClick={() => submitFeedback(complaint.id)}
                      disabled={submittingFeedback[complaint.id]}
                    >
                      {submittingFeedback[complaint.id]
                        ? "Submitting..."
                        : "⭐ Submit Feedback"}
                    </button>


                    {feedbackMessage[complaint.id] && (

                      <div className="modern-feedback-message">
                        {feedbackMessage[complaint.id]}
                      </div>

                    )}

                  </div>

                )}

              </article>

            ))}

          </section>

        )}


        {/* BACK BUTTON */}

        <Link
          to="/dashboard"
          className="complaints-back-link"
        >
          ← Back to Dashboard
        </Link>

      </main>


      {/* FOOTER */}

      <footer className="complaints-page-footer">

        <div>
          <strong>CampusCare</strong>
          <p>SMART CAMPUS SOLUTIONS</p>
        </div>

        <span>Report. Resolve. Improve. ❤️</span>

      </footer>

    </div>
  );
}

export default MyComplaints;