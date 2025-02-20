import { Link, Routes, Route } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";

const AdminPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 p-5 ml-60">
        <Routes>
          <Route path="/admin" element={<Overview />} />
          <Route path="/admin/userlist" element={<UserList />} />
        </Routes>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-primary/40 text-white p-6 fixed flex flex-col">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <FaUserCircle className="text-5xl mb-2" />
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-4 flex-grow">
        <li>
          <Link
            to="/overview"
            className="block py-2 px-4 rounded-md hover:bg-primary/80"
          >
            Overview
          </Link>
        </li>
        <li>
          <Link
            to="/admin/userlist"
            className="block py-2 px-4 rounded-md hover:bg-primary/80"
          >
            User List
          </Link>
        </li>
      </ul>

      {/* Logout Button - Positioned Below Options */}
      <div className="mt-4">
        <Link to="/">
          <button className="flex items-center gap-2 bg-white text-primary py-2 px-4 rounded-md hover:bg-gray-100 transition w-full">
            <IoLogOutOutline className="text-xl" />
            Logout
          </button>
        </Link>
      </div>
    </div>
  );
};

const Overview = () => {
  // Dummy data for marketplace statistics
  const stats = {
    totalSellers: 150,
    totalCustomers: 1200,
    activeProducts: 350,
    totalSales: 5000,
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-60 h-screen bg-primary/40 text-white p-6 fixed flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-5xl mb-2" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <ul className="space-y-4 flex-grow">
          <li>
            <Link
              to="/overview"
              className="block py-2 px-4 rounded-md hover:bg-primary/80"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              to="/admin/userlist"
              className="block py-2 px-4 rounded-md hover:bg-primary/80"
            >
              User List
            </Link>
          </li>
        </ul>

        <div className="mt-4">
          <Link to="/">
            <button className="flex items-center gap-2 bg-white text-primary py-2 px-4 rounded-md hover:bg-gray-100 transition w-full">
              <IoLogOutOutline className="text-xl" />
              Logout
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-60 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          Admin Dashboard
        </h1>

        {/* Overview Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Sellers */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Total Sellers
            </h2>
            <p className="text-2xl font-bold text-blue-500">
              {stats.totalSellers}
            </p>
          </div>

          {/* Customers */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Total Customers
            </h2>
            <p className="text-2xl font-bold text-blue-500">
              {stats.totalCustomers}
            </p>
          </div>

          {/* Active Products */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Active Products
            </h2>
            <p className="text-2xl font-bold text-green-500">
              {stats.activeProducts}
            </p>
          </div>

          {/* Total Sales */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700">Total Sales</h2>
            <p className="text-2xl font-bold text-orange-500">
              {stats.totalSales}
            </p>
          </div>
        </div>

        {/* Platform Overview Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            CustomHive Overview
          </h2>
          <p className="text-lg text-gray-600">
            CustomHive is a digital marketplace for personalized and handmade
            creations, designed to empower small business owners. The platform
            connects sellers specializing in custom-made products, such as
            birthday cards, personalized gifts, and artisanal crafts, with
            customers who are looking for unique, high-quality creations.
          </p>
          <p className="mt-4 text-lg text-gray-600">
            CustomHive offers a seamless experience for managing products,
            processing sales, and fostering communication between sellers and
            customers. The platform is dedicated to promoting the growth of
            small businesses in the competitive handmade goods market, helping
            them to reach a wider audience and increase sales.
          </p>
        </div>
      </div>
    </div>
  );
};

const UserList = () => (
  <div>
    <h1 className="text-2xl">User List Section</h1>
  </div>
);

export default AdminPage;
