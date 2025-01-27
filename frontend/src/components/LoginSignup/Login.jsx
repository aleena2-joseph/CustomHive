import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import logo from "../Products/Navbar/logo.png";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Added name state
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    localStorage.setItem("userName", name);
    setUser(name);
    axios
      .post("http://localhost:5000/login", { email, password })
      .then((response) => {
        if (response.data.success) {
          // Redirect to the appropriate dashboard based on the role
          navigate(response.data.redirectUrl);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
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
              <Link to="/login">
                <button className="bg-primary text-white py-1 px-4 rounded-full">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-secondary text-white py-1 px-4 rounded-full">
                  Signup
                </button>
              </Link>
              <button
                onClick={() => alert("Ordering not available yet")}
                className="bg-gradient-to-r from-primary to-secondary text-white py-1 px-4 rounded-full flex items-center gap-3 group"
              >
                <span className="group-hover:block hidden transition-all duration-200">
                  Order
                </span>
                <FaCartShopping className="text-xl text-white drop-shadow-sm cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex justify-center items-center py-12">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-center text-primary font-bold text-2xl mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              type="submit"
            >
              Login
            </button>

            <p className="text-center mt-4">
              Dont have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Signup
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
