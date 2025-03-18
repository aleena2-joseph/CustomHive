import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaShoppingCart,
  FaStore,
  FaTag,
  FaSearch,
  FaFilter,
  FaCrown,
} from "react-icons/fa";
import logo from "../Products/Navbar/logo.png";
import axios from "axios";
import Hero from "../Hero/Hero";
import { FaCartShopping } from "react-icons/fa6";

const UserDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleAddToCart = async (product) => {
    try {
      const userEmail = user?.email;
      if (!userEmail) {
        alert("Please log in to add items to your cart.");
        return;
      }

      // Check if the product belongs to the user
      if (product.email === userEmail) {
        alert("You cannot purchase your own product.");
        return;
      }

      const cartItem = {
        email: userEmail,
        product_id: product.Product_id,
      };

      await axios.post("http://localhost:5000/api/add-to-cart", cartItem);

      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error);
      alert("Failed to add product to cart.");
    }
  };

  useEffect(() => {
    // Fetch all products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/all-products"
        );
        setProducts(response.data);
        setFilteredProducts(response.data);

        // Extract unique categories and subcategories
        const uniqueCategories = [
          ...new Set(response.data.map((product) => product.category_name)),
        ].filter(Boolean);
        setCategories(uniqueCategories);

        const uniqueSubcategories = [
          ...new Set(response.data.map((product) => product.subcategory_name)),
        ].filter(Boolean);
        setSubcategories(uniqueSubcategories);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);
  const handleViewDetails = (product) => {
    // Navigate to product details page or show modal
    console.log("Viewing details for:", product);
    // Example: if using React Router
    // navigate(`/product/${product.id}`);
  };
  // Filter products based on search term, category, subcategory, and price
  useEffect(() => {
    let results = products;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        (product) =>
          product.Product_name.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          (product.Description &&
            product.Description.toLowerCase().includes(
              searchTerm.toLowerCase()
            ))
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter(
        (product) => product.category_name === selectedCategory
      );
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      results = results.filter(
        (product) => product.subcategory_name === selectedSubcategory
      );
    }

    // Filter by price range
    if (minPrice !== "") {
      results = results.filter(
        (product) => parseFloat(product.Price) >= parseFloat(minPrice)
      );
    }

    if (maxPrice !== "") {
      results = results.filter(
        (product) => parseFloat(product.Price) <= parseFloat(maxPrice)
      );
    }

    setFilteredProducts(results);
  }, [
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice,
    products,
  ]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setMinPrice("");
    setMaxPrice("");
    setFilteredProducts(products);
  };

  // Check if the current user is the owner of the product
  const isProductOwner = (product) => {
    return user?.email === product.email;
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
          {/* Aligning the elements horizontally */}
          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <a href="/cart">
              <FaCartShopping className="text-3xl text-primary" />
            </a>

            {/* User Profile Dropdown */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center gap-2"
              >
                <FaUserCircle className="text-3xl text-primary" />
                <span className="hidden md:inline text-gray-700">
                  {user?.name || "Guest"}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-32 w-48 bg-white border rounded-lg shadow-lg z-20">
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

            {/* Logout Button */}
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
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Filter Section */}
              <div className="relative">
                <button
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition-all"
                >
                  <FaFilter />
                  Filters
                </button>

                {filterMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10 p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full border rounded-md p-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">All Subcategories</option>
                        {subcategories.map((subcat, index) => (
                          <option key={index} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="Min"
                          className="w-1/2 border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Max"
                          className="w-1/2 border rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-primary"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setFilterMenuOpen(false)}
                        className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/80"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory ||
              selectedSubcategory ||
              minPrice ||
              maxPrice) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                    Subcategory: {selectedSubcategory}
                    <button
                      onClick={() => setSelectedSubcategory("")}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                    Price: {minPrice ? `₹${minPrice}` : "₹0"} -{" "}
                    {maxPrice ? `₹${maxPrice}` : "Any"}
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
              <p className="text-gray-600 text-lg">
                No products found matching your criteria
              </p>
              {(searchTerm ||
                selectedCategory ||
                selectedSubcategory ||
                minPrice ||
                maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
                      {/* Add Crown icon for products owned by the user */}
                      {isProductOwner(product) && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <FaCrown size={12} />
                          Your Product
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
                    {/* Status Badge */}
                    <p
                      className={`text-[10px] font-semibold py-1 px-2 rounded-full text-center mb-2
                        ${
                          product.status === 0
                            ? "bg-red-100 text-red-600 border border-red-400 w-fit"
                            : "hidden"
                        }
                      `}
                    >
                      Out of Stock
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <Link
                        to={`/product/${product.Product_id}`}
                        state={{
                          product: {
                            ...product,
                            product_image:
                              product.product_image || product.Product_image,
                          },
                        }}
                      >
                        {isProductOwner(product) ? (
                          <button
                            disabled
                            className="bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed text-sm"
                            title="You cannot view details of your own product"
                          >
                            View Details
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDetails(product)}
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
                          >
                            View Details
                          </button>
                        )}
                      </Link>

                      {/* Conditional rendering for Add to Cart button */}
                      {isProductOwner(product) ? (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 p-3 rounded-full cursor-not-allowed"
                          title="You cannot purchase your own product"
                        >
                          <FaShoppingCart />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary text-white p-3 rounded-full hover:bg-primary/80 transition-colors transform hover:scale-105"
                        >
                          <FaShoppingCart />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};

UserDashboard.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default UserDashboard;
