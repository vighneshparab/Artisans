import React from "react";

const Footer = () => {
  return (
    <footer
      className="text-white py-4"
      style={{
        backgroundColor: "#333", // Dark background for better contrast
        borderTop: "4px solid #AD8B73", // Accent color to match theme
      }}
    >
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Company Info */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3" style={{ color: "#AD8B73" }}>
              ShopEase
            </h5>
            <p style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
              Discover unique handcrafted goods and support small businesses.
              Quality and creativity delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3" style={{ color: "#AD8B73" }}>
              Quick Links
            </h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="/about"
                  className="text-white text-decoration-none"
                  style={{ fontSize: "0.95rem" }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-white text-decoration-none"
                  style={{ fontSize: "0.95rem" }}
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-white text-decoration-none"
                  style={{ fontSize: "0.95rem" }}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-white text-decoration-none"
                  style={{ fontSize: "0.95rem" }}
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-4 mb-4 text-center text-md-start">
            <h5 className="mb-3" style={{ color: "#AD8B73" }}>
              Follow Us
            </h5>
            <div>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white me-3"
                style={{ fontSize: "1.5rem" }}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white me-3"
                style={{ fontSize: "1.5rem" }}
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white me-3"
                style={{ fontSize: "1.5rem" }}
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
                style={{ fontSize: "1.5rem" }}
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#444" }} />

        {/* Copyright */}
        <div className="text-center">
          <p className="mb-0" style={{ fontSize: "0.85rem" }}>
            &copy; 2025 ShopEase. All Rights Reserved. |{" "}
            <a
              href="/terms"
              className="text-white text-decoration-none"
              style={{ fontSize: "0.85rem" }}
            >
              Terms of Service
            </a>{" "}
            |{" "}
            <a
              href="/privacy"
              className="text-white text-decoration-none"
              style={{ fontSize: "0.85rem" }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
