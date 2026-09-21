import { useState } from "react";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      // Save authentication token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage("Login failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-header">
          <div className="login-icon">
            🏫
          </div>

          <h1>Welcome Back</h1>

          <p>
            Login to manage your college complaints
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}
        </form>

        <div className="login-register">
          Don't have an account?{" "}
          <a href="/register">
            Create an account
          </a>
        </div>

      </div>
    </div>
  );
}

export default Login;