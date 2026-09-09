import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

const DashboardLayout = () => {
  return (
    <div className="nova-shell">

      {/* Keyboard accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <TopNav />

      <main
        id="main-content"
        className="nova-main"
        tabIndex="-1"
      >
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;