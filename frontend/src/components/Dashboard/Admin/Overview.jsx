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
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      axios.get("http://localhost:5000/api/session", { withCredentials: true }),
      axios.get("http://localhost:5000/users"),
      axios.get("http://localhost:5000/api/business-types"),
      axios.get("http://localhost:5000/api/business-profile/owners-count"),
      axios.get("http://localhost:5000/api/products/count"),
      axios.get("http://localhost:5000/business-category-requests"),
    ])
      .then(
        ([
          sessionRes,
          usersRes,
          categoriesRes,
          ownersRes,
          productsRes,
          requestsRes,
        ]) => {
          setUser(sessionRes.data.user || null);
          setTotalUsers(usersRes.data.length || 0);
          setCategories(categoriesRes.data || []);
          setOwnerCount(ownersRes.data.ownerCount || 0);
          setProductCount(productsRes.data.totalProducts || 0);
          setRequests(requestsRes.data || []);
        }
      )
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Approve category request
  const handleApprove = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/business-category-requests/approve/${id}`
      );
      console.log("Request approved:", response.data);
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };
  // Reject category request
  const handleReject = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/business-category-requests/reject/${id}`
      );
      console.log("Request rejected:", response.data);

      // Optionally, update the state to remove the rejected request from the list
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.request_id !== id)
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
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

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 min-h-screen shadow-md">
          <Sidebar setUser={setUser} />
        </div>

        {/* Overview Section */}
        <div className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Overview</h2>

          {/* Stats Cards */}
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
            {categories.map((category, index) => (
              <div
                key={category.business_id || index}
                className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-300"
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {category.type_name}
                </h4>
              </div>
            ))}
          </div>

          {/* Pending Category Requests */}
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 mt-8">
            Pending Category Requests
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.request_id}
                  className="bg-white shadow-md rounded-lg p-4 border border-gray-300"
                >
                  <p className="text-lg font-bold">
                    {req.requested_category
                      ? `Category: ${req.requested_category}`
                      : req.requested_business_type
                      ? `Business Type: ${req.requested_business_type}`
                      : req.requested_subcategory
                      ? `Subcategory: ${req.requested_subcategory}`
                      : "Request"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Requested by: {req.email}
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    onClick={() => handleApprove(req.request_id)}
                  >
                    Approve
                  </button>
                  <button
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={() => handleReject(req.request_id)}
                  >
                    Reject
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No pending requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
