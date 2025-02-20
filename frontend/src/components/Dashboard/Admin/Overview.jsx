import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaUserCircle,
} from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const Overview = () => {
  // Dummy data
  const stats = {
    totalUsers: 1200,
    totalOrders: 350,
    totalProducts: 75,
    revenue: "$15,230",
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
      <div className="ml-64 min-h-screen bg-gray-100 w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-10">
          Admin Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <FaUsers className="text-4xl text-blue-500" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Users</p>
                <h2 className="text-2xl font-semibold">{stats.totalUsers}</h2>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <FaShoppingCart className="text-4xl text-green-500" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <h2 className="text-2xl font-semibold">{stats.totalOrders}</h2>
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <FaBox className="text-4xl text-orange-500" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Products</p>
                <h2 className="text-2xl font-semibold">
                  {stats.totalProducts}
                </h2>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <FaChartBar className="text-4xl text-purple-500" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Revenue</p>
                <h2 className="text-2xl font-semibold">{stats.revenue}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
