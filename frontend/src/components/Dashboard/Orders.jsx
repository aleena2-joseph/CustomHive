import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../components/Products/Navbar/logo.png";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialProduct = location.state?.product;

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    text: "",
    image: null,
    customization_details: "",
    quantity: 1,
  });

  // Calculate additional price based on text length
  const calculateTextSurcharge = (text) => {
    const textLength = text.length;
    if (textLength === 0) return 0;
    if (textLength <= 50) return 10;
    if (textLength <= 100) return 20;
    if (textLength <= 150) return 30;
    return Math.ceil(textLength / 50) * 10; // Additional Rs.10 for every 50 characters
  };

  // Calculate total price including text surcharge
  const textSurcharge = calculateTextSurcharge(formData.text);
  const basePrice = product ? product.Price * formData.quantity : 0;
  const totalPrice = basePrice + (formData.text.length > 0 ? textSurcharge : 0);

  // Fetch user session if not available
  useEffect(() => {
    if (!user) {
      axios
        .get("http://localhost:5000/api/session", { withCredentials: true })
        .then((response) => {
          if (response.data.user) {
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
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
  }, [user, navigate]);

  useEffect(() => {
    if (!initialProduct) {
      alert("No product selected. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    // Check if we already have complete product information
    if (initialProduct.Product_id && initialProduct.Price) {
      // Make sure we properly set the product image URL
      const productWithImage = {
        ...initialProduct,
        product_image:
          initialProduct.product_image || initialProduct.Product_image,
      };
      setProduct(productWithImage);
      setLoading(false);
    } else {
      // If not complete, fetch from API
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/api/ord_prod/${
              initialProduct.Product_id || initialProduct.product_id
            }`
          );
          setProduct(response.data);
        } catch (err) {
          console.error("Error fetching product details:", err);
          setError("Failed to load product details. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchProductDetails();
    }
  }, [initialProduct, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to place an order.");
      navigate("/login");
      return;
    }

    if (!product) {
      alert("Product information not available. Please try again.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("email", user.email);
    formDataToSend.append("product_id", product.Product_id);
    formDataToSend.append("quantity", formData.quantity);
    formDataToSend.append("total_amount", totalPrice);
    formDataToSend.append("text", formData.text);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    formDataToSend.append(
      "customization_details",
      formData.customization_details
    );

    try {
      await axios.post("http://localhost:5000/api/orders", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("Order placed successfully!");
      navigate("/my-orders");
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error);
      alert("Error placing order. Please try again.");
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
                      product.product_image?.startsWith("http")
                        ? product.product_image
                        : product.product_image?.startsWith("/")
                        ? `http://localhost:5000${product.product_image}`
                        : `http://localhost:5000/${product.product_image}`
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Quantity:
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max="20"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

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
                      Additional ₹10 charge for up to 50 characters, ₹20 for up
                      to 100 characters, etc.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Upload Image (Optional):
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
                  {formData.text.length > 0 && (
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
                type="submit"
                className="bg-primary text-white py-3 rounded-md w-full hover:bg-primary/90 transition-colors font-medium text-lg"
                disabled={!product}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
