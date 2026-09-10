import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  Shield,
  UserRound,
  Hash,
  Power,
  Trash2,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Activity,
} from "lucide-react";

import userService from "../services/userService";

const UserDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [savingRole, setSavingRole] = useState(false);

  const [savingStatus, setSavingStatus] = useState(false);

  const [deletingUser, setDeletingUser] = useState(false);

  const [actionMessage, setActionMessage] = useState(null);

  const [actionError, setActionError] = useState(null);

  /*
   * =========================================
   * LOAD USER
   * =========================================
   */

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await userService.getUserById(id);

      console.log(
        "NovaWavex user:",
        data
      );

      setUser(data);

    } catch (err) {
      console.error(
        "Failed to load user:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to view this user."
        );
      } else {
        setError(
          "Unable to load user."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================
   * LOAD ON ID CHANGE
   * =========================================
   */

  useEffect(() => {
    loadUser();
  }, [id]);

  /*
   * =========================================
   * CHANGE USER ROLE
   * =========================================
   */

  const handleRoleChange = async (
    event
  ) => {
    const newRole =
      event.target.value;

    if (
      !newRole ||
      newRole === user.role
    ) {
      return;
    }

    try {
      setSavingRole(true);

      setActionMessage(null);
      setActionError(null);

      const updatedUser =
        await userService.updateUserRole(
          user.id,
          newRole
        );

      setUser(updatedUser);

      setActionMessage(
        `User role updated to ${newRole}.`
      );

    } catch (err) {
      console.error(
        "Failed to update user role:",
        err
      );

      setActionError(
        err.response?.data?.message ||
        "Unable to update user role."
      );

    } finally {
      setSavingRole(false);
    }
  };

  /*
   * =========================================
   * ENABLE / DISABLE USER
   * =========================================
   */

  const handleStatusChange = async () => {
    if (!user) {
      return;
    }

    const nextStatus =
      !user.enabled;

    const action =
      nextStatus
        ? "enable"
        : "disable";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this user account?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSavingStatus(true);

      setActionMessage(null);
      setActionError(null);

      const updatedUser =
        await userService.updateAccountStatus(
          user.id,
          nextStatus
        );

      setUser(updatedUser);

      setActionMessage(
        nextStatus
          ? "User account enabled successfully."
          : "User account disabled successfully."
      );

    } catch (err) {
      console.error(
        "Failed to update account status:",
        err
      );

      setActionError(
        err.response?.data?.message ||
        "Unable to update account status."
      );

    } finally {
      setSavingStatus(false);
    }
  };

  /*
   * =========================================
   * DELETE USER
   * =========================================
   */

  const handleDeleteUser = async () => {
    if (!user || deletingUser) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${user.fullName || "this user"}?\n\n` +
        "This permanently deletes the user account " +
        "and all workflows owned by this user.\n\n" +
        "This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUser(true);

      setActionMessage(null);
      setActionError(null);

      await userService.deleteUser(
        user.id
      );

      navigate("/users", {
        replace: true,
        state: {
          message:
            "User account deleted successfully.",
        },
      });

    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setActionError(
        err.response?.data?.message ||
        "Unable to delete this user account."
      );

      setDeletingUser(false);
    }
  };

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="user-details-page">

        <div className="user-details-loading">

          <div className="user-details-loading-icon">
            <Loader2
              size={23}
              className="admin-spin"
            />
          </div>

          <h1>
            User Details
          </h1>

          <p>
            Loading NovaWavex user profile...
          </p>

        </div>

      </div>
    );
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (error) {
    return (
      <div className="user-details-page">

        <div className="user-details-error">

          <div className="user-details-error-icon">
            !
          </div>

          <h1>
            Unable to Load User
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="user-details-back-button"
            onClick={() =>
              navigate("/users")
            }
          >
            <ArrowLeft size={17} />
            Back to Users
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================================
   * USER NOT FOUND
   * =========================================
   */

  if (!user) {
    return (
      <div className="user-details-page">

        <div className="user-details-error">

          <div className="user-details-error-icon">
            ?
          </div>

          <h1>
            User Not Found
          </h1>

          <p>
            The requested NovaWavex user
            could not be found.
          </p>

          <button
            type="button"
            className="user-details-back-button"
            onClick={() =>
              navigate("/users")
            }
          >
            <ArrowLeft size={17} />
            Back to Users
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================================
   * PROFILE AVATAR
   * =========================================
   */

  const hasProfileImage =
    user.profileImage &&
    user.profileImage.trim() !== "";

  /*
   * =========================================
   * USER INITIALS
   * =========================================
   */

  const initials =
    user.fullName
      ? user.fullName
          .split(" ")
          .filter(Boolean)
          .map((name) =>
            name.charAt(0)
          )
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";

  const isAdmin =
    user.role === "ADMIN";

  const isEnabled =
    user.enabled !== false;

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="user-details-page">

      {/* =====================================
          BACK NAVIGATION
          ===================================== */}

      <button
        type="button"
        className="user-details-back-button"
        onClick={() =>
          navigate("/users")
        }
      >
        <ArrowLeft size={17} />
        Back to Users
      </button>


      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="user-details-header">

        <div>

          <div className="user-details-title-row">

            <span className="user-details-eyebrow">
              USER PROFILE
            </span>

            <span
              className={
                isEnabled
                  ? "user-status-badge active"
                  : "user-status-badge disabled"
              }
            >
              <span className="user-status-dot"></span>

              {isEnabled
                ? "ACTIVE"
                : "DISABLED"}

            </span>

          </div>

          <h1>
            User Details
          </h1>

          <p>
            Manage NovaWavex user information and
            account access.
          </p>

        </div>

      </div>


      {/* =====================================
          USER PROFILE
          ===================================== */}

      <div className="user-profile-card">

        <div className="user-profile-header">

          <div
            className="user-profile-avatar"
            style={{
              width: "64px",
              height: "64px",
              minWidth: "64px",
              minHeight: "64px",
              maxWidth: "64px",
              maxHeight: "64px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            {hasProfileImage ? (
              <img
                src={user.profileImage}
                alt={
                  user.fullName ||
                  "User profile"
                }
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              initials
            )}

          </div>


          <div className="user-profile-info">

            <div className="user-profile-name-row">

              <h2>
                {user.fullName ||
                  "Unnamed User"}
              </h2>

              <span
                className={
                  isAdmin
                    ? "user-details-role admin"
                    : "user-details-role"
                }
              >
                <Shield size={13} />

                {user.role ||
                  "USER"}
              </span>

            </div>

            <p>
              {user.email ||
                "No email available"}
            </p>

          </div>

        </div>


        <div className="user-profile-divider"></div>


        {/* ===================================
            USER INFORMATION
            =================================== */}

        <div className="user-information">

          <div className="user-information-item">

            <div className="user-information-icon">
              <UserRound size={17} />
            </div>

            <div>

              <span>
                FULL NAME
              </span>

              <strong>
                {user.fullName ||
                  "Not available"}
              </strong>

            </div>

          </div>


          <div className="user-information-item">

            <div className="user-information-icon">
              <Mail size={17} />
            </div>

            <div>

              <span>
                EMAIL ADDRESS
              </span>

              <strong>
                {user.email ||
                  "Not available"}
              </strong>

            </div>

          </div>


          <div className="user-information-item">

            <div className="user-information-icon">
              <Shield size={17} />
            </div>

            <div>

              <span>
                ACCOUNT ROLE
              </span>

              <strong>
                {user.role ||
                  "USER"}
              </strong>

            </div>

          </div>


          <div className="user-information-item">

            <div className="user-information-icon">
              <Hash size={17} />
            </div>

            <div>

              <span>
                USER ID
              </span>

              <strong>
                #{user.id}
              </strong>

            </div>

          </div>


          <div className="user-information-item">

            <div className="user-information-icon">
              <Power size={17} />
            </div>

            <div>

              <span>
                ACCOUNT STATUS
              </span>

              <strong
                className={
                  isEnabled
                    ? "status-text-active"
                    : "status-text-disabled"
                }
              >
                {isEnabled
                  ? "Active"
                  : "Disabled"}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================
            ADMIN COMMAND CENTER
            =================================== */}

        <div className="admin-controls-wrapper">

          {/* HEADER */}

          <div className="admin-controls-header">

            <div className="admin-controls-heading-icon">
              <Settings2 size={17} />
            </div>

            <div className="admin-controls-heading-content">

              <div className="admin-section-label">
                ADMIN CONTROLS
              </div>

              <h2>
                Account Management
              </h2>

              <p>
                Configure permissions and control
                account access.
              </p>

            </div>

            <div className="admin-console-indicator">

              <Activity size={13} />

              ADMIN CONSOLE

            </div>

          </div>


          {/* COMMAND GRID */}

          <div className="admin-control-grid">


            {/* =================================
                ROLE CONTROL
                ================================= */}

            <div className="admin-control-card">

              <div className="admin-control-card-header">

                <div className="admin-control-icon role">
                  <Shield size={16} />
                </div>

                <div className="admin-control-title">

                  <span>
                    PERMISSIONS
                  </span>

                  <strong>
                    Account Role
                  </strong>

                </div>

                <div className="admin-control-number">
                  01
                </div>

              </div>


              <div className="admin-control-divider"></div>


              <div className="admin-control-description">
                Define the permission level assigned
                to this NovaWavex account.
              </div>


              <div className="admin-select-wrapper">

                <select
                  id="user-role"
                  value={user.role || "USER"}
                  onChange={handleRoleChange}
                  disabled={
                    savingRole ||
                    deletingUser
                  }
                  className="admin-role-select"
                >

                  <option value="USER">
                    USER
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>

                </select>

                <ChevronDown
                  size={14}
                  className="admin-select-icon"
                />

              </div>


              {savingRole && (
                <div className="admin-control-status">

                  <Loader2
                    size={12}
                    className="admin-spin"
                  />

                  Updating account role...

                </div>
              )}

            </div>


            {/* =================================
                ACCOUNT ACCESS
                ================================= */}

            <div className="admin-control-card">

              <div className="admin-control-card-header">

                <div className="admin-control-icon access">
                  <Power size={16} />
                </div>

                <div className="admin-control-title">

                  <span>
                    ACCESS CONTROL
                  </span>

                  <strong>
                    Account Access
                  </strong>

                </div>

                <div className="admin-control-number">
                  02
                </div>

              </div>


              <div className="admin-control-divider"></div>


              <div className="admin-access-status-row">

                <div>

                  <span>
                    CURRENT STATE
                  </span>

                  <strong
                    className={
                      isEnabled
                        ? "access-state active"
                        : "access-state disabled"
                    }
                  >

                    <span className="access-state-dot"></span>

                    {isEnabled
                      ? "ACTIVE"
                      : "DISABLED"}

                  </strong>

                </div>

              </div>


              <button
                type="button"
                onClick={handleStatusChange}
                disabled={
                  savingStatus ||
                  deletingUser
                }
                className={
                  isEnabled
                    ? "admin-access-button disable"
                    : "admin-access-button enable"
                }
              >

                {savingStatus ? (
                  <Loader2
                    size={15}
                    className="admin-spin"
                  />
                ) : (
                  <Power size={15} />
                )}

                {savingStatus
                  ? "Updating Access..."
                  : isEnabled
                    ? "Disable Account"
                    : "Enable Account"}

              </button>


              <small>
                {isEnabled
                  ? "User is currently allowed to sign in."
                  : "User login is currently blocked."}
              </small>

            </div>

          </div>


          {/* =================================
              ACTION FEEDBACK
              ================================= */}

          {actionMessage && (

            <div className="admin-action-success">

              <div className="feedback-icon">
                <CheckCircle2 size={15} />
              </div>

              <div>

                <strong>
                  Action completed
                </strong>

                <span>
                  {actionMessage}
                </span>

              </div>

            </div>

          )}


          {actionError && (

            <div className="admin-action-error">

              <div className="feedback-icon">
                <AlertTriangle size={15} />
              </div>

              <div>

                <strong>
                  Action failed
                </strong>

                <span>
                  {actionError}
                </span>

              </div>

            </div>

          )}


          {/* =================================
              DANGER ZONE
              ================================= */}

          <div className="admin-danger-zone">

            <div className="admin-danger-header">

              <div className="admin-danger-icon">
                <AlertTriangle size={17} />
              </div>

              <div>

                <div className="danger-label">
                  DANGER ZONE
                </div>

                <h3>
                  Delete User Account
                </h3>

                <p>
                  Permanently remove this account and
                  all workflows owned by this user.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="admin-delete-button"
              onClick={handleDeleteUser}
              disabled={deletingUser}
            >

              {deletingUser ? (
                <Loader2
                  size={15}
                  className="admin-spin"
                />
              ) : (
                <Trash2 size={15} />
              )}

              {deletingUser
                ? "Deleting Account..."
                : "Delete User Account"}

            </button>

          </div>

        </div>

      </div>


      {/* =====================================
          PAGE-SPECIFIC STYLES
          ===================================== */}

      <style>{`

        /* =====================================
           PAGE SAFETY
           ===================================== */

        .user-details-page {

          width: 100%;
          max-width: 100%;
          min-width: 0;

          box-sizing: border-box;

          overflow-x: hidden;
        }


        .user-details-page * {

          box-sizing: border-box;

          max-width: 100%;
        }


        /* =====================================
           PAGE HEADER
           ===================================== */

        .user-details-title-row {

          display: flex;
          align-items: center;
          gap: 10px;

          min-width: 0;
        }

        .user-status-badge {

          display: inline-flex;
          align-items: center;
          gap: 6px;

          flex-shrink: 0;

          padding: 4px 8px;

          border-radius: 999px;

          font-size: 7px;
          font-weight: 850;
          letter-spacing: 0.8px;
        }

        .user-status-badge.active {

          color: #18794e;

          background: #eefaf3;

          border: 1px solid #d5eee0;
        }

        .user-status-badge.disabled {

          color: #a34b4b;

          background: #fff5f5;

          border: 1px solid #efdada;
        }

        .user-status-dot {

          width: 5px;
          height: 5px;

          flex-shrink: 0;

          border-radius: 50%;

          background: currentColor;
        }


        /* =====================================
           PROFILE HEADER
           ===================================== */

        .user-profile-name-row {

          display: flex;
          align-items: center;

          flex-wrap: wrap;

          gap: 8px;

          min-width: 0;
        }

        .user-profile-info {

          min-width: 0;

          flex: 1;
        }

        .user-profile-info h2 {

          max-width: 100%;

          overflow-wrap: anywhere;

          word-break: break-word;
        }

        .user-profile-info p {

          max-width: 100%;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        /* =====================================
           INFORMATION STATUS
           ===================================== */

        .status-text-active {

          color: #18794e !important;
        }

        .status-text-disabled {

          color: #a34b4b !important;
        }


        /* =====================================
           ADMIN COMMAND CENTER
           ===================================== */

        .admin-controls-wrapper {

          position: relative;

          width: 100%;
          max-width: 100%;
          min-width: 0;

          margin-top: 26px;

          padding: 20px;

          border: 1px solid #dfe5ee;

          border-radius: 13px;

          background:
            linear-gradient(
              180deg,
              #fafcff 0%,
              #f5f7fb 100%
            );

          box-shadow:
            0 5px 18px rgba(
              25,
              40,
              70,
              0.035
            );

          overflow: hidden;
        }

        .admin-controls-wrapper::before {

          content: "";

          position: absolute;

          top: 0;
          left: 20px;
          right: 20px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #d6e1f7,
              transparent
            );
        }


        /* =====================================
           ADMIN HEADER
           ===================================== */

        .admin-controls-header {

          display: flex;
          align-items: flex-start;

          gap: 11px;

          min-width: 0;
        }

        .admin-controls-heading-icon {

          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #4f7df3;

          background:
            linear-gradient(
              145deg,
              #f0f5ff,
              #e9f0ff
            );

          border: 1px solid #dce6fb;

          box-shadow:
            inset 0 1px 0 rgba(
              255,
              255,
              255,
              0.8
            );
        }

        .admin-controls-heading-content {

          min-width: 0;

          flex: 1;
        }

        .admin-section-label {

          color: #7183a1;

          font-size: 8px;

          font-weight: 850;

          letter-spacing: 1.15px;
        }

        .admin-controls-header h2 {

          margin: 3px 0 0;

          color: #1d2b43;

          font-size: 15px;

          font-weight: 780;

          letter-spacing: -0.15px;
        }

        .admin-controls-header p {

          margin: 4px 0 0;

          color: #7b8799;

          font-size: 9px;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }

        .admin-console-indicator {

          margin-left: auto;

          flex-shrink: 0;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          padding: 5px 8px;

          border-radius: 6px;

          color: #70809a;

          background: #f2f5fa;

          border: 1px solid #e2e7ef;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 0.65px;
        }


        /* =====================================
           CONTROL GRID
           ===================================== */

        .admin-control-grid {

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 11px;

          margin-top: 17px;

          min-width: 0;
        }


        /* =====================================
           CONTROL CARD
           ===================================== */

        .admin-control-card {

          position: relative;

          min-width: 0;

          padding: 14px;

          overflow: hidden;

          border: 1px solid #e0e6ef;

          border-radius: 10px;

          background: #ffffff;

          box-shadow:
            0 2px 9px rgba(
              28,
              43,
              67,
              0.025
            );

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .admin-control-card:hover {

          border-color: #d4ddea;

          box-shadow:
            0 5px 15px rgba(
              28,
              43,
              67,
              0.045
            );

          transform: translateY(-1px);
        }

        .admin-control-card::after {

          content: "";

          position: absolute;

          top: 0;
          left: 0;

          width: 3px;
          height: 100%;

          background: #dce7ff;
        }

        .admin-control-card:nth-child(2)::after {

          background: #d8eee1;
        }


        /* =====================================
           CONTROL CARD HEADER
           ===================================== */

        .admin-control-card-header {

          display: flex;

          align-items: center;

          gap: 9px;

          min-width: 0;
        }

        .admin-control-icon {

          width: 31px;
          height: 31px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;
        }

        .admin-control-icon.role {

          color: #4f7df3;

          background: #eef4ff;

          border: 1px solid #e1eaff;
        }

        .admin-control-icon.access {

          color: #15965a;

          background: #ecfaf2;

          border: 1px solid #d9efe3;
        }

        .admin-control-title {

          min-width: 0;

          flex: 1;
        }

        .admin-control-title span {

          display: block;

          color: #8a95a6;

          font-size: 7px;

          font-weight: 850;

          letter-spacing: 0.9px;
        }

        .admin-control-title strong {

          display: block;

          margin-top: 3px;

          color: #25334b;

          font-size: 11px;

          font-weight: 750;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .admin-control-number {

          margin-left: auto;

          flex-shrink: 0;

          align-self: flex-start;

          color: #b2bbc9;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.5px;
        }


        /* =====================================
           CONTROL DIVIDER
           ===================================== */

        .admin-control-divider {

          height: 1px;

          margin: 12px 0;

          background: #edf0f5;
        }

        .admin-control-description {

          min-height: 27px;

          color: #7e899b;

          font-size: 9px;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }


        /* =====================================
           ROLE SELECT
           ===================================== */

        .admin-select-wrapper {

          position: relative;

          width: 100%;

          min-width: 0;

          margin-top: 12px;
        }

        .admin-role-select {

          width: 100%;

          min-width: 0;

          min-height: 36px;

          padding:
            0 32px 0 10px;

          box-sizing: border-box;

          appearance: none;

          border: 1px solid #d9e0eb;

          border-radius: 7px;

          outline: none;

          color: #334155;

          background: #ffffff;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .admin-role-select:hover {

          border-color: #cbd5e4;
        }

        .admin-role-select:focus {

          border-color: #4f7df3;

          box-shadow:
            0 0 0 2px
            rgba(
              79,
              125,
              243,
              0.10
            );
        }

        .admin-role-select:disabled {

          opacity: 0.6;

          cursor: not-allowed;
        }

        .admin-select-icon {

          position: absolute;

          top: 50%;
          right: 10px;

          pointer-events: none;

          color: #7d899c;

          transform:
            translateY(-50%);
        }


        /* =====================================
           CONTROL STATUS
           ===================================== */

        .admin-control-status {

          margin-top: 7px;

          display: flex;

          align-items: center;

          gap: 5px;

          color: #718096;

          font-size: 8px;

          font-weight: 600;

          overflow-wrap: anywhere;
        }


        /* =====================================
           ACCESS STATUS
           ===================================== */

        .admin-access-status-row {

          display: flex;

          align-items: center;
          justify-content: space-between;

          min-height: 27px;

          min-width: 0;
        }

        .admin-access-status-row > div {

          min-width: 0;
        }

        .admin-access-status-row span {

          display: block;

          color: #8a95a6;

          font-size: 7px;

          font-weight: 850;

          letter-spacing: 0.8px;
        }

        .access-state {

          margin-top: 3px;

          display: inline-flex !important;

          align-items: center;

          gap: 5px;

          font-size: 9px !important;

          letter-spacing: 0 !important;
        }

        .access-state.active {

          color: #188052 !important;
        }

        .access-state.disabled {

          color: #a44c4c !important;
        }

        .access-state-dot {

          width: 5px;
          height: 5px;

          flex-shrink: 0;

          border-radius: 50%;

          background: currentColor;
        }


        /* =====================================
           ACCESS BUTTON
           ===================================== */

        .admin-access-button {

          width: 100%;

          min-width: 0;

          min-height: 36px;

          margin-top: 12px;

          padding:
            0 8px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          border-radius: 7px;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.12s ease;
        }

        .admin-access-button:active:not(:disabled) {

          transform:
            translateY(1px);
        }

        .admin-access-button.disable {

          border: 1px solid #e3d2d2;

          color: #a34b4b;

          background: #fffafa;
        }

        .admin-access-button.disable:hover {

          background: #fff4f4;

          border-color: #dcbcbc;
        }

        .admin-access-button.enable {

          border: 1px solid #cfe7d9;

          color: #18794e;

          background: #f4fbf7;
        }

        .admin-access-button.enable:hover {

          background: #eaf8ef;

          border-color: #bdddca;
        }

        .admin-access-button:disabled {

          opacity: 0.6;

          cursor: not-allowed;
        }

        .admin-control-card small {

          display: block;

          margin-top: 7px;

          color: #8994a5;

          font-size: 8px;

          line-height: 1.4;

          overflow-wrap: anywhere;
        }


        /* =====================================
           FEEDBACK
           ===================================== */

        .admin-action-success,
        .admin-action-error {

          margin-top: 11px;

          padding: 9px 10px;

          display: flex;

          align-items: center;

          gap: 8px;

          min-width: 0;

          border-radius: 8px;

          font-size: 9px;
        }

        .admin-action-success {

          color: #18794e;

          background: #f2fbf6;

          border: 1px solid #d8eee1;
        }

        .admin-action-error {

          color: #ae4949;

          background: #fff7f7;

          border: 1px solid #f0d6d6;
        }

        .feedback-icon {

          width: 25px;
          height: 25px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 6px;

          background:
            rgba(
              255,
              255,
              255,
              0.65
            );
        }

        .admin-action-success > div:last-child,
        .admin-action-error > div:last-child {

          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .admin-action-success strong,
        .admin-action-error strong {

          font-size: 8px;

          font-weight: 800;
        }

        .admin-action-success span,
        .admin-action-error span {

          font-size: 9px;

          overflow-wrap: anywhere;
        }


        /* =====================================
           DANGER ZONE
           ===================================== */

        .admin-danger-zone {

          margin-top: 17px;

          padding: 15px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 18px;

          min-width: 0;

          border: 1px solid #efd9d9;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #fffafa 0%,
              #fff7f7 100%
            );
        }

        .admin-danger-header {

          min-width: 0;

          display: flex;

          align-items: flex-start;

          gap: 10px;
        }

        .admin-danger-icon {

          width: 32px;
          height: 32px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          color: #b44747;

          background: #ffeded;

          border: 1px solid #f6dcdc;
        }

        .admin-danger-header > div:last-child {

          min-width: 0;
        }

        .danger-label {

          color: #b44747;

          font-size: 7px;

          font-weight: 850;

          letter-spacing: 1.1px;
        }

        .admin-danger-header h3 {

          margin: 4px 0 0;

          color: #713b3b;

          font-size: 12px;

          font-weight: 760;

          overflow-wrap: anywhere;
        }

        .admin-danger-header p {

          margin: 4px 0 0;

          color: #967171;

          font-size: 8px;

          line-height: 1.5;

          overflow-wrap: anywhere;
        }


        /* =====================================
           DELETE BUTTON
           ===================================== */

        .admin-delete-button {

          min-height: 35px;

          flex-shrink: 0;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          padding:
            0 13px;

          border: 1px solid #d8aaaa;

          border-radius: 7px;

          color: #ffffff;

          background: #b44747;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.16s ease,
            transform 0.12s ease;
        }

        .admin-delete-button:hover {

          background: #a13e3e;
        }

        .admin-delete-button:active:not(:disabled) {

          transform:
            translateY(1px);
        }

        .admin-delete-button:disabled {

          opacity: 0.65;

          cursor: not-allowed;
        }


        /* =====================================
           LOADING ANIMATION
           ===================================== */

        .admin-spin {

          animation:
            admin-spin
            0.9s
            linear
            infinite;
        }

        @keyframes admin-spin {

          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }

        }


        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 800px) {

          .admin-console-indicator {

            display: none;
          }

        }


        @media (max-width: 700px) {

          .admin-control-grid {

            grid-template-columns: 1fr;
          }

          .admin-danger-zone {

            align-items: stretch;

            flex-direction: column;
          }

          .admin-delete-button {

            width: 100%;
          }

        }


        /* =====================================
           MOBILE POLISH
           ===================================== */

        @media (max-width: 600px) {

          .user-details-page {

            padding-left: 14px;
            padding-right: 14px;

            overflow-x: hidden;
          }


          /* PAGE HEADER */

          .user-details-title-row {

            gap: 7px;

            flex-wrap: wrap;
          }

          .user-details-header h1 {

            margin-top: 8px;

            font-size: 22px;

            line-height: 1.2;
          }

          .user-details-header p {

            max-width: 100%;

            margin-top: 6px;

            font-size: 10px;

            line-height: 1.55;
          }


          /* BACK BUTTON */

          .user-details-back-button {

            min-height: 34px;

            padding:
              0 10px;

            gap: 6px;

            font-size: 10px;
          }


          /* PROFILE CARD */

          .user-profile-card {

            width: 100%;

            max-width: 100%;

            min-width: 0;

            margin-top: 16px;

            padding: 14px;

            border-radius: 12px;

            overflow: hidden;
          }


          /* PROFILE HEADER */

          .user-profile-header {

            width: 100%;

            min-width: 0;

            display: flex;

            align-items: center;

            gap: 11px;
          }

          .user-profile-avatar {

            width: 54px !important;
            height: 54px !important;

            min-width: 54px !important;
            min-height: 54px !important;

            max-width: 54px !important;
            max-height: 54px !important;

            font-size: 16px;
          }

          .user-profile-info {

            min-width: 0;

            flex: 1;
          }

          .user-profile-name-row {

            gap: 5px;

            align-items: center;
          }

          .user-profile-info h2 {

            min-width: 0;

            margin: 0;

            font-size: 14px;

            line-height: 1.3;

            overflow-wrap: anywhere;

            word-break: break-word;
          }

          .user-profile-info p {

            min-width: 0;

            max-width: 100%;

            margin: 4px 0 0;

            font-size: 9px;

            line-height: 1.4;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;
          }


          .user-details-role {

            min-height: 20px;

            padding:
              0 6px;

            display: inline-flex;

            align-items: center;

            gap: 3px;

            flex-shrink: 0;

            border-radius: 999px;

            font-size: 7px;
          }


          /* DIVIDER */

          .user-profile-divider {

            margin:
              13px 0;
          }


          /* INFORMATION */

          .user-information {

            width: 100%;

            min-width: 0;

            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 8px;
          }

          .user-information-item {

            min-width: 0;

            padding: 9px;

            display: flex;

            align-items: center;

            gap: 8px;

            border:
              1px solid #edf0f5;

            border-radius: 8px;

            background: #fbfcfe;
          }

          .user-information-item > div:last-child {

            min-width: 0;

            flex: 1;
          }

          .user-information-icon {

            width: 27px;
            height: 27px;

            min-width: 27px;

            flex-shrink: 0;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 7px;
          }

          .user-information-item span {

            display: block;

            max-width: 100%;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;

            font-size: 6.5px;
          }

          .user-information-item strong {

            display: block;

            min-width: 0;

            max-width: 100%;

            margin-top: 3px;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;

            font-size: 9px;
          }


          /* ADMIN COMMAND CENTER */

          .admin-controls-wrapper {

            margin-top: 18px;

            padding: 13px;

            border-radius: 11px;
          }

          .admin-controls-wrapper::before {

            left: 13px;
            right: 13px;
          }


          /* ADMIN HEADER */

          .admin-controls-header {

            gap: 8px;

            align-items: flex-start;
          }

          .admin-controls-heading-icon {

            width: 31px;
            height: 31px;

            min-width: 31px;

            border-radius: 8px;
          }

          .admin-controls-header h2 {

            font-size: 13px;

            line-height: 1.25;
          }

          .admin-controls-header p {

            margin-top: 3px;

            font-size: 8px;

            line-height: 1.45;
          }

          .admin-section-label {

            font-size: 7px;

            letter-spacing: 0.9px;
          }


          /* CONTROL GRID */

          .admin-control-grid {

            margin-top: 13px;

            gap: 9px;

            grid-template-columns: 1fr;
          }


          /* CONTROL CARDS */

          .admin-control-card {

            width: 100%;

            min-width: 0;

            padding: 11px;

            border-radius: 9px;
          }

          .admin-control-card:hover {

            transform: none;
          }

          .admin-control-card-header {

            gap: 7px;
          }

          .admin-control-icon {

            width: 29px;
            height: 29px;

            min-width: 29px;

            border-radius: 7px;
          }

          .admin-control-title span {

            font-size: 6.5px;
          }

          .admin-control-title strong {

            font-size: 10px;
          }

          .admin-control-number {

            font-size: 7px;
          }

          .admin-control-divider {

            margin:
              9px 0;
          }

          .admin-control-description {

            min-height: auto;

            font-size: 8px;

            line-height: 1.5;
          }


          /* SELECT */

          .admin-select-wrapper {

            margin-top: 9px;
          }

          .admin-role-select {

            min-height: 34px;

            padding:
              0 29px 0 9px;

            font-size: 9px;
          }

          .admin-select-icon {

            right: 8px;

            width: 13px;

            height: 13px;
          }


          /* ACCESS */

          .admin-access-status-row {

            min-height: 24px;
          }

          .admin-access-status-row span {

            font-size: 6.5px;
          }

          .access-state {

            font-size: 8px !important;
          }

          .admin-access-button {

            min-height: 35px;

            margin-top: 9px;

            padding:
              0 7px;

            font-size: 8px;
          }

          .admin-control-card small {

            font-size: 7px;

            line-height: 1.45;
          }


          /* FEEDBACK */

          .admin-action-success,
          .admin-action-error {

            margin-top: 9px;

            padding: 8px;

            gap: 7px;

            align-items: flex-start;
          }

          .feedback-icon {

            width: 23px;
            height: 23px;

            min-width: 23px;
          }

          .admin-action-success strong,
          .admin-action-error strong {

            font-size: 7.5px;
          }

          .admin-action-success span,
          .admin-action-error span {

            font-size: 8px;

            line-height: 1.4;
          }


          /* DANGER ZONE */

          .admin-danger-zone {

            margin-top: 13px;

            padding: 11px;

            gap: 11px;

            border-radius: 9px;
          }

          .admin-danger-header {

            width: 100%;

            gap: 8px;
          }

          .admin-danger-icon {

            width: 29px;
            height: 29px;

            min-width: 29px;

            border-radius: 7px;
          }

          .danger-label {

            font-size: 6.5px;

            letter-spacing: 0.9px;
          }

          .admin-danger-header h3 {

            margin-top: 3px;

            font-size: 10px;
          }

          .admin-danger-header p {

            margin-top: 3px;

            font-size: 7.5px;

            line-height: 1.45;
          }

          .admin-delete-button {

            min-height: 35px;

            width: 100%;

            padding:
              0 10px;

            font-size: 8px;
          }

        }


        /* =====================================
           VERY SMALL MOBILE
           ===================================== */

        @media (max-width: 380px) {

          .user-details-page {

            padding-left: 10px;
            padding-right: 10px;
          }

          .user-profile-card {

            padding: 11px;
          }

          .user-profile-header {

            gap: 9px;
          }

          .user-profile-avatar {

            width: 50px !important;
            height: 50px !important;

            min-width: 50px !important;
            min-height: 50px !important;

            max-width: 50px !important;
            max-height: 50px !important;
          }

          .user-profile-info h2 {

            font-size: 12px;
          }

          .user-profile-info p {

            font-size: 8px;
          }

          .user-information {

            gap: 6px;
          }

          .user-information-item {

            padding: 7px;

            gap: 6px;
          }

          .user-information-icon {

            width: 24px;
            height: 24px;

            min-width: 24px;
          }

          .user-information-item span {

            font-size: 6px;
          }

          .user-information-item strong {

            font-size: 8px;
          }

          .admin-controls-wrapper {

            padding: 11px;
          }

          .admin-control-card {

            padding: 10px;
          }

          .admin-controls-heading-icon {

            width: 29px;
            height: 29px;

            min-width: 29px;
          }

          .admin-controls-header h2 {

            font-size: 12px;
          }

          .admin-controls-header p {

            font-size: 7px;
          }

          .admin-control-description {

            font-size: 7.5px;
          }

          .admin-danger-zone {

            padding: 10px;
          }

        }


        /* =====================================
           REDUCED MOTION
           ===================================== */

        @media (prefers-reduced-motion: reduce) {

          .admin-spin,
          .admin-control-card,
          .admin-access-button,
          .admin-delete-button {

            animation: none !important;

            transition: none !important;
          }

        }

      `}</style>

    </div>
  );
};

export default UserDetails;