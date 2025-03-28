import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SellDashboard from "../Components/seller/Dashboard";
import ProductManagement from "../Components/seller/Product";
import OrderManagement from "../Components/seller/Order";
import ReportSection from "../Components/seller/Report";
import ProfileSection from "../Components/seller/Profile";

const SellerDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, key: "dashboard" },
    { name: "Products", icon: <FaBox />, key: "products" },
    { name: "Orders", icon: <FaShoppingCart />, key: "orders" },
    { name: "Report", icon: <FaChartBar />, key: "report" },
    { name: "Profile", icon: <FaUser />, key: "profile" },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 h-100">
      {/* Mobile Navbar */}
      <nav className="navbar d-md-none px-3 shadow-sm bg-light">
        <button
          className="btn text-dark"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
        >
          <FaBars />
        </button>
        <h4 className="text-dark m-0 fw-bold">Seller Dashboard</h4>
        <button className="btn text-dark" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </nav>

      <div className="d-flex flex-grow-1" style={{ minHeight: "100vh" }}>
        {/* Sidebar for Large Screens */}
        <div
          className="d-none d-md-flex flex-column p-3 shadow bg-light"
          style={{ width: "260px" }}
        >
          <h4 className="text-center fw-bold">Seller Dashboard</h4>
          <ul className="nav flex-column mt-4 flex-grow-1">
            {menuItems.map(({ name, icon, key }) => (
              <li className="nav-item" key={key}>
                <button
                  className={`nav-link btn btn-link w-100 text-start p-2 rounded ${
                    activePage === key
                      ? "fw-bold bg-secondary text-white shadow-sm"
                      : "text-dark"
                  }`}
                  onClick={() => setActivePage(key)}
                >
                  {icon} <span className="ms-2">{name}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Logout Button Under Profile */}
          <button
            className="btn btn-danger w-100 fw-bold mt-3"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        </div>

        {/* Mobile Offcanvas Sidebar */}
        <div className="d-md-none">
          <div
            className="offcanvas offcanvas-start text-dark bg-light"
            id="mobileSidebar"
          >
            <div className="offcanvas-header">
              <h5 className="fw-bold">Seller Dashboard</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="nav flex-column">
                {menuItems.map(({ name, icon, key }) => (
                  <li className="nav-item" key={key}>
                    <button
                      className={`nav-link btn btn-link text-start p-2 ${
                        activePage === key
                          ? "fw-bold bg-secondary text-white shadow-sm"
                          : "text-dark"
                      }`}
                      onClick={() => setActivePage(key)}
                      data-bs-dismiss="offcanvas"
                    >
                      {icon} <span className="ms-2">{name}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Logout Button Under Profile */}
              <button
                className="btn btn-danger w-100 mt-3 fw-bold"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column">
          <div
            className="container-fluid p-4 text-dark flex-grow-1"
            style={{
              backgroundColor: "#FAF3E0",
              overflow: "auto",
            }}
          >
            {activePage === "dashboard" && <SellDashboard />}
            {activePage === "products" && <ProductManagement />}
            {activePage === "orders" && <OrderManagement />}
            {activePage === "report" && <ReportSection />}
            {activePage === "profile" && <ProfileSection />}
          </div>

          {/* Footer */}
          <footer className="bg-light text-center text-dark py-3 mt-auto shadow-sm">
            &copy; {new Date().getFullYear()} Seller Dashboard. All rights
            reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
