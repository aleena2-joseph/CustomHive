// import { useEffect, useState } from "react";
// import axios from "axios";
// import PropTypes from "prop-types";
// import { Link } from "react-router-dom";
// import {
//   FaArrowLeft,
//   FaBox,
//   FaEye,
//   FaFileInvoice,
//   FaUser,
// } from "react-icons/fa";

// import Header from "./Header";

// const OrdersReceived = ({ userEmail, setUser }) => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState({
//     orderId: null,
//     status: "",
//     isLoading: false,
//   });
//   const [statusUpdateMessage, setStatusUpdateMessage] = useState({
//     type: "",
//     text: "",
//   });

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `http://localhost:5000/api/seller/received-orders/${userEmail}`
//         );
//         setOrders(response.data);
//       } catch (error) {
//         console.error("Error fetching seller orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [userEmail]);

//   const handleViewDetails = (order) => {
//     setSelectedOrder(order);
//     setUpdateStatus({
//       orderId: order.order_id,
//       status: order.order_status,
//       isLoading: false,
//     });
//     // Clear any previous status update messages
//     setStatusUpdateMessage({ type: "", text: "" });
//   };

//   const handleCloseDetails = () => {
//     setSelectedOrder(null);
//     setUpdateStatus({
//       orderId: null,
//       status: "",
//       isLoading: false,
//     });
//   };

//   const handleStatusChange = (e) => {
//     setUpdateStatus({
//       ...updateStatus,
//       status: e.target.value,
//     });
//   };

//   const handleUpdateStatus = async () => {
//     if (!updateStatus.status) {
//       setStatusUpdateMessage({
//         type: "error",
//         text: "Please select a status",
//       });
//       return;
//     }

//     try {
//       setUpdateStatus({ ...updateStatus, isLoading: true });

//       // Replace with your actual API endpoint
//       const response = await axios.put(
//         "http://localhost:5000/api/orders/update-status",
//         {
//           orderId: updateStatus.orderId,
//           status: updateStatus.status,
//         }
//       );

//       setStatusUpdateMessage({
//         type: "success",
//         text: response.data.message || "Status updated successfully!",
//       });

//       // Update the orders list with the new status
//       setOrders(
//         orders.map((order) => {
//           if (order.order_id === updateStatus.orderId) {
//             return { ...order, order_status: updateStatus.status };
//           }
//           return order;
//         })
//       );

//       // If the selected order is open, update its status too
//       if (selectedOrder && selectedOrder.order_id === updateStatus.orderId) {
//         setSelectedOrder({
//           ...selectedOrder,
//           order_status: updateStatus.status,
//         });
//       }

