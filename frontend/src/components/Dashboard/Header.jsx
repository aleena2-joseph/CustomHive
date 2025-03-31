import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import logo from "../Products/Navbar/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
const Header = ({ setUser: setGlobalUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setLocalUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    localStorage.removeItem("user");
    setLocalUser(null);
    if (typeof setGlobalUser === "function") {
      setGlobalUser(null);
    }
    navigate("/login");
  };

  useEffect(() => {
    // If no user is found in local state, try to get from session
    if (!user) {
      axios
        .get("http://localhost:5000/api/session", { withCredentials: true })
        .then((response) => {
          if (response.data.user) {
            const userData = response.data.user;
            setLocalUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            // Update global user state if the setter function exists
            if (typeof setGlobalUser === "function") {
              setGlobalUser(userData);
            }
          } else {
            // No user in session, redirect to login
            navigate("/login");
          }
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
          navigate("/login");
        });
    }
  }, [user, setGlobalUser, navigate]);

  return (
    <div>
      <div className="bg-primary/40 py-3 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <a
              href="#"
              className="font-bold text-2xl sm:text-3xl flex items-center gap-2"
            >
              <img src={logo} alt="logo" className="w-10" />
              <span className="text-primary">CustomHive</span>
            </a>
          </div>
          {/* Aligning the elements horizontally */}
          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <Link to="/cart">
              <FaCartShopping className="text-3xl text-primary" />
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center gap-2"
              >
                <FaUserCircle className="text-3xl text-primary" />
                <span className="hidden md:inline text-gray-700">
                  {user?.name || "Guest"}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-32 w-48 bg-white border rounded-lg shadow-lg z-20">
                  <ul className="py-2">
                    <li>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        View Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/view-orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/80 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
Header.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default Header;
