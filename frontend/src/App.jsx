import React, { useState } from "react";

import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import UserDashboard from "./components/Dashboard/UserDashboard";
import Business_profile from "./components/Dashboard/Business_profile";
import Admin from "./components/Dashboard/Admin";
import Home from "./components/Dashboard/Home";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem("userName") || null);
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/Login" element={<Login setUser={setUser} />} />

          <Route
            path="/userDashboard"
            element={
              user ? (
                <UserDashboard userName={user} setUser={setUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="/Signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <UserDashboard userName={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/business_profile" element={<Business_profile />} />
          <Route path="/Admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
