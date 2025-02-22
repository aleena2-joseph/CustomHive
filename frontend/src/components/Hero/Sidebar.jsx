import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-primary/30 text-white p-5 fixed">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <ul className="mt-5 space-y-3">
        <li>
          <Link to="/admin/overview" className="block p-2 hover:bg-primary">
            Overview
          </Link>
        </li>
        <li>
          <Link to="/admin/userlist" className="block p-2 hover:bg-primary">
            User List
          </Link>
        </li>
        <li>
          <Link to="/admin/category" className="block p-2 hover:bg-primary">
            Category
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
