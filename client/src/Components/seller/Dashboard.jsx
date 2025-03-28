import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

function SellDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [graphData, setGraphData] = useState({
    salesData: [],
    ordersData: [],
    salesByProduct: [],
    salesByCategory: [],
  });

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingGraphs, setLoadingGraphs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setLoadingMetrics(false);
          return;
        }

        // Fetch key metrics
        const response = await axios.get(
          "http://localhost:5000/api/seller/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMetrics({
          totalSales: response.data.totalSales,
          totalOrders: response.data.totalOrders,
          totalProducts: response.data.totalProducts,
        });

        setLoadingMetrics(false);
        setTimeout(fetchGraphData, 500); // Delay for better UX
      } catch (err) {
        setError("Failed to fetch dashboard data.");
        setLoadingMetrics(false);
        setLoadingGraphs(false);
      }
    };

    const fetchGraphData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/seller/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGraphData({
          salesData: response.data.salesTrend || [],
          ordersData: response.data.ordersTrend || [],
          salesByProduct: response.data.salesByProduct || [],
          salesByCategory: response.data.salesByCategory || [],
        });

        setLoadingGraphs(false);
      } catch (err) {
        setLoadingGraphs(false);
      }
    };

    fetchMetrics();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4560"];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Seller Dashboard</h2>

      {loadingMetrics ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card p-4 text-center shadow-lg">
                <h5>Total Sales</h5>
                <h3 className="text-primary">
                  ${metrics.totalSales.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-4 text-center shadow-lg">
                <h5>Orders</h5>
                <h3 className="text-success">{metrics.totalOrders}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-4 text-center shadow-lg">
                <h5>Products</h5>
                <h3 className="text-warning">{metrics.totalProducts}</h3>
              </div>
            </div>
          </div>

          {loadingGraphs ? (
            <div className="text-center">
              <div className="spinner-border text-secondary" role="status">
                <span className="sr-only">Loading graphs...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="card p-4 shadow-lg mb-4">
                <h4 className="text-center">Sales Trend (Hourly)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={graphData.salesData}>
                    <XAxis dataKey="_id.date" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-4 shadow-lg mb-4">
                <h4 className="text-center">Orders Over Time (Hourly)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graphData.ordersData}>
                    <XAxis dataKey="_id.date" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-4 shadow-lg mb-4">
                <h4 className="text-center">Sales by Product</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graphData.salesByProduct}>
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="totalSales" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-4 shadow-lg">
                <h4 className="text-center">Sales by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={graphData.salesByCategory}
                      dataKey="totalSales"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {graphData.salesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SellDashboard;
