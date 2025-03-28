import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import backgroundImage from "../assets/images/hero.jpg";
import aboutImage from "../assets/images/download.jfif";

const About = () => {
  return (
    <div>
      <Navbar />
      {/* Hero Section */}
      <div
        className="about-hero text-center text-light d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: "60vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "30px",
            borderRadius: "10px",
          }}
        >
          <h1 className="fw-bold display-4">About Artisan Shop</h1>
          <p className="lead mt-3" style={{ fontSize: "1.25rem" }}>
            Crafted with Passion, Inspired by Culture
          </p>
        </div>
      </div>

      {/* About Content Section */}
      <div className="container py-5">
        <div className="row align-items-center">
          {/* Image Section */}
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src={aboutImage}
              alt="Artisan Craft"
              className="img-fluid rounded shadow-lg"
              style={{ transform: "scale(1)", transition: "transform 0.3s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          </div>
          {/* Text Section */}
          <div className="col-md-6">
            <h2 className="fw-bold mb-4" style={{ color: "#AD4C4C" }}>
              Our Story
            </h2>
            <p style={{ color: "#444", lineHeight: "1.8" }}>
              Artisan Shop was founded with a vision to bring traditional and
              handcrafted goods to the modern marketplace. Our mission is to
              empower skilled artisans by providing them with a platform to
              showcase their work to a global audience. Each piece we sell is a
              testament to the dedication and craftsmanship of our talented
              creators.
            </p>
            <p style={{ color: "#444", lineHeight: "1.8" }}>
              We believe in sustainability, creativity, and keeping traditions
              alive through the art of handmade goods. By choosing Artisan Shop,
              you contribute to preserving cultural heritage and supporting
              communities around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div
        className="py-5 text-center text-light"
        style={{
          background: "linear-gradient(90deg, #AD4C4C, #6D2323)",
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-4">Our Mission</h2>
          <p
            className="lead mx-auto"
            style={{ maxWidth: "800px", lineHeight: "1.8", fontSize: "1.2rem" }}
          >
            To connect people with unique and meaningful handcrafted products
            while uplifting artisans and preserving age-old traditions. We
            strive to create a marketplace where every purchase has a purpose.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="container py-5">
        <h2
          className="fw-bold text-center mb-5"
          style={{
            color: "#6D2323",
            position: "relative",
          }}
        >
          Our Values
        </h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div
              className="card shadow border-0 h-100"
              style={{ transition: "transform 0.3s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div className="card-body">
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "#6D2323", fontSize: "1.25rem" }}
                >
                  Sustainability
                </h5>
                <p style={{ lineHeight: "1.8", color: "#555" }}>
                  Every product we offer is sourced responsibly, ensuring
                  minimal impact on the environment.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div
              className="card shadow border-0 h-100"
              style={{ transition: "transform 0.3s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div className="card-body">
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "#6D2323", fontSize: "1.25rem" }}
                >
                  Authenticity
                </h5>
                <p style={{ lineHeight: "1.8", color: "#555" }}>
                  We ensure every item is genuine and reflects the unique skills
                  of its creator.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div
              className="card shadow border-0 h-100"
              style={{ transition: "transform 0.3s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div className="card-body">
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "#6D2323", fontSize: "1.25rem" }}
                >
                  Community
                </h5>
                <p style={{ lineHeight: "1.8", color: "#555" }}>
                  By shopping with us, you contribute to artisan communities and
                  their livelihoods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
