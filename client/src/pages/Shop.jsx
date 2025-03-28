import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import backgroundImage from "../assets/images/hero.jpg";
import "../assets/style/productpage.css";
import categoriesData from "../data/categories";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filtering in real-time
  useEffect(() => {
    let updatedProducts = products;

    if (selectedCategory !== "All") {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (selectedSubCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.subcategory === selectedSubCategory
      );
    }

    if (selectedPrice !== "All") {
      const [min, max] = selectedPrice.split("-").map(Number);
      updatedProducts = updatedProducts.filter(
        (product) => product.price >= min && product.price <= max
      );
    }

    if (selectedRating !== "All") {
      updatedProducts = updatedProducts.filter(
        (product) => Math.round(product.rating) === parseInt(selectedRating)
      );
    }

    setFilteredProducts(updatedProducts);
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedPrice,
    selectedRating,
    products,
  ]);

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
    <div style={{ backgroundColor: "#FFFBE9" }}>
      <Navbar />

      <ToastContainer position="top-right" autoClose={3000} />

      <section
        id="hero"
        className="text-center text-white py-5"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to Our Store</h1>
          <p className="lead">
            Discover the finest handcrafted goods tailored just for you.
          </p>
        </div>
      </section>

      <div className="container my-4">
        <div className="row filter-section">
          {/* Category Filter */}
          <div className="col-md-3">
            <h4>Category</h4>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              {categoriesData.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-category Filter */}
          {selectedCategory !== "All" &&
            categoriesData.find((c) => c.name === selectedCategory)
              ?.subcategories.length > 0 && (
              <div className="col-md-3">
                <h4>Sub-category</h4>
                <select
                  className="form-select"
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                >
                  <option value="">All</option>
                  {categoriesData
                    .find((c) => c.name === selectedCategory)
                    ?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
            )}

          {/* Price Filter */}
          <div className="col-md-3">
            <h4>Price Range</h4>
            <select
              className="form-select"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            >
              <option value="All">All</option>
              <option value="0-500">$0 - $500</option>
              <option value="501-1000">$501 - $1000</option>
              <option value="1001-2000">$1001 - $2000</option>
              <option value="2001-5000">$2001 - $5000</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="col-md-3">
            <h4>Ratings</h4>
            <select
              className="form-select"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="All">All</option>
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
              <option value="2">★★☆☆☆ (2 Stars)</option>
              <option value="1">★☆☆☆☆ (1 Star)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Listing */}
      <section id="products" className="py-5">
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: "#AD8B73" }}>
            Our Handcrafted Goods
          </h2>
          <div className="row g-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center">No products found.</p>
            ) : (
              filteredProducts.map((product) => (
                <div className="col-md-4" key={product.id}>
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <img
                      src={`http://localhost:5000/uploads/${product.images[0]}`}
                      alt={product.title}
                      className="card-img-top rounded-top-4"
                      style={{ height: "220px", objectFit: "cover" }}
                    />
                    <div className="card-body text-center">
                      <h6 className="card-title fw-bold text-dark text-truncate">
                        {product.title}
                      </h6>
                      <p className="text-muted small">{product.description}</p>
                      <p className="fw-bold text-primary fs-6 mb-3">
                        ${product.price}
                      </p>
                      <p className="text-warning">⭐ {product.rating}</p>

                      {/* Wishlist Button */}
                      <button
                        className="btn btn-sm btn-outline-danger mb-2"
                        onClick={() => addToWishlist(product)}
                      >
                        ❤️ Wishlist
                      </button>
                      <Link
                        to={`/product/${product._id}`}
                        className="btn btn-sm btn-dark w-100 rounded-pill"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
