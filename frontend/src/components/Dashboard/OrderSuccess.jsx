import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaBoxOpen } from "react-icons/fa";
import axios from "axios";
import PropTypes from "prop-types";
import logo from "../../components/Products/Navbar/logo.png";

const OrderSuccess = ({ setUser: setGlobalUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = location.state?.orderId;
  const paymentId = location.state?.paymentId;

  useEffect(() => {
    if (!orderId) {
      navigate("/dashboard");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`
        );
        setOrderDetails(response.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          "Failed to load order details. Please check your account for confirmation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (typeof setGlobalUser === "function") {
      setGlobalUser(null);
    }
    navigate("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-700">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-yellow-500 text-6xl mb-4 flex justify-center">
            <FaCheckCircle />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Received</h1>
          <p className="text-gray-600 mb-6">
            Your payment was successful, but we couldnt load your complete order
            details.
          </p>
          <p className="text-gray-800 mb-4">
            Payment ID: <span className="font-semibold">{paymentId}</span>
          </p>
          <p className="text-gray-800 mb-6">
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-primary text-white py-2 px-6 rounded-full hover:bg-primary/90 flex items-center gap-2"
            >
              <FaHome /> Return Home
            </Link>
            <Link
              to="/orders"
              className="border border-primary text-primary py-2 px-6 rounded-full hover:bg-primary/10 flex items-center gap-2"
            >
              <FaBoxOpen /> View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary/40 py-3 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link
            to="/dashboard"
            className="font-bold text-2xl sm:text-3xl flex items-center gap-2"
          >
            <img src={logo} alt="logo" className="w-10" />
            <span className="text-primary">CustomHive</span>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-6 flex justify-center">
              <FaCheckCircle />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. Your payment has been processed
              successfully.
            </p>
          </div>
          <div className="border-t border-b py-6 my-6">
            <h2 className="text-lg font-semibold mb-3 text-primary">
              Order Information
            </h2>
            <p className="text-gray-700">
              Order ID: {orderDetails?.order_id || orderId}
            </p>
            <p className="text-gray-700">
              Payment ID: {orderDetails?.payment_id || paymentId}
            </p>
            <p className="text-gray-700">
              Date:{" "}
              {orderDetails?.date ? formatDate(orderDetails.date) : "Just now"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderSuccess.propTypes = { setUser: PropTypes.func };
export default OrderSuccess;
