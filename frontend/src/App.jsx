import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import UserDashboard from "./components/Dashboard/UserDashboard";
import Cart from "./components/Dashboard/Cart";
import Overview from "../../frontend/src/components/Dashboard/Admin/Overview";
import Home from "./components/Dashboard/Home";
import UserList from "./components/Dashboard/Admin/UserList";
import Business_types from "./components/Dashboard/Admin/Business_types";
import ForgotPassword from "./components/LoginSignup/ForgotPassword";
import ResetPassword from "./components/LoginSignup/ResetPassword";
import Category from "./components/Dashboard/Admin/Category";
import SubCategory from "./components/Dashboard/Admin/Subcategory";
import ProfilePage from "./components/Dashboard/ProfilePage";
import ViewDetails from "./components/Dashboard/ViewDetails";
import Orders from "./components/Dashboard/Orders";
import CartCheckout from "./components/Dashboard/CartCheckout";
import OrderSuccess from "./components/Dashboard/OrderSuccess";
import ViewOrders from "./components/Dashboard/ViewOrders";
import Header from "./components/Dashboard/Header";
import OrdersReceived from "./components/Dashboard/OrdersReceived";
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

        <Route path="/admin" element={<Navigate to="/admin/overview" />} />
        <Route
          path="/admin/overview"
          element={<Overview setUser={setUser} />}
        />
        <Route
          path="/admin/userlist"
          element={<UserList setUser={setUser} />}
        />
        <Route
          path="/admin/business_types"
          element={<Business_types setUser={setUser} />}
        />
        <Route
          path="/admin/category"
          element={<Category setUser={setUser} />}
        />
        <Route
          path="/admin/subcategory"
          element={<SubCategory setUser={setUser} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProfilePage setUser={setUser} />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart setUser={setUser} />} />
        <Route path="/orders" element={<Orders setUser={setUser} />} />
        <Route
          path="/product/:id"
          element={<ViewDetails setUser={setUser} />}
        />
        <Route
          path="/CartCheckout"
          element={<CartCheckout setUser={setUser} />}
        />
        <Route
          path="order-success"
          element={<OrderSuccess setUser={setUser} />}
        />
        <Route
          path="/view_details"
          element={<ViewDetails setUser={setUser} />}
        />
        <Route
          path="/view-orders"
          element={
            user ? (
              <ViewOrders userEmail={user.email} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/orders-received"
          element={
            <OrdersReceived
              user={user}
              setUser={setUser}
              userEmail={user?.email || ""}
            />
          }
        />

        <Route
          path="/header"
          element={
            user ? (
              <Header user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