//       // Clear the message after 3 seconds
//       setTimeout(() => {
//         setStatusUpdateMessage({ type: "", text: "" });
//       }, 3000);
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       setStatusUpdateMessage({
//         type: "error",
//         text: error.response?.data?.error || "Failed to update status",
//       });
//     } finally {
//       setUpdateStatus({ ...updateStatus, isLoading: false });
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case "success":
//       case "completed":
//         return "bg-green-500";
//       case "pending":
//         return "bg-yellow-500";
//       case "processing":
//         return "bg-blue-500";
//       case "cancelled":
//         return "bg-red-500";
//       case "delivered":
//         return "bg-purple-500";
//       case "shipped":
//         return "bg-indigo-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex justify-center items-center">
//         <div className="text-center">
//           <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
//           <p className="mt-4 text-gray-600">Loading received orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header setUser={setUser} />

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center mb-6">
//           <Link
//             to="/seller/dashboard"
//             className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
//           >
//             <FaArrowLeft />
//             <span>Back to Seller Dashboard</span>
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-3xl font-bold text-primary flex items-center gap-3 mb-6">
//             <FaFileInvoice />
//             Orders Received
//           </h2>

//           {orders.length === 0 ? (
//             <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
//               <div className="flex justify-center mb-4">
//                 <FaBox className="text-6xl text-gray-400" />
//               </div>
//               <p className="text-gray-600 text-lg mb-6">
//                 You havent received any orders yet
//               </p>
//               <Link
//                 to="/seller/products"
//                 className="bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/80 transition-colors"
//               >
//                 Manage Products
//               </Link>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-4 py-3 text-left">Order ID</th>
//                     <th className="px-4 py-3 text-left">Product</th>
//                     <th className="px-4 py-3 text-center">Price</th>
//                     <th className="px-4 py-3 text-center">Quantity</th>
//                     <th className="px-4 py-3 text-center">Customer</th>
//                     <th className="px-4 py-3 text-center">Date</th>
//                     <th className="px-4 py-3 text-center">Status</th>
//                     <th className="px-4 py-3 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orders.map((order, index) => (
//                     <tr
//                       key={index}
//                       className="border-b hover:bg-gray-50 transition-colors duration-150"
//                     >
//                       <td className="px-4 py-4 font-medium">
//                         #{order.order_id}
//                       </td>
//                       <td className="px-4 py-4">{order.product_name}</td>
//                       <td className="px-4 py-4 text-center">
//                         ₹{order.item_price}
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         {order.quantity}
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         {order.customer_name}
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         {formatDate(order.order_date)}
//                         <div className="text-xs text-gray-500">
//                           {formatTime(order.order_date)}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <span
//                           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
//                             order.order_status
//                           )}`}
//                         >
//                           {order.order_status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <button
//                           onClick={() => handleViewDetails(order)}
//                           className="text-primary hover:text-primary/80 transition-colors"
//                           title="View Details"
//                         >
//                           <FaEye className="inline text-lg" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Order Details Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-2xl font-bold text-primary">
//                   Order Details
//                 </h3>
//                 <button
//                   onClick={handleCloseDetails}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   &times;
//                 </button>
//               </div>
//               <div className="border-t pt-4">
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Order ID</p>
//                     <p className="font-medium">#{selectedOrder.order_id}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Order Date</p>
//                     <p className="font-medium">
//                       {formatDate(selectedOrder.order_date)} at{" "}
//                       {formatTime(selectedOrder.order_date)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>
//                     <p>
//                       <span
//                         className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
//                           selectedOrder.order_status
//                         )}`}
//                       >
//                         {selectedOrder.order_status}
//                       </span>
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Customer</p>
//                     <p className="font-medium flex items-center">
//                       <FaUser className="mr-1 text-gray-400" />
//                       {selectedOrder.customer_name}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {selectedOrder.customer_email}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="border-t pt-4 mt-4">
//                   <h4 className="font-bold mb-3">Product Details</h4>
//                   <div className="bg-gray-100 p-4 rounded-md">
//                     <div className="flex items-start">
//                       <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0">
//                         {selectedOrder.product_image ? (
//                           <img
//                             src={`http://localhost:5000/uploads/products/${selectedOrder.product_image}`}
//                             alt={selectedOrder.product_name}
//                             className="w-full h-full object-cover rounded-md"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-gray-400">
//                             No Image
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <h5 className="font-medium">
//                           {selectedOrder.product_name}
//                         </h5>
//                         <p className="text-sm text-gray-500">
//                           Product ID: {selectedOrder.product_id}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Quantity: {selectedOrder.quantity}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Unit Price: ₹{selectedOrder.item_price}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="border-t pt-4 mt-4">
//                   <h4 className="font-bold mb-3">Price Summary</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Subtotal</span>
//                       <span>
//                         ₹
//                         {(
//                           selectedOrder.item_price * selectedOrder.quantity
//                         ).toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="border-t pt-2 mt-2">
//                       <div className="flex justify-between font-bold">
//                         <span>Total</span>
//                         <span>
//                           ₹
//                           {(
//                             selectedOrder.item_price * selectedOrder.quantity
//                           ).toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="border-t pt-4 mt-4">
//                   <h4 className="font-bold mb-3">Update Order Status</h4>
//                   <div className="flex items-center space-x-3">
//                     <select
//                       value={updateStatus.status}
//                       onChange={handleStatusChange}
//                       className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
//                     >
//                       <option value="">Select Status</option>
//                       <option value="pending">Pending</option>
//                       <option value="processing">Processing</option>
//                       <option value="shipped">Shipped</option>
//                       <option value="delivered">Delivered</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </select>
//                     <button
//                       onClick={handleUpdateStatus}
//                       disabled={updateStatus.isLoading}
//                       className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-md transition-colors flex items-center"
//                     >
//                       {updateStatus.isLoading ? (
//                         <>
//                           <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2"></span>
//                           Updating...
//                         </>
//                       ) : (
//                         "Update Status"
//                       )}
//                     </button>
//                   </div>
//                   {statusUpdateMessage.text && (
//                     <div
//                       className={`mt-3 p-3 rounded-md ${
//                         statusUpdateMessage.type === "error"
//                           ? "bg-red-100 text-red-700"
//                           : "bg-green-100 text-green-700"
//                       }`}
//                     >
//                       {statusUpdateMessage.text}
//                     </div>
//                   )}
//                 </div>
//                 <div className="mt-6 flex justify-end space-x-4">
//                   <button
//                     className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
//                     onClick={handleCloseDetails}
//                   >
//                     Close
//                   </button>
//                   <button
//                     className="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-md transition-colors"
//                     onClick={() => window.print()}
//                   >
//                     Print Order
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <footer className="bg-gray-800 text-white py-8 mt-12">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4">CustomHive</h3>
//               <p className="text-gray-400">
//                 Your one-stop shop for custom products and merchandise.
//               </p>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-4">Quick Links</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <Link
//                     to="/seller/dashboard"
//                     className="text-gray-400 hover:text-white"
//                   >
//                     Dashboard
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     to="/seller/products"
//                     className="text-gray-400 hover:text-white"
//                   >
//                     My Products
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="#" className="text-gray-400 hover:text-white">
//                     Account Settings
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="#" className="text-gray-400 hover:text-white">
//                     Support
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
//               <div className="flex space-x-4">
//                 <a href="#" className="text-gray-400 hover:text-white">
//                   Facebook
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white">
//                   Twitter
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white">
//                   Instagram
//                 </a>
//               </div>
//             </div>
//           </div>
//           <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
//             <p>© 2025 CustomHive. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// OrdersReceived.propTypes = {
//   userEmail: PropTypes.string.isRequired,
//   setUser: PropTypes.func,
// };

// export default OrdersReceived;
import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaEye,
  FaFileInvoice,
  FaUser,
  FaPencilAlt,
  FaImage,
} from "react-icons/fa";

import Header from "./Header";

const OrdersReceived = ({ userEmail, setUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({
    orderId: null,
    status: "",
    isLoading: false,
  });
  const [statusUpdateMessage, setStatusUpdateMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/seller/received-orders/${userEmail}`
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setUpdateStatus({
      orderId: order.order_id,
      status: order.order_status,
      isLoading: false,
    });
    // Clear any previous status update messages
    setStatusUpdateMessage({ type: "", text: "" });
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setUpdateStatus({
      orderId: null,
      status: "",
      isLoading: false,
    });
  };

  const handleStatusChange = (e) => {
    setUpdateStatus({
      ...updateStatus,
      status: e.target.value,
    });
  };

  const handleUpdateStatus = async () => {
    if (!updateStatus.status) {
      setStatusUpdateMessage({
        type: "error",
        text: "Please select a status",
      });
      return;
    }

    try {
      setUpdateStatus({ ...updateStatus, isLoading: true });

      const response = await axios.put(
        "http://localhost:5000/api/orders/update-status",
        {
          orderId: updateStatus.orderId,
          status: updateStatus.status,
        }
      );

      setStatusUpdateMessage({
        type: "success",
        text: response.data.message || "Status updated successfully!",
      });

      // Update the orders list with the new status
      setOrders(
        orders.map((order) => {
          if (order.order_id === updateStatus.orderId) {
            return { ...order, order_status: updateStatus.status };
          }
          return order;
        })
      );

      // If the selected order is open, update its status too
      if (selectedOrder && selectedOrder.order_id === updateStatus.orderId) {
        setSelectedOrder({
          ...selectedOrder,
          order_status: updateStatus.status,
        });
      }

      // Clear the message after 3 seconds
      setTimeout(() => {
        setStatusUpdateMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setStatusUpdateMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to update status",
      });
    } finally {
      setUpdateStatus({ ...updateStatus, isLoading: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "delivered":
        return "bg-purple-500";
      case "shipped":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const hasCustomization = (order) => {
    return (
      order.customization_id ||
      order.text ||
      order.customization_image ||
      order.customization_description
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading received orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setUser={setUser} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Seller Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3 mb-6">
            <FaFileInvoice />
            Orders Received
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <FaBox className="text-6xl text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-6">
                You havent received any orders yet
              </p>
              <Link
                to="/seller/products"
                className="bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/80 transition-colors"
              >
                Manage Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Price</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-center">Customer</th>
                    <th className="px-4 py-3 text-center">Customization</th>
                    <th className="px-4 py-3 text-center">Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 font-medium">
                        #{order.order_id}
                      </td>
                      <td className="px-4 py-4">{order.product_name}</td>
                      <td className="px-4 py-4 text-center">
                        ₹{order.item_price}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {order.customer_name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {hasCustomization(order) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaPencilAlt className="mr-1" />
                            Custom
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {formatDate(order.order_date)}
                        <div className="text-xs text-gray-500">
                          {formatTime(order.order_date)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary">
                  Order Details
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.order_date)} at{" "}
                      {formatTime(selectedOrder.order_date)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(
                          selectedOrder.order_status
                        )}`}
                      >
                        {selectedOrder.order_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium flex items-center">
                      <FaUser className="mr-1 text-gray-400" />
                      {selectedOrder.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.customer_email}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Product Details</h4>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0">
                        {selectedOrder.product_image ? (
                          <img
                            src={`http://localhost:5000/uploads/products/${selectedOrder.product_image}`}
                            alt={selectedOrder.product_name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium">
                          {selectedOrder.product_name}
                        </h5>
                        <p className="text-sm text-gray-500">
                          Product ID: {selectedOrder.product_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {selectedOrder.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Unit Price: ₹{selectedOrder.item_price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Details Section */}
                {hasCustomization(selectedOrder) && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold mb-3 flex items-center">
                      <FaPencilAlt className="mr-2 text-primary" />
                      Customization Details
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-md">
                      {selectedOrder.customization_description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 font-medium">
                            Description:
                          </p>
                          <p className="text-gray-700">
                            {selectedOrder.customization_description}
                          </p>
                        </div>
                      )}

                      {selectedOrder.text && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 font-medium">
                            Custom Text:
                          </p>
                          <div className="bg-white p-3 rounded border border-gray-200 mt-1">
                            <p className="text-gray-700">
                              {selectedOrder.text}
                            </p>
                            {selectedOrder.max_characters && (
                              <p className="text-xs text-gray-500 mt-1">
                                Max Characters: {selectedOrder.max_characters}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedOrder.customization_image && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 font-medium">
                            Custom Image:
                          </p>
                          <div className="mt-1">
                            <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden">
                              <img
                                src={`http://localhost:5000/uploads/customizations/${selectedOrder.customization_image}`}
                                alt="Custom design"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/400x300?text=Image+Not+Available";
                                }}
                              />
                            </div>
                            <div className="flex justify-center mt-2">
                              <a
                                href={`http://localhost:5000/uploads/customizations/${selectedOrder.customization_image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 text-sm flex items-center"
                              >
                                <FaImage className="mr-1" /> View Full Size
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        ₹
                        {(
                          selectedOrder.item_price * selectedOrder.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          ₹
                          {(
                            selectedOrder.item_price * selectedOrder.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold mb-3">Update Order Status</h4>
                  <div className="flex items-center space-x-3">
                    <select
                      value={updateStatus.status}
                      onChange={handleStatusChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updateStatus.isLoading}
                      className="px-4 py-2 bg-primary text-white hover:bg-primary/80 rounded-md transition-colors flex items-center"
                    >
                      {updateStatus.isLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                  {statusUpdateMessage.text && (
                    <div
                      className={`mt-3 p-3 rounded-md ${
                        statusUpdateMessage.type === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {statusUpdateMessage.text}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={handleCloseDetails}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-md transition-colors"
                    onClick={() => window.print()}
                  >
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CustomHive</h3>
              <p className="text-gray-400">
                Your one-stop shop for custom products and merchandise.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/seller/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/seller/products"
                    className="text-gray-400 hover:text-white"
                  >
                    My Products
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Account Settings
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© 2025 CustomHive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

OrdersReceived.propTypes = {
  userEmail: PropTypes.string.isRequired,
  setUser: PropTypes.func,
};

export default OrdersReceived;
