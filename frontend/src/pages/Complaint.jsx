import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");

  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // IMAGE SELECTION
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

  // REMOVE IMAGE
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    const input = document.getElementById("complaint-image");

    if (input) {
      input.value = "";
    }
  };

  // RULE-BASED AI CLASSIFICATION
  const handleAIClassify = async () => {
    if (!title.trim() || !description.trim()) {
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
        `Suggested category: ${response.data.category} | Priority: ${response.data.priority}`
      );
    } catch (error) {
      console.error(error);
      setAiMessage("Classification failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // SUBMIT COMPLAINT
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !category) {
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

      const complaintId =
        response.data.complaint?.id ?? response.data.id;

      if (!complaintId) {
        setMessage(
          "Complaint submitted, but its ID could not be retrieved."
        );
        return;
      }

      // STEP 2: UPLOAD IMAGE
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
            "Complaint submitted, but image upload failed."
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
    <div className="cc-complaint-page">

      {/* NAVIGATION */}
      <nav className="cc-complaint-nav">

        <Link to="/dashboard" className="cc-complaint-brand">
          <span className="cc-brand-icon">🏛️</span>

          <span>
            <strong>CampusCare</strong>
            <small>SMART CAMPUS SOLUTIONS</small>
          </span>
        </Link>

        <Link to="/dashboard" className="cc-nav-dashboard">
          ← Dashboard
        </Link>

      </nav>

      <div className="cc-complaint-container">

        {/* PAGE HEADER */}
        <div className="cc-complaint-heading">

          <div className="cc-heading-badge">
            CAMPUSCARE • STUDENT SUPPORT
          </div>

          <h1>
            Your Voice, <span>Our Priority.</span>
          </h1>

          <p>
            Share your concern with us. Our team will work
            towards making your campus a better place.
          </p>

        </div>

        {/* INFORMATION CARDS */}
        <div className="cc-info-cards">

          <div className="cc-info-card">
            <div className="cc-info-icon">📝</div>
            <div>
              <h3>Share your concern</h3>
              <p>Explain your issue clearly</p>
            </div>
          </div>

          <div className="cc-info-card">
            <div className="cc-info-icon">✨</div>
            <div>
              <h3>Smart classification</h3>
              <p>Get category suggestions</p>
            </div>
          </div>

          <div className="cc-info-card">
            <div className="cc-info-icon">📊</div>
            <div>
              <h3>Track progress</h3>
              <p>Stay updated on your concern</p>
            </div>
          </div>

        </div>

        {/* MAIN FORM */}
        <div className="cc-form-card">

          <div className="cc-form-card-header">

            <div>
              <span className="cc-section-label">
                NEW COMPLAINT
              </span>

              <h2>Tell us what happened</h2>

              <p>
                Fill in the details below to submit your concern.
              </p>
            </div>

            <div className="cc-form-icon">📋</div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* TITLE */}
            <div className="cc-form-group">

              <label htmlFor="title">
                Complaint title <span>*</span>
              </label>

              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Classroom fan is not working"
                required
                disabled={submitting}
              />

            </div>

            {/* DESCRIPTION */}
            <div className="cc-form-group">

              <label htmlFor="description">
                Describe your issue <span>*</span>
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what happened, where it happened, and any important details..."
                rows="5"
                required
                disabled={submitting}
              />

              <small>
                The more details you provide, the easier it is
                for the team to understand your concern.
              </small>

            </div>

            {/* AI CLASSIFICATION */}
            <div className="cc-ai-card">

              <div className="cc-ai-content">

                <div className="cc-ai-icon">✨</div>

                <div>
                  <h3>Smart Complaint Classification</h3>

                  <p>
                    Get automatic category and priority
                    suggestions based on your complaint details.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="cc-ai-button"
                onClick={handleAIClassify}
                disabled={aiLoading || submitting}
              >
                {aiLoading
                  ? "Analyzing..."
                  : "✨ Classify My Complaint"}
              </button>

              {aiMessage && (
                <div className="cc-ai-message">
                  {aiMessage}
                </div>
              )}

            </div>

            {/* CATEGORY AND PRIORITY */}
            <div className="cc-form-row">

              <div className="cc-form-group">

                <label htmlFor="category">
                  Complaint category <span>*</span>
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={submitting}
                >
                  <option value="">Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Library">Library</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>

              </div>

              <div className="cc-form-group">

                <label htmlFor="priority">
                  Priority level
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={submitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

              </div>

            </div>

            {/* IMAGE UPLOAD */}
            <div className="cc-upload-section">

              <label className="cc-upload-label">
                📷 Attach supporting image
                <span> (Optional)</span>
              </label>

              <label
                htmlFor="complaint-image"
                className="cc-upload-box"
              >

                <div className="cc-upload-icon">☁️</div>

                <h3>Click to upload an image</h3>

                <p>
                  JPG, PNG or WebP • Maximum size 5 MB
                </p>

                <input
                  type="file"
                  id="complaint-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting}
                />

              </label>

              {imagePreview && (
                <div className="cc-image-preview">

                  <img
                    src={imagePreview}
                    alt="Complaint attachment preview"
                  />

                  <div className="cc-image-details">
                    <strong>{selectedImage?.name}</strong>

                    <small>
                      {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={submitting}
                  >
                    ✕
                  </button>

                </div>
              )}

            </div>

            {/* SUBMIT BUTTON */}
            <div className="cc-submit-section">

              <button
                type="submit"
                className="cc-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting your complaint..."
                  : "Submit Complaint →"}
              </button>

              <p>
                🔒 Your complaint details are handled securely.
              </p>

            </div>

            {/* MESSAGE */}
            {message && (
              <div className="cc-form-message">
                {message}
              </div>
            )}

          </form>

        </div>

        <div className="cc-bottom-note">
          Need help? CampusCare is here to support you. 💜
        </div>

      </div>

    </div>
  );
}

export default Complaint;