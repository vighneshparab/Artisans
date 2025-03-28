import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/images/login-image.jpg";

const Login = () => {
  const navigate = useNavigate();

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      // Destructure response data
      const { token, user } = response.data;

      if (!user || !user.role) {
        throw new Error("Invalid user data received");
      }

      // Store token and user details
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-Based Redirection
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "seller":
          navigate("/seller-dashboard");
          break;
        default:
          navigate("/profile");
          break;
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3 py-3">
      <div
        className="row shadow-lg bg-white rounded overflow-hidden w-100"
        style={{ maxWidth: "850px" }}
      >
        {/* Left Side Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={loginImage}
            alt="Login"
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Right Side Form */}
        <div className="col-md-6 p-4">
          <h2 className="text-center mb-4 text-primary">Login</h2>

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password with Toggle */}
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>

            {/* Remember Me Checkbox */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember Me
                </label>
              </div>
              <Link to="/forgot-password" className="text-primary">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-3">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-primary fw-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
