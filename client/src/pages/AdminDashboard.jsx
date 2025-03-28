import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import defaultimg from "../assets/images/defaultimage.jpg";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaUser, FaSignOutAlt } from "react-icons/fa";
import {
  Form,
  Card,
  Button,
  Table,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  ToggleButton,
  ButtonGroup,
  Navbar,
  Nav,
  Modal,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [salesType, setSalesType] = useState("monthly");
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    profilePic: "",
    role: "",
    status: "",
    permissions: [],
    createdAt: "",
    updatedAt: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const filteredUsers = users.filter(
    (user) =>
      (searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter) &&
      (statusFilter === "" || user.status === statusFilter)
  );

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchSalesData();
  }, []);

  useEffect(() => {
    if (activeSection === "sales-reports") {
      fetchSalesReports();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/admin/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAdminData({
          name: data.name,
          email: data.email,
          profilePic: data.profilePic,
          role: data.role,
          status: data.status,
          permissions: data.permissions,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };
    fetchAdminProfile();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/dashboard/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(data);
    } catch (error) {
      setError("Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSalesReports = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard/sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensures proper content-type
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales reports.");
      }

      const data = await response.json();
      setSalesReports(data);
    } catch (err) {
      setError(err.message || "Failed to fetch sales reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Ensuring page reload to reset state
    window.location.href = "/login";
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(data);
    } catch (error) {
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/dashboard/sales",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMonthlySales(data.monthlySales || []);
      setDailySales(data.dailySales || []);
    } catch (error) {
      setError("Failed to load sales data");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "banned" : "active";
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`, // Match your API route
        { status: newStatus }, // Only updating status
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message
      toast.success(
        `User ${newStatus === "active" ? "unbanned" : "banned"} successfully`
      );

      // Update local state after successful API request
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  return (
    <Container fluid className="px-0">
      {/* Navbar */}
      <Navbar
        expand="lg"
        className="shadow-sm sticky-top px-3"
        style={{ background: "linear-gradient(45deg, #1E3A8A, #1E40AF)" }}
      >
        <Navbar.Brand className="fw-bold text-white">
          🚀 Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              onClick={() => setActiveSection("dashboard")}
              className="text-light d-flex align-items-center"
            >
              <FaTachometerAlt className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link
              onClick={() => setActiveSection("user-management")}
              className="text-light d-flex align-items-center"
            >
              <FaUsers className="me-2" /> User Management
            </Nav.Link>
            <Nav.Link
              onClick={() => setActiveSection("admin-profile")}
              className="text-light d-flex align-items-center"
            >
              <FaUser className="me-2" /> Profile
            </Nav.Link>
            <Button
              variant="outline-light"
              className="ms-3 d-flex align-items-center"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main Content */}
      <Row className="m-0">
        <Col md={12} className="p-4">
          <ToastContainer position="top-right" autoClose={3000} />
          {error && <Alert variant="danger">{error}</Alert>}

          {activeSection === "dashboard" && (
            <>
              <h2 className="text-center mb-4">Admin Dashboard</h2>
              {/* Dashboard Stats */}
              <Row>
                {loadingStats ? (
                  <Spinner animation="border" className="m-auto" />
                ) : (
                  stats &&
                  [
                    { label: "Total Users", value: stats.totalUsers },
                    { label: "Total Sellers", value: stats.totalSellers },
                    { label: "Total Orders", value: stats.totalOrders },
                    { label: "Total Sales ($)", value: stats.totalSales },
                  ].map((item, index) => (
                    <Col lg={3} md={6} sm={12} key={index} className="mb-4">
                      <Card className="shadow-sm text-center p-3 rounded-4 border-0 bg-light">
                        <h5 className="mb-2">{item.label}</h5>
                        <p className="fs-4 text-primary fw-bold">
                          {item.value}
                        </p>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>

              {/* Sales Chart Toggle */}
              <h4 className="mt-5">Sales Performance</h4>
              <ButtonGroup className="mb-3">
                <ToggleButton
                  type="radio"
                  variant="outline-primary"
                  checked={salesType === "monthly"}
                  onClick={() => setSalesType("monthly")}
                >
                  Monthly Sales
                </ToggleButton>
                <ToggleButton
                  type="radio"
                  variant="outline-primary"
                  checked={salesType === "daily"}
                  onClick={() => setSalesType("daily")}
                >
                  Daily Sales
                </ToggleButton>
              </ButtonGroup>

              {/* Sales Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={salesType === "monthly" ? monthlySales : dailySales}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {activeSection === "user-management" && (
            <>
              <h4 className="mt-5 mb-3">User Management</h4>
              {/* User Management Filters */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                    <option value="user">User</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* User Management Table */}
              {loadingUsers ? (
                <Spinner animation="border" className="m-auto" />
              ) : (
                <Table
                  striped
                  bordered
                  responsive
                  hover
                  className="shadow-sm rounded-4 overflow-hidden"
                >
                  <thead className="bg-dark text-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name || "N/A"}</td>
                          <td>{user.email || "N/A"}</td>
                          <td>{user.role}</td>
                          <td
                            className={
                              user.status === "active"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {user.status}
                          </td>
                          <td>
                            <Button
                              variant={
                                user.status === "active" ? "danger" : "success"
                              }
                              size="sm"
                              onClick={() =>
                                toggleUserStatus(user._id, user.status)
                              }
                            >
                              {user.status === "active" ? "Ban" : "Unban"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {activeSection === "admin-profile" && (
            <>
              <h4 className="mt-5 mb-3">Admin Profile</h4>
              <Card className="p-4 shadow-sm">
                <Card.Body className="text-center">
                  <img
                    src={adminData.profilePic || defaultimg}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    width="100"
                    height="100"
                  />
                  <h4>{adminData.name}</h4>
                  <p>{adminData.email}</p>
                  <p>
                    <strong>Role:</strong> {adminData.role}
                  </p>
                  <p>
                    <strong>Status:</strong> {adminData.status}
                  </p>
                  <p>
                    <strong>Permissions:</strong>{" "}
                    {adminData.permissions.join(", ")}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(adminData.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Updated At:</strong>{" "}
                    {new Date(adminData.updatedAt).toLocaleString()}
                  </p>
                  <Button variant="danger" onClick={handleLogout}>
                    Logout
                  </Button>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
