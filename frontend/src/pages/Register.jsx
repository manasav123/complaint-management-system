import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!name.trim() || !email.trim() || !password || !role) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setSuccess(true);
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Registration failed. Please try again."
      );

      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-page">

      <div className="login-back-home">
        <Link to="/">← Back to Home</Link>
      </div>

      <div className="modern-login-container">

        {/* LEFT PANEL */}

        <div className="login-welcome-panel">

          <div className="login-brand">
            <div className="login-brand-icon">🏛️</div>
            <span>CampusCare</span>
          </div>

          <div className="login-welcome-content">

            <span className="login-tag">
              JOIN THE CAMPUSCARE COMMUNITY
            </span>

            <h1>
              Your Campus.
              <br />
              Your Voice.
              <br />
              <span>Your Impact.</span>
            </h1>

            <p>
              Be part of a smarter campus where every
              complaint matters and every voice
              contributes to positive change.
            </p>

            <div className="login-benefits">

              <div>
                <span>✓</span>
                Create your campus account
              </div>

              <div>
                <span>✓</span>
                Report issues easily
              </div>

              <div>
                <span>✓</span>
                Track complaint progress
              </div>

              <div>
                <span>✓</span>
                Get smart AI assistance
              </div>

            </div>

          </div>

          <div className="login-panel-footer">
            Together, let's improve our campus. ❤️
          </div>

          <div className="login-decoration decoration-one"></div>
          <div className="login-decoration decoration-two"></div>

        </div>

        {/* RIGHT PANEL */}

        <div className="login-form-panel register-form-panel">

          <div className="login-form-heading">

            <div className="login-form-icon">✨</div>

            <span>GET STARTED WITH CAMPUSCARE</span>

            <h2>Create Account</h2>

            <p>
              Fill in your details to join our community.
            </p>

          </div>

          <form
            className="modern-login-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div className="modern-form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="modern-input-wrapper">
                <span>👤</span>

                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

            </div>

            {/* EMAIL */}

            <div className="modern-form-group">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="modern-input-wrapper">
                <span>✉️</span>

                <input
                  type="email"
                  id="register-email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

            </div>

            {/* PASSWORD */}

            <div className="modern-form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="modern-input-wrapper">
                <span>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="modern-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* ACCOUNT TYPE */}

            <div className="modern-form-group">

              <label htmlFor="role">
                Account Type
              </label>

              <div className="modern-input-wrapper modern-select-wrapper">
                <span>🎓</span>

                <select
                  id="role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={
                  success
                    ? "modern-register-success"
                    : "modern-login-message"
                }
              >
                {success ? "✅ " : "⚠️ "}
                {message}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="modern-login-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

          </form>

          <div className="modern-login-register">
            Already have an account?
            <Link to="/login"> Login here</Link>
          </div>

          <div className="login-security-note">
            🔐 Your account information is securely handled.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;