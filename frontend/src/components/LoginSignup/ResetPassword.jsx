import { useState } from "react";
import axios from "axios";
import logo from "../Products/Navbar/logo.png";
import backgroundImage from "../../assets/Img/bg1.webp";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/reset-password/${token}`,
        {
          password,
        }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div>
      <div
        className="min-h-screen bg-gray-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Link to="/">
          <h2 className="font-bold text-l sm:text-3xl flex gap-2 items-center bg-black/50 text-white py-1 px-2 rounded-md leading-tight">
            <img src={logo} alt="logo" className="w-8 h-8" />
            CustomHive
          </h2>
        </Link>

        <div className="relative min-h-screen flex justify-center items-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white bg-opacity-30 p-8 rounded-lg shadow-md w-full max-w-md -mt-24">
            <h2 className="text-center text-primary font-bold text-2xl mb-6">
              Reset Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-800 mb-2">New Password</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-800 mb-2">
                  Confirm Password
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                type="submit"
              >
                Reset Password
              </button>
            </form>
            {message && (
              <p className="text-green-600 text-center mt-4">{message}</p>
            )}
            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
