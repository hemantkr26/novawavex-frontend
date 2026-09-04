import api from "./api";

const userService = {

  /*
   * =========================================
   * GET ALL USERS
   * =========================================
   */

  getAllUsers: async () => {

    const response =
      await api.get(
        "/api/users"
      );

    return response.data;
  },


  /*
   * =========================================
   * GET CURRENT AUTHENTICATED USER
   * =========================================
   */

  getCurrentUser: async () => {

    const response =
      await api.get(
        "/api/users/me"
      );

    return response.data;
  },


  /*
   * =========================================
   * GET USER BY ID
   * =========================================
   */

  getUserById: async (id) => {

    const response =
      await api.get(
        `/api/users/${id}`
      );

    return response.data;
  },


  /*
   * =========================================
   * CREATE USER
   * =========================================
   */

  createUser: async (userData) => {

    const response =
      await api.post(
        "/api/users",
        userData
      );

    return response.data;
  },


  /*
   * =========================================
   * UPDATE CURRENT USER PROFILE IMAGE
   * =========================================
   */

  updateProfileImage: async (
    profileImage
  ) => {

    const response =
      await api.put(
        "/api/users/me/profile-image",
        {
          profileImage,
        }
      );

    return response.data;
  },


  /*
   * =========================================
   * UPDATE CURRENT USER NAME
   * =========================================
   */

  updateCurrentUserName: async (
    fullName
  ) => {

    const response =
      await api.put(
        "/api/users/me/name",
        {
          fullName,
        }
      );

    return response.data;
  },

};

export default userService;