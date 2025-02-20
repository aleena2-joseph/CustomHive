import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import logo from "../Products/Navbar/logo.png";

import Hero from "../Hero/Hero";
import Products from "../Products/Products";
import TopProducts from "../TopProducts/TopProducts";

const UserDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Ensure the correct key is removed
    setUser(null);
    setTimeout(() => {
      navigate("/login");
    }, 100);
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
            <button
              onClick={handleLogout}
              className="bg-primary text-white py-1 px-4 rounded-full"
            >
              Logout
            </button>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Welcome, {user?.name || "Guest"}!
            </h2>
          </div>
        </div>
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
