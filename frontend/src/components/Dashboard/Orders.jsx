import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../components/Products/Navbar/logo.png";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import PropTypes from "prop-types";

const Orders = ({ setUser: setGlobalUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialProduct = location.state?.product;
  const [quantity, setQuantity] = useState(1);
  const [user, setLocalUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const MAX_QUANTITY = product?.stock || 1;

  const [formData, setFormData] = useState({
    text: "",
    image: null,
    customization_details: "",
    quantity: 1,
  });

  const calculateTextSurcharge = (text, quantity) => {
    if (!product?.isTextNeeded) return 0;
    const textLength = text.length;
    if (textLength === 0) return 0;

    // Get max_characters from product or default to 50
    const maxChars = product.max_characters || 50;

    // Calculate charges based on text length
    const charBlocks = Math.ceil(textLength / maxChars);
    return charBlocks * 10 * quantity;
  };

  // Calculate surcharge
  const textSurcharge = calculateTextSurcharge(
    formData.text,
    formData.quantity
  );

  // Calculate base price
  const basePrice = product ? product.Price * formData.quantity : 0;

  // Calculate total price
  const totalPrice = basePrice + (formData.text.length > 0 ? textSurcharge : 0);

  // Fetch user session if not available
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

  useEffect(() => {
    if (!initialProduct) {
      alert("No product selected. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const productId =
          initialProduct.Product_id || initialProduct.product_id;
        const response = await axios.get(
          `http://localhost:5000/api/ord_prod/${productId}`
        );

        // Set product data with properly formatted image URL
        const productData = response.data;

        // Format image URL if needed
        if (productData.product_image) {
          if (
            !productData.product_image.startsWith("http") &&
            !productData.product_image.startsWith("/")
          ) {
            productData.product_image = `http://localhost:5000/${productData.product_image}`;
          } else if (productData.product_image.startsWith("/")) {
            productData.product_image = `http://localhost:5000${productData.product_image}`;
          }
        }

        setProduct(productData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Please try again.");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [initialProduct, navigate]);

  // Effect to update formData.quantity when quantity state changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      quantity: quantity,
    }));
  }, [quantity]);

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

  const incrementQuantity = () => {
    if (quantity < MAX_QUANTITY) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > MAX_QUANTITY) {
      value = MAX_QUANTITY;
    }
    setQuantity(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handlePayment = async () => {
    if (!user) {
      alert("Please log in to proceed with the payment.");
      navigate("/login");
      return;
    }

    try {
      // Format the data to match the backend expectations
      const cartItems = [
        {
          product_id: product.Product_id,
          quantity: formData.quantity,
          max_characters: product.max_characters || 50,
          text: formData.text,
          customization_description: formData.customization_details,
        },
      ];

      // Step 1: Create an order on the backend
      const orderResponse = await axios.post(
        "http://localhost:5000/api/create-order",
        {
          email: user.email,
          cartItems,
          total_amount: totalPrice,
        }
      );

      const { id: order_id, currency, amount } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: "rzp_test_9QpKV5f6tjujcT", // Replace with your Razorpay Key ID
        amount: amount,
        currency: currency,
        name: "CustomHive",
        description: "Payment for your custom product",
        image: logo,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on the backend
            await axios.post("http://localhost:5000/api/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 4: If verification successful, upload image if exists
            if (formData.image && product.isImageNeeded) {
              const imageFormData = new FormData();
              imageFormData.append("image", formData.image);
              imageFormData.append("order_id", response.razorpay_order_id);

              await axios.post(
                "http://localhost:5000/api/upload-customization-image",
                imageFormData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
            }

            alert("Payment successful! Your order has been placed.");
            navigate("/my-orders");
          } catch (error) {
            console.error("Error during payment verification:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error while processing payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading product details...</p>
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
            onClick={() => navigate(-1)}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-6 hover:underline"
        >
          <FaArrowLeft /> Back to Product
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Product Details
            </h2>

            {product ? (
              <div>
                <div className="mb-4 flex justify-center">
                  <img
                    src={
                      product.product_image ||
                      "https://via.placeholder.com/400x300?text=Image+Not+Available"
                    }
                    alt={product.Product_name}
                    className="max-w-full h-auto max-h-64 object-contain rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Available";
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">
                    {product.Product_name}
                  </h3>
                  <p className="text-gray-700">{product.Description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Price</p>
                      <p className="font-semibold text-lg">
                        ₹{product.Price?.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">
                        {product.category_name || "N/A"} -{" "}
                        {product.subcategory_name || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Seller</p>
                      <p className="font-medium">
                        {product.seller_name || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Business Type</p>
                      <p className="font-medium">
                        {product.business_type || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Product information not available</p>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Place Your Order
            </h2>

            <div className="space-y-5">
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Quantity (1-{MAX_QUANTITY}):
                </p>
                <div className="flex items-center border border-gray-300 rounded-md w-32">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={MAX_QUANTITY}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 text-center border-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    disabled={quantity >= MAX_QUANTITY}
                  >
                    +
                  </button>
                </div>
                {quantity >= MAX_QUANTITY && (
                  <p className="text-xs text-amber-600 mt-1">
                    Maximum quantity reached.
                  </p>
                )}
              </div>

              {/* Text customization with max_characters info */}
              {product?.isTextNeeded === 1 && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Text to Print/Engrave:
                  </label>
                  <input
                    type="text"
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    placeholder="Text you want on your custom product"
                    className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={
                      product.max_characters ? product.max_characters * 5 : 250
                    } // Limit max length to 5x max_characters or 250
                  />
                  {formData.text.length > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="flex justify-between">
                        <span>Characters: {formData.text.length}</span>
                        <span className="text-primary font-medium">
                          +₹{textSurcharge}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.max_characters
                          ? `Additional ₹10 charge for every ${product.max_characters} characters`
                          : "Additional ₹10 charge for every 50 characters"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Image upload */}
              {product?.isImageNeeded === 1 && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Upload Image:
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload an image to be used on your custom product
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Customization Details:
                </label>
                <textarea
                  name="customization_details"
                  value={formData.customization_details}
                  onChange={handleChange}
                  placeholder="Describe how you want your product customized..."
                  className="border rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                ></textarea>
              </div>

              {product && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center text-lg mb-2">
                    <span>Base Price:</span>
                    <span>₹{product.Price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mb-2">
                    <span>Quantity:</span>
                    <span>x {formData.quantity}</span>
                  </div>
                  {product.isTextNeeded === 1 && formData.text.length > 0 && (
                    <div className="flex justify-between items-center text-lg mb-2">
                      <span>Text Customization:</span>
                      <span>+₹{textSurcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold text-primary border-t pt-2">
                    <span>Total:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-all w-full"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Orders.propTypes = {
  setUser: PropTypes.func,
};

export default Orders;
