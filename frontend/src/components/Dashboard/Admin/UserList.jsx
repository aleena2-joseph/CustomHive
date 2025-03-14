import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import Sidebar from "../../Hero/Sidebar";
import logo from "../../Products/Navbar/logo.png";

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch session data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/session", { withCredentials: true })
      .then((res) => setUser(res.data.user || null))
      .catch((err) => console.error("Error fetching session:", err));

    // Fetch users from the database
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:5000/users");

        // Filter users to exclude admin (role_id = 1)
        const filteredUsers = response.data.filter(
          (user) => user.role_id !== 1
        );
        setData(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please try again later.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Toggle user status (Activate/Deactivate)
  const toggleStatus = async (email, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await axios.put(`http://localhost:5000/users/${email}/status`, {
        status: newStatus,
      });

      // Update state to reflect the new status
      setData((prevData) =>
        prevData.map((user) =>
          user.email === email ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

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

      {/* Main Content: Sidebar on the left, User List on the right */}
      <div className="flex flex-grow">
        {/* Sidebar (fixed width) */}
        <div className="w-64 bg-gray-100 min-h-screen shadow-md">
          <Sidebar setUser={setUser} />
        </div>

        {/* User List Section (takes remaining space) */}
        <div className="flex-1 p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">
            User/Seller List
          </h2>

          {/* Display Error Message */}
          {error && (
            <div className="bg-red-500 text-white p-3 mb-4 text-center rounded-md">
              {error}
            </div>
          )}

          <div className="overflow-x-auto shadow-lg rounded-lg bg-white p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-500 text-white">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  data.map((user) => (
                    <tr
                      key={user.email}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.phone}</td>
                      <td className="px-6 py-4 font-semibold">
                        <span
                          className={
                            user.status === 1
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {user.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(user.email, user.status)}
                          className={`py-2 px-4 rounded-lg text-white transition-all duration-300 shadow-md ${
                            user.status === 1
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {user.status === 1 ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
