import { useState, useEffect } from "react";
import Sidebar from "../../Hero/Sidebar";
import axios from "axios";
import PropTypes from "prop-types";

const Category = ({ setUser }) => {
  const [typeName, setTypeName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5000/add-business-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type_name: typeName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        setTypeName(""); // Clear input after successful submission
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong!" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBusinessTypes();
  });

  const fetchBusinessTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/business-types"
      );
      setBusinessTypes(response.data);
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar setUser={setUser} />
      <div style={{ flex: 1, padding: "20px", marginLeft: "250px" }}>
        <div className="p-5">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Category</h2>

          {/* Add Business Type Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {message && (
              <p
                className={`mb-4 p-2 rounded ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-800 mb-2">
                  Business Type
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                  type="text"
                  name="typeName"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter business type"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Business Type"}
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Available Business Types
            </h3>
            <ul className="list-disc pl-5">
              {businessTypes.length > 0 ? (
                businessTypes.map((type) => (
                  <li key={type.business_id} className="text-gray-800">
                    {type.type_name}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No business types available</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
Category.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Category;
