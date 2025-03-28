import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import categoriesData from "../data/categories";

const CategorySection = ({ products = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        return (
          product.category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
        );
      })
    : products;

  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">Shop by Category</h2>

      {/* Category Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
        {categoriesData.map((category) => (
          <button
            key={category.name}
            className={`btn btn-outline-dark ${
              selectedCategory === category.name ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="row g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div className="col-md-4" key={product.id || product.name}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                {product.images?.length > 0 && (
                  <img
                    src={`http://localhost:5000/uploads/${product.images[0]}`}
                    alt={product.name}
                    className="card-img-top rounded-top-4"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-dark">
                    {product.name}
                  </h6>
                  <p className="text-muted small">{product.description}</p>
                  <p className="fw-bold text-primary fs-6 mb-3">
                    ${product.price}
                  </p>
                  <Link
                    to={`/product/${product._id}`}
                    className="btn btn-sm btn-dark w-100 my-2 rounded-pill"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">
            No products available in this category.
          </p>
        )}
        {/* Show All Products Option */}
        {filteredProducts.length > 3 && (
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <Link
              to="/products"
              className="btn btn-lg btn-outline-dark w-100 rounded-pill text-center"
            >
              View All Products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
