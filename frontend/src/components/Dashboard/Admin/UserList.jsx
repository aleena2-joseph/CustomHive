import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../Hero/Sidebar";

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/users");

      console.log("Fetched Users from Backend:", response.data); // Debugging

      // Filter users to exclude admin (role_id = 1)
      const filteredUsers = response.data.filter((user) => user.role_id !== 1);

      setData(filteredUsers); // Store only non-admin users
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle status toggle
  const toggleStatus = async (email, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await axios.put(`http://localhost:5000/update_status/${email}`, {
        status: newStatus,
      });

      setData((prevData) =>
        prevData.map((user) =>
          user.email === email ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  }
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <div className="flex-1 p-5 ml-60">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">User List</h2>
          <div className="overflow-x-auto flex justify-center w-full max-w-4xl shadow-lg rounded-lg bg-white p-4 mx-auto">
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
