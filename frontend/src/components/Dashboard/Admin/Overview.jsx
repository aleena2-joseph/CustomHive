import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../Hero/Sidebar";

const Overview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch total users (excluding admin)
    axios
      .get("http://localhost:5000/users")
      .then((res) => setTotalUsers(res.data.length))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch business categories
    axios
      .get("http://localhost:5000/api/business-types")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <div className="p-5 ml-60">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Overview</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="text-3xl">{totalUsers}</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Owners</h3>
              <p className="text-3xl">0</p> {/* Dummy Value */}
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Products</h3>
              <p className="text-3xl">0</p> {/* Dummy Value */}
            </div>
          </div>

          {/* Categories Section */}
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Business Categories
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.business_id}
                className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-300"
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {category.type_name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
