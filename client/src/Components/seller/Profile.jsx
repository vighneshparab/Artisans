import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Defaultimage from "../../assets/images/defaultimage.jpg";

function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    storeName: "",
    storeDescription: "",
    profilePic: null,
  });

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!user || user.role !== "seller") {
          setError("Unauthorized access. Please log in as a seller.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/users/profile/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSeller(response.data);
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          storeName: response.data.storeName || "",
          storeDescription: response.data.storeDescription || "",
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

    fetchSellerProfile();
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

      const response = await axios.put(
        `http://localhost:5000/api/users/editprofile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Show success toast
      toast.success("Profile updated successfully!");

      // Reload the updated profile
      setSeller(response.data);
      setEditing(false);
    } catch (err) {
      setError("Update failed. " + (err.response?.data?.error || err.message));
      toast.error("Profile update failed!");
    }
  };

  if (loading)
    return (
      <div className="text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="text-center">Seller Profile</h2>
      <div className="card p-4 shadow-lg">
        <div className="text-center">
          <img
            src={
              seller.profilePic
                ? `http://localhost:5000/uploads/${seller.profilePic}`
                : Defaultimage
            }
            alt="Profile"
            className="rounded-circle"
            width="150"
            height="150"
          />
          <h4 className="mt-3">{seller.name}</h4>
          <p className="text-muted">{seller.email}</p>
        </div>
        {editing ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Store Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>Store Description</label>
                <textarea
                  className="form-control"
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="col-md-12 mb-3">
                <label>Profile Picture</label>
                <input
                  type="file"
                  className="form-control"
                  name="profilePic"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="mt-4">
            <p>
              <strong>Phone:</strong> {seller.phone || "Not Provided"}
            </p>
            <p>
              <strong>Address:</strong> {seller.address || "Not Provided"}
            </p>
            <p>
              <strong>Store Name:</strong> {seller.storeName}
            </p>
            <p>
              <strong>Store Description:</strong>{" "}
              {seller.storeDescription || "Not Provided"}
            </p>
            <button
              className="btn btn-success mt-3"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProfile;
