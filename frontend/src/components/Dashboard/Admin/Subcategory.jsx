import { useState, useEffect } from "react";
import Sidebar from "../../Hero/Sidebar";
import PropTypes from "prop-types";
import axios from "axios";
import { Edit2, Trash2, Save, X } from "lucide-react";

const SubCategory = ({ setUser }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch business types
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/business-types"
        );
        if (response.data && Array.isArray(response.data)) {
          setBusinessTypes(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching business types:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessTypes();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  // Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Business Type Selection
  const handleBusinessTypeChange = (e) => {
    const selectedType = e.target.value;
    setSelectedBusinessType(selectedType);
    setSelectedCategory(""); // Reset category selection

    // Filter categories based on business type
    const filtered = categories.filter(
      (category) => category.business_id == selectedType
    );
    setFilteredCategories(filtered);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBusinessType || !selectedCategory || !subCategoryName.trim()) {
      alert(
        "Please select a business type, category, and enter a subcategory name."
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/add-subcategory",
        {
          business_id: selectedBusinessType,
          category_id: selectedCategory,
          subcategory_name: subCategoryName.trim(),
          description: description.trim(),
        }
      );

      // Show success message
      const successMessage = document.getElementById("successMessage");
      successMessage.textContent = response.data.message;
      successMessage.classList.remove("hidden");

      // Hide success message after 3 seconds
      setTimeout(() => {
        successMessage.classList.add("hidden");
      }, 3000);

      // Reset form
      setSubCategoryName("");
      setDescription("");
      setSelectedBusinessType("");
      setSelectedCategory("");
      setFilteredCategories([]);
      fetchSubCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
      alert("Failed to add subcategory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a subcategory
  const handleEdit = (subcategory) => {
    setIsEditing(true);
    setEditingId(subcategory.subcategory_id);
    setEditName(subcategory.subcategory_name);
    setEditDescription(subcategory.description || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  // Save edited subcategory
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      alert("Subcategory name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(`http://localhost:5000/api/update-subcategory/${id}`, {
        subcategory_name: editName.trim(),
        description: editDescription.trim(),
      });

      // Show success message
      const successMessage = document.getElementById("successMessage");
      successMessage.textContent = "Subcategory updated successfully!";
      successMessage.classList.remove("hidden");

      // Hide success message after 3 seconds
      setTimeout(() => {
        successMessage.classList.add("hidden");
      }, 3000);

      setIsEditing(false);
      setEditingId(null);
      fetchSubCategories();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert("Failed to update subcategory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete subcategory
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `http://localhost:5000/api/delete-subcategory/${id}`
        );

        // Show success message
        const successMessage = document.getElementById("successMessage");
        successMessage.textContent = "Subcategory deleted successfully!";
        successMessage.classList.remove("hidden");

        // Hide success message after 3 seconds
        setTimeout(() => {
          successMessage.classList.add("hidden");
        }, 3000);

        fetchSubCategories();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert("Failed to delete subcategory. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar setUser={setUser} />
      <div className="flex-1 p-6 ml-[250px]">
        {/* Success message */}
        <div
          id="successMessage"
          className="hidden mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-sm"
        >
          Subcategory added successfully!
        </div>

        {/* Add Subcategory Form */}
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
            Add Subcategory
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type:
              </label>
              <select
                value={selectedBusinessType}
                onChange={handleBusinessTypeChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 focus:outline-none shadow-sm"
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

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 focus:outline-none shadow-sm"
                disabled={!selectedBusinessType} // Disable if business type not selected
              >
                <option value="">Select a category</option>
                {filteredCategories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory Name:
              </label>
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Enter subcategory name"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 focus:outline-none shadow-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter subcategory description (optional)"
                rows="3"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 focus:outline-none shadow-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ${
                  !selectedBusinessType ||
                  !selectedCategory ||
                  !subCategoryName.trim() ||
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
                disabled={
                  !selectedBusinessType ||
                  !selectedCategory ||
                  !subCategoryName.trim() ||
                  isLoading
                }
              >
                {isLoading ? "Adding..." : "Add Subcategory"}
              </button>
            </div>
          </form>
        </div>

        {/* Subcategory List */}
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">
            Subcategory List
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : subCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Subcategory
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subCategories.map((subCategory) => (
                    <tr
                      key={subCategory.subcategory_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        {isEditing &&
                        editingId === subCategory.subcategory_id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          subCategory.subcategory_name
                        )}
                      </td>
                      <td className="px-4 py-3">{subCategory.category_name}</td>
                      <td className="px-4 py-3">
                        {isEditing &&
                        editingId === subCategory.subcategory_id ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          subCategory.description || "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing &&
                        editingId === subCategory.subcategory_id ? (
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() =>
                                handleSaveEdit(subCategory.subcategory_id)
                              }
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(subCategory)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(subCategory.subcategory_id)
                              }
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No subcategories found.
            </p>
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
