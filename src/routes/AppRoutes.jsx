import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import Dashboard from "../pages/Dashboard";
import Workflows from "../pages/Workflows";
import WorkflowDetails from "../pages/WorkflowDetails";
import CreateWorkflow from "../pages/CreateWorkflow";
import Notifications from "../pages/Notifications";
import Users from "../pages/Users";
import UserDetails from "../pages/UserDetails";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================================
          PUBLIC AUTHENTICATION ROUTES
          =========================================
      */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* =========================================
          PROTECTED ROUTES
          =========================================
      */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* WORKFLOWS */}

          <Route
            path="/workflows"
            element={<Workflows />}
          />

          <Route
            path="/workflows/:id"
            element={<WorkflowDetails />}
          />

          <Route
            path="/workflows/create"
            element={<CreateWorkflow />}
          />


          {/* NOTIFICATIONS */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />


          {/* USERS */}

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/users/:id"
            element={<UserDetails />}
          />

        </Route>
      </Route>


      {/* =========================================
          DEFAULT ROUTE
          =========================================
      */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =========================================
          UNKNOWN ROUTE
          =========================================
      */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;