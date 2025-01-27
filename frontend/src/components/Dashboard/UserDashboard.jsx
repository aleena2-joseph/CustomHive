import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import logo from "../Products/Navbar/logo.png";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import Hero from "../Hero/Hero";
import Products from "../Products/Products";
import TopProducts from "../TopProducts/TopProducts";

const UserDashboard = ({ userName, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userName");
    setUser(null);
    navigate("/");
  };

  return (
    <div>
      <div>
        {/* Upper Navbar */}
        <div className="bg-primary/40 py-2">
          <div
            className="container flex justify-between
        items-center "
          >
            <div>
              <a
                href="#"
                className="font-bold 
            text-2xl sm:text-3xl flex gap-2"
              >
                <img src={logo} alt="logo" className="w-10 uppercase" />
                CustomHive
              </a>
            </div>
            {/* search bar */}
            <div className="flex justify-between items-center gap-4 ">
              <div
                className="relative group hidden
            sm:block"
              >
                <input
                  type="text"
                  placeholder="Search"
                  className="w-[200px] sm:w-[200px]
              group-hover:w-[300px]
              transition-all duration-300
              rounded-full border
              border-gray-300 px-2 py-1 
              focus:outline-none focus:border-1
              focus:border-primary
              "
                />
                <IoMdSearch
                  className="text-gray-500 group-hover:text-primary absolute
              top-1/2 -translate-y-1/2 right-3"
                />
              </div>
            </div>

            {/* order button */}

            <button
              onClick={() => alert("Ordering not available yet ")}
              className="bg-gradient-to-r from-primary to-secondary transition-all duration-200
          text-white py-1 px-4 rounded-full flex
          items-center gap-3 group"
            >
              <span className="group-hover:block hidden transition-all duration-200">
                order
              </span>
              <FaCartShopping
                className="text-xl text-white drop-shadow-sm 
            cursor-pointer"
              />
            </button>
            <button
              onClick={handleLogout}
              className="bg-primary text-white py-1 px-4 rounded-full"
            >
              Logout
            </button>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Welcome, {userName}!
            </h2>
          </div>
        </div>

        <Hero />
        <Products />
        <TopProducts />
        <div className="flex justify-between items-center"></div>
      </div>
    </div>
  );
};
UserDashboard.propTypes = {
  userName: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default UserDashboard;
