import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaUserCircle,
  FaEye,
  FaFileInvoice,
} from "react-icons/fa";
import logo from "../Products/Navbar/logo.png";

const ViewOrders = ({ userEmail, setGlobalUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [user, setLocalUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch user data from localStorage if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }

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
  useEffect(() => {
    // If no user is found in local state, try to get from session
    if (!user) {
      axios
        .get("http://localhost:5000/api/session", { withCredentials: true })
        .then((response) => {
          if (response.data.user) {
            const userData = response.data.user;
            setLocalUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            // Update global user state if the setter function exists
            if (typeof setGlobalUser === "function") {
              setGlobalUser(userData);
            }
          } else {
            // No user in session, redirect to login
            navigate("/login");
          }
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
          navigate("/login");
        });
    }
  }, [user, setGlobalUser, navigate]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    localStorage.removeItem("user");
    setLocalUser(null);
    if (typeof setGlobalUser === "function") {
      setGlobalUser(null);
    }
    navigate("/login");
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
      {/* Navbar */}
      <div className="bg-primary/40 py-3 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <Link
              to="/dashboard"
              className="font-bold text-2xl sm:text-3xl flex items-center gap-2"
            >
              <img src={logo} alt="logo" className="w-10" />
              <span className="text-primary">CustomHive</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <FaUserCircle className="text-3xl text-primary" />
            <span className="hidden md:inline text-gray-700">
              {user?.name || userEmail || "Guest"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/80 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

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
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="inline text-lg" />
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
                      {/* image */}
                      {/* <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0"></div> */}
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
                    {/* <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹0.00</span>
                    </div> */}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Shipping Information</h4>
                  <p className="text-gray-600">
                    {selectedOrder.shipping_address ||
                      "Default Shipping Address"}
                  </p>
                </div> */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={handleCloseDetails}
                  >
                    Close
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
  userEmail: PropTypes.string.isRequired,
};
ViewOrders.propTypes = {
  setGlobalUser: PropTypes.func,
};

export default ViewOrders;
