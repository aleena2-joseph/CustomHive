import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit, FiLogOut, FiPlusCircle } from "react-icons/fi";

const ProfilePage = () => {
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    subcategory_id: "",
  });

  // Fetch products and subcategories from the database
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));

    axios
      .get("http://localhost:5000/api/subcategories")
      .then((response) => setSubcategories(response.data))
      .catch((error) => console.error("Error fetching subcategories:", error));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add a new product
  const addProduct = async (e) => {
    e.preventDefault();
    if (
      !newProduct.name.trim() ||
      !newProduct.price.trim() ||
      !newProduct.subcategory_id
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products",
        newProduct
      );
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        subcategory_id: "",
      });
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
          <h2 className="text-xl font-semibold">John Doe</h2>
          <p className="text-gray-500">Seller Account</p>
        </div>
      </div>

      {/* Profile Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600">
          <FiEdit />
          <span>Edit Profile</span>
        </button>
        <button className="flex items-center space-x-2 p-3 bg-red-500 text-white rounded-lg w-full hover:bg-red-600">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {/* My Products Section */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-semibold mb-4">My Products</h3>

        {/* Product Form */}
        <form onSubmit={addProduct} className="mb-4 grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            className="border p-2 rounded-lg"
            placeholder="Product Name"
            required
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            className="border p-2 rounded-lg"
            placeholder="Price"
            required
          />
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            className="border p-2 rounded-lg col-span-2"
            placeholder="Product Description"
          />
          <select
            name="subcategory_id"
            value={newProduct.subcategory_id}
            onChange={handleChange}
            className="border p-2 rounded-lg"
            required
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.Subcategory_id} value={sub.Subcategory_id}>
                {sub.Subcategory_name}
              </option>
            ))}
          </select>
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

export default ProfilePage;
