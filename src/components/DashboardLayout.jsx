import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

const DashboardLayout = () => {
  return (
    <div className="nova-shell">

      <TopNav />

      <main className="nova-main">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;