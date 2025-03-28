import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data.order);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch order");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h3>Loading Invoice...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-5">
        <h3>Order not found</h3>
      </div>
    );
  }

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <ToastContainer />

        <div
          className="card shadow-lg p-4"
          style={{
            maxWidth: "800px",
            margin: "auto",
            border: "1px solid #ddd",
          }}
        >
          {/* Print Button (Hidden in Print Mode) */}
          <div className="text-end">
            <button className="btn btn-dark print-hidden" onClick={handlePrint}>
              🖨️ Print Invoice
            </button>
          </div>

          {/* Invoice Header */}
          <div className="text-center border-bottom pb-3">
            <h2 className="fw-bold text-uppercase">Invoice</h2>
            <h5 className="text-muted">Order ID: {order._id}</h5>
            <p className="text-muted">
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Business & Delivery Details */}
          <div className="d-flex justify-content-between mt-3">
            <div>
              <h5 className="fw-bold">Billed To:</h5>
              <p className="mb-1">
                <strong>{order.user.name}</strong>
              </p>
              <p className="mb-1">Email: {order.user.email}</p>
              <p className="mb-1">Phone: {order.user.phone}</p>
            </div>
            <div className="text-end">
              <h5 className="fw-bold">Delivery Address:</h5>
              <p className="mb-1">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </p>
              <p className="mb-1">
                {order.deliveryAddress.state}, {order.deliveryAddress.country}
              </p>
              <p className="mb-1">
                <strong>Pincode:</strong> {order.deliveryAddress.postal_code}
              </p>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="table-responsive mt-4">
            <table className="table table-bordered text-center">
              <thead className="bg-dark text-white">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th className="print-hidden">Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.product.name}</td>
                    <td className="print-hidden">
                      <img
                        src={`http://localhost:5000/uploads/${item.product.images[0]}`}
                        alt={item.product.name}
                        width="50"
                        height="50"
                        className="rounded"
                      />
                    </td>
                    <td>₹{item.product.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="row mt-3 border-top pt-3">
            <div className="col-md-6">
              <h5>
                <strong>Payment Method:</strong> {order.paymentMethod}
              </h5>
              <p>
                <strong>Transaction ID:</strong> {order.transactionId}
              </p>
            </div>
            <div className="col-md-6 text-end">
              <h4 className="fw-bold text-success">
                Grand Total: ₹{order.totalAmount.toFixed(2)}
              </h4>
              <span
                className={`badge fs-6 ${
                  order.status === "Paid" ? "bg-success" : "bg-danger"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 border-top pt-3">
            <p className="fw-bold text-muted">
              Thank you for shopping with us!
            </p>
            <p className="text-muted small">
              If you have any questions about this invoice, please contact us at{" "}
              <br />
              <strong>Email:</strong> support@yourshop.com |{" "}
              <strong>Phone:</strong> +91 98765 43210
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style>
          {`
          @media print {
            .print-hidden {
              display: none !important;
            }
          }
        `}
        </style>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetails;
