import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import UserDashboard from "./components/Dashboard/UserDashboard";
import BusinessProfile from "./components/Dashboard/Business_profile"; // Corrected naming
import AdminPage from "./components/Dashboard/Admin/AdminPage";
import Home from "./components/Dashboard/Home";
import UserList from "./components/Dashboard/Admin/UserList";
import Overview from "../../frontend/src/components/Dashboard/Admin/Overview";
import ForgotPassword from "./components/LoginSignup/ForgotPassword";
import ResetPassword from "./components/LoginSignup/ResetPassword";

const App = () => {
  const [user, setUser] = useState(() => {
    // Ensure user is retrieved as an object
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/userDashboard"
          element={
            user ? (
              <UserDashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <UserDashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/business_profile" element={<BusinessProfile />} />

        {/* Admin Panel - Nested Routing */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Move /userlist inside Admin Panel */}
        {/* This ensures the sidebar and navbar remain when navigating */}
        <Route path="/admin/userlist" element={<UserList />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
