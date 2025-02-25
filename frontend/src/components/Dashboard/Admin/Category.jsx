import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../Hero/Sidebar";
import PropTypes from "prop-types";
import axios from "axios";

const Category = ({ setUser }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);

  // Function to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");

      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
    }
  }, []);

  // Fetch business types and categories when component mounts
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/business-types"
        );

        if (response.data && Array.isArray(response.data)) {
          setBusinessTypes(response.data);
        } else {
          console.error("Unexpected API response format for business types");
        }
      } catch (error) {
        console.error("Error fetching business types:", error);
      }
    };

    fetchBusinessTypes();
    fetchCategories();
  }, [fetchCategories]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBusiness || !categoryName.trim()) {
      alert("Please select a business type and enter a category name.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-category",
        {
          business_id: selectedBusiness,
          category_name: categoryName.trim(),
          description: description.trim(),
        }
      );

      alert(response.data.message);

      // Reset form fields
      setCategoryName("");
      setDescription("");
      setSelectedBusiness("");

      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar setUser={setUser} />
      <div className="flex-1 p-6 ml-[250px]">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Add Category
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown to select business type */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Business Type:
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              >
                <option value="">Select a business type</option>
                {businessTypes.map((business) => (
                  <option
                    key={business.business_id}
                    value={business.business_id}
                  >
                    {business.type_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Category Name:
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description (optional)"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            {/* Submit Button (Disabled if fields are empty) */}
            <div>
              <button
                type="submit"
                className={`w-full text-white font-bold py-2 px-4 rounded-lg transition ${
                  !selectedBusiness || !categoryName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!selectedBusiness || !categoryName.trim()}
              >
                Add Category
              </button>
            </div>
          </form>
        </div>

        {/* Display Category List */}
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Category List
          </h2>
          {categories.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-4 py-2">
                    Category Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Business Type
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.category_id}
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {category.category_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {businessTypes.find(
                        (b) => b.business_id === category.business_id
                      )?.type_name || "Unknown"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {category.description || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center">No categories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

Category.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Category;
