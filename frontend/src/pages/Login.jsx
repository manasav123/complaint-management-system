import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (event) => {
event.preventDefault();


setMessage("");

if (!email || !password) {
  setMessage("Please enter both email and password.");
  return;
}

try {
  setLoading(true);

  const response = await api.post("/login", {
    email,
    password,
  });

  if (response.data.error) {
    setMessage(response.data.error);
    return;
  }

  localStorage.setItem("token", response.data.token);

  localStorage.setItem(
    "user",
    JSON.stringify(response.data.user)
  );

  window.location.href = "/dashboard";

} catch (error) {
  setMessage(
    error.response?.data?.detail ||
    "Login failed. Please try again."
  );

  console.error(error);

} finally {
  setLoading(false);
}


};

return ( <div className="modern-login-page">


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
          WELCOME TO CAMPUSCARE
        </span>

        <h1>
          A Better Campus
          <br />
          Starts With <span>Your Voice.</span>
        </h1>

        <p>
          Report campus issues, track complaints
          and stay connected with a smarter
          complaint management experience.
        </p>

        <div className="login-benefits">

          <div>
            <span>✓</span>
            Easy complaint submission
          </div>

          <div>
            <span>✓</span>
            Transparent complaint tracking
          </div>

          <div>
            <span>✓</span>
            Smart AI assistance
          </div>

        </div>

      </div>

      <div className="login-panel-footer">
        Report. Resolve. Improve. ❤️
      </div>

      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

    </div>

    {/* RIGHT PANEL */}

    <div className="login-form-panel">

      <div className="login-form-heading">

        <div className="login-form-icon">👋</div>

        <span>YOUR CAMPUS ACCOUNT</span>

        <h2>Welcome Back!</h2>

        <p>
          Enter your details to access your account.
        </p>

      </div>

      <form
        className="modern-login-form"
        onSubmit={handleSubmit}
      >

        <div className="modern-form-group">

          <label htmlFor="email">
            Email Address
          </label>

          <div className="modern-input-wrapper">
            <span>✉️</span>

            <input
              type="email"
              id="email"
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

        <div className="modern-form-group">

          <label htmlFor="password">
            Password
          </label>

          <div className="modern-input-wrapper">
            <span>🔒</span>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
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

        {message && (
          <div className="modern-login-message">
            ⚠️ {message}
          </div>
        )}

        <button
          type="submit"
          className="modern-login-button"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

      </form>

      <div className="modern-login-register">
        Don't have an account?
        <Link to="/register"> Create Account</Link>
      </div>

      <div className="login-security-note">
        🔐 Your account information is securely handled.
      </div>

    </div>

  </div>

</div>

);
}

export default Login;
