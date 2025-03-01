import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaUserCircle, FaShoppingCart, FaStore, FaTag } from "react-icons/fa";
import logo from "../Products/Navbar/logo.png";
import axios from "axios";
import Hero from "../Hero/Hero";
//import TopProducts from "../TopProducts/TopProducts";
import { FaCartShopping } from "react-icons/fa6";

const UserDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/all-products"
        );
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      // Make a request to your server to log out
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    // Clear client-side state and local storage
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-primary/40 py-3 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <a
              href="#"
              className="font-bold text-2xl sm:text-3xl flex items-center gap-2"
            >
              <img src={logo} alt="logo" className="w-10" />
              <span className="text-primary">CustomHive</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <FaCartShopping className="text-3xl text-primary mr-6" />
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center gap-2"
              >
                <FaUserCircle className="text-3xl text-primary" />
                <span className="hidden md:inline text-gray-700 mr-4">
                  {user?.name || "Guest"}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                  <ul className="py-2">
                    <li>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        View Profile
                      </a>
                    </li>
                    <li>
                      {/* <li>
                        <a
                          href="/cart"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          View Cart
                        </a>
                      </li> */}
                      <a
                        href="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/80 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-primary">
            Welcome back,{" "}
            <span className="text-gray-800">{user?.name || "Guest"}!</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Discover our latest customizable products and exclusive offers.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Available Products Section */}
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 relative">
              Available Products
              <span className="block h-1 w-24 bg-primary mt-2"></span>
            </h2>
            <div className="flex gap-2">
              <button className="bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors">
                Filter
              </button>
              <button className="bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors">
                Sort
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
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
          ) : products.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
              {products.map((product) => (
                <div
                  key={product.Product_id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-64 overflow-hidden relative">
                    {product.Product_image ? (
                      <img
                        src={`http://localhost:5000/${product.Product_image}`}
                        alt={product.Product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {product.category_name && (
                        <span className="bg-primary/80 text-white text-xs px-2 py-1 rounded-full">
                          {product.category_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">
                        {product.Product_name}
                      </h3>
                      <span className="text-primary font-bold text-lg">
                        ₹{parseFloat(product.Price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {product.subcategory_name && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center gap-1">
                          <FaTag className="text-gray-400" size={10} />
                          {product.subcategory_name}
                        </span>
                      )}
                      {product.business_type && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center gap-1">
                          <FaStore className="text-gray-400" size={10} />
                          {product.business_type}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.Description || "No description available"}
                    </p>

                    {product.seller_name && (
                      <p className="text-xs text-gray-500 mb-4">
                        Seller: {product.seller_name}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="bg-primary text-white p-3 rounded-full hover:bg-primary/80 transition-colors transform hover:scale-105">
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  <a href="#" className="text-gray-400 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
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

UserDashboard.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default UserDashboard;
