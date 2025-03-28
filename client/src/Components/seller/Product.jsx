import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import categoriesData from "../../data/categories.js";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ category: "", price: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Get unique categories from products
  const categories = [...new Set(products.map((product) => product.category))];

  // Filter logic
  const filteredProducts = products.filter((product) => {
    return (
      (searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (category === "" || product.category === category) &&
      (minPrice === "" || product.price >= parseFloat(minPrice)) &&
      (maxPrice === "" || product.price <= parseFloat(maxPrice)) &&
      (!inStockOnly || product.stock > 0)
    );
  });

  let user = {};
  const token = localStorage.getItem("token");
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {
    console.error("Invalid user data in localStorage");
  }

  const userId = user?.id || null;
  const userRole = user?.role || null;
  const userToken = token;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "Stock must be 0 or more";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.subcategory.trim())
      newErrors.subcategory = "Subcategory is required";
    if (!formData.images.length && !editingProduct)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (e.target.name === "images") {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: files });
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();

      // Append images correctly
      if (Array.isArray(formData.images) && formData.images.length > 0) {
        if (formData.images.length > 6) {
          toast.error("You can upload a maximum of 6 images!");
          setLoading(false);
          return;
        }

        formData.images.forEach((file) => {
          form.append("images", file);
        });
      } else {
        toast.error("Please upload at least one image!");
        setLoading(false);
        return;
      }

      // Append other form data
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          form.append(key, formData[key]);
        }
      });

      // Ensure token is valid
      if (!userToken) {
        toast.error("Unauthorized: No token provided!");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${userToken}`,
      };

      let response;
      if (editingProduct && editingProduct._id) {
        // Update existing product
        response = await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          form,
          { headers }
        );
        toast.success("Product updated successfully!");
      } else {
        // Add new product
        response = await axios.post(
          "http://localhost:5000/api/products/add",
          form,
          { headers }
        );
        toast.success("Product added successfully!");
      }

      // Refresh product list and reset form
      fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product!");
      console.error("Axios Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return; // Exit if user cancels

    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Error deleting product!");
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: editingProduct.price || "",
        stock: editingProduct.stock || "",
        category: editingProduct.category || "",
        subcategory: editingProduct.subcategory || "",
        images: null, // Reset file input
      });
    }
  }, [editingProduct]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      subcategory: "",
      images: [],
    });
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="container mt-4">
      <ToastContainer />

      {userRole === "seller" && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Product Management</h2>
          <button
            className="btn btn-success"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Hide Form" : "Add Product"}
          </button>
        </div>
      )}
      {showForm && userRole === "seller" && (
        <div className="card p-3 mb-4">
          <h4>{editingProduct ? "Edit Product" : "Add Product"}</h4>
          <form onSubmit={handleSubmit}>
            {Object.keys(errors).map((key) => (
              <div className="alert alert-danger py-1 my-1" key={key}>
                {errors[key]}
              </div>
            ))}
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Product Name"
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Description"
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Price"
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Stock"
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesData.map((cat, index) => (
                    <option key={index} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select Subcategory</option>
                  {categoriesData
                    .find((cat) => cat.name === formData.category)
                    ?.subcategories.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  className="form-control"
                  required={!editingProduct}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : editingProduct
                ? "Update Product"
                : "Add Product"}
            </button>
          </form>
        </div>
      )}

      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="mb-3">Filter Products</h5>
        <div className="row g-2">
          {/* Search by Name */}
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="col-md-3">
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {/* In Stock Only */}
          <div className="col-md-2 d-flex align-items-center">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
            />
            <label className="form-check-label">In Stock Only</label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="bg-dark text-white">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price ($)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      {product.images?.length > 0 && (
                        <img
                          src={`http://localhost:5000/uploads/${product.images[0]}`}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>${product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Show Item
                      </button>
                      {userRole === "seller" && (
                        <>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedProduct && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-md">
              <div
                className="modal-content shadow-lg border-0"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                {/* Modal Header */}
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">
                    {selectedProduct.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                  ></button>
                </div>

                {/* Modal Body */}
                <div
                  className="modal-body p-3"
                  style={{ background: "#f9f9f9" }}
                >
                  {/* Image Carousel */}
                  {selectedProduct.images?.length > 0 && (
                    <div
                      id="productCarousel"
                      className="carousel slide"
                      data-bs-ride="carousel"
                    >
                      <div className="carousel-inner rounded-2 shadow-sm">
                        {selectedProduct.images.map((image, index) => (
                          <div
                            className={`carousel-item ${
                              index === 0 ? "active" : ""
                            }`}
                            key={index}
                          >
                            <img
                              src={`http://localhost:5000/uploads/${image}`}
                              alt={selectedProduct.name}
                              className="d-block w-100"
                              style={{
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Carousel Controls */}
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#productCarousel"
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon bg-dark rounded-circle p-1"></span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#productCarousel"
                        data-bs-slide="next"
                      >
                        <span className="carousel-control-next-icon bg-dark rounded-circle p-1"></span>
                      </button>
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="mt-3">
                    <p className="fs-6 mb-2">
                      <strong className="text-primary">Description:</strong>{" "}
                      {selectedProduct.description}
                    </p>
                    <p className="fs-6 mb-2">
                      <strong className="text-success">Price:</strong> $
                      {selectedProduct.price}
                    </p>
                    <p className="fs-6 mb-2">
                      <strong className="text-warning">Stock:</strong>{" "}
                      {selectedProduct.stock}
                    </p>
                    <p className="fs-6 mb-2">
                      <strong className="text-danger">Category:</strong>{" "}
                      {selectedProduct.category}
                    </p>
                    <p className="fs-6">
                      <strong className="text-info">Subcategory:</strong>{" "}
                      {selectedProduct.subcategory}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light">
                  <button
                    className="btn btn-sm btn-secondary px-3 py-1"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedProduct && <div className="modal-backdrop fade show"></div>}
      </div>
    </div>
  );
};

export default ProductManagement;
