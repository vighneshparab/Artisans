import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useReactToPrint } from "react-to-print";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";

function ReportSection() {
  const reportRef = useRef(null);
  const chartRef = useRef(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/seller/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSalesData(response.data);
      } catch (err) {
        setError("Failed to fetch report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const generatePDF = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Sales Report",
  });

  const saveChartAsImage = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "sales-chart.png";
        link.click();
      });
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container my-4">
      <div className="card shadow-lg p-4 border-0">
        <h2 className="text-center fw-bold text-primary mb-3">
          📊 Sales Report
        </h2>

        <div ref={reportRef} className="p-4 border rounded bg-light">
          <div className="row text-center">
            {[
              {
                label: "Total Sales",
                value: `$${salesData.totalSales?.toLocaleString()}`,
              },
              {
                label: "Total Orders",
                value: salesData.totalOrders,
              },
              {
                label: "Total Products",
                value: salesData.totalProducts,
              },
            ].map((item, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h5 className="fw-bold">{item.label}</h5>
                  <p className="fs-4 text-success fw-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <h4 className="mt-4 text-center fw-bold">📊 Sales by Product</h4>
          <div className="table-responsive">
            <table className="table table-hover table-bordered mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Product</th>
                  <th>Sales ($)</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {salesData.salesByProduct.map((product, index) => (
                  <tr key={index} className="text-center">
                    <td>{product._id}</td>
                    <td className="text-success fw-bold">
                      ${product.totalSales}
                    </td>
                    <td className="fw-bold">{product.totalOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="mt-4 text-center fw-bold">📊 Sales Trend</h4>
          <div ref={chartRef} className="bg-white p-3 rounded shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.salesTrend}>
                <XAxis dataKey="_id.date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-primary btn-lg px-4 me-3"
            onClick={generatePDF}
          >
            <FaDownload className="me-2" /> Download Report as PDF
          </button>
          <button
            className="btn btn-secondary btn-lg px-4"
            onClick={saveChartAsImage}
          >
            📷 Save Chart as Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportSection;
