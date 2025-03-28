import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Defaultimage from "../assets/images/defaultimage.jpg";
import "../assets/style/profile.css";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import moment from "moment";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]); // Order History
  const [wishlist, setWishlist] = useState([]); // Wishlist Items

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    profilePic: null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!user) {
          setError("Unauthorized access. Please log in.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          profilePic: response.data.profilePic || null,
        });
      } catch (err) {
        setError(
          "Failed to fetch profile. " +
            (err.response?.data?.error || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("You must be logged in to view orders.");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/users/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          console.log(response.data.orders);
          setOrders(response.data.orders);
          toast.success("📦 Orders loaded successfully!");
        } else {
          toast.error(response.data.message || "Failed to fetch orders.");
        }
      } catch (err) {
        console.error("❌ Fetch Orders Error:", err);
        toast.error("Something went wrong while loading orders.");
      }
    };

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("⚠️ No authentication token found. Please log in.");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/users/wishlist",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.success && Array.isArray(response.data.wishlist)) {
          setWishlist(response.data.wishlist);
        } else {
          toast.error(
            "⚠️ Unexpected response format. Failed to load wishlist."
          );
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error(
          `⚠️ ${error.response?.data?.message || "Failed to load wishlist."}`
        );
      }
    };

    fetchUserProfile();
    fetchOrders();
    fetchWishlist();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "profilePic" || value instanceof File) {
          formDataToSend.append(key, value);
        }
      });
      await axios.put(
        "http://localhost:5000/api/users/editprofile",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError("Update failed. " + (err.response?.data?.error || err.message));
      toast.error("Profile update failed!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <ToastContainer />
        <div className="row">
          {/* Profile Card */}
          <div className="col-md-4">
            <div className="profile-card text-center p-4">
              <img
                src={
                  formData.profilePic instanceof File
                    ? URL.createObjectURL(formData.profilePic)
                    : user?.profilePic
                    ? `http://localhost:5000/uploads/${user.profilePic}`
                    : Defaultimage
                }
                alt="Profile"
                className="profile-img"
              />
              {editing ? (
                <>
                  <input
                    type="file"
                    className="form-control mt-2"
                    onChange={handleFileChange}
                  />
                </>
              ) : (
                <>
                  <h4 className="mt-3">{user?.name}</h4>
                  <p className="text-muted">{user?.email}</p>
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="col-md-8">
            <div className="profile-card">
              <h5>Profile Details</h5>
              <hr />
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-success me-2">
                    ✅ Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditing(false)}
                  >
                    ❌ Cancel
                  </button>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Full Name:</strong> {user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user?.phone || "Not Provided"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Address:</strong>{" "}
                      {user?.address || "Not Provided"}
                    </p>
                    <p>
                      <strong>Member Since:</strong> Jan 2023
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="profile-card mt-3">
              <h5>📜 Order History</h5>
              <hr />
              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Total</th>
                        <th>Items</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            <span
                              className={`badge ${
                                order.status === "Pending"
                                  ? "bg-warning"
                                  : "bg-success"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {moment(order.createdAt).format(
                              "DD MMM YYYY, h:mm A"
                            )}
                          </td>
                          <td>{order.paymentMethod}</td>
                          <td>₹{order.totalAmount.toFixed(2)}</td>
                          <td>
                            <ul className="list-unstyled">
                              {order.items.map((item) => (
                                <li key={item.product._id}>
                                  {item.product.name} × {item.quantity} — ₹
                                  {(item.product.price * item.quantity).toFixed(
                                    2
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <Link
                              to={`/orderbill/${order._id}`}
                              className="btn btn-primary btn-sm"
                            >
                              🧾 View Invoice
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">❌ No orders found.</p>
              )}
            </div>

            {/* Wishlist */}
            <div className="profile-card mt-3">
              <h5 className="mb-2">Saved Items</h5>
              <hr />
              <ul className="list-group">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <li
                      key={item._id}
                      className="list-group-item d-flex align-items-center"
                    >
                      <img
                        src={`http://localhost:5000/uploads/${item.images}`}
                        alt={item.name}
                        className="me-2 rounded"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />

                      <span>{item.name}</span>
                      <span className="ms-auto text-success fw-bold">
                        ${item.price}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-muted text-center">
                    No saved items found.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
