import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Home";
import About from "../pages/About";
import ContactUs from "../pages/Contactus";
import Shop from "../pages/Shop";
import Product from "../pages/Product";
import Cart from "../pages/Cart";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../Components/Protectedroutes";
import SellerDashboard from "../pages/SellerDashboard";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import OrderDetails from "../pages/OrderDetails";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/wishlist" element={<Wishlist />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/orderbill/:orderId" element={<OrderDetails />} />

      <Route
        path="/cart"
        element={
          <ProtectedRoute role="user">
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller-dashboard"
        element={
          <ProtectedRoute role="seller">
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute role="user">
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path=""
        element={
          <ProtectedRoute role="user">
            <OrderDetails />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
