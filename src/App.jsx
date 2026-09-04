import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Workflows from "./pages/Workflows";
import WorkflowDetails from "./pages/WorkflowDetails";
import EditWorkflowPage from "./pages/EditWorkflowPage";
import CreateWorkflow from "./pages/CreateWorkflow";

import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";

import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";
import Notifications from "./pages/Notifications";

import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { useAuth } from "./context/AuthContext";

/*
 * =========================================
 * PROTECTED ROUTES
 * =========================================
 */

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <DashboardLayout />;
};


/*
 * =========================================
 * APPLICATION
 * =========================================
 */

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* =========================================
          PUBLIC AUTHENTICATION ROUTES
          =========================================
      */}


      {/* =========================================
          LOGIN
          =========================================
      */}

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Login />
          )
        }
      />


      {/* =========================================
          REGISTER
          =========================================
      */}

      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Register />
          )
        }
      />


      {/* =========================================
          FORGOT PASSWORD
          =========================================
      */}

      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <ForgotPassword />
          )
        }
      />


      {/* =========================================
          RESET PASSWORD
          =========================================
      */}

      <Route
        path="/reset-password"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <ResetPassword />
          )
        }
      />


      {/* =========================================
          PROTECTED ROUTES
          =========================================
      */}

      <Route element={<ProtectedRoutes />}>


        {/* =========================================
            DASHBOARD
            =========================================
        */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================================
            WORKFLOWS
            =========================================
        */}

        <Route
          path="/workflows"
          element={<Workflows />}
        />


        {/* CREATE WORKFLOW */}

        <Route
          path="/workflows/create"
          element={<CreateWorkflow />}
        />


        {/* WORKFLOW DETAILS */}

        <Route
          path="/workflows/:id"
          element={<WorkflowDetails />}
        />


        {/* EDIT WORKFLOW */}

        <Route
          path="/workflows/:id/edit"
          element={<EditWorkflowPage />}
        />


        {/* =========================================
            USERS
            =========================================
        */}

        <Route
          path="/users"
          element={<Users />}
        />


        {/* USER DETAILS */}

        <Route
          path="/users/:id"
          element={<UserDetails />}
        />


        {/* =========================================
            ACTIVITY
            =========================================
        */}

        <Route
          path="/activity"
          element={<Activity />}
        />


        {/* =========================================
            NOTIFICATIONS
            =========================================
        */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* =========================================
            PROFILE
            =========================================
        */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================================
            SETTINGS
            =========================================
        */}

        <Route
          path="/settings"
          element={<Settings />}
        />

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
          UNKNOWN ROUTES
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

export default App;