import { useState, useEffect } from "react";

import axios from "axios";

import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
const OrdersPage = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/orders/${user.email}`
      );
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderIds((prevIds) => {
      if (prevIds.includes(orderId)) {
        return prevIds.filter((id) => id !== orderId);
      } else {
        return [...prevIds, orderId];
      }
    });
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Header setUser={setUser} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-primary mb-6 hover:underline"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-xl mb-4">You dont have any orders yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        Order #{order.order_id.substring(0, 10)}...
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleOrderDetails(order.order_id)}
                    className="text-primary hover:text-primary/80 text-sm font-medium underline"
                  >
                    {expandedOrderIds.includes(order.order_id)
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {expandedOrderIds.includes(order.order_id) && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-md font-medium mb-3">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={`${order.order_id}-${item.product_id}`}
                            className="flex flex-col md:flex-row gap-4 border-b pb-4"
                          >
                            <div className="w-full md:w-1/4 flex justify-center">
                              <img
                                src={
                                  item.Product_image
                                    ? item.Product_image.startsWith("http")
                                      ? item.Product_image
                                      : `http://localhost:5000/${item.Product_image}`
                                    : "https://via.placeholder.com/100x100?text=No+Image"
                                }
                                alt={item.Product_name}
                                className="w-24 h-24 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/100x100?text=No+Image";
                                }}
                              />
                            </div>
                            <div className="w-full md:w-3/4">
                              <h5 className="font-medium">
                                {item.Product_name}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="text-sm">
                                  <span className="text-gray-500">
                                    Quantity:{" "}
                                  </span>
                                  <span>{item.quantity}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500">Price: </span>
                                  <span>
                                    ₹{parseFloat(item.price).toFixed(2)}
                                  </span>
                                </div>
                                {item.customization_text && (
                                  <div className="text-sm col-span-2">
                                    <span className="text-gray-500">
                                      Custom Text:{" "}
                                    </span>
                                    <span>{item.customization_text}</span>
                                  </div>
                                )}
                                {item.customization_details && (
                                  <div className="text-sm col-span-2">
                                    <span className="text-gray-500">
                                      Custom Details:{" "}
                                    </span>
                                    <span>{item.customization_details}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment ID:</span>
                          <span>{order.payment_id || "Not paid yet"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
