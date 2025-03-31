import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import { FaArrowLeft } from "react-icons/fa";
import PropTypes from "prop-types";
import Header from "./Header";

const CartCheckout = ({ setUser: setUser }) => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch cart items
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/cart/${user.email}`)
        .then((response) => {
          // Format image URLs if needed
          const formattedCartItems = response.data.map((item) => {
            let productImage = item.Product_image;

            // Format image URL if needed
            if (productImage) {
              if (
                !productImage.startsWith("http") &&
                !productImage.startsWith("/")
              ) {
                productImage = `http://localhost:5000/${productImage}`;
              } else if (productImage.startsWith("/")) {
                productImage = `http://localhost:5000${productImage}`;
              }
            }

            return {
              ...item,
              Product_image: productImage,
              quantity: 1, // Default quantity
              isTextNeeded: item.isTextNeeded === 1,
              isImageNeeded: item.isImageNeeded === 1,
              max_characters: item.max_characters || 50,
            };
          });

          setCartItems(formattedCartItems);

          // Initialize customizations object
          const initialCustomizations = {};
          formattedCartItems.forEach((item) => {
            initialCustomizations[item.product_id] = {
              text: "",
              image: null,
              customization_details: "",
              quantity: 1,
            };
          });

          setCustomizations(initialCustomizations);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching cart items:", err);
          setError("Failed to load cart items. Please try again.");
          setLoading(false);
        });
    }
  }, [user]);

  // Calculate total amount when cart items or customizations change
  useEffect(() => {
    let total = 0;

    cartItems.forEach((item) => {
      const itemCustomization = customizations[item.product_id] || {
        quantity: 1,
        text: "",
      };
      const quantity = itemCustomization.quantity || 1;
      const basePrice = item.Price * quantity;

      // Calculate text surcharge if applicable
      let textSurcharge = 0;
      if (item.isTextNeeded && itemCustomization.text?.length > 0) {
        const maxChars = item.max_characters || 50;
        const charBlocks = Math.ceil(itemCustomization.text.length / maxChars);
        textSurcharge = charBlocks * 10 * quantity;
      }

      total += basePrice + textSurcharge;
    });

    setTotalAmount(total);
  }, [cartItems, customizations]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    // Find product to get max stock
    const product = cartItems.find((item) => item.product_id === productId);
    const MAX_QUANTITY = product?.stock || 1;

    // Ensure quantity is within valid range
    let value = parseInt(newQuantity, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > MAX_QUANTITY) {
      value = MAX_QUANTITY;
    }

    // Update customizations state
    setCustomizations((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: value,
      },
    }));
  };

  const incrementQuantity = (productId) => {
    const product = cartItems.find((item) => item.product_id === productId);
    const MAX_QUANTITY = product?.stock || 1;
    const currentQuantity = customizations[productId]?.quantity || 1;

    if (currentQuantity < MAX_QUANTITY) {
      handleQuantityChange(productId, currentQuantity + 1);
    }
  };

  const decrementQuantity = (productId) => {
    const currentQuantity = customizations[productId]?.quantity || 1;

    if (currentQuantity > 1) {
      handleQuantityChange(productId, currentQuantity - 1);
    }
  };

  const handleCustomizationChange = (productId, field, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (productId, e) => {
    setCustomizations((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        image: e.target.files[0],
      },
    }));
  };

  const calculateTextSurcharge = (product) => {
    if (!product.isTextNeeded) return 0;

    const customization = customizations[product.product_id] || {
      text: "",
      quantity: 1,
    };
    const textLength = customization.text?.length || 0;
    if (textLength === 0) return 0;

    // Get max_characters from product or default to 50
    const maxChars = product.max_characters || 50;

    // Calculate charges based on text length
    const charBlocks = Math.ceil(textLength / maxChars);
    return charBlocks * 10 * customization.quantity;
  };

  const getProductTotal = (product) => {
    const customization = customizations[product.product_id] || {
      quantity: 1,
      text: "",
    };
    const basePrice = product.Price * customization.quantity;
    const textSurcharge = calculateTextSurcharge(product);

    return basePrice + textSurcharge;
  };

  const handlePayment = async () => {
    if (!user?.email || cartItems.length === 0) {
      setPaymentError("Your cart is empty or you're not logged in.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Prepare cart items for the order
      const orderCartItems = cartItems.map((item) => {
        const customization = customizations[item.product_id] || {
          quantity: 1,
          text: "",
          customization_details: "",
        };
        return {
          product_id: item.product_id,
          quantity: customization.quantity || 1,
          max_characters: item.max_characters || 50,
          text: customization.text || "",
          customization_description: customization.customization_details || "",
          price: item.Price, // Include price if needed by the backend
        };
      });

      // Create order on the server
      const orderResponse = await axios.post(
        "http://localhost:5000/api/create-order",
        {
          email: user.email,
          cartItems: orderCartItems,
          total_amount: totalAmount,
        }
      );

      if (!orderResponse.data) {
        throw new Error("Order creation failed. No response from server.");
      }

      const { id: orderId, amount, currency } = orderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_9QpKV5f6tjujcT", // Replace with your Razorpay key
        amount: amount,
        currency: currency,
        name: "CustomHive",
        description: "Purchase from CustomHive",
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify the payment with the backend
            const paymentVerification = await axios.post(
              "http://localhost:5000/api/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (paymentVerification.data.success) {
              // Clear the cart after successful payment
              try {
                await axios.delete(
                  `http://localhost:5000/api/cart/${user.email}`,
                  {
                    headers: { "Content-Type": "application/json" },
                  }
                );
                console.log("Cart cleared successfully after payment.");
              } catch (clearCartError) {
                console.error("Failed to clear cart:", clearCartError);
              }

              alert("Order Successful!");
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setPaymentError(
              "Payment verification failed. Please contact support."
            );
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
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      // Open Razorpay payment window
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentError(
        error.response?.data?.error ||
          "Failed to initiate payment. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading cart items...</p>
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
            onClick={() => navigate("/cart")}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
          >
            Go Back to Cart
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
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-primary mb-6 hover:underline"
        >
          <FaArrowLeft /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-xl mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full md:w-1/4 flex justify-center">
                        <img
                          src={
                            item.Product_image ||
                            "https://via.placeholder.com/200x200?text=Image+Not+Available"
                          }
                          alt={item.Product_name}
                          className="w-full max-w-[150px] h-auto object-contain rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/200x200?text=Image+Not+Available";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="w-full md:w-3/4">
                        <h3 className="text-xl font-semibold">
                          {item.Product_name}
                        </h3>
                        <p className="text-gray-600 mb-2">{item.Description}</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Category: </span>
                            <span className="font-medium">
                              {item.category_name} - {item.subcategory_name}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Seller: </span>
                            <span className="font-medium">
                              {item.seller_name || "N/A"}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Price: </span>
                            <span className="font-medium">
                              ₹{item.Price.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Stock: </span>
                            <span className="font-medium">
                              {item.stock} available
                            </span>
                          </div>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-4 mb-4">
                          <label className="text-gray-700">Quantity:</label>
                          <div className="flex items-center border border-gray-300 rounded-md w-32">
                            <button
                              type="button"
                              onClick={() => decrementQuantity(item.product_id)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={
                                (customizations[item.product_id]?.quantity ||
                                  1) <= 1
                              }
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={
                                customizations[item.product_id]?.quantity || 1
                              }
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product_id,
                                  e.target.value
                                )
                              }
                              className="w-12 text-center border-none focus:ring-0"
                            />
                            <button
                              type="button"
                              onClick={() => incrementQuantity(item.product_id)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={
                                (customizations[item.product_id]?.quantity ||
                                  1) >= item.stock
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Customization Button and Summary */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setCustomizingProduct(item)}
                            className="flex items-center gap-2 text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
                          >
                            Customize
                          </button>
                          {customizingProduct && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                  <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-primary">
                                      Customize{" "}
                                      {customizingProduct.Product_name}
                                    </h2>
                                    <button
                                      onClick={() =>
                                        setCustomizingProduct(null)
                                      }
                                      className="text-gray-500 hover:text-gray-700 text-3xl"
                                    >
                                      &times;
                                    </button>
                                  </div>

                                  <div className="space-y-6">
                                    {/* Quantity Control */}
                                    <div>
                                      <p className="text-gray-700 mb-2 font-medium">
                                        Quantity (1-{customizingProduct.stock}):
                                      </p>
                                      <div className="flex items-center border border-gray-300 rounded-md w-32">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            decrementQuantity(
                                              customizingProduct.product_id
                                            )
                                          }
                                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                          disabled={
                                            (customizations[
                                              customizingProduct.product_id
                                            ]?.quantity || 1) <= 1
                                          }
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          max={customizingProduct.stock}
                                          value={
                                            customizations[
                                              customizingProduct.product_id
                                            ]?.quantity || 1
                                          }
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              customizingProduct.product_id,
                                              e.target.value
                                            )
                                          }
                                          className="w-12 text-center border-none focus:ring-0"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            incrementQuantity(
                                              customizingProduct.product_id
                                            )
                                          }
                                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                          disabled={
                                            (customizations[
                                              customizingProduct.product_id
                                            ]?.quantity || 1) >=
                                            customizingProduct.stock
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                      {(customizations[
                                        customizingProduct.product_id
                                      ]?.quantity || 1) >=
                                        customizingProduct.stock && (
                                        <p className="text-xs text-amber-600 mt-1">
                                          Maximum quantity reached.
                                        </p>
                                      )}
                                    </div>

                                    {customizingProduct.isTextNeeded === 1 && (
                                      <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                          Text to Print/Engrave:
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            customizations[
                                              customizingProduct.product_id
                                            ]?.text || ""
                                          }
                                          onChange={(e) =>
                                            handleCustomizationChange(
                                              customizingProduct.product_id,
                                              "text",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Text you want on your custom product"
                                          className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                          maxLength={
                                            customizingProduct.max_characters
                                              ? customizingProduct.max_characters *
                                                5
                                              : 250
                                          }
                                        />
                                        {/* Existing text length and surcharge logic */}
                                      </div>
                                    )}

                                    {customizingProduct.isImageNeeded === 1 && (
                                      <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                          Upload Image:
                                        </label>
                                        <input
                                          type="file"
                                          onChange={(e) =>
                                            handleImageChange(
                                              customizingProduct.product_id,
                                              e
                                            )
                                          }
                                          className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                          accept="image/*"
                                        />
                                        {/* Existing image selection logic */}
                                      </div>
                                    )}

                                    {/* Customization Details */}
                                    <div>
                                      <label className="block text-gray-700 mb-2 font-medium">
                                        Customization Details:
                                      </label>
                                      <textarea
                                        value={
                                          customizations[
                                            customizingProduct.product_id
                                          ]?.customization_details || ""
                                        }
                                        onChange={(e) =>
                                          handleCustomizationChange(
                                            customizingProduct.product_id,
                                            "customization_details",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Describe how you want your product customized..."
                                        className="border rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                      ></textarea>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-gray-50 p-4 rounded-md">
                                      <div className="flex justify-between items-center text-lg mb-2">
                                        <span>Base Price:</span>
                                        <span>
                                          ₹{customizingProduct.Price.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-lg mb-2">
                                        <span>Quantity:</span>
                                        <span>
                                          x{" "}
                                          {customizations[
                                            customizingProduct.product_id
                                          ]?.quantity || 1}
                                        </span>
                                      </div>
                                      {customizingProduct.isTextNeeded === 1 &&
                                        customizations[
                                          customizingProduct.product_id
                                        ]?.text?.length > 0 && (
                                          <div className="flex justify-between items-center text-lg mb-2">
                                            <span>Text Customization:</span>
                                            <span>
                                              +₹
                                              {calculateTextSurcharge(
                                                customizingProduct
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        )}
                                      <div className="flex justify-between items-center text-xl font-bold text-primary border-t pt-2">
                                        <span>Total:</span>
                                        <span>
                                          ₹
                                          {(
                                            customizingProduct.Price *
                                              (customizations[
                                                customizingProduct.product_id
                                              ]?.quantity || 1) +
                                            (customizingProduct.isTextNeeded ===
                                            1
                                              ? calculateTextSurcharge(
                                                  customizingProduct
                                                )
                                              : 0)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                      onClick={() =>
                                        setCustomizingProduct(null)
                                      }
                                      className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        setCustomizingProduct(null)
                                      }
                                      className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90"
                                    >
                                      Save Customization
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <span>
                        {item.Product_name} x{" "}
                        {customizations[item.product_id]?.quantity || 1}
                      </span>
                      <span>₹{getProductTotal(item).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold mb-6">
                    <span>Total:</span>
                    <span className="text-primary">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                      {paymentError}
                    </div>
                  )}

                  <button
                    className="bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-all w-full text-lg font-medium"
                    onClick={handlePayment}
                    disabled={isProcessingPayment || cartItems.length === 0}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CartCheckout.propTypes = {
  setUser: PropTypes.func,
};

export default CartCheckout;
