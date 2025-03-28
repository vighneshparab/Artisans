import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import registerImage from "../assets/images/register-image.jpg";

const Register = () => {
  const navigate = useNavigate();

  // State for form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!fullName || !email || !password || !confirmPassword || !role) {
      setErrorMessage("All fields are required!");
      return;
    }

    // Validate password (min 6 characters, 1 uppercase, 1 number, 1 special character)
    if (
      !/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)
    ) {
      setErrorMessage(
        "Password must be at least 6 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format!");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name: fullName,
          email,
          password,
          role,
          ...(role === "seller" && { storeName, storeDescription }),
        }
      );

      // Extract token and user after successful registration
      const { token, user } = response.data;

      setSuccessMessage("Registration successful! Redirecting...");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      const redirectTo =
        user.role === "seller" ? "/seller-dashboard" : "/profile";

      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed! Please try again."
      );
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
            src={registerImage}
            alt="Register"
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Right Side Form */}
        <div className="col-md-6 p-4">
          <h2 className="text-center mb-4 text-primary">Create Account</h2>

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success text-center">
              {successMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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

            {/* Password & Confirm Password */}
            <div className="row">
              <div className="col-6">
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-6">
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Select Role
              </label>
              <select
                className="form-select"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {/* Store Details (Only for Sellers) */}
            {role === "seller" && (
              <>
                <div className="mb-3">
                  <label htmlFor="storeName" className="form-label">
                    Store Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="storeName"
                    placeholder="Enter store name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="storeDescription" className="form-label">
                    Store Description
                  </label>
                  <textarea
                    className="form-control"
                    id="storeDescription"
                    rows="3"
                    placeholder="Enter store details"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-primary fw-bold">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
