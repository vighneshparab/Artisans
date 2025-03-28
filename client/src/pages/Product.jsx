import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import Toast
import "react-toastify/dist/ReactToastify.css"; // Import Toast CSS

const Product = () => {
  const { productId } = useParams();
  console.log(productId);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const API_URL = "http://localhost:5000";

  const addToCart = async (product, quantity = 1) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.warn("Please login to add items to your cart!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("🔒 Authentication required. Please log in again.");
        return;
      }

      quantity = parseInt(quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        toast.error("❌ Invalid quantity. Please select at least 1 item.");
        return;
      }

      const requestData = {
        userId: user.id,
        productId: product._id,
        quantity,
      };

      const response = await fetch(`http://localhost:5000/api/users/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add to cart.");
      }

      toast.success(`✅ ${product.name} (${quantity}) added to cart!`);
    } catch (error) {
      toast.error("❌ Something went wrong. Please try again.");
    }
  };

  const addToWishlist = async (product) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      toast.warn("Please login to add items to your cart!");
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

  useEffect(() => {
    if (product) {
      axios
        .get(`http://localhost:5000/api/products/category/${product.category}`)
        .then((response) => {
          setRelatedProducts(response.data);
        })
        .catch((error) => {
          console.error("Error fetching related products:", error);
        });
    }
  }, [product]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${productId}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <div className="text-center my-5">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center my-5">Product not found</div>;
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="container-fluid py-5"
        style={{
          background: "linear-gradient(to right, #f9f9f9, #ffffff)",
          minHeight: "100vh",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            {/* Product Images */}
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <img
                  src={`http://localhost:5000/uploads/${product.images[0]}`}
                  className="img-fluid rounded"
                  alt={product.name}
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </div>
              {/* Thumbnails */}
              <div className="row mt-3 gx-2">
                {product.images.map((thumb, index) => (
                  <div key={index} className="col-3">
                    <img
                      src={`http://localhost:5000/uploads/${thumb}`}
                      className="img-fluid border rounded cursor-pointer"
                      alt="Thumbnail"
                      style={{
                        transition: "transform 0.2s",
                        cursor: "pointer",
                        boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.1)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="col-md-6">
              <div className="p-4 border rounded shadow-sm bg-white">
                <h2 className="fw-bold text-dark">{product.name}</h2>
                <p className="text-muted">by {product.brand}</p>

                <div className="d-flex align-items-center">
                  <span
                    className="badge bg-success me-2 px-3 py-2"
                    style={{ fontSize: "14px" }}
                  >
                    {product.rating} ⭐
                  </span>
                  <span className="text-secondary">
                    ({product.reviews} Reviews)
                  </span>
                </div>

                <h3 className="text-danger mt-3">${product.price}</h3>
                <p className="mt-3 text-dark">{product.description}</p>

                {/* Quantity & Buttons */}
                <div className="d-flex align-items-center mt-3 gap-2 flex-wrap">
                  {/* Quantity Selector */}
                  <div className="d-flex align-items-center border rounded-pill px-2 py-1 bg-light shadow-sm">
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      style={{
                        borderRadius: "50%",
                        fontSize: "0.85rem",
                        padding: "4px 6px",
                      }}
                      onClick={() => {
                        const input = document.getElementById(
                          `quantity-${product._id}`
                        );
                        if (input.value > 1)
                          input.value = parseInt(input.value, 10) - 1;
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      id={`quantity-${product._id}`}
                      className="form-control text-center border-0 bg-transparent mx-1"
                      min="1"
                      defaultValue="1"
                      style={{
                        width: "60px",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    />
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      style={{
                        borderRadius: "50%",
                        fontSize: "1rem",
                        padding: "4px 6px",
                      }}
                      onClick={() => {
                        const input = document.getElementById(
                          `quantity-${product._id}`
                        );
                        input.value = parseInt(input.value, 10) + 1;
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className="btn btn-dark btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1 shadow-sm"
                    style={{ fontSize: "0.9rem", transition: "0.3s ease" }}
                    onClick={() => {
                      const quantity = parseInt(
                        document.getElementById(`quantity-${product._id}`)
                          .value,
                        10
                      );
                      addToCart(product, quantity);
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#222")}
                    onMouseOut={(e) => (e.target.style.background = "#000")}
                  >
                    🛒 Add to Cart
                  </button>

                  {/* Wishlist Button */}
                  <button
                    className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1 shadow-sm"
                    style={{ fontSize: "0.9rem", transition: "0.3s ease" }}
                    onClick={() => addToWishlist(product)}
                    onMouseOver={(e) => (e.target.style.background = "#ff4d4d")}
                    onMouseOut={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    ❤️ Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="row mt-5 text-center">
            <h4 className="fw-bold text-dark">You May Also Like</h4>
            {relatedProducts.length > 0 ? (
              relatedProducts.map((related) => (
                <div key={related.id} className="col-md-4 p-3">
                  <div className="card shadow-sm border-0">
                    <img
                      src={`http://localhost:5000/uploads/${related.images[0]}`}
                      className="img-fluid rounded-top"
                      alt={related.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="p-3">
                      <h5 className="fw-bold">{related.name}</h5>
                      <p className="text-danger fw-bold">${related.price}</p>
                      <Link
                        to={`/product/${related._id}`}
                        className="btn btn-sm btn-dark w-100 rounded-pill"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-warning">
                No related products found.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
