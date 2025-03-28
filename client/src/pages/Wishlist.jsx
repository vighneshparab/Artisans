import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/users/wishlist/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setWishlist(response.data.wishlist);
        } else {
          console.error("Failed to fetch wishlist:", response.data.message);
        }
      } catch (error) {
        console.error(
          "Error fetching wishlist:",
          error.response?.data?.message || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return <p>Loading wishlist...</p>;
  }

  // Move Item to Cart
  const moveToCart = async (productId) => {
    try {
      await axios.post("/api/cart/add", { productId });
      await removeItem(productId, true);
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  };

  // Remove Item from Wishlist
  const removeItem = async (productId, movedToCart = false) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/users/wishlist/remove",
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item._id !== productId)
        );
        toast.success(
          movedToCart ? "Item moved to cart!" : "Item removed from wishlist!"
        );
      } else {
        console.error("Failed to remove item:", response.data.message);
        toast.error("Failed to remove item.");
      }
    } catch (error) {
      console.error(
        "Error removing item from wishlist:",
        error.response?.data?.message || error.message
      );
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#2c3e50" }}>
          ❤️ My Wishlist
        </h2>

        {loading ? (
          <h3 className="text-muted text-center">Loading Wishlist...</h3>
        ) : wishlist.length === 0 ? (
          <div className="text-center my-5">
            <h3 className="text-muted">Your wishlist is empty! 😢</h3>
            <Link to="/shop" className="btn btn-dark mt-3">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row justify-content-center">
            {wishlist.map((item) => (
              <motion.div
                key={item._id}
                className="col-md-4 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <div className="card border-0 shadow-lg rounded-lg overflow-hidden position-relative">
                  <div className="position-relative">
                    <img
                      src={`http://localhost:5000/uploads/${item.images[0]}`}
                      className="card-img-top"
                      alt={item.name}
                    />
                    {/* Delete Button */}
                    <motion.div
                      className="position-absolute top-0 end-0 m-2"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item._id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#ff453a",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <FaTrash size={16} color="white" />
                    </motion.div>
                  </div>
                  <div className="card-body text-center">
                    <h5
                      className="card-title fw-bold"
                      style={{ color: "#2c3e50" }}
                    >
                      {item.name}
                    </h5>
                    <p className="fw-bold text-danger fs-5">
                      ${item.price.toFixed(2)}
                    </p>
                    <Link
                      to={`/product/${item._id}`}
                      className="btn btn-sm btn-dark w-100 rounded-pill"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
