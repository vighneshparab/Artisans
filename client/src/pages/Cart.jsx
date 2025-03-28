import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({
  clientSecret,
  cartItems,
  totalAmount,
  address,
  handleClose,
  clearCart,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [userName, setUserName] = useState("");
  const [productStock, setProductStock] = useState({});

  const authToken = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    fetchUserDetails();
    fetchProductStock();
  }, [authToken, userId, cartItems]);

  const fetchUserDetails = async () => {
    if (!authToken || !userId) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.name) {
        setUserName(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error fetching user details");
    }
  };

  const fetchProductStock = async () => {
    try {
      const stockData = {};
      for (const item of cartItems) {
        const response = await axios.get(
          `http://localhost:5000/api/products/${item.product._id}`
        );
        stockData[item.product._id] = response.data.stock;
      }
      setProductStock(stockData);
    } catch (error) {
      console.error("Error fetching product stock:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check stock availability
    for (const item of cartItems) {
      if (item.quantity > (productStock[item.product._id] || 0)) {
        toast.error(
          `Not enough stock available for ${item.product.name}. Available: ${
            productStock[item.product._id]
          }`
        );
        return;
      }
    }

    if (!stripe || !elements) {
      toast.error("Stripe is not properly initialized.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setPaymentError("Payment details are missing.");
        setIsProcessing(false);
        return;
      }

      // Ensure elements are submitted properly
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error) {
        setPaymentError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");

        // Call function to place order after payment
        await handlePaymentSuccess(paymentIntent.id);

        handleClose();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setPaymentError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to place the order
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      console.log("Placing order with PaymentIntent ID:", paymentIntentId);

      const response = await axios.post(
        "http://localhost:5000/api/orders/place-order",
        {
          cartItems,
          totalAmount,
          address,
          paymentMethod: "Credit Card",
          paymentIntentId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("Order Response:", response.data);

      if (response.data.success) {
        const orderId = response.data.orderId;
        alert("🎉 Order placed successfully!");

        // 🔹 Remove items from cart after order placement
        for (const item of cartItems) {
          const productId = item.product._id || item.product;

          try {
            await axios.delete("http://localhost:5000/api/users/cart/remove", {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              data: { productId },
            });

            console.log(`✅ Removed product ${productId} from cart`);
          } catch (cartError) {
            console.error(
              `❌ Failed to remove product ${productId}:", cartError`
            );
            toast.error(`Could not remove product ${productId} from cart.`);
          }
        }

        toast.success("🛒 Cart cleared successfully!");

        // ⏳ Wait a moment before navigating for better UX
        setTimeout(() => {
          window.location.href = `/orderbill/${orderId}`;
        }, 1500);
      } else {
        toast.error("⚠️ Failed to place order: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Order Placement Error:", error);
      toast.error("Something went wrong while placing your order.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <CardElement className="mb-3 p-2 border rounded" />
      {paymentError && <div className="text-danger mb-2">{paymentError}</div>}
      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </Form>
  );
};

// Main Cart Component
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [quantityTimeouts, setQuantityTimeouts] = useState({});
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const authToken = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  useEffect(() => {
    fetchUserDetails();
    fetchCartItems();
  }, [authToken, userId]);

  const fetchCartItems = async () => {
    if (!authToken || !userId) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/cart/",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data.success) {
        setCartItems(response.data.cart);
      }
    } catch {
      toast.error("Error fetching cart items");
    }
  };

  const fetchUserDetails = async () => {
    if (!authToken || !userId) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.name) {
        setUserName(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error fetching user details");
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    clearTimeout(quantityTimeouts[productId]);
    const timeout = setTimeout(
      () => updateQuantity(productId, newQuantity),
      1000
    );
    setQuantityTimeouts((prev) => ({ ...prev, [productId]: timeout }));
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/cart/update`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success("Quantity updated!");
    } catch {
      toast.error("Error updating quantity");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/cart/remove`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { productId },
      });
      toast.success("Item removed from cart!");
      fetchCartItems();
    } catch {
      toast.error("Error removing item");
    }
  };

  // Calculate prices
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const gst = subtotal * 0.18;
  const deliveryCharge = 40;
  const totalPrice = subtotal + gst + deliveryCharge;

  const handleProceedToCheckout = () => setShowAddressModal(true);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmitAddress = async () => {
    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.zip.trim()
    ) {
      return toast.error("Please enter a complete delivery address!");
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/orders/create-payment-intent",
        {
          amount: totalPrice,
          customerAddress: {
            line1: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.zip,
            country: "IN",
          },
          userName: userName || (await fetchUserDetails()),
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowAddressModal(false);
        setShowPaymentModal(true);
        toast.success("Payment initiated!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  if (!cartItems.length) {
    return (
      <>
        <Navbar />
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center min-vh-100 w-100 px-4"
          style={{
            background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
          }}
        >
          <div className="fs-1">🛒</div>
          <h2 className="fw-bold text-dark fs-3 mt-3">Your Cart is Empty 😢</h2>
          <p className="text-muted fs-5">
            Oops! You haven’t added anything yet. Let’s fix that!
          </p>
          <Link
            to="/shop "
            className="mt-4 px-4 py-2 btn btn-primary btn-lg fw-bold shadow text-decoration-none"
          >
            🛍️ Start Shopping
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer />

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={8}>
            <h3 className="fw-bold mb-4">Shopping Cart</h3>
            <Table
              responsive
              bordered
              hover
              className="text-center align-middle"
            >
              <thead className="bg-light">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.product._id}>
                    <td className="d-flex align-items-center">
                      <img
                        src={`http://localhost:5000/uploads/${item.product.images}`}
                        alt={item.product.name}
                        width="60"
                        className="rounded me-3"
                      />
                      {item.product.name}
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        className="form-control w-50 mx-auto"
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product._id,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td>₹{(item.product.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm p-3">
              <h4 className="fw-bold">Order Summary</h4>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>GST (18%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Delivery:</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
      {/* Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Shipping Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                required
                name="street"
                value={address.street}
                onChange={handleAddressChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                required
                name="city"
                value={address.city}
                onChange={handleAddressChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                required
                name="state"
                value={address.state}
                onChange={handleAddressChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>ZIP Code</Form.Label>
              <Form.Control
                required
                name="zip"
                value={address.zip}
                onChange={handleAddressChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddressModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAddress}>
            Continue to Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                cartItems={cartItems} // Already available in parent
                totalAmount={totalPrice} // Pass totalPrice as totalAmount
                address={address} // Already available in parent
                handleClose={() => setShowPaymentModal(false)}
              />
            </Elements>
          ) : null}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Cart;
