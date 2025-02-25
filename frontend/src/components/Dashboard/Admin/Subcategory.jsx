import { useState, useEffect } from "react";
import Sidebar from "../../Hero/Sidebar";
import PropTypes from "prop-types";
import axios from "axios";

const SubCategory = ({ setUser }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  // Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/subcategories"
      );
      if (response.data && Array.isArray(response.data.data)) {
        setSubCategories(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !subCategoryName.trim()) {
      alert("Please select a category and enter a subcategory name.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-subcategory",
        {
          category_id: selectedCategory,
          subcategory_name: subCategoryName.trim(),
          description: description.trim(),
        }
      );

      alert(response.data.message);
      setSubCategoryName("");
      setDescription("");
      setSelectedCategory("");
      fetchSubCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar setUser={setUser} />
      <div className="flex-1 p-6 ml-[250px]">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Add Subcategory
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Subcategory Name:
              </label>
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Enter subcategory name"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter subcategory description (optional)"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                className={`w-full text-white font-bold py-2 px-4 rounded-lg transition ${
                  !selectedCategory || !subCategoryName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!selectedCategory || !subCategoryName.trim()}
              >
                Add Subcategory
              </button>
            </div>
          </form>
        </div>

        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Subcategory List
          </h2>
          {subCategories.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-4 py-2">
                    Subcategory Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Category</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {subCategories.map((subCategory) => (
                  <tr
                    key={subCategory.subcategory_id}
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {subCategory.subcategory_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {categories.find(
                        (c) => c.category_id === subCategory.category_id
                      )?.category_name || "Unknown"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {subCategory.description || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center">No subcategories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

SubCategory.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default SubCategory;
