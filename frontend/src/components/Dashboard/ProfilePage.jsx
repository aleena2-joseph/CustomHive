import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Products/Navbar/logo.png";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import {
  FiPlusCircle,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiEdit,
} from "react-icons/fi";
import { RiFunctionAddLine } from "react-icons/ri";

const ProfilePage = ({ setUser }) => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [priceRangeError, setPriceRangeError] = useState("");
  const [priceRange, setPriceRange] = useState({ min: null, max: null });

  // States for business types, categories, and subcategories
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditClick = (product) => {
    setSelectedProduct(product); // Store selected product
    setShowModal(true); // Show the modal
  };

  const [requestData, setRequestData] = useState({
    businessCategory: "",
    businessTypeId: "",
    category: "",
    categoryId: "",
    subcategory: "",
  });

  // Update your handleInputChange function:
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For select inputs, also update the corresponding ID field
    if (name === "businessCategory") {
      // Find the selected business type
      const selectedBT = businessTypes.find(
        (bt) => bt.business_id === parseInt(value)
      );

      if (selectedBT) {
        // If selecting from existing business types
        setRequestData({
          ...requestData,
          businessCategory: selectedBT.type_name,
          businessTypeId: value, // Store the ID as a string
        });

        // Fetch categories for this business type
        axios
          .get(`http://localhost:5000/api/categories?business_id=${value}`)
          .then((response) => {
            let categoriesData = Array.isArray(response.data)
              ? response.data
              : response.data && typeof response.data === "object"
              ? response.data.data || []
              : [];
            setCategories(categoriesData);
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            setCategories([]);
          });
      } else {
        // For manually entered business type
        setRequestData({
          ...requestData,
          businessCategory: value,
          businessTypeId: "",
          categoryId: "", // Reset category ID when business type changes
          category: "", // Reset category when business type changes
        });
        setCategories([]);
      }
    } else if (name === "category" && requestData.businessTypeId) {
      // For category selection
      const selectedCat = categories.find(
        (cat) => cat.category_id === parseInt(value)
      );

      if (selectedCat) {
        setRequestData({
          ...requestData,
          category: selectedCat.category_name,
          categoryId: value,
        });
      } else {
        setRequestData({
          ...requestData,
          category: value,
          categoryId: "",
        });
      }
    } else {
      // For other inputs
      setRequestData({ ...requestData, [name]: value });
    }
  };
  const handleRequest = () => {
    setShowModal(true);
  };

  // Update handleSubmitRequest to use the IDs if available
  const handleSubmitRequest = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/request-business-category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile_id: user?.id || 1, // Use user ID if available
            requested_business_type:
              requestData.businessTypeId || requestData.businessCategory,
            requested_category: requestData.categoryId || requestData.category,
            requested_subcategory: requestData.subcategory,
            is_new_business_type: !requestData.businessTypeId,
            is_new_category: !requestData.categoryId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Request sent successfully!");
        setShowModal(false);
        setRequestData({
          businessCategory: "",
          businessTypeId: "",
          category: "",
          categoryId: "",
          subcategory: "",
        });
      } else {
        throw new Error(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request.");
    }
  };
  // Updated handleUpdateProduct function with authentication
  const handleUpdateProduct = async () => {
    // Validate inputs
    if (!selectedProduct.Product_name || !selectedProduct.Price) {
      alert("Enter all fields correctly!");
      return;
    }

    if (selectedProduct.Stock < 0 || selectedProduct.Stock > 100) {
      alert("Stock must be between 0 and 100!");
      return;
    }

    try {
      // Collect the data to update
      const productData = {
        Product_name: selectedProduct.Product_name,
        Price: selectedProduct.Price,
        Description: selectedProduct.Description || "",
        Stock: selectedProduct.Stock,
        isImageNeeded: selectedProduct.isImageNeeded,
        isTextNeeded: selectedProduct.isTextNeeded,
        max_characters: selectedProduct.max_characters, // Add max_characters to update
      };

      await axios.put(
        `http://localhost:5000/api/update-product/${selectedProduct.Product_id}`,
        productData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Rest of the function remains the same
    } catch {
      // Error handling code
    }
  };

  const navigate = useNavigate();

  // Session: initialize user from localStorage
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // If no user is stored, fetch session data from the backend.
  useEffect(() => {
    if (!user) {
      axios
        .get("http://localhost:5000/api/session", { withCredentials: true })
        .then((response) => {
          if (response.data.user) {
            setUserState(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            if (typeof setUser === "function") {
              setUser(response.data.user);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
        });
    }
  }, [user, setUser]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: 1,
    isImageNeeded: true, // Default to true
    isTextNeeded: true, // Default to true
    max_characters: 100, // Default value for maximum characters
  });

  // Fetch products for the current user (using session and explicit email parameter)
  useEffect(() => {
    if (user && user.email) {
      axios
        .get(
          `http://localhost:5000/api/products?email=${encodeURIComponent(
            user.email
          )}`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log("Products:", response.data);
          setProducts(response.data);
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [user]);

  // Fetch price range when subcategory changes
  useEffect(() => {
    if (selectedSubcategory && selectedBusinessType) {
      axios
        .get(
          `http://localhost:5000/api/price-range?business_id=${selectedBusinessType}&subcategory_id=${selectedSubcategory}`
        )
        .then((response) => {
          if (
            response.data.min_price !== undefined &&
            response.data.max_price !== undefined
          ) {
            setPriceRange({
              min: response.data.min_price,
              max: response.data.max_price,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching price range:", error);
        });
    } else {
      setPriceRange({ min: null, max: null });
    }
  }, [selectedSubcategory, selectedBusinessType]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    localStorage.removeItem("user");
    if (typeof setUser === "function") {
      setUser(null);
    }
    setUserState(null);
    navigate("/login");
  };

  // Fetch business types on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/business-types")
      .then((response) => {
        console.log("Business Types:", response.data);
        setBusinessTypes(response.data || []);
      })
      .catch((error) => console.error("Error fetching business types:", error));
  }, []);

  // Fetch categories when a business type is selected

  // For fetching categories
  useEffect(() => {
    if (selectedBusinessType) {
      console.log(
        "Fetching categories for business type:",
        selectedBusinessType
      );

      axios
        .get(
          `http://localhost:5000/api/categories?business_id=${selectedBusinessType}`
        )
        .then((response) => {
          console.log("Raw Categories Response:", response);

          // Handle different response structures
          let categoriesData;
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (response.data && typeof response.data === "object") {
            categoriesData = response.data.data || [];
          } else {
            categoriesData = [];
            console.error("Unexpected response format:", response.data);
          }

          console.log("Processed Categories Data:", categoriesData);
          setCategories(categoriesData);

          // Reset subcategory-related selections
          setSelectedCategory("");
          setSelectedSubcategory("");
          setPriceRange({ min: null, max: null });
          setPriceRangeError("");
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
          if (error.response) {
            console.log("Error status:", error.response.status);
            console.log("Error data:", error.response.data);
          }
          setCategories([]);
        });
    } else {
      setCategories([]);
      setSelectedCategory("");
      setSelectedSubcategory("");
      setPriceRange({ min: null, max: null });
      setPriceRangeError("");
    }
  }, [selectedBusinessType]);
  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      console.log("Fetching subcategories for category:", selectedCategory);

      axios
        .get(
          `http://localhost:5000/api/subcategories?category_id=${selectedCategory}`
        )
        .then((response) => {
          console.log("Raw Subcategories Response:", response);

          // Handle different response structures
          let subcategoriesData;
          if (Array.isArray(response.data)) {
            subcategoriesData = response.data;
          } else if (response.data && typeof response.data === "object") {
            subcategoriesData = response.data.data || [];
          } else {
            subcategoriesData = [];
            console.error(
              "Unexpected subcategories response format:",
              response.data
            );
          }

          console.log("Processed Subcategories Data:", subcategoriesData);
          setSubcategories(subcategoriesData);
          setSelectedSubcategory("");
          setPriceRange({ min: null, max: null });
          setPriceRangeError("");
        })
        .catch((error) => {
          console.error("Error fetching subcategories:", error);
          if (error.response) {
            console.log("Error status:", error.response.status);
            console.log("Error data:", error.response.data);
          }
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
      setPriceRange({ min: null, max: null });
      setPriceRangeError("");
    }
  }, [selectedCategory]);
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]:
        name === "stock" ? Math.max(1, Math.min(100, Number(value))) : value,
    }));
  };

  // Handle file input for image upload
  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting Data:", newProduct); // Debugging

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("subcategory_id", selectedSubcategory);
      formData.append("business_id", selectedBusinessType);
      formData.append("stock", newProduct.stock);
      formData.append("email", user?.email || "");
      formData.append("isImageNeeded", newProduct.isImageNeeded);
      formData.append("isTextNeeded", newProduct.isTextNeeded);
      formData.append("max_characters", newProduct.max_characters); // Add max_characters

      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (response.ok) {
        alert("Product added successfully!");
        setNewProduct({
          name: "",
          price: "",
          stock: 1,
          description: "",
          isImageNeeded: true,
          isTextNeeded: true,
          max_characters: 100, // Reset to default value
          image: null,
        });

        // Refresh the products list
        if (user && user.email) {
          axios
            .get(
              `http://localhost:5000/api/products?email=${encodeURIComponent(
                user.email
              )}`,
              { withCredentials: true }
            )
            .then((response) => {
              setProducts(response.data);
            })
            .catch((error) => console.error("Error fetching products:", error));
        }
      } else {
        alert("Failed to add product: " + data.message || data.error);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred.");
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();

    setPriceRangeError("");

    if (
      !newProduct.name.trim() ||
      !newProduct.price.trim() ||
      !selectedSubcategory ||
      !selectedBusinessType ||
      !(user && user.email)
    ) {
      alert(
        "Please fill all required fields, including selecting a Business Type and ensuring you are logged in."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("subcategory_id", selectedSubcategory);
    formData.append("business_id", selectedBusinessType);
    formData.append("stock", newProduct.stock);
    formData.append("email", user?.email || "");
    formData.append("isImageNeeded", newProduct.isImageNeeded);
    formData.append("isTextNeeded", newProduct.isTextNeeded);
    formData.append("max_characters", newProduct.max_characters); // Add max_characters

    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      // Rest of the function remains the same
    } catch {
      // Error handling code
    }
  };

  // Toggle product status
  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/products/${id}`,
        {
          status: !currentStatus,
        },
        { withCredentials: true }
      );

      setProducts(
        products.map((product) =>
          product.Product_id === id
            ? { ...product, Status: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="flex gap-2 text-primary hover:text-primary/80 transition-colors ml-10 mt-5">
        <Link to="/dashboard" className="flex items-center">
          <h3 className="flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </h3>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="bg-gradient-to-br from-primary/40 to-primary/60 p-6 rounded-full">
              <FaUserCircle className="text-6xl text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.name || "Guest"}
              </h2>
              <p className="text-lg text-gray-600">{user?.email || ""}</p>
              <div className="mt-2 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Seller Account
              </div>
            </div>
            <div className="ml-auto flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                <FiEdit size={18} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* My Products Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FiPackage className="mr-2 text-primary" />
            My Products
          </h3>

          {/* Product Form */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FiPlusCircle className="mr-2 text-primary" />
              Add New Product
            </h4>

            <form onSubmit={addProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Type Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <select
                    value={selectedBusinessType}
                    onChange={(e) => setSelectedBusinessType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/10"
                    required
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map((bt, index) => (
                      <option
                        key={bt.business_id || `bt-${index}`}
                        value={bt.business_id}
                      >
                        {bt.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/10"
                    required
                    disabled={!selectedBusinessType}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option
                        key={cat.category_id || `cat-${index}`}
                        value={cat.category_id}
                      >
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategory
                  </label>
                  <select
                    name="subcategory_id"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:primary focus:border-primary/10 disabled:bg-gray-100 disabled:text-gray-500"
                    required
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sub, index) => (
                      <option
                        key={sub.subcategory_id || `sub-${index}`}
                        value={sub.subcategory_id}
                      >
                        {sub.subcategory_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleProductChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:primary/10 focus:border-primary/10"
                      placeholder="Product Name"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price{" "}
                    {priceRange.min !== null &&
                      priceRange.max !== null &&
                      `(Range: ₹${priceRange.min} - ₹${priceRange.max})`}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleProductChange}
                      className={`pl-10 w-full border ${
                        priceRangeError ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:primary/10 focus:border-primary/10`}
                      placeholder="Price"
                      required
                    />
                  </div>
                  {priceRangeError && (
                    <p className="mt-1 text-sm text-red-600">
                      {priceRangeError}
                    </p>
                  )}
                </div>

                {/* Maximum Characters - NEW FIELD */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Characters
                  </label>
                  <input
                    type="number"
                    name="max_characters"
                    value={newProduct.max_characters}
                    onChange={handleProductChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/10"
                    placeholder="Maximum Characters"
                    min="1"
                    max="1000"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum number of characters customers can input for
                    customization
                  </p>
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Stock (1-100)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleProductChange}
                    className={`w-full border ${
                      newProduct.stock < 1 || newProduct.stock > 100
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/10`}
                    placeholder="Stock Quantity"
                    min="1"
                    max="100"
                    required
                  />
                </div>
                {newProduct.stock < 1 || newProduct.stock > 100 ? (
                  <p className="mt-1 text-sm text-red-600">
                    Stock must be between 1-100.
                  </p>
                ) : null}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleProductChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:primary focus:primary/10"
                  placeholder="Product Description"
                  rows="3"
                />
              </div>

              {/* File Input for Image */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {newProduct.image && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {newProduct.image.name}
                  </p>
                )}
              </div>

              {/* Customization Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Customization Options
                </label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isImageNeeded"
                      name="isImageNeeded"
                      checked={newProduct.isImageNeeded}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          isImageNeeded: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="isImageNeeded"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Customer needs to provide an image
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isTextNeeded"
                      name="isTextNeeded"
                      checked={newProduct.isTextNeeded}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          isTextNeeded: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="isTextNeeded"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Customer needs to provide text
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/10 transition"
              >
                <FiPlusCircle size={20} />
                <span className="font-medium">Add Product</span>
              </button>
            </form>
            <button
              onClick={handleRequest}
              className="mt-4 mr-2 text-primary px-3 py-1 rounded-lg bg-primary/10 flex items-center"
            >
              Request Category{" "}
              <RiFunctionAddLine className="ml-2 text-primary" />
            </button>

            {/* Request Category Modal */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white p-5 rounded-lg shadow-lg w-96 max-w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-3">
                    Request New Category
                  </h2>

                  {/* Business Type Selection */}
                  {/* Business Type Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <div className="flex">
                      <select
                        name="businessCategory"
                        value={requestData.businessTypeId} // Use businessTypeId for the select value
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded mr-2"
                      >
                        <option value="">Select Existing or Add New</option>
                        {businessTypes.map((bt) => (
                          <option key={bt.business_id} value={bt.business_id}>
                            {bt.type_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!requestData.businessTypeId && (
                      <input
                        type="text"
                        name="businessCategory"
                        value={requestData.businessCategory}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded mt-2"
                        placeholder="Enter new business type"
                      />
                    )}
                  </div>

                  {/* Category Selection - Only show dropdown if business type is selected */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {requestData.businessTypeId && (
                      <div className="flex">
                        <select
                          name="category"
                          value={requestData.categoryId}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded mr-2"
                        >
                          <option value="">Select Existing or Add New</option>
                          {categories
                            .filter(
                              (cat) =>
                                cat.business_id ===
                                parseInt(requestData.businessTypeId)
                            )
                            .map((cat) => (
                              <option
                                key={cat.category_id}
                                value={cat.category_id}
                              >
                                {cat.category_name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    {(!requestData.categoryId ||
                      !requestData.businessTypeId) && (
                      <input
                        type="text"
                        name="category"
                        value={requestData.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded mt-2"
                        placeholder="Enter new category"
                      />
                    )}
                  </div>

                  {/* Subcategory */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      name="subcategory"
                      value={requestData.subcategory}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                      placeholder="Enter new subcategory"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded mr-2 hover:bg-gray-400 transition"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition flex items-center"
                      onClick={handleSubmitRequest}
                    >
                      <RiFunctionAddLine className="mr-2" />
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Product List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Your Products
            </h4>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No products yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first product above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.Product_id}
                    className={`rounded-lg border overflow-hidden transition ${
                      product.Status ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row">
                      {product.Product_image && (
                        <div className="w-full md:w-1/4 h-48 md:h-auto">
                          <img
                            src={`http://localhost:5000/${product.Product_image}`}
                            alt={product.Product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4
                              className={`text-lg font-semibold ${
                                product.Status
                                  ? "text-gray-800"
                                  : "text-gray-500 line-through"
                              }`}
                            >
                              {product.Product_name}
                            </h4>
                            <span className="text-lg font-bold text-primary ">
                              ₹{product.Price}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 text-sm">
                            {product.Description}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="mr-2 text-primary px-3 py-1 rounded-lg bg-primary/10"
                          >
                            Edit
                          </button>
                          {showModal && selectedProduct && (
                            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                              <div className="bg-white p-5 rounded-lg shadow-lg w-96 max-w-full max-h-[90vh] overflow-y-auto">
                                <h2 className="text-lg font-semibold mb-3">
                                  Edit Product
                                </h2>

                                {/* Product Name */}
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name
                                  </label>
                                  <input
                                    type="text"
                                    value={selectedProduct.Product_name}
                                    onChange={(e) =>
                                      setSelectedProduct({
                                        ...selectedProduct,
                                        Product_name: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                  />
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    value={selectedProduct.Price}
                                    onChange={(e) =>
                                      setSelectedProduct({
                                        ...selectedProduct,
                                        Price: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                  />
                                </div>

                                {/* Stock Quantity */}
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    value={selectedProduct.Stock}
                                    onChange={(e) => {
                                      let value = parseInt(e.target.value, 10);
                                      if (value < 0) value = 0; // Ensure stock is not less than 0
                                      if (value > 100) value = 100; // Ensure stock is not greater than 100
                                      setSelectedProduct({
                                        ...selectedProduct,
                                        Stock: value,
                                      });
                                    }}
                                    className="w-full p-2 border rounded"
                                    required
                                  />
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={selectedProduct.Description || ""}
                                    onChange={(e) =>
                                      setSelectedProduct({
                                        ...selectedProduct,
                                        Description: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                  />
                                </div>

                                {/* Buttons */}
                                <div className="mt-4 flex justify-end">
                                  <button
                                    className="px-4 py-2 bg-gray-300 rounded mr-2 hover:bg-gray-400 transition"
                                    onClick={() => setShowModal(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                                    onClick={handleUpdateProduct}
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              toggleProductStatus(
                                product.Product_id,
                                product.Status
                              )
                            }
                            className={`px-4 py-2 rounded-lg transition ${
                              product.Status
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {product.Status ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProfilePage.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default ProfilePage;
