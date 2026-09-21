import React, { useState } from "react";
import api from "../services/api";

function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [message, setMessage] = useState("");

  // ---------------------------------------------------------
  // AI CLASSIFICATION
  // ---------------------------------------------------------

  const analyzeComplaint = async () => {
    if (!title || !description) {
      setAiMessage("Enter the title and description first.");
      return;
    }

    setAiLoading(true);
    setAiMessage("");
    setMessage("");

    try {
      const response = await api.post("/ai/classify", {
        title,
        description,
      });

      if (response.data.error) {
        setAiMessage(response.data.error);
        setAiLoading(false);
        return;
      }

      setCategory(response.data.category);
      setPriority(response.data.priority);

      setAiMessage(
        `AI classified this complaint as ${response.data.category} with ${response.data.priority} priority.`
      );
    } catch (error) {
      console.error("AI classification error:", error);
      setAiMessage("AI classification failed.");
    }

    setAiLoading(false);
  };

  // ---------------------------------------------------------
  // SUBMIT COMPLAINT
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description || !category) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await api.post("/complaints", {
        user_id: user.id,
        title,
        description,
        category,
        priority,
      });

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setMessage("Complaint submitted successfully!");

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      setAiMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Complaint submission failed.");
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">

        <div className="form-header">
          <p className="dashboard-label">
            COMPLAINT MANAGEMENT
          </p>

          <h1>
            Submit a Complaint
          </h1>

          <p>
            Tell us about the issue and we'll make sure it reaches
            the appropriate team.
          </p>
        </div>

        <form
          className="complaint-form"
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Complaint Title
            </label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: Hostel water supply problem"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the problem in detail..."
            />

          </div>

          {/* AI BUTTON */}

          <button
            type="button"
            className="ai-analyze-button"
            onClick={analyzeComplaint}
            disabled={aiLoading}
          >
            {aiLoading
              ? "🤖 Analyzing..."
              : "🤖 Analyze Complaint with AI"}
          </button>

          {/* AI MESSAGE */}

          {aiMessage && (
            <div className="ai-message">
              {aiMessage}
            </div>
          )}

          {/* CATEGORY + PRIORITY */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >

                <option value="">
                  Select category
                </option>

                <option value="Academic">
                  Academic
                </option>

                <option value="Hostel">
                  Hostel
                </option>

                <option value="Library">
                  Library
                </option>

                <option value="Infrastructure">
                  Infrastructure
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            <div className="form-group">

              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
              >

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

              </select>

            </div>

          </div>

          {/* SUBMIT */}

          <button
            className="submit-button"
            type="submit"
          >
            Submit Complaint
          </button>

          {/* SUBMIT MESSAGE */}

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}

        </form>

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

export default Complaint;