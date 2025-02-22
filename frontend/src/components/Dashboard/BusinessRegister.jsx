import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BusinessRegister = () => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    business_id: "",
    logo: null,
    banner: null,
  });

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios
      .get("http://localhost:5000/get_business_types")
      .then((res) => setBusinessTypes(res.data))
      .catch((err) => console.error("Error fetching business types:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("email", userEmail);
    data.append("description", formData.description);
    data.append("business_id", formData.business_id);
    data.append("logo", formData.logo);
    data.append("banner", formData.banner);

    try {
      await axios.post("http://localhost:5000/add_business", data);
      navigate("/business_owner_dashboard");
    } catch (error) {
      console.error("Error registering business:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Business Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Business Type</label>
          <select
            className="w-full p-2 border"
            value={formData.business_id}
            onChange={(e) =>
              setFormData({ ...formData, business_id: e.target.value })
            }
            required
          >
            <option value="">Select Business Type</option>
            {businessTypes.map((type) => (
              <option key={type.business_id} value={type.business_id}>
                {type.type_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Business Description</label>
          <textarea
            className="w-full p-2 border"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Logo</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) =>
              setFormData({ ...formData, logo: e.target.files[0] })
            }
          />
        </div>

        <div>
          <label className="block text-gray-700">Banner</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) =>
              setFormData({ ...formData, banner: e.target.files[0] })
            }
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Register Business
        </button>
      </form>
    </div>
  );
};

export default BusinessRegister;
