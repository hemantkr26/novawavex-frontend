
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Shield,
  UserRound,
  Hash,
} from "lucide-react";

import userService from "../services/userService";

const UserDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /*
   * =========================================
   * LOAD USER
   * =========================================
   */

  const loadUser = async () => {
    try {
      setLoading(true);

      setError(null);

      const data = await userService.getUserById(id);

      console.log("NovaWavex user:", data);

      setUser(data);
    } catch (err) {
      console.error(
        "Failed to load user:",
        err
      );

      setError(
        "Unable to load user."
      );
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
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="user-details-page">

        <div className="user-details-loading">

          <div className="user-details-loading-icon">
            <UserRound size={24} />
          </div>

          <h1>
            User Details
          </h1>

          <p>
            Loading user...
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
   *
   * The profile image is constrained to the
   * avatar container so large uploaded images
   * cannot expand the layout.
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

  /*
   * =========================================
   * USER DETAILS
   * =========================================
   */

  return (
    <div className="user-details-page">

      {/* =====================================
          BACK BUTTON
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

          <span className="user-details-eyebrow">
            USER PROFILE
          </span>

          <h1>
            User Details
          </h1>

          <p>
            Manage NovaWavex user information.
          </p>

        </div>

      </div>


      {/* =====================================
          PROFILE CARD
          ===================================== */}

      <div className="user-profile-card">

        {/* Profile Header */}

        <div className="user-profile-header">

          {/* =================================
              PROFILE AVATAR
              ================================= */}

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


          {/* =================================
              USER INFORMATION
              ================================= */}

          <div className="user-profile-info">

            <h2>
              {user.fullName ||
                "Unnamed User"}
            </h2>

            <p>
              {user.email ||
                "No email available"}
            </p>

          </div>


          {/* =================================
              ROLE
              ================================= */}

          <span
            className={
              user.role === "ADMIN"
                ? "user-details-role admin"
                : "user-details-role"
            }
          >
            <Shield size={14} />

            {user.role ||
              "USER"}
          </span>

        </div>


        {/* Divider */}

        <div className="user-profile-divider"></div>


        {/* ===================================
            INFORMATION
            =================================== */}

        <div className="user-information">

          {/* Full Name */}

          <div className="user-information-item">

            <div className="user-information-icon">
              <UserRound size={18} />
            </div>

            <div>

              <span>
                Full Name
              </span>

              <strong>
                {user.fullName ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* Email */}

          <div className="user-information-item">

            <div className="user-information-icon">
              <Mail size={18} />
            </div>

            <div>

              <span>
                Email Address
              </span>

              <strong>
                {user.email ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* Role */}

          <div className="user-information-item">

            <div className="user-information-icon">
              <Shield size={18} />
            </div>

            <div>

              <span>
                Account Role
              </span>

              <strong>
                {user.role ||
                  "USER"}
              </strong>

            </div>

          </div>


          {/* User ID */}

          <div className="user-information-item">

            <div className="user-information-icon">
              <Hash size={18} />
            </div>

            <div>

              <span>
                User ID
              </span>

              <strong>
                #{user.id}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default UserDetails;
