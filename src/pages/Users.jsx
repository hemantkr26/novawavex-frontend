import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import userService from "../services/userService";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [forbidden, setForbidden] = useState(false);

  const [error, setError] = useState(null);

  /*
   * =========================================
   * LOAD USERS
   * =========================================
   */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const data = await userService.getAllUsers();

      console.log("NovaWavex users:", data);

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setForbidden(true);
      } else {
        setError(
          "Unable to load users."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  /*
   * =========================================
   * INITIAL LOAD
   * =========================================
   */

  useEffect(() => {
    loadUsers();
  }, []);


  /*
   * =========================================
   * OPEN USER DETAILS
   * =========================================
   */

  const openUserDetails = (id) => {
    navigate(`/users/${id}`);
  };


  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="users-page">

      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="users-page-header">

        <h1>
          Users
        </h1>

        <p>
          Manage NovaWavex users.
        </p>

      </div>


      {/* =====================================
          LOADING
          ===================================== */}

      {loading && (
        <div
          className="users-state"
          role="status"
          aria-live="polite"
        >
          <span className="users-loading-dot" />
          <span>
            Loading users...
          </span>
        </div>
      )}


      {/* =====================================
          403 ACCESS DENIED
          ===================================== */}

      {!loading &&
        forbidden && (

          <div
            className="users-access-denied"
            role="alert"
          >

            <div className="users-state-icon">
              !
            </div>

            <div>

              <h2>
                Access Denied
              </h2>

              <p>
                You do not have permission
                to view the users.
              </p>

              <p>
                Only administrators can
                access this section.
              </p>

            </div>

          </div>
        )}


      {/* =====================================
          OTHER ERRORS
          ===================================== */}

      {!loading &&
        !forbidden &&
        error && (

          <div
            className="users-error"
            role="alert"
          >
            {error}
          </div>
        )}


      {/* =====================================
          USERS TABLE
          ===================================== */}

      {!loading &&
        !forbidden &&
        !error &&
        users.length > 0 && (

          <div className="users-table-container">

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Full Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="user-row"
                      onClick={() =>
                        openUserDetails(user.id)
                      }
                    >

                      {/* ID */}

                      <td>

                        <span className="user-id">
                          #{user.id}
                        </span>

                      </td>


                      {/* Full Name */}

                      <td>

                        <span className="user-name">
                          {user.fullName ||
                            "No name"}
                        </span>

                      </td>


                      {/* Email */}

                      <td>

                        <span className="user-email">
                          {user.email ||
                            "No email"}
                        </span>

                      </td>


                      {/* Role */}

                      <td>

                        <span
                          className={
                            user.role === "ADMIN"
                              ? "user-role admin"
                              : "user-role"
                          }
                        >
                          {user.role ||
                            "USER"}
                        </span>

                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={
                            user.enabled === false
                              ? "user-role"
                              : "user-role admin"
                          }
                        >
                          {user.enabled === false
                            ? "DISABLED"
                            : "ACTIVE"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}


      {/* =====================================
          EMPTY STATE
          ===================================== */}

      {!loading &&
        !forbidden &&
        !error &&
        users.length === 0 && (

          <div className="users-empty-state">

            <h2>
              No users found
            </h2>

            <p>
              There are currently no users
              available in the team.
            </p>

          </div>
        )}


      {/* =====================================
          TEAM PAGE STYLES
          ===================================== */}

      <style>{`

        /* =====================================
           PAGE
           ===================================== */

        .users-page {

          width: 100%;
          max-width: 100%;

          min-width: 0;

          box-sizing: border-box;

          overflow-x: hidden;

          padding:
            24px 28px 32px;

          color: #172033;
        }


        /* =====================================
           HEADER
           ===================================== */

        .users-page-header {

          width: 100%;

          min-width: 0;

          margin-bottom: 22px;
        }


        .users-page-header h1 {

          margin: 0;

          color: #172033;

          font-size: 25px;
          font-weight: 800;

          line-height: 1.2;
        }


        .users-page-header p {

          margin:
            7px 0 0;

          color: #68758a;

          font-size: 12px;

          line-height: 1.5;
        }


        /* =====================================
           STATES
           ===================================== */

        .users-state {

          min-height: 100px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          color: #68758a;

          font-size: 12px;
        }


        .users-loading-dot {

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #4f7df3;

          animation:
            users-loading-pulse
            1s
            ease-in-out
            infinite;
        }


        /* =====================================
           TABLE CONTAINER
           ===================================== */

        .users-table-container {

          width: 100%;

          max-width: 100%;

          min-width: 0;

          box-sizing: border-box;

          border:
            1px solid #e3e8f0;

          border-radius: 12px;

          background: #ffffff;

          box-shadow:
            0 8px 24px
            rgba(31, 45, 70, 0.06);

          overflow: hidden;
        }


        /* =====================================
           TABLE WRAPPER

           Important:
           The wrapper may scroll internally on
           very narrow screens, but it will NEVER
           make the complete page wider.
           ===================================== */

        .users-table-wrapper {

          width: 100%;

          max-width: 100%;

          min-width: 0;

          overflow-x: auto;
          overflow-y: hidden;

          -webkit-overflow-scrolling: touch;

          scrollbar-width: thin;
        }


        .users-table-wrapper::-webkit-scrollbar {

          height: 6px;
        }


        .users-table-wrapper::-webkit-scrollbar-track {

          background: #f4f6f9;
        }


        .users-table-wrapper::-webkit-scrollbar-thumb {

          border-radius: 10px;

          background: #cbd5e4;
        }


        /* =====================================
           TABLE
           ===================================== */

        .users-table {

          width: 100%;

          min-width: 620px;

          border-collapse: collapse;

          table-layout: fixed;
        }


        .users-table th,
        .users-table td {

          box-sizing: border-box;

          text-align: left;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        .users-table th {

          height: 44px;

          padding:
            0 16px;

          color: #7a8699;

          background: #f8f9fb;

          border-bottom:
            1px solid #e7ebf1;

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.35px;

          text-transform: uppercase;
        }


        .users-table td {

          height: 52px;

          padding:
            0 16px;

          color: #42506a;

          border-bottom:
            1px solid #edf0f5;

          font-size: 11px;
        }


        .users-table tbody tr:last-child td {

          border-bottom: 0;
        }


        /* =====================================
           COLUMN WIDTHS
           ===================================== */

        .users-table th:nth-child(1),
        .users-table td:nth-child(1) {

          width: 80px;
        }


        .users-table th:nth-child(2),
        .users-table td:nth-child(2) {

          width: 22%;
        }


        .users-table th:nth-child(3),
        .users-table td:nth-child(3) {

          width: 34%;
        }


        .users-table th:nth-child(4),
        .users-table td:nth-child(4) {

          width: 110px;
        }


        .users-table th:nth-child(5),
        .users-table td:nth-child(5) {

          width: 120px;
        }


        /* =====================================
           ROW
           ===================================== */

        .user-row {

          cursor: pointer;

          transition:
            background 0.18s ease;
        }


        .user-row:hover {

          background: #f8faff;
        }


        .user-row:active {

          background: #f3f6fc;
        }


        .user-row:focus-visible {

          outline:
            2px solid #4f7df3;

          outline-offset: -2px;
        }


        /* =====================================
           USER TEXT
           ===================================== */

        .user-id {

          color: #8a95a6;

          font-size: 10px;

          font-weight: 700;
        }


        .user-name {

          display: block;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #25324a;

          font-weight: 700;
        }


        .user-email {

          display: block;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #68758a;
        }


        /* =====================================
           ROLE / STATUS
           ===================================== */

        .user-role {

          display: inline-flex;
          align-items: center;
          justify-content: center;

          max-width: 100%;

          min-height: 24px;

          padding:
            0 9px;

          box-sizing: border-box;

          border:
            1px solid #e1e6ee;

          border-radius: 999px;

          color: #68758a;

          background: #f7f8fa;

          font-size: 9px;

          font-weight: 800;

          letter-spacing:
            0.25px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        .user-role.admin {

          border-color:
            #d6e1ff;

          color: #4f72d8;

          background: #f0f4ff;
        }


        /* =====================================
           ACCESS DENIED
           ===================================== */

        .users-access-denied {

          width: 100%;

          max-width: 100%;

          box-sizing: border-box;

          display: flex;
          align-items: flex-start;

          gap: 14px;

          padding: 22px;

          border:
            1px solid #f0d7d7;

          border-radius: 12px;

          background: #fff8f8;
        }


        .users-state-icon {

          width: 32px;
          height: 32px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #b54747;

          background: #fdeaea;

          font-size: 15px;
          font-weight: 800;
        }


        .users-access-denied h2 {

          margin: 0 0 6px;

          color: #8f3838;

          font-size: 14px;
          font-weight: 800;
        }


        .users-access-denied p {

          margin: 4px 0;

          color: #8c6262;

          font-size: 11px;

          line-height: 1.5;
        }


        /* =====================================
           ERROR
           ===================================== */

        .users-error {

          width: 100%;

          max-width: 100%;

          box-sizing: border-box;

          padding:
            12px 14px;

          border:
            1px solid #f1d4d4;

          border-radius: 8px;

          color: #b54747;

          background: #fff3f3;

          font-size: 11px;
        }


        /* =====================================
           EMPTY
           ===================================== */

        .users-empty-state {

          width: 100%;

          max-width: 100%;

          box-sizing: border-box;

          padding:
            42px 24px;

          border:
            1px dashed #dbe2ec;

          border-radius: 12px;

          text-align: center;

          background: #fbfcfe;
        }


        .users-empty-state h2 {

          margin: 0;

          color: #25324a;

          font-size: 15px;

          font-weight: 800;
        }


        .users-empty-state p {

          margin:
            7px 0 0;

          color: #7a8699;

          font-size: 11px;
        }


        /* =====================================
           LOADING ANIMATION
           ===================================== */

        @keyframes users-loading-pulse {

          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }


        /* =====================================
           TABLET
           ===================================== */

        @media (max-width: 900px) {

          .users-page {

            padding:
              22px 20px 28px;
          }


          .users-table {

            min-width: 580px;
          }

          .users-table th,
          .users-table td {

            padding:
              0 13px;
          }

        }


        /* =====================================
           MOBILE
           ===================================== */

        @media (max-width: 600px) {

          .users-page {

            padding:
              18px 14px 24px;

            overflow-x: hidden;
          }


          .users-page-header {

            margin-bottom: 17px;
          }


          .users-page-header h1 {

            font-size: 21px;
          }


          .users-page-header p {

            font-size: 11px;
          }


          .users-table-container {

            border-radius: 10px;
          }


          .users-table {

            min-width: 540px;
          }


          .users-table th {

            height: 40px;

            padding:
              0 11px;

            font-size: 9px;
          }


          .users-table td {

            height: 48px;

            padding:
              0 11px;

            font-size: 10px;
          }


          .users-table th:nth-child(1),
          .users-table td:nth-child(1) {

            width: 62px;
          }


          .users-table th:nth-child(2),
          .users-table td:nth-child(2) {

            width: 145px;
          }


          .users-table th:nth-child(3),
          .users-table td:nth-child(3) {

            width: 190px;
          }


          .users-table th:nth-child(4),
          .users-table td:nth-child(4) {

            width: 85px;
          }


          .users-table th:nth-child(5),
          .users-table td:nth-child(5) {

            width: 95px;
          }


          .users-access-denied {

            padding: 17px;

            gap: 10px;
          }


          .users-access-denied h2 {

            font-size: 13px;
          }


          .users-access-denied p {

            font-size: 10px;
          }

        }


        /* =====================================
           VERY SMALL MOBILE
           ===================================== */

        @media (max-width: 380px) {

          .users-page {

            padding:
              16px 10px 22px;
          }


          .users-table {

            min-width: 520px;
          }


          .users-table th,
          .users-table td {

            padding:
              0 9px;
          }

        }


        /* =====================================
           REDUCED MOTION
           ===================================== */

        @media (prefers-reduced-motion: reduce) {

          .users-loading-dot,
          .user-row {

            animation: none !important;

            transition: none !important;
          }

        }

      `}</style>

    </div>
  );
};

export default Users;