import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import axios from "axios";
import {
  FaShoppingCart,
  FaArrowLeft,
  FaTag,
  FaStore,
  FaUser,
} from "react-icons/fa";
import Header from "./Header";
// import { BsStars } from "react-icons/bs";
const ViewDetails = ({ setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate(); // Added missing navigate definition
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Product ID from params:", id);

    const fetchProduct = async () => {
      try {
        console.log(
          `Fetching product data from: http://localhost:5000/api/prod/${id}`
        );
        const response = await fetch(`http://localhost:5000/api/prod/${id}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response not OK:", response.status, errorText);
          throw new Error(
            `Failed to fetch product details: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Product data received:", data);
        setProduct(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    navigate("/orders", { state: { product } });
  };
  const handleAddToCart = async () => {
    try {
      // Get user from localStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        alert("Please log in to add items to your cart.");
        return;
      }

      const user = JSON.parse(userData);
      const cartItem = {
        email: user.email,
        product_id: product.Product_id,
        // quantity: quantity,
      };

      const response = await axios.post(
        "http://localhost:5000/api/add-to-cart",
        cartItem
      );

      if (response.status === 200) {
        alert("Product added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error);
      alert("Failed to add product to cart.");
    }
  };

  // const incrementQuantity = () => {
  //   if (quantity < MAX_QUANTITY) {
  //     setQuantity(quantity + 1);
  //   }
  // };

  // const decrementQuantity = () => {
  //   if (quantity > 1) {
  //     setQuantity(quantity - 1);
  //   }
  // };

  // const handleQuantityChange = (e) => {
  //   let value = parseInt(e.target.value, 10);
  //   if (isNaN(value) || value < 1) {
  //     value = 1;
  //   } else if (value > MAX_QUANTITY) {
  //     value = MAX_QUANTITY;
  //   }
  //   setQuantity(value);
  // };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2 text-gray-600">Loading product details...</p>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-all"
          >
            <FaArrowLeft className="inline mr-2" /> Back to Products
          </Link>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 text-lg">Product not found</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-all"
          >
            <FaArrowLeft className="inline mr-2" /> Back to Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setUser={setUser} />

      {/* Welcome Message */}

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/2 p-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`http://localhost:5000/${product.Product_image}`}
                  alt={product.Product_name}
                  className="w-full h-full object-contain md:h-[500px]"
                />
              </div>
            </div>
            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex items-center space-x-2 mb-4">
                {product.category_name && (
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs">
                    {product.category_name}
                  </span>
                )}
                {product.subcategory_name && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs flex items-center">
                    <FaTag className="mr-1" size={10} />
                    {product.subcategory_name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.Product_name}
              </h1>

              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-primary mr-3">
                  ₹{parseFloat(product.Price).toFixed(2)}
                </span>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  In Stock
                </span>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.Description || "No description available."}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {product.seller_name && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-32 flex items-center">
                      <FaUser className="mr-2 text-gray-400" size={14} />
                      Seller:
                    </span>
                    <span className="text-gray-800">{product.seller_name}</span>
                  </div>
                )}
                {product.business_type && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-32 flex items-center">
                      <FaStore className="mr-2 text-gray-400" size={14} />
                      Business Type:
                    </span>
                    <span className="text-gray-800">
                      {product.business_type}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 border-2 border-primary text-primary py-3 rounded-md hover:bg-primary/10 transition-colors"
                >
                  Buy Now
                </button>
              </div>

              {/* Additional Information */}
              <div className="mt-8 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">
                  Shipping & Returns
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Free shipping on orders over ₹999</li>
                  <li>Standard delivery: 3-5 business days</li>
                </ul>
              </div>
            </div>
          </div>
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
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-gray-400 hover:text-white"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white"
                  >
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

// Add PropTypes validation
ViewDetails.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  setUser: PropTypes.func.isRequired,
};

ViewDetails.propTypes = {
  setUser: PropTypes.func,
};

export default ViewDetails;
