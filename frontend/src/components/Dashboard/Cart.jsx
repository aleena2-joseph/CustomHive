import { useState, useEffect } from "react";
import {
  FaTrash,
  FaArrowLeft,
  FaShoppingBag,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import PropTypes from "prop-types";

import { Link, useNavigate } from "react-router-dom";
import logo from "../Products/Navbar/logo.png";

const Cart = ({ setUser: setGlobalUser }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setLocalUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Calculate the total price of all items
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.Price || 0) * item.quantity,
    0
  );

  // First useEffect to handle session management
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

  // Second useEffect to fetch cart items once we have a user
  useEffect(() => {
    if (!user) {
      return; // Don't try to fetch cart if no user
    }

    const fetchCartItems = async () => {
      try {
        setLoading(true);
        console.log("Fetching cart for email:", user.email);
        const response = await axios.get(
          `http://localhost:5000/api/cart/${user.email}`
        );

        console.log("Cart API response:", response.data);

        // Add a quantity property to each cart item
        const itemsWithQuantity = response.data.map((item) => ({
          ...item,
          quantity: 1,
        }));

        setCartItems(itemsWithQuantity);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError("Failed to fetch cart items. Please try again later.");
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${cartItemId}`);
      setCartItems(cartItems.filter((item) => item.cart_id !== cartItemId));
      alert("Item removed from cart successfully!");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item from cart.");
    }
  };

  const handleQuantityChange = (cartItemId, newQuantity) => {
    // Ensure quantity stays within range of 1-20
    if (newQuantity < 1) return;
    if (newQuantity > 20) return;

    setCartItems(
      cartItems.map((item) =>
        item.cart_id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  const handleCheckout = () => {
    // Implement checkout process here
    alert("Checkout feature will be implemented soon!");
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
              {user?.name || "Guest"}
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

      {/* Cart Page Content */}
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
            <FaShoppingBag />
            Your Shopping Cart
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading your cart items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-50 rounded-lg p-4">
              <p className="text-red-500">{error}</p>
              <button
                className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <FaShoppingBag className="text-6xl text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
              <Link
                to="/dashboard"
                className="bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/80 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-center">Price</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.cart_id} className="border-b">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 overflow-hidden rounded-md">
                              {item.Product_image ? (
                                <img
                                  src={`http://localhost:5000/${item.Product_image}`}
                                  alt={item.Product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {item.Product_name || "Unnamed Product"}
                              </h3>
                              {item.subcategory_name && (
                                <p className="text-xs text-gray-500">
                                  {item.subcategory_name}
                                </p>
                              )}
                              {item.seller_name && (
                                <p className="text-xs text-gray-500">
                                  Seller: {item.seller_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          ₹{parseFloat(item.Price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.cart_id,
                                  item.quantity - 1
                                )
                              }
                              className="bg-gray-200 px-3 py-1 rounded-l-md"
                            >
                              -
                            </button>
                            <span className="bg-white px-4 py-1 border-y">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.cart_id,
                                  item.quantity + 1
                                )
                              }
                              className="bg-gray-200 px-3 py-1 rounded-r-md"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          ₹
                          {(
                            parseFloat(item.Price || 0) * item.quantity
                          ).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(item.cart_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="w-full md:w-1/2">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-bold text-lg mb-3">Order Notes</h3>
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows="4"
                      placeholder="Special instructions for your order..."
                    ></textarea>
                  </div>
                </div>
                <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded-md">
                  <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{(totalPrice * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          ₹{(totalPrice + totalPrice * 0.18).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary text-white py-3 px-4 rounded-md mt-6 hover:bg-primary/80 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer remains unchanged */}
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
Cart.propTypes = {
  setUser: PropTypes.func,
};
export default Cart;
