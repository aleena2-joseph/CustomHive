import { Link, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import axios from "axios";
import PropTypes from "prop-types";

const Sidebar = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    localStorage.removeItem("user");
    if (typeof setUser === "function") {
      setUser(null);
    }
    navigate("/login");
  };

  return (
    <div className="w-60 h-screen bg-primary/30 text-white p-5 fixed">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <ul className="mt-5 space-y-3">
        <li>
          <Link to="/admin/overview" className="block p-2 hover:bg-primary">
            Overview
          </Link>
        </li>
        <li>
          <Link to="/admin/userlist" className="block p-2 hover:bg-primary">
            User/Seller List
          </Link>
        </li>
        <li>
          <Link
            to="/admin/business_types"
            className="block p-2 hover:bg-primary"
          >
            Business Types
          </Link>
        </li>
        <li>
          <Link to="/admin/category" className="block p-2 hover:bg-primary">
            Category
          </Link>
        </li>
        <li>
          <Link to="/admin/subcategory" className="block p-2 hover:bg-primary">
            Subcategory
          </Link>
        </li>
      </ul>
      <div className="mt-4">
        <button
          className="flex items-center gap-2 bg-white text-primary py-2 px-4 rounded-md hover:bg-gray-100 transition w-full"
          onClick={handleLogout}
        >
          <IoLogOutOutline className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};

// Prop validation
Sidebar.propTypes = {
  setUser: PropTypes.func.isRequired, // Ensures setUser is a function
};

export default Sidebar;
