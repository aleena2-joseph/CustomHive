import { useState } from "react";

import logo from "../../components/Products/Navbar/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../../assets/Img/bg1.webp"; // Ensure correct path

const Signup = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 3,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/add_user",
        values
      );

      if (response.data.success) {
        navigate("/login");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover", // Adjust background size
        backgroundPosition: "center", // Center the image
        backgroundRepeat: "no-repeat", // Ensure the background doesn't repeat
      }}
    >
      {/* Navbar */}
      <Link to="/">
        {" "}
        <h2 className="font-bold text-l sm:text-3xl flex gap-2 items-center bg-black/50 text-white py-1 px-2 rounded-md leading-tight">
          <img src={logo} alt="logo" className="w-8 h-8" />
          CustomHive
        </h2>
      </Link>

      {/* Signup Form */}
      <div className="relative min-h-screen flex justify-center items-center">
        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Signup Form */}
        <div className="relative bg-white bg-opacity-30 p-8 rounded-lg shadow-md w-full max-w-md -mt-24">
          <h2 className="text-center text-primary font-bold text-2xl mb-6">
            Register
          </h2>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-800 mb-2">Name</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="text"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 mb-2">Email</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="email"
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 mb-2">Phone</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="text"
                value={values.phone}
                onChange={(e) =>
                  setValues({ ...values, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-gray-800 mb-2">Password</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                type="password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                required
              />
            </div>

            <button
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
