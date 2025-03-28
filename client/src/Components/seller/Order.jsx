import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/orders/sellerorders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      } catch (error) {
        toast.error("Error fetching orders");
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Error updating order status");
      console.error("Error updating order status:", error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Error deleting order");
      console.error("Error deleting order:", error);
    }
  };

  const getAllowedStatusOptions = (currentStatus) => {
    const statusOptions = {
      Pending: ["Shipped", "Delivered", "Canceled"],
      Shipped: ["Delivered", "Canceled"],
      Delivered: ["Delivered"],
      Canceled: ["Canceled"],
    };
    return statusOptions[currentStatus] || [];
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setFilteredOrders(
      value === "" ? orders : orders.filter((order) => order.status === value)
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-center">Manage Orders</h2>

      <div className="d-flex justify-content-end mb-3">
        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={handleFilterChange}
        >
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.user.name}</td>
                <td>
                  {order.items.map((item) => item.product.name).join(", ")}
                </td>
                <td>{order.totalAmount}</td>
                <td>
                  <select
                    className="form-select"
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    disabled={
                      order.status === "Delivered" ||
                      order.status === "Canceled"
                    }
                  >
                    {getAllowedStatusOptions(order.status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteOrder(order._id)}
                    disabled={
                      order.status === "Delivered" || order.status === "Shipped"
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderManagement;
