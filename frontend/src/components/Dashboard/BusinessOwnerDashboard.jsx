import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate();
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
    } else {
      axios
        .get(`http://localhost:5000/get_business_profile/${userEmail}`)
        .then((res) => {
          if (res.data.registered) {
            setBusinessProfile(res.data.profile);
          }
        })
        .catch((err) => console.error("Error fetching profile:", err))
        .finally(() => setLoading(false));
    }
  }, [userEmail, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      {businessProfile ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">
            Welcome, {businessProfile.email}
          </h2>
          <p className="text-gray-600">{businessProfile.description}</p>
          <div className="flex gap-4 mt-4">
            <img
              src={`/uploads/${businessProfile.logo}`}
              alt="Logo"
              className="w-24 h-24 rounded-md"
            />
            <img
              src={`/uploads/${businessProfile.banner}`}
              alt="Banner"
              className="w-full h-32 rounded-md"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">
            Please Complete Your Business Profile
          </h2>
          <button
            className="mt-4 bg-primary text-white px-4 py-2 rounded"
            onClick={() => navigate("/business_register")}
          >
            Register Now
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDashboard;
