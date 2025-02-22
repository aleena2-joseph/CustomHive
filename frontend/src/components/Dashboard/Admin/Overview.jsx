import Sidebar from "../../Hero/Sidebar";

const Overview = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <div className="flex-1 p-5 ml-60">
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Overview</h2>
        </div>
      </div>
    </div>
  );
};

export default Overview;
