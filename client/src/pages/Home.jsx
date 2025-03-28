import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import backgroundImage from "../assets/images/hero.jpg";
import { Link } from "react-router-dom";
import CategorySection from "../Components/CategorySection";

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error("❌ Fetch Error:", err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setUser(loggedInUser || null);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.warn("Please login to add items to your wishlist!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add to wishlist.");
      }

      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };
  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section */}
      <section
        className="text-center d-flex align-items-center justify-content-center vh-100 position-relative px-3"
        style={{
          backgroundColor: "#E3CAA5",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "8px solid #AD8B73",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container">
          <h1
            style={{
              color: "#FFFBE9",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "600",
              fontSize: "clamp(2.5rem, 5vw, 4rem)", // Responsive font size
              textTransform: "uppercase",
              textShadow: "3px 3px 10px rgba(0, 0, 0, 0.7)",
              marginBottom: "1rem",
            }}
          >
            Welcome to Artisan's Haven
          </h1>
          <p
            style={{
              color: "#E3CAA5",
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "400",
              fontSize: "clamp(1rem, 2vw, 1.5rem)", // Adjusts for small screens
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.8",
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.6)",
            }}
          >
            Discover unique, handcrafted goods made with love and passion.
            Support artisans and celebrate creativity.
          </p>
          <a
            href="#products"
            className="btn btn-lg mt-4"
            style={{
              display: "inline-block",
              backgroundColor: "#6D2323",
              color: "#FFFBE9",
              border: "none",
              padding: "12px 30px",
              borderRadius: "50px",
              fontSize: "1.2rem",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
              transition: "background-color 0.3s, transform 0.3s",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#AD8B73";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6D2323";
              e.target.style.transform = "scale(1)";
            }}
          >
            Explore Collections
          </a>
        </div>
      </section>

      {/* Product Section */}
      <section id="products" className="py-5 bg-white">
        <div className="container">
          {/* Section Heading */}
          <h2
            className="text-center mb-5"
            style={{ color: "#AD8B73", fontWeight: "500" }}
          >
            Our Handcrafted Goods
          </h2>

          {/* Loading Spinner */}
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div
              className="d-flex flex-wrap justify-content-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {products.map((product) => (
                <div key={product.id}>
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100"
                    style={{
                      width: "100%",
                      maxWidth: "350px",
                      margin: "auto",
                    }}
                  >
                    {/* Product Image */}
                    <div className="position-relative">
                      <img
                        src={`http://localhost:5000/uploads/${product.images[0]}`}
                        alt={product.title}
                        className="card-img-top rounded-top-4"
                        style={{
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Card Body */}
                    <div className="card-body text-center py-3 px-3">
                      <h6 className="card-title fw-bold text-dark">
                        {product.name}
                      </h6>
                      <p className="text-muted small">{product.description}</p>
                      <p className="fw-bold text-primary fs-6 mb-3">
                        ${product.price}
                      </p>

                      {/* Wishlist Button */}
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => addToWishlist(product)}
                        >
                          ❤️ Wishlist
                        </button>
                      </div>

                      {/* View Details Button */}
                      <Link
                        to={`/product/${product._id}`}
                        className="btn btn-sm btn-dark w-100 my-2 rounded-pill"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* {catgeroy section} */}
      <CategorySection products={products} />

      {/* Features Section */}
      <section
        id="features"
        className="py-5"
        style={{
          background: "linear-gradient(135deg, #F8F9FA, #FFFFFF)",
          color: "#4A4A4A",
        }}
      >
        <div className="container">
          <h2
            className="text-center mb-5"
            style={{
              fontWeight: "700",
              fontSize: "2.5rem",
              color: "#6C757D",
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            Why Shop With Us?
          </h2>

          <div
            className="d-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              padding: "0 1rem",
            }}
          >
            {/* Feature Box */}
            {[
              {
                icon: "🚚",
                title: "Fast Delivery",
                text: "Quick shipping for all handcrafted items.",
              },
              {
                icon: "💰",
                title: "Affordable Prices",
                text: "Best prices for high-quality goods.",
              },
              {
                icon: "⭐",
                title: "Exceptional Quality",
                text: "Carefully crafted with precision.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-4 rounded"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                  borderRadius: "12px",
                  padding: "2rem",
                  transition: "transform 0.3s ease, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0px 6px 16px rgba(0, 0, 0, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0px 4px 12px rgba(0, 0, 0, 0.08)";
                }}
              >
                <div
                  className="mb-3"
                  style={{
                    fontSize: "3rem",
                    color: "#5A6268",
                    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {feature.icon}
                </div>
                <h5
                  className="fw-bold"
                  style={{ fontSize: "1.4rem", color: "#495057" }}
                >
                  {feature.title}
                </h5>
                <p className="text-muted" style={{ fontSize: "1rem" }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="products" className="py-5 bg-white">
        <div className="container">
          {/* Section Heading */}
          <h2
            className="text-center mb-5"
            style={{ color: "#AD8B73", fontWeight: "500" }}
          >
            Our Handcrafted Goods
          </h2>

          {/* Loading Spinner */}
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div
              className="d-flex flex-wrap justify-content-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {products.map((product) => (
                <div key={product.id}>
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100"
                    style={{
                      width: "100%",
                      maxWidth: "350px",
                      margin: "auto",
                    }}
                  >
                    {/* Product Image */}
                    <div className="position-relative">
                      <img
                        src={`http://localhost:5000/uploads/${product.images[0]}`}
                        alt={product.title}
                        className="card-img-top rounded-top-4"
                        style={{
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Card Body */}
                    <div className="card-body text-center py-3 px-3">
                      <h6 className="card-title fw-bold text-dark">
                        {product.name}
                      </h6>
                      <p className="text-muted small">{product.description}</p>
                      <p className="fw-bold text-primary fs-6 mb-3">
                        ${product.price}
                      </p>

                      {/* Wishlist Button */}
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => addToWishlist(product)}
                        >
                          ❤️ Wishlist
                        </button>
                      </div>

                      {/* View Details Button */}
                      <Link
                        to={`/product/${product._id}`}
                        className="btn btn-sm btn-dark w-100 my-2 rounded-pill"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Callout Section */}
      <section
        id="featured-callout"
        className="py-5 text-center"
        style={{
          backgroundColor: "#F8F9FA", // Lighter background color
          borderTop: "8px solid #B2B2B2", // Softer border for a lighter look
          borderBottom: "8px solid #B2B2B2", // Softer border for a lighter look
        }}
      >
        <div className="container">
          <h2
            className="mb-4"
            style={{
              color: "#4B4B4B", // Darker text for contrast
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "600",
            }}
          >
            Explore Artisan's Featured Picks
          </h2>
          <p
            className="lead"
            style={{
              color: "#5D5D5D", // Slightly lighter text for easy readability
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1.2rem",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Our hand-selected collection showcases the best of artisan
            craftsmanship, ensuring quality and uniqueness in every piece.
          </p>
          <Link
            to="/shop"
            className="btn btn-lg mt-4"
            style={{
              backgroundColor: "#823030", // Lighter background for button
              color: "#FFFFFF", // White text for contrast
              border: "none",
              padding: "12px 30px",
              borderRadius: "50px",
              fontSize: "1.2rem",
              fontWeight: "500", // Added weight for better typography
              letterSpacing: "1px", // Slight letter-spacing for a more polished look
              textTransform: "uppercase", // Capitalized text for a clean, modern touch
              boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)", // Slightly stronger shadow for more depth
              transition:
                "background-color 0.3s, transform 0.3s, box-shadow 0.3s", // Smooth transitions
              display: "inline-block", // Ensures the button is treated as a block element while allowing margin
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#6D9BC3"; // Slightly darker shade on hover
              e.target.style.transform = "scale(1.05)"; // Smooth scale effect on hover
              e.target.style.boxShadow = "0 12px 20px rgba(0, 0, 0, 0.2)"; // Deep shadow on hover
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#A1C6EA"; // Return to original color
              e.target.style.transform = "scale(1)"; // Return to original scale
              e.target.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)"; // Return to original shadow
            }}
          >
            Browse All Products
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
