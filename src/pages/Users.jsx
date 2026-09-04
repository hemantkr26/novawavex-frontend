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

      /*
       * 403 = Authenticated but
       * not authorized as ADMIN
       */

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

  return (
    <div className="users-page">

      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <h1>
        Users
      </h1>

      <p>
        Manage NovaWavex users.
      </p>


      {/* =====================================
          LOADING
          ===================================== */}

      {loading && (
        <p>
          Loading users...
        </p>
      )}


      {/* =====================================
          403 ACCESS DENIED
          ===================================== */}

      {!loading &&
        forbidden && (

          <div className="users-access-denied">

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
        )}


      {/* =====================================
          OTHER ERRORS
          ===================================== */}

      {!loading &&
        !forbidden &&
        error && (

          <p>
            {error}
          </p>
        )}


      {/* =====================================
          USERS TABLE
          ===================================== */}

      {!loading &&
        !forbidden &&
        !error &&
        users.length > 0 && (

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

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}


      {/* =====================================
          EMPTY STATE
          ===================================== */}

      {!loading &&
        !forbidden &&
        !error &&
        users.length === 0 && (

          <p>
            No users found.
          </p>
        )}

    </div>
  );
};

export default Users;