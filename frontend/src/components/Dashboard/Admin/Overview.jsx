import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../Hero/Sidebar";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../Products/Navbar/logo.png";

const Overview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [categories, setCategories] = useState([]);
  const [ownerCount, setOwnerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch session data
    axios
      .get("http://localhost:5000/api/session", { withCredentials: true })
      .then((res) => setUser(res.data.user || null))
      .catch((err) => console.error("Error fetching session:", err));

    // Fetch total users (excluding admin)
    axios
      .get("http://localhost:5000/users")
      .then((res) => setTotalUsers(res.data.length || 0))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch business categories
    axios
      .get("http://localhost:5000/api/business-types")
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Error fetching categories:", err));

    // Fetch total owners count
    axios
      .get("http://localhost:5000/api/business-profile/owners-count")
      .then((res) => setOwnerCount(res.data.ownerCount || 0))
      .catch((err) => console.error("Error fetching owner count:", err));

    // Fetch total product count
    axios
      .get("http://localhost:5000/api/products/count")
      .then((res) => setProductCount(res.data.totalProducts || 0))
      .catch((err) => console.error("Error fetching Products count:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the top */}
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
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar on the left, Overview on the right */}
      <div className="flex flex-grow">
        {/* Sidebar (fixed width) */}
        <div className="w-64 bg-gray-100 min-h-screen shadow-md">
          <Sidebar setUser={setUser} />
        </div>

        {/* Overview Section (takes remaining space) */}
        <div className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Overview</h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="text-3xl">{totalUsers}</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Owners</h3>
              <p className="text-3xl">{ownerCount}</p>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Products</h3>
              <p className="text-3xl">{productCount}</p>
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
