import { useState, useEffect } from "react";
import Sidebar from "../../Hero/Sidebar";
import axios from "axios";
import PropTypes from "prop-types";

const Business_types = ({ setUser }) => {
  const [typeName, setTypeName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [filteredBusinessTypes, setFilteredBusinessTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    setFilteredBusinessTypes(
      businessTypes.filter((type) =>
        type.type_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, businessTypes]);

  const fetchBusinessTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/business-types"
      );
      setBusinessTypes(response.data);
      setFilteredBusinessTypes(response.data);
    } catch (error) {
      console.error("Error fetching business types:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/add-business-type",
        { type_name: typeName }
      );
      setMessage({ type: "success", text: response.data.message });
      setTypeName("");
      fetchBusinessTypes();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data.error || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    const typeToEdit = businessTypes.find((type) => type.business_id === id);
    setEditingName(typeToEdit.type_name);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/update-business-type/${id}`, {
        type_name: editingName,
      });
      setMessage({
        type: "success",
        text: "Business type updated successfully!",
      });
      setEditingId(null);
      setEditingName("");
      fetchBusinessTypes();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data.error || "Update failed!",
      });
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar setUser={setUser} />
      <div style={{ flex: 1, padding: "20px", marginLeft: "250px" }}>
        <div className="p-5">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Category</h2>
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

          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <label className="block text-gray-800 mb-2">Business Type</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter business type"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Business Type"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-semibold mb-4">
              Available Business Types
            </h3>
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full px-3 py-2 border rounded-md mb-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="list-disc pl-5">
              {filteredBusinessTypes.length > 0 ? (
                filteredBusinessTypes.map((type) => (
                  <li
                    key={type.business_id}
                    className="flex justify-between items-center text-gray-800 mb-2"
                  >
                    {editingId === type.business_id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border px-2 py-1 mr-2"
                      />
                    ) : (
                      <span>{type.type_name}</span>
                    )}
                    <div>
                      {editingId === type.business_id ? (
                        <button
                          onClick={() => handleUpdate(type.business_id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(type.business_id)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                      )}
                    </div>
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

Business_types.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Business_types;
