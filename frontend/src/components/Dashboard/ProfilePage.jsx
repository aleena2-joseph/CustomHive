import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import {
  FiEdit,
  FiLogOut,
  FiPlusCircle,
  FiDollarSign,
  FiPackage,
  FiTag,
} from "react-icons/fi";

const ProfilePage = ({ setUser }) => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  // Updated handleUpdateProduct function with authentication
  const handleUpdateProduct = async () => {
    // Validate inputs
    if (!selectedProduct.Product_name || !selectedProduct.Price) {
      alert("Product name and price are required!");
      return;
    }

    try {
      // Collect the data to update
      const productData = {
        Product_name: selectedProduct.Product_name,
        Price: selectedProduct.Price,
        Description: selectedProduct.Description || "",
      };

      const response = await axios.put(
        `http://localhost:5000/api/update-product/${selectedProduct.Product_id}`,
        productData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Important for authentication
        }
      );

      if (response.status === 200) {
        // Update the local products array with the updated product
        setProducts(
          products.map((product) =>
            product.Product_id === selectedProduct.Product_id
              ? { ...product, ...productData }
              : product
          )
        );

        setShowModal(false);
        alert("Product updated successfully!");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        `Error updating product: ${
          error.response?.data?.error || error.message
        }`
      );
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

  // Product form state (with image property)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

  // Fetch products for the current user (using session)
  // useEffect(() => {
  //   if (user && user.email) {
  //     axios
  //       .get("http://localhost:5000/api/products", {
  //         withCredentials: true,
  //       })
  //       .then((response) => {
  //         console.log("Products:", response.data);
  //         setProducts(response.data);
  //       })
  //       .catch((error) => console.error("Error fetching products:", error));
  //   }
  // }, [user]);
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
  useEffect(() => {
    if (selectedBusinessType) {
      axios
        .get(
          `http://localhost:5000/api/categories?business_id=${selectedBusinessType}`
        )
        .then((response) => {
          console.log("Categories:", response.data);
          // Extract the data array from the response
          const categoriesData = response.data.data || [];
          setCategories(categoriesData);

          // Reset subcategory-related selections
          setSelectedCategory("");
          setSelectedSubcategory("");
        })
        .catch((error) => console.error("Error fetching categories:", error));
    } else {
      setCategories([]);
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  }, [selectedBusinessType]);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      axios
        .get(
          `http://localhost:5000/api/subcategories?category_id=${selectedCategory}`
        )
        .then((response) => {
          console.log("Subcategories:", response.data);
          // Extract the data array from the response
          const subcategoriesData = response.data.data || [];
          setSubcategories(subcategoriesData);
          setSelectedSubcategory("");
        })
        .catch((error) =>
          console.error("Error fetching subcategories:", error)
        );
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // Handle changes in text fields
  const handleProductChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle file input for image upload
  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  // Add a new product with image upload and update business_profile
  const addProduct = async (e) => {
    e.preventDefault();

    // Validate required fields
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

    // Build FormData for multipart/form-data
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("subcategory_id", selectedSubcategory);
    formData.append("business_id", selectedBusinessType);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("Product added:", response.data);
      setProducts([...products, response.data]);
      // Reset form fields
      setNewProduct({ name: "", description: "", price: "", image: null });
      // Don't reset selections to improve user experience
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response) {
        console.error("Server response status:", error.response.status);
        console.error("Server response data:", error.response.data);
        console.log("Full server response:", error.response);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error during request setup:", error.message);
      }
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
              <button
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition"
                onClick={handleLogout}
              >
                <FiLogOut size={18} />
                <span>Logout</span>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/10 disabled:bg-gray-100 disabled:text-gray-500"
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
                    Price
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
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:primary/10 focus:border-primary/10"
                      placeholder="Price"
                      required
                    />
                  </div>
                </div>
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

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/10 transition"
              >
                <FiPlusCircle size={20} />
                <span className="font-medium">Add Product</span>
              </button>
            </form>
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
