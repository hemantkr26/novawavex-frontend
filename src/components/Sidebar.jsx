import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  Users,
  PlusCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Workflows",
      path: "/workflows",
      icon: Workflow,
    },
    {
      name: "Create Workflow",
      path: "/workflows/create",
      icon: PlusCircle,
    },
    {
      name: "Users",
      path: "/users",
      icon: Users,
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>NovaWavex</h2>
        <span>Workflow Platform</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;