import { useState } from "react";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
      });

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {
      setMessage("Registration failed. Please try again.");
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

          <h1>Create Account</h1>

          <p>
            Join the AI-powered complaint management system
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Create Account
          </button>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

        </form>

        <div className="login-register">
          Already have an account?{" "}
          <a href="/login">
            Login here
          </a>
        </div>

      </div>
    </div>
  );
}

export default Register;