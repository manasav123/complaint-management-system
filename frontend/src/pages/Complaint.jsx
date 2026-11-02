import React, { useState, useEffect } from "react";
import api from "../services/api";

function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  // IMAGE UPLOAD STATES
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ---------------------------------------------------------
  // IMAGE SELECTION
  // ---------------------------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setMessage("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ---------------------------------------------------------
  // REMOVE SELECTED IMAGE
  // ---------------------------------------------------------

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    const input = document.getElementById("complaint-image");

    if (input) {
      input.value = "";
    }
  };

  // ---------------------------------------------------------
  // AI CLASSIFICATION
  // ---------------------------------------------------------

  const handleAIClassify = async () => {
    if (!title || !description) {
      setAiMessage(
        "Please enter the complaint title and description first."
      );
      return;
    }

    setAiLoading(true);
    setAiMessage("");

    try {
      const response = await api.post("/ai/classify", {
        title,
        description,
      });

      if (response.data.error) {
        setAiMessage(response.data.error);
        return;
      }

      setCategory(response.data.category);
      setPriority(response.data.priority);

      setAiMessage(
        `AI classified this as ${response.data.category} with ${response.data.priority} priority.`
      );
    } catch (error) {
      console.error(error);
      setAiMessage("AI classification failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
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

    setSubmitting(true);
    setMessage("");

    try {
      // STEP 1: CREATE COMPLAINT

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

      // Get the newly created complaint ID

      const complaintId =
        response.data.complaint?.id ?? response.data.id;

      if (!complaintId) {
        setMessage(
          "Complaint submitted, but its ID could not be retrieved."
        );
        return;
      }

      // STEP 2: UPLOAD IMAGE IF SELECTED

      if (selectedImage) {
        const formData = new FormData();

        formData.append("image", selectedImage);

        try {
          await api.post(
            `/complaints/${complaintId}/image`,
            formData
          );

          setMessage(
            "Complaint and image submitted successfully! 🎉"
          );
        } catch (imageError) {
          console.error(imageError);

          setMessage(
            "Complaint submitted successfully, but image upload failed. You can try uploading it again."
          );
        }
      } else {
        setMessage("Complaint submitted successfully! 🎉");
      }

      // STEP 3: RESET FORM

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      setAiMessage("");

      removeImage();

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
        "Complaint submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">

        {/* PAGE HEADER */}

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

        {/* COMPLAINT FORM */}

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
              placeholder="Example: Classroom fan not working"
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
            className="ai-button"
            onClick={handleAIClassify}
            disabled={aiLoading || submitting}
          >
            {aiLoading
              ? "🤖 AI Analyzing..."
              : "🤖 Classify with AI"}
          </button>

          {/* AI MESSAGE */}

          {aiMessage && (
            <div className="ai-message">
              {aiMessage}
            </div>
          )}

          {/* IMAGE UPLOAD */}

          <div className="form-group image-upload-group">

            <label htmlFor="complaint-image">
              📷 Attach Complaint Image (Optional)
            </label>

            <input
              type="file"
              id="complaint-image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={submitting}
            />

            <small>
              Accepted formats: JPG, PNG and WebP. Maximum size: 5 MB.
            </small>

            {/* IMAGE PREVIEW */}

            {imagePreview && (
              <div className="image-preview">

                <img
                  src={imagePreview}
                  alt="Complaint preview"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={submitting}
                >
                  Remove Image ✖
                </button>

              </div>
            )}

          </div>

          {/* CATEGORY + PRIORITY */}

          <div className="form-row">

            {/* CATEGORY */}

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

            {/* PRIORITY */}

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

          {/* SUBMIT BUTTON */}

          <button
            className="submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting Complaint..."
              : "Submit Complaint"}
          </button>

          {/* SUCCESS / ERROR MESSAGE */}

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}

        </form>

        {/* BACK TO DASHBOARD */}

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