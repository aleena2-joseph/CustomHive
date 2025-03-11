import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../Hero/Sidebar";
import PropTypes from "prop-types";
import axios from "axios";
import {
  FiEdit,
  FiPlusCircle,
  FiPackage,
  FiSave,
  FiX,
  FiFilter,
} from "react-icons/fi";

const Category = ({ setUser }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterBusinessId, setFilterBusinessId] = useState(""); // New state for filtering categories display

  // Function to fetch categories with optional business_id filter
  const fetchCategories = useCallback(async (businessId = null) => {
    setIsLoading(true);
    try {
      // Build the URL with query parameters if businessId is provided
      let url = "http://localhost:5000/api/categories";
      if (businessId) {
        url += `?business_id=${businessId}`;
      }

      const response = await axios.get(url);

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
    } finally {
      setIsLoading(false);
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
    fetchCategories(); // Fetch all categories initially
  }, [fetchCategories]);

  // Handle business filter change
  const handleBusinessFilterChange = (e) => {
    const businessId = e.target.value;
    setFilterBusinessId(businessId);
    fetchCategories(businessId || null); // Fetch filtered categories or all if no filter
  };

  // Handle form submission for adding a new category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedBusiness ||
      !categoryName.trim() ||
      minPrice === "" ||
      maxPrice === ""
    ) {
      alert(
        "Please select a business type, enter a category name, and set price range."
      );
      return;
    }

    if (parseFloat(minPrice) > parseFloat(maxPrice)) {
      alert("Minimum price cannot be greater than maximum price.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-category",
        {
          business_id: selectedBusiness,
          category_name: categoryName.trim(),
          description: description.trim(),
          min_price: minPrice,
          max_price: maxPrice,
        }
      );

      // Show success notification
      const notification = document.getElementById("notification");
      notification.textContent = response.data.message;
      notification.classList.remove("hidden");
      notification.classList.add(
        "bg-green-100",
        "border-green-500",
        "text-green-700"
      );

      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);

      // Reset form fields
      setCategoryName("");
      setDescription("");
      setSelectedBusiness("");
      setMinPrice("");
      setMaxPrice("");

      // Refresh categories list with current filter
      fetchCategories(filterBusinessId || null);
    } catch (error) {
      console.error("Error adding category:", error);

      // Show error notification
      const notification = document.getElementById("notification");
      notification.textContent =
        error.response?.data?.error || "Failed to add category";
      notification.classList.remove("hidden");
      notification.classList.add(
        "bg-red-100",
        "border-red-500",
        "text-red-700"
      );

      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.category_name);
    setDescription(category.description || "");
    setSelectedBusiness(category.business_id);
    setMinPrice(category.min_price || "");
    setMaxPrice(category.max_price || "");
    setEditMode(true);

    // Scroll to the form
    document
      .getElementById("categoryForm")
      .scrollIntoView({ behavior: "smooth" });
  };

  // Handle update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (
      !selectedBusiness ||
      !categoryName.trim() ||
      minPrice === "" ||
      maxPrice === ""
    ) {
      alert(
        "Please select a business type, enter a category name, and set price range."
      );
      return;
    }

    if (parseFloat(minPrice) > parseFloat(maxPrice)) {
      alert("Minimum price cannot be greater than maximum price.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/update-category/${currentCategory.category_id}`,
        {
          business_id: selectedBusiness,
          category_name: categoryName.trim(),
          description: description.trim(),
          min_price: minPrice,
          max_price: maxPrice,
        }
      );

      // Show success notification
      const notification = document.getElementById("notification");
      notification.textContent = response.data.message;
      notification.classList.remove("hidden");
      notification.classList.add(
        "bg-green-100",
        "border-green-500",
        "text-green-700"
      );

      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);

      // Reset form and edit mode
      setCategoryName("");
      setDescription("");
      setSelectedBusiness("");
      setMinPrice("");
      setMaxPrice("");
      setEditMode(false);
      setCurrentCategory(null);

      // Refresh categories list with current filter
      fetchCategories(filterBusinessId || null);
    } catch (error) {
      console.error("Error updating category:", error);

      // Show error notification
      const notification = document.getElementById("notification");
      notification.textContent =
        error.response?.data?.error || "Failed to update category";
      notification.classList.remove("hidden");
      notification.classList.add(
        "bg-red-100",
        "border-red-500",
        "text-red-700"
      );

      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setCategoryName("");
    setDescription("");
    setSelectedBusiness("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businessTypes
        .find((b) => b.business_id === category.business_id)
        ?.type_name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Clear all filters
  const clearFilters = () => {
    setFilterBusinessId("");
    setSearchTerm("");
    fetchCategories(); // Fetch all categories
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar setUser={setUser} />
      <div className="flex-1 p-6 ml-[250px]">
        {/* Notification banner */}
        <div
          id="notification"
          className="hidden px-4 py-3 mb-4 rounded-lg border"
        ></div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiPackage className="mr-2 text-blue-500" />
                  {editMode ? "Edit Category" : "Add Category"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editMode
                    ? "Update an existing category in your product catalog"
                    : "Create a new category for organizing your products"}
                </p>
              </div>
            </div>

            <form
              id="categoryForm"
              onSubmit={editMode ? handleUpdateCategory : handleSubmit}
              className="p-6 space-y-4"
            >
              {/* Dropdown to select business type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type:
                </label>
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name:
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description (optional)"
                  rows="3"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Price Range Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Price:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Price:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                {editMode && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={
                    !selectedBusiness ||
                    !categoryName.trim() ||
                    minPrice === "" ||
                    maxPrice === "" ||
                    isLoading
                  }
                  className={`flex items-center justify-center flex-1 px-4 py-2.5 font-medium rounded-lg transition ${
                    !selectedBusiness ||
                    !categoryName.trim() ||
                    minPrice === "" ||
                    maxPrice === "" ||
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : editMode
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : editMode ? (
                    <FiSave className="mr-2" />
                  ) : (
                    <FiPlusCircle className="mr-2" />
                  )}
                  {isLoading
                    ? "Processing..."
                    : editMode
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>

          {/* Display Category List */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mt-8">
            <div className="border-b border-gray-200">
              <div className="px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiPackage className="mr-2 text-blue-500" />
                  Category List
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your product categories
                </p>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="px-6 pt-4 space-y-3">
              {/* Business Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiFilter className="inline mr-1" /> Filter by Business Type:
                </label>
                <div className="flex gap-2">
                  <select
                    value={filterBusinessId}
                    onChange={handleBusinessFilterChange}
                    className="flex-grow p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Business Types</option>
                    {businessTypes.map((business) => (
                      <option
                        key={business.business_id}
                        value={business.business_id}
                      >
                        {business.type_name}
                      </option>
                    ))}
                  </select>

                  {(filterBusinessId || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center"
                    >
                      <FiX className="mr-1" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Search box */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search:
                </label>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : categories.length > 0 ? (
                <div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business Type
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price Range
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCategories.map((category) => (
                        <tr
                          key={category.category_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-800">
                              {category.category_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {category.type_name ||
                                businessTypes.find(
                                  (b) => b.business_id === category.business_id
                                )?.type_name ||
                                "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {category.min_price !== undefined &&
                            category.max_price !== undefined ? (
                              <span className="text-gray-700">
                                ₹{parseFloat(category.min_price).toFixed(2)} - ₹
                                {parseFloat(category.max_price).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                Not set
                              </span>
                            )}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <FiEdit className="mr-1" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No categories found.</p>
                  <p className="text-sm text-gray-400">
                    Add your first category using the form above.
                  </p>
                </div>
              )}

              {categories.length > 0 && filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No categories match your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Category.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Category;
