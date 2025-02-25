// import { useNavigate } from "react-router-dom";
// import PropTypes from "prop-types";
// import logo from "../Products/Navbar/logo.png";
// import axios from "axios";
// import Hero from "../Hero/Hero";
// import Products from "../Products/Products";
// import TopProducts from "../TopProducts/TopProducts";

// const UserDashboard = ({ user, setUser }) => {
//   const navigate = useNavigate();

//   // const handleLogout = () => {
//   //   localStorage.removeItem("user");
//   //   setUser(null);
//   //   setTimeout(() => {
//   //     navigate("/login");
//   //   }, 100);
//   const handleLogout = async () => {
//     try {
//       // Make a request to your server to log out
//       await axios.get("http://localhost:5000/logout", {
//         withCredentials: true,
//       });
//     } catch (error) {
//       console.error("Server logout error:", error);
//     }
//     // Clear client-side state and local storage
//     localStorage.removeItem("user");
//     setUser(null);
//     navigate("/login");
//   };

//   return (
//     <div>
//       <div>
//         <div className="bg-primary/40 py-2">
//           <div className="container flex justify-between items-center">
//             <div>
//               <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
//                 <img src={logo} alt="logo" className="w-10 uppercase" />
//                 CustomHive
//               </a>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-primary text-white py-1 px-4 rounded-full"
//             >
//               Logout
//             </button>
//             <h2 className="text-3xl font-bold text-primary mb-4">
//               Welcome, {user?.name || "Guest"}!
//             </h2>
//           </div>
//         </div>
//         <Hero />
//         <Products />
//         <TopProducts />
//       </div>
//     </div>
//   );
// };

// UserDashboard.propTypes = {
//   user: PropTypes.object,
//   setUser: PropTypes.func.isRequired,
// };

// export default UserDashboard;
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../Products/Navbar/logo.png";
import axios from "axios";
import Hero from "../Hero/Hero";
import Products from "../Products/Products";
import TopProducts from "../TopProducts/TopProducts";

const UserDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Make a request to your server to log out
      await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server logout error:", error);
    }
    // Clear client-side state and local storage
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      <div>
        <div className="bg-primary/40 py-2">
          <div className="container flex justify-between items-center">
            <div>
              <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
                <img src={logo} alt="logo" className="w-10 uppercase" />
                CustomHive
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                >
                  <FaUserCircle className="text-3xl text-gray-700 hover:text-gray-900" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                    <ul className="py-2">
                      <li>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          View Profile
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary text-white py-1 px-4 rounded-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4 text-center">
          Welcome, {user?.name || "Guest"}!
        </h2>
        <Hero />
        <Products />
        <TopProducts />
      </div>
    </div>
  );
};

UserDashboard.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default UserDashboard;
