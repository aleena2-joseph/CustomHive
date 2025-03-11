import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../Hero/Sidebar";

const Overview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [categories, setCategories] = useState([]);
  const [ownerCount, setOwnerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    // Fetch total users (excluding admin)
    axios
      .get("http://localhost:5000/users")
      .then((res) => setTotalUsers(res.data.length || 0))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch business categories
    axios
      .get("http://localhost:5000/api/business-types")
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Error fetching categories:", err));

    // Fetch total owners count
    axios
      .get("http://localhost:5000/api/business-profile/owners-count")
      .then((res) => setOwnerCount(res.data.ownerCount || 0))
      .catch((err) => console.error("Error fetching owner count:", err));

    axios
      .get("http://localhost:5000/api/products/count")
      .then((res) => setProductCount(res.data.totalProducts || 0))
      .catch((err) => console.error("Error fetching Products count:", err));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <div className="p-5 ml-60">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Overview</h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="text-3xl">{totalUsers}</p>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Owners</h3>
              <p className="text-3xl">{ownerCount}</p>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Total Products</h3>
              <p className="text-3xl">{productCount}</p>
            </div>
          </div>

          {/* Categories Section */}
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Business Categories
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.business_id}
                className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-300"
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {category.type_name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
// import { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import axios from "axios";
// import Sidebar from "../../Hero/Sidebar";

// const StatCard = ({ title, value, icon, color }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
//         <div className={`p-2 rounded-full ${color}`}>{icon}</div>
//       </div>
//       <p className="text-3xl font-bold">{value}</p>
//     </div>
//   );
// };

// StatCard.propTypes = {
//   title: PropTypes.string.isRequired,
//   value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
//   icon: PropTypes.element,
//   color: PropTypes.string,
// };

// StatCard.defaultProps = {
//   color: "bg-blue-100",
//   icon: null,
// };

// const CategoryCard = ({ name, count }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-4">
//       <h3 className="font-medium">{name}</h3>
//       <p className="text-gray-500 text-sm">{count} businesses</p>
//     </div>
//   );
// };

// CategoryCard.propTypes = {
//   name: PropTypes.string.isRequired,
//   count: PropTypes.number,
// };

// CategoryCard.defaultProps = {
//   count: 0,
// };

// const Overview = () => {
//   // State for existing backend data
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [categories, setCategories] = useState([]);
//   const [ownerCount, setOwnerCount] = useState(0);
//   const [productCount, setProductCount] = useState(0);

//   // State for additional metrics (using dummy data initially)
//   // const [activeUsers, setActiveUsers] = useState(45);
//   // const [totalRevenue, setTotalRevenue] = useState(12580);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setLoading(true);

//     // Create an array of all API requests
//     const requests = [
//       // Existing requests
//       axios.get("http://localhost:5000/users"),
//       axios.get("http://localhost:5000/api/business-types"),
//       axios.get("http://localhost:5000/api/business-profile/owners-count"),
//       axios.get("http://localhost:5000/api/products/count"),

//       // You could add new API endpoints here if they exist
//       // axios.get("http://localhost:5000/api/active-users"),
//       // axios.get("http://localhost:5000/api/revenue"),
//     ];

//     // Execute all requests in parallel
//     Promise.all(requests)
//       .then(([usersRes, categoriesRes, ownersRes, productsRes]) => {
//         setTotalUsers(usersRes.data.length || 0);
//         setCategories(categoriesRes.data || []);
//         setOwnerCount(ownersRes.data.ownerCount || 0);
//         setProductCount(productsRes.data.totalProducts || 0);

//         // When you have real API endpoints, uncomment and modify these:
//         // setActiveUsers(activeUsersRes.data.count || 0);
//         // setTotalRevenue(revenueRes.data.total || 0);
//       })
//       .catch((err) => {
//         console.error("Error fetching dashboard data:", err);
//         setError("Failed to load dashboard data. Please try again later.");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // Calculate additional metrics from existing data
//   const userToOwnerRatio =
//     totalUsers > 0 ? ((ownerCount / totalUsers) * 100).toFixed(1) : 0;
//   const averageProductsPerOwner =
//     ownerCount > 0 ? (productCount / ownerCount).toFixed(1) : 0;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p>Loading dashboard data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 p-4 rounded-lg text-red-800 text-center my-4">
//         <p>{error}</p>
//         <button
//           className="mt-2 px-4 py-2 bg-red-100 rounded-md hover:bg-red-200"
//           onClick={() => window.location.reload()}
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex">
//       <Sidebar />

//       <div className="flex-1 p-6 bg-gray-50">
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

//           {/* Main Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <StatCard
//               title="Total Users"
//               value={totalUsers}
//               icon={<span>👥</span>}
//               color="bg-blue-100"
//             />

//             <StatCard
//               title="Total Owners"
//               value={ownerCount}
//               icon={<span>🏢</span>}
//               color="bg-green-100"
//             />

//             <StatCard
//               title="Total Products"
//               value={productCount}
//               icon={<span>📦</span>}
//               color="bg-purple-100"
//             />

//             <StatCard
//               title="Active Users"
//               icon={<span>👤</span>}
//               color="bg-yellow-100"
//             />
//           </div>

//           {/* Additional Metrics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             <StatCard
//               title="Owner/User Ratio"
//               value={`${userToOwnerRatio}%`}
//               icon={<span>📊</span>}
//               color="bg-indigo-100"
//             />

//             <StatCard
//               title="Avg Products per Owner"
//               value={averageProductsPerOwner}
//               icon={<span>📈</span>}
//               color="bg-teal-100"
//             />

//             <StatCard
//               title="Total Revenue"
//               //value={`$${totalRevenue.toLocaleString()}`}
//               icon={<span>💰</span>}
//               color="bg-pink-100"
//             />
//           </div>

//           {/* Categories Section */}
//           <h2 className="text-xl font-bold mb-4">Business Categories</h2>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {categories.length > 0 ? (
//               categories.map((category) => (
//                 <CategoryCard
//                   key={category.id || category.type_name}
//                   name={category.type_name}
//                   count={category.count || Math.floor(Math.random() * 20) + 5} // Dummy count if not provided by API
//                 />
//               ))
//             ) : (
//               <p className="col-span-full text-gray-500">
//                 No business categories found.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Overview;
