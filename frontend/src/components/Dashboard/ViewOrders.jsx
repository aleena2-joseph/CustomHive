import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaEye,
  FaFileInvoice,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

import Header from "./Header";

const ViewOrders = ({ userEmail, setUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    orderId: null,
    rating: 0,
    comment: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/vieworders/${userEmail}`
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleRateProduct = (orderId) => {
    setRatingData({
      orderId,
      rating: 0,
      comment: "",
    });
    setShowRatingModal(true);
    setSubmitMessage({ type: "", text: "" });
  };

  const handleStarClick = (rating) => {
    setRatingData({ ...ratingData, rating });
  };

  const handleCommentChange = (e) => {
    setRatingData({ ...ratingData, comment: e.target.value });
  };

  const handleSubmitRating = async () => {
    if (ratingData.rating === 0) {
      setSubmitMessage({
        type: "error",
        text: "Please select a rating",
      });
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await axios.post("http://localhost:5000/reviews", {
        orderId: ratingData.orderId,
        rating: ratingData.rating,
        comment: ratingData.comment,
      });

      setSubmitMessage({
        type: "success",
        text: response.data.message || "Review submitted successfully!",
      });

      // Close the modal after 2 seconds
      setTimeout(() => {
        setShowRatingModal(false);
        setSubmitMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to submit review",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setRatingData({
      orderId: null,
      rating: 0,
      comment: "",
    });
    setSubmitMessage({ type: "", text: "" });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "delivered":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render star rating component
  const StarRating = ({ rating, onStarClick }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onStarClick(star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <FaStar className="text-yellow-400 text-xl" />
            ) : (
              <FaRegStar className="text-gray-400 text-xl hover:text-yellow-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setUser={setUser} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3 mb-6">
            <FaFileInvoice />
            Your Order History
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <FaShoppingBag className="text-6xl text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-6">
                You havent placed any orders yet
              </p>
              <Link
                to="/dashboard"
                className="bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/80 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Price</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 font-medium">
                        #{order.order_id}
                      </td>
                      <td className="px-4 py-4">{order.product_name}</td>
                      <td className="px-4 py-4 text-center">₹{order.price}</td>
                      <td className="px-4 py-4 text-center">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        ₹{order.total_amount}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {new Date(order.order_date).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(order.order_date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => handleRateProduct(order.order_id)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                          title="Rate Product"
                        >
                          <FaStar className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary">
                  Order Details
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.order_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Product Details</h4>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0">
                        {selectedOrder.product_image ? (
                          <img
                            src={`http://localhost:5000/uploads/products/${selectedOrder.product_image}`}
                            alt={selectedOrder.product_name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium">
                          {selectedOrder.product_name}
                        </h5>
                        <p className="text-sm text-gray-500">
                          Quantity: {selectedOrder.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Unit Price: ₹{selectedOrder.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        ₹{selectedOrder.price * selectedOrder.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%)</span>
                      <span>
                        ₹
                        {(
                          selectedOrder.price *
                          selectedOrder.quantity *
                          0.18
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={handleCloseDetails}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleRateProduct(selectedOrder.order_id);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-md transition-colors"
                  >
                    Rate Product
                  </button>
                  <button className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-md transition-colors">
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary">
                  Rate Your Purchase
                </h3>
                <button
                  onClick={handleCloseRatingModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="border-t pt-4">
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    How would you rate your experience with this product?
                  </p>
                  <div className="flex justify-center mb-4">
                    <StarRating
                      rating={ratingData.rating}
                      onStarClick={handleStarClick}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">
                    Share your feedback (optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Tell us what you liked or didn't like about the product..."
                    value={ratingData.comment}
                    onChange={handleCommentChange}
                  ></textarea>
                </div>
                {submitMessage.text && (
                  <div
                    className={`mb-4 p-3 rounded-md ${
                      submitMessage.type === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={handleCloseRatingModal}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-md transition-colors flex items-center"
                    onClick={handleSubmitRating}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CustomHive</h3>
              <p className="text-gray-400">
                Your one-stop shop for custom products and merchandise.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© 2025 CustomHive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

ViewOrders.propTypes = {
  rating: PropTypes.number.isRequired,
  onStarClick: PropTypes.func.isRequired,
};

ViewOrders.propTypes = {
  userEmail: PropTypes.string.isRequired,
  setUser: PropTypes.func,
};

export default ViewOrders;
