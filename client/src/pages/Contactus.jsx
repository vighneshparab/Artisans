import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import heroImage from "../assets/images/hero.jpg"; // Replace with an appropriate image path

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = "http://127.0.0.1:5000"; // Adjust with your backend URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccessMessage("Your message has been sent successfully!");
        setErrorMessage("");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setErrorMessage("There was an error submitting your message.");
      }
    } catch (error) {
      setErrorMessage("Failed to send your message. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: "#FFFBE9" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        className="text-center text-light d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          height: "50vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h1 className="fw-bold">Get in Touch</h1>
          <p className="lead">We'd love to hear from you!</p>
        </div>
      </section>

      <section id="contact-us" className="py-5">
        <div className="container">
          <div className="row gy-4">
            {/* Contact Form */}
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <h4 className="text-center mb-4" style={{ color: "#AD8B73" }}>
                    Send Us a Message
                  </h4>

                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">
                        Message
                      </label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: "#AD8B73",
                        color: "#FFFBE9",
                        border: "none",
                        width: "100%",
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <h4 className="text-center mb-4" style={{ color: "#AD8B73" }}>
                    Contact Information
                  </h4>
                  <p className="mb-3">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    <strong>Address:</strong> 1234 Main Street, Suite 101, City,
                    State, ZIP
                  </p>
                  <p className="mb-3">
                    <i className="fas fa-phone-alt me-2"></i>
                    <strong>Phone:</strong> (123) 456-7890
                  </p>
                  <p>
                    <i className="fas fa-envelope me-2"></i>
                    <strong>Email:</strong> support@company.com
                  </p>
                  <h5 className="mt-4 text-center" style={{ color: "#6D2323" }}>
                    Follow Us
                  </h5>
                  <div className="d-flex justify-content-center">
                    <a
                      href="#"
                      className="text-dark mx-2"
                      style={{ fontSize: "20px" }}
                    >
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a
                      href="#"
                      className="text-dark mx-2"
                      style={{ fontSize: "20px" }}
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      href="#"
                      className="text-dark mx-2"
                      style={{ fontSize: "20px" }}
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
