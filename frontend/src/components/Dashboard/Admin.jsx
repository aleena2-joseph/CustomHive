import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import logo from "../../components/Products/Navbar/logo.png";

function Admin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hanleLogout = () => {
    navigate("/");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/users");
      if (response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setData([]);
        console.error("No data received from server");
      }
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

  const handleDelete = async (email) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${email}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-primary vh-100 vw-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid bg-primary vh-100 vw-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary/40 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link
            to="/"
            className="font-bold text-2xl sm:text-3xl flex gap-2 items-center"
          >
            <img src={logo} alt="logo" className="w-10" />
            CustomHive
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="Search"
                className="w-[200px] sm:w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-2 py-1 focus:outline-none focus:border-1 focus:border-primary"
              />
              <IoMdSearch className="text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3" />
            </div>

            <div className="flex gap-4">
              <Link to="/userDashboard">
                <button className="bg-primary text-white py-1 px-4 rounded-full">
                  Home
                </button>
              </Link>
              <button
                onClick={hanleLogout}
                className="bg-primary text-white py-1 px-4 rounded-full"
              >
                Logout
              </button>
              <button
                onClick={() => alert("Ordering not available yet")}
                className="bg-gradient-to-r from-primary to-secondary text-white py-1 px-4 rounded-full flex items-center gap-3 group"
              >
                <span className="group-hover:block hidden">Order</span>
                <FaCartShopping className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 ml-4">
        <table className="table-auto border border-gray-300 ">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Password</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td>No students found</td>
              </tr>
            ) : (
              data.map((user) => (
                <tr key={user.email}>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.password}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.phone}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Link to={`/read/${user.id}`}>Read</Link>
                    <Link to={`/edit/${user.id}`}>Edit</Link>
                    <button onClick={() => handleDelete(user.email)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
