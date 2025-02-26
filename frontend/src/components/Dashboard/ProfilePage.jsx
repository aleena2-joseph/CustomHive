import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit, FiLogOut, FiPlusCircle } from "react-icons/fi";

const ProfilePage = ({ setUser }) => {
  const [products, setProducts] = useState([]);

  // States for business types, categories, and subcategories
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  // Product form state (added image property)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: null, // For storing the selected file
  });

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

  // Helper function to extract an array from the response
  const extractDataArray = (responseData) => {
    const data = responseData.data || responseData;
    return Array.isArray(data) ? data : [];
  };

  // Fetch products and business types on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        console.log("Products:", response.data);
        setProducts(extractDataArray(response.data));
      })
      .catch((error) => console.error("Error fetching products:", error));

    axios
      .get("http://localhost:5000/api/business-types")
      .then((response) => {
        console.log("Business Types:", response.data);
        setBusinessTypes(extractDataArray(response.data));
      })
      .catch((error) => console.error("Error fetching business types:", error));
  }, []);

  // Fetch categories when a business type is selected
  useEffect(() => {
    if (selectedBusinessType) {
      axios
        .get(
          `http://localhost:5000/api/categories?business_type=${selectedBusinessType}`
        )
        .then((response) => {
          console.log("Categories:", response.data);
          setCategories(extractDataArray(response.data));
        })
        .catch((error) => console.error("Error fetching categories:", error));
    } else {
      setCategories([]);
      setSelectedCategory("");
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
          setSubcategories(extractDataArray(response.data));
        })
        .catch((error) =>
          console.error("Error fetching subcategories:", error)
        );
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // Handle product input changes for text fields
  const handleProductChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle file input changes for image upload
  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  // Add a new product with image upload
  const addProduct = async (e) => {
    e.preventDefault();
    if (
      !newProduct.name.trim() ||
      !newProduct.price.trim() ||
      !selectedSubcategory
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Build FormData so we can send multipart/form-data
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("subcategory_id", selectedSubcategory);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProducts([...products, response.data]);
      // Reset form fields
      setNewProduct({ name: "", description: "", price: "", image: null });
      setSelectedBusinessType("");
      setSelectedCategory("");
      setSelectedSubcategory("");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Toggle product status
  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, {
        status: !currentStatus,
      });
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
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 border-b pb-4 mb-6">
        <FaUserCircle className="text-5xl text-gray-700" />
        <div>
          <h2 className="text-xl font-semibold">{user?.name || "Guest"}</h2>
          <p className="text-gray-500">Seller Account</p>
        </div>
      </div>

      {/* Profile Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600">
          <FiEdit />
          <span>Edit Profile</span>
        </button>
        <button
          className="flex items-center space-x-2 p-3 bg-red-500 text-white rounded-lg w-full hover:bg-red-600"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {/* My Products Section */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-semibold mb-4">My Products</h3>

        {/* Product Form */}
        <form onSubmit={addProduct} className="mb-4 grid grid-cols-2 gap-4">
          {/* Business Type Select */}
          <select
            value={selectedBusinessType}
            onChange={(e) => setSelectedBusinessType(e.target.value)}
            className="border p-2 rounded-lg"
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

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded-lg"
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

          {/* Subcategory Select */}
          <select
            name="subcategory_id"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="border p-2 rounded-lg"
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

          {/* Product Name */}
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleProductChange}
            className="border p-2 rounded-lg"
            placeholder="Product Name"
            required
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleProductChange}
            className="border p-2 rounded-lg"
            placeholder="Price"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleProductChange}
            className="border p-2 rounded-lg col-span-2"
            placeholder="Product Description"
          />

          {/* File Input for Image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-2"
          />

          <button
            type="submit"
            className="col-span-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
          >
            <FiPlusCircle className="mr-2" /> Add Product
          </button>
        </form>

        {/* Product List */}
        <ul>
          {products.map((product) => (
            <li
              key={product.Product_id}
              className={`flex justify-between items-center p-3 border rounded-lg mb-2 ${
                product.Status ? "bg-gray-100" : "bg-gray-300"
              }`}
            >
              <div>
                <h4 className={product.Status ? "" : "line-through"}>
                  {product.Product_name} - ₹{product.Price}
                </h4>
                <p className="text-sm text-gray-500">{product.Description}</p>
                {product.Product_image && (
                  <img
                    src={`http://localhost:5000/${product.Product_image}`}
                    alt={product.Product_name}
                    className="mt-2 h-20"
                  />
                )}
              </div>
              <button
                onClick={() =>
                  toggleProductStatus(product.Product_id, product.Status)
                }
                className={`border px-3 py-1 rounded-lg ${
                  product.Status
                    ? "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                    : "text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                {product.Status ? "Disable" : "Enable"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

ProfilePage.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default ProfilePage;
