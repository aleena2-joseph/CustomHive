import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Header from "./Header";
import axios from "axios";

const OrdersReceived = ({ setUser }) => {
  const [orders, setOrders] = useState([]);
  const storedEmail = localStorage.getItem("sellerEmail"); // Retrieve seller email

  useEffect(() => {
    if (!storedEmail) {
      console.warn("No seller email found in localStorage.");
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for:", storedEmail);

        const response = await axios.get("http://localhost:5000/getProfile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = response.data; // Extract data from response
        console.log("Orders received:", data);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [storedEmail]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setUser={setUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Orders Received</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Customer Name</th>
                  <th className="border p-2">Product Name</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Customization</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} className="text-center">
                    <td className="border p-2">{order.order_id}</td>
                    <td className="border p-2">{order.customer_name}</td>
                    <td className="border p-2">{order.product_name}</td>
                    <td className="border p-2">₹{order.product_price}</td>
                    <td className="border p-2">{order.quantity}</td>
                    <td className="border p-2">
                      {order.customization_text ||
                      order.customization_image ||
                      order.customization_description ? (
                        <>
                          {order.customization_text && (
                            <p>Text: {order.customization_text}</p>
                          )}
                          {order.customization_image && (
                            <img
                              src={order.customization_image}
                              alt="Customization"
                              className="max-w-20 max-h-20 mx-auto"
                            />
                          )}
                          {order.customization_description && (
                            <p>
                              Description: {order.customization_description}
                            </p>
                          )}
                        </>
                      ) : (
                        "No Customization"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

OrdersReceived.propTypes = {
  setUser: PropTypes.func,
};

export default OrdersReceived;
