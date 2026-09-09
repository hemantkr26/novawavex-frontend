import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  User,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Fingerprint,
  Activity,
  Camera,
  Upload,
  X,
  Loader2,
  Pencil,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import userService from "../services/userService";


const Profile = () => {

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();


  /*
   * =========================================
   * PROFILE STATE
   * =========================================
   */

  const [
    profile,
    setProfile,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * =========================================
   * COMPONENT MOUNT STATE
   * =========================================
   */

  const isMountedRef =
    useRef(false);


  /*
   * =========================================
   * IMAGE STATE
   * =========================================
   */

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);


  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);


  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);


  const [
    imageMessage,
    setImageMessage,
  ] = useState("");


  const [
    imageError,
    setImageError,
  ] = useState("");


  /*
   * =========================================
   * PROFILE IMAGE LOAD ERROR
   * =========================================
   */

  const [
    profileImageError,
    setProfileImageError,
  ] = useState(false);


  /*
   * =========================================
   * NAME EDIT STATE
   * =========================================
   */

  const [
    editingName,
    setEditingName,
  ] = useState(false);


  const [
    editedName,
    setEditedName,
  ] = useState("");


  const [
    savingName,
    setSavingName,
  ] = useState(false);


  const [
    nameMessage,
    setNameMessage,
  ] = useState("");


  const [
    nameError,
    setNameError,
  ] = useState("");


  /*
   * =========================================
   * ACCOUNT DELETION STATE
   * =========================================
   */

  const [
    deletingAccount,
    setDeletingAccount,
  ] = useState(false);


  const [
    deleteError,
    setDeleteError,
  ] = useState("");


  /*
   * =========================================
   * FILE INPUT REF
   * =========================================
   */

  const fileInputRef =
    useRef(null);


  /*
   * =========================================
   * COMPONENT MOUNT
   * =========================================
   */

  useEffect(() => {

    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };

  }, []);


  /*
   * =========================================
   * LOAD CURRENT USER
   * =========================================
   */

  useEffect(() => {

    let cancelled = false;


    const loadProfile = async () => {

      if (!isAuthenticated) {

        if (
          !cancelled &&
          isMountedRef.current
        ) {

          setProfile(null);
          setError("");
          setLoading(false);

        }

        return;
      }


      try {

        if (
          !cancelled &&
          isMountedRef.current
        ) {

          setLoading(true);
          setError("");
          setProfileImageError(false);

        }


        const data =
          await userService.getCurrentUser();


        if (
          cancelled ||
          !isMountedRef.current
        ) {

          return;

        }


        setProfile(data);
        setError("");


      } catch (err) {

        if (
          cancelled ||
          !isMountedRef.current
        ) {

          return;

        }


        console.error(
          "Failed to load profile:",
          err
        );


        setError(
          "Unable to load your profile information."
        );


      } finally {

        if (
          !cancelled &&
          isMountedRef.current
        ) {

          setLoading(false);

        }

      }

    };


    loadProfile();


    return () => {

      cancelled = true;

    };

  }, [
    isAuthenticated,
  ]);


  /*
   * =========================================
   * USER DATA
   * =========================================
   */

  const profileData =
    profile || user || {};


  const email =
    profileData?.email ||
    "Not available";


  const role =
    profileData?.role ||
    "USER";


  const fullName =
    profileData?.fullName ||
    profileData?.name ||
    "Not available";


  const userId =
    profileData?.id !== undefined &&
    profileData?.id !== null
      ? `#${profileData.id}`
      : "Not available";


  const profileImage =
    profileData?.profileImage ||
    null;


  /*
   * =========================================
   * ACCOUNT STATUS
   * =========================================
   */

  const accountStatus =
    isAuthenticated
      ? "Active"
      : "Inactive";


  const authenticationStatus =
    isAuthenticated
      ? "JWT Authentication"
      : "Not authenticated";


  const sessionType =
    isAuthenticated
      ? "Stateless"
      : "None";


  /*
   * =========================================
   * AVATAR INITIALS
   * =========================================
   */

  const getInitials = () => {

    if (
      fullName !== "Not available" &&
      fullName.trim()
    ) {

      const parts =
        fullName
          .trim()
          .split(/\s+/);


      if (parts.length >= 2) {

        return (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();

      }


      return (
        parts[0][0] ||
        "U"
      ).toUpperCase();

    }


    if (
      email &&
      email !== "Not available"
    ) {

      return email
        .charAt(0)
        .toUpperCase();

    }


    return "U";

  };


  const avatarInitials =
    getInitials();


  /*
   * =========================================
   * ROLE LABEL
   * =========================================
   */

  const roleLabel =
    role
      .toString()
      .toUpperCase();


  /*
   * =========================================
   * OPEN FILE SELECTOR
   * =========================================
   */

  const openFileSelector = () => {

    setImageMessage("");
    setImageError("");

    if (fileInputRef.current) {

      fileInputRef.current.click();

    }

  };


  /*
   * =========================================
   * HANDLE IMAGE SELECTION
   * =========================================
   */

  const handleImageSelect = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {

      return;

    }


    setImageMessage("");
    setImageError("");
    setProfileImageError(false);


    /*
     * Validate file type
     */

    if (
      !file.type.startsWith("image/")
    ) {

      setImageError(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;

    }


    /*
     * Validate file size
     *
     * Maximum: 2 MB
     */

    const maxSize =
      2 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      setImageError(
        "Image size must be 2 MB or less."
      );

      event.target.value = "";

      return;

    }


    /*
     * Store selected file
     */

    setSelectedImage(file);


    /*
     * Create preview
     */

    const reader =
      new FileReader();


    reader.onload = () => {

      if (!isMountedRef.current) {

        return;

      }


      setImagePreview(
        reader.result
      );

    };


    reader.onerror = () => {

      if (!isMountedRef.current) {

        return;

      }


      setImageError(
        "Unable to preview the selected image."
      );

    };


    reader.readAsDataURL(file);

  };


  /*
   * =========================================
   * CANCEL IMAGE SELECTION
   * =========================================
   */

  const cancelImageSelection = () => {

    setSelectedImage(null);
    setImagePreview(null);
    setImageMessage("");
    setImageError("");
    setProfileImageError(false);


    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };


  /*
   * =========================================
   * HANDLE PROFILE IMAGE LOAD ERROR
   * =========================================
   */

  const handleProfileImageError = () => {

    if (!isMountedRef.current) {

      return;

    }


    setProfileImageError(true);

  };


  /*
   * =========================================
   * UPLOAD PROFILE IMAGE
   * =========================================
   */

  const handleUploadImage = async () => {

    if (!selectedImage) {

      return;

    }


    if (!imagePreview) {

      setImageError(
        "Unable to process the selected image."
      );

      return;

    }


    try {

      setUploadingImage(true);

      setImageMessage("");
      setImageError("");
      setProfileImageError(false);


      const updatedProfile =
        await userService.updateProfileImage(
          imagePreview
        );


      if (!isMountedRef.current) {

        return;

      }


      setProfile(
        updatedProfile
      );


      setSelectedImage(null);
      setImagePreview(null);
      setProfileImageError(false);


      if (fileInputRef.current) {

        fileInputRef.current.value = "";

      }


      setImageMessage(
        "Profile image updated successfully."
      );


    } catch (err) {

      if (!isMountedRef.current) {

        return;

      }


      console.error(
        "Failed to update profile image:",
        err
      );


      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "";


      setImageError(
        typeof backendMessage === "string" &&
        backendMessage.trim()
          ? backendMessage
          : "Unable to update your profile image."
      );


    } finally {

      if (isMountedRef.current) {

        setUploadingImage(false);

      }

    }

  };


  /*
   * =========================================
   * START EDIT NAME
   * =========================================
   */

  const handleStartEditName = () => {

    setEditedName(
      fullName !== "Not available"
        ? fullName
        : ""
    );


    setNameMessage("");
    setNameError("");
    setEditingName(true);

  };


  /*
   * =========================================
   * CANCEL EDIT NAME
   * =========================================
   */

  const handleCancelEditName = () => {

    if (savingName) {

      return;

    }


    setEditedName("");
    setNameMessage("");
    setNameError("");
    setEditingName(false);

  };


  /*
   * =========================================
   * HANDLE NAME INPUT
   * =========================================
   */

  const handleNameChange = (
    event
  ) => {

    setEditedName(
      event.target.value
    );

    setNameMessage("");
    setNameError("");

  };


  /*
   * =========================================
   * SAVE NAME
   * =========================================
   */

  const handleSaveName = async () => {

    const trimmedName =
      editedName.trim();


    if (!trimmedName) {

      setNameError(
        "Full name cannot be empty."
      );

      return;

    }


    if (
      trimmedName.length < 2
    ) {

      setNameError(
        "Full name must contain at least 2 characters."
      );

      return;

    }


    if (savingName) {

      return;

    }


    try {

      setSavingName(true);

      setNameMessage("");
      setNameError("");


      const updatedProfile =
        await userService.updateCurrentUserName(
          trimmedName
        );


      if (!isMountedRef.current) {

        return;

      }


      setProfile(
        updatedProfile
      );


      setEditingName(false);
      setEditedName("");


      setNameMessage(
        "Name updated successfully."
      );


    } catch (err) {

      if (!isMountedRef.current) {

        return;

      }


      console.error(
        "Failed to update profile name:",
        err
      );


      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "";


      setNameError(
        typeof backendMessage === "string" &&
        backendMessage.trim()
          ? backendMessage
          : "Unable to update your name."
      );


    } finally {

      if (isMountedRef.current) {

        setSavingName(false);

      }

    }

  };


  /*
   * =========================================
   * DELETE ACCOUNT
   * =========================================
   *
   * Backend endpoint:
   *
   * DELETE /api/users/me
   *
   * After successful deletion:
   *
   * 1. Tell AuthContext to logout.
   * 2. Redirect to login.
   *
   * =========================================
   */

  const handleDeleteAccount = async () => {

    if (deletingAccount) {

      return;

    }


    setDeleteError("");


    /*
     * First confirmation
     */

    const firstConfirmation =
      window.confirm(
        "Delete your NovaWavex account?\n\nThis action permanently removes your account and cannot be undone."
      );


    if (!firstConfirmation) {

      return;

    }


    /*
     * Second confirmation
     */

    const secondConfirmation =
      window.confirm(
        `Final confirmation:\n\nDelete the account associated with ${email}?\n\nThis cannot be undone.`
      );


    if (!secondConfirmation) {

      return;

    }


    try {

      setDeletingAccount(true);
      setDeleteError("");


      /*
       * REAL BACKEND DELETE
       */

      await userService.deleteCurrentUser();


      /*
       * Use the existing AuthContext logout()
       * instead of manually clearing storage.
       *
       * This keeps:
       *
       * - isAuthenticated
       * - user
       * - JWT storage
       *
       * synchronized with the rest of
       * the application.
       */

      logout();


      /*
       * Redirect to login.
       */

      window.location.href =
        "/login";


    } catch (err) {

      console.error(
        "Failed to delete account:",
        err
      );


      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "";


      if (isMountedRef.current) {

        setDeleteError(
          typeof backendMessage === "string" &&
          backendMessage.trim()
            ? backendMessage
            : "Unable to delete your account. Please try again."
        );

        setDeletingAccount(false);

      }

    }

  };


  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */

  if (loading) {

    return (

      <div className="profile-page">

        <div className="profile-page-header">

          <span className="profile-eyebrow">
            ACCOUNT
          </span>

          <h1>
            Profile
          </h1>

          <p>
            Manage your NovaWavex account information.
          </p>

        </div>


        <div className="profile-loading">

          <Loader2
            size={18}
            className="profile-loading-spinner"
          />

          Loading your profile...

        </div>

      </div>

    );

  }


  /*
   * =========================================
   * ERROR STATE
   * =========================================
   */

  if (
    error &&
    !profile
  ) {

    return (

      <div className="profile-page">

        <div className="profile-page-header">

          <span className="profile-eyebrow">
            ACCOUNT
          </span>

          <h1>
            Profile
          </h1>

          <p>
            Manage your NovaWavex account information.
          </p>

        </div>


        <div className="profile-error">

          {error}

        </div>

      </div>

    );

  }


  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (

    <div className="profile-page">


      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="profile-page-header">

        <span className="profile-eyebrow">
          ACCOUNT
        </span>

        <h1>
          Profile
        </h1>

        <p>
          Manage your NovaWavex account information.
        </p>

      </div>


      {/* =====================================
          MAIN CARD
          ===================================== */}

      <div className="profile-card">


        {/* ===================================
            PROFILE HEADER
            =================================== */}

        <div className="profile-card-header">


          {/* =================================
              AVATAR
              ================================= */}

          <div className="profile-avatar-wrapper">

            {(
              imagePreview ||
              (
                profileImage &&
                !profileImageError
              )
            ) ? (

              <img
                src={
                  imagePreview ||
                  profileImage
                }
                alt="Profile"
                className="profile-avatar-image"
                onError={
                  imagePreview
                    ? undefined
                    : handleProfileImageError
                }
              />

            ) : (

              <div className="profile-avatar-large">

                {avatarInitials}

              </div>

            )}


            <button
              type="button"
              className="profile-avatar-camera"
              onClick={openFileSelector}
              disabled={uploadingImage}
              title="Change profile image"
            >

              <Camera size={13} />

            </button>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="profile-image-input"
            />

          </div>


          <div className="profile-card-identity">

            <h2>

              {fullName !== "Not available"
                ? fullName
                : "NovaWavex User"}

            </h2>

            <p>
              {email}
            </p>

          </div>


          <div className="profile-header-status">

            <span className="profile-status">

              <CheckCircle2 size={13} />

              {accountStatus}

            </span>

          </div>

        </div>


        {/* ===================================
            IMAGE CONTROLS
            =================================== */}

        {selectedImage && (

          <div className="profile-image-actions">

            <div className="profile-image-selected">

              <span>
                {selectedImage.name}
              </span>

              <small>
                Ready to upload
              </small>

            </div>


            <div className="profile-image-buttons">

              <button
                type="button"
                className="profile-image-cancel"
                onClick={cancelImageSelection}
                disabled={uploadingImage}
              >

                <X size={14} />

                Cancel

              </button>


              <button
                type="button"
                className="profile-image-upload"
                onClick={handleUploadImage}
                disabled={uploadingImage}
              >

                {uploadingImage ? (

                  <Loader2
                    size={14}
                    className="profile-loading-spinner"
                  />

                ) : (

                  <Upload size={14} />

                )}

                {uploadingImage
                  ? "Uploading..."
                  : "Upload Image"}

              </button>

            </div>

          </div>

        )}


        {/* ===================================
            IMAGE MESSAGE
            =================================== */}

        {imageMessage && (

          <div className="profile-image-success">

            <CheckCircle2 size={14} />

            {imageMessage}

          </div>

        )}


        {imageError && (

          <div className="profile-image-error">

            {imageError}

          </div>

        )}


        {/* ===================================
            NAME MESSAGE
            =================================== */}

        {nameMessage && (

          <div className="profile-image-success">

            <CheckCircle2 size={14} />

            {nameMessage}

          </div>

        )}


        {/* Divider */}

        <div className="profile-divider"></div>


        {/* ===================================
            USER INFORMATION
            =================================== */}

        <div className="profile-section">

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <User size={16} />

            </div>

            <div>

              <h3>
                User Information
              </h3>

              <p>
                Basic information associated with your account.
              </p>

            </div>

          </div>


          <div className="profile-information">


            {/* =================================
                FULL NAME
                ================================= */}

            <div className="profile-information-item">

              <div className="profile-information-label">

                <User size={15} />

                <span>
                  Full Name
                </span>

              </div>


              {editingName ? (

                <div className="profile-name-editor">

                  <input
                    type="text"
                    value={editedName}
                    onChange={handleNameChange}
                    maxLength={100}
                    autoFocus
                    disabled={savingName}
                    placeholder="Enter your full name"
                    className="profile-name-input"
                  />


                  <button
                    type="button"
                    className="profile-name-save"
                    onClick={handleSaveName}
                    disabled={savingName}
                    title="Save name"
                  >

                    {savingName ? (

                      <Loader2
                        size={13}
                        className="profile-loading-spinner"
                      />

                    ) : (

                      <Save size={13} />

                    )}

                    {savingName
                      ? "Saving..."
                      : "Save"}

                  </button>


                  <button
                    type="button"
                    className="profile-name-cancel"
                    onClick={handleCancelEditName}
                    disabled={savingName}
                    title="Cancel"
                  >

                    <X size={13} />

                  </button>

                </div>

              ) : (

                <div className="profile-name-display">

                  <strong>
                    {fullName}
                  </strong>


                  <button
                    type="button"
                    className="profile-name-edit"
                    onClick={handleStartEditName}
                    title="Edit full name"
                  >

                    <Pencil size={13} />

                    Edit

                  </button>

                </div>

              )}

            </div>


            {nameError && (

              <div className="profile-name-error">

                {nameError}

              </div>

            )}


            {/* =================================
                EMAIL
                ================================= */}

            <div className="profile-information-item">

              <div className="profile-information-label">

                <Mail size={15} />

                <span>
                  Email
                </span>

              </div>

              <strong>
                {email}
              </strong>

            </div>


            {/* =================================
                ROLE
                ================================= */}

            <div className="profile-information-item">

              <div className="profile-information-label">

                <ShieldCheck size={15} />

                <span>
                  Role
                </span>

              </div>

              <strong
                className={
                  roleLabel === "ADMIN"
                    ? "profile-role admin"
                    : "profile-role"
                }
              >

                {roleLabel}

              </strong>

            </div>

          </div>

        </div>


        {/* ===================================
            ACCOUNT INFORMATION
            =================================== */}

        <div className="profile-section">

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <Fingerprint size={16} />

            </div>

            <div>

              <h3>
                Account Information
              </h3>

              <p>
                Current account and authentication information.
              </p>

            </div>

          </div>


          <div className="profile-information">


            <div className="profile-information-item">

              <div className="profile-information-label">

                <Activity size={15} />

                <span>
                  Account Status
                </span>

              </div>

              <strong className="profile-status">

                <CheckCircle2 size={13} />

                {accountStatus}

              </strong>

            </div>


            <div className="profile-information-item">

              <div className="profile-information-label">

                <KeyRound size={15} />

                <span>
                  Authentication
                </span>

              </div>

              <strong>
                {authenticationStatus}
              </strong>

            </div>


            <div className="profile-information-item">

              <div className="profile-information-label">

                <Fingerprint size={15} />

                <span>
                  Account ID
                </span>

              </div>

              <strong>
                {userId}
              </strong>

            </div>


            <div className="profile-information-item">

              <div className="profile-information-label">

                <ShieldCheck size={15} />

                <span>
                  Session Type
                </span>

              </div>

              <strong>
                {sessionType}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================
            ACCOUNT SECURITY
            =================================== */}

        <div className="profile-security">

          <div className="profile-security-icon">

            <ShieldCheck size={17} />

          </div>


          <div className="profile-security-content">

            <strong>
              Account Security
            </strong>

            <span>
              Your NovaWavex session is protected using
              stateless JWT authentication.
            </span>

          </div>


          <div className="profile-security-status">

            <CheckCircle2 size={14} />

            Secure

          </div>

        </div>


        {/* ===================================
            DANGER ZONE
            =================================== */}

        <div className="profile-danger-zone">

          <div className="profile-danger-header">

            <div className="profile-danger-icon">

              <AlertTriangle size={17} />

            </div>


            <div>

              <span className="profile-danger-eyebrow">
                DANGER ZONE
              </span>

              <h3>
                Delete Account
              </h3>

              <p>
                Permanently remove your NovaWavex account and
                end your current access.
              </p>

            </div>

          </div>


          <div className="profile-danger-content">

            <div className="profile-danger-copy">

              <strong>
                Permanently delete your account
              </strong>

              <span>
                This action cannot be undone. You will be
                signed out immediately after the account is deleted.
              </span>

            </div>


            <button
              type="button"
              className="profile-delete-button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >

              {deletingAccount ? (

                <Loader2
                  size={14}
                  className="profile-loading-spinner"
                />

              ) : (

                <Trash2 size={14} />

              )}

              {deletingAccount
                ? "Deleting..."
                : "Delete Account"}

            </button>

          </div>


          {deleteError && (

            <div className="profile-delete-error">

              <AlertTriangle size={14} />

              <span>
                {deleteError}
              </span>

            </div>

          )}

        </div>


      </div>


      {/* =====================================
          PROFILE STYLES
          ===================================== */}

      <style>{`

        .profile-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 34px 48px;
          box-sizing: border-box;
        }


        .profile-page-header {
          margin-bottom: 24px;
        }


        .profile-eyebrow {
          display: inline-block;
          margin-bottom: 6px;
          color: #718096;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }


        .profile-page-header h1 {
          margin: 0;
          color: #172033;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 750;
        }


        .profile-page-header p {
          margin: 7px 0 0;
          color: #68758a;
          font-size: 12px;
          line-height: 1.5;
        }


        .profile-card {
          width: 100%;
          box-sizing: border-box;
          padding: 0 24px 24px;
          border: 1px solid #e7ebf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 5px 18px rgba(25, 40, 70, 0.045);
        }


        .profile-card-header {
          min-height: 108px;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
        }


        .profile-avatar-wrapper {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          position: relative;
        }


        .profile-avatar-large {
          width: 58px;
          height: 58px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #4f7df3;
          background: #eef4ff;
          border: 1px solid #dce7ff;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }


        .profile-avatar-image {
          width: 58px;
          height: 58px;
          display: block;
          object-fit: cover;
          border-radius: 14px;
          border: 1px solid #dce7ff;
          background: #eef4ff;
        }


        .profile-avatar-camera {
          position: absolute;
          right: -5px;
          bottom: -5px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 2px solid #ffffff;
          border-radius: 50%;
          color: #ffffff;
          background: #4f7df3;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(30, 50, 90, 0.18);
        }


        .profile-avatar-camera:hover {
          background: #3f6fe8;
        }


        .profile-avatar-camera:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }


        .profile-image-input {
          display: none;
        }


        .profile-image-actions {
          margin: 0 0 16px;
          padding: 11px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border: 1px solid #e4eaf4;
          border-radius: 9px;
          background: #f8faff;
        }


        .profile-image-selected {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .profile-image-selected span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #334155;
          font-size: 10px;
          font-weight: 650;
        }


        .profile-image-selected small {
          color: #7a8699;
          font-size: 9px;
        }


        .profile-image-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }


        .profile-image-cancel,
        .profile-image-upload {
          min-height: 29px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 10px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }


        .profile-image-cancel {
          border: 1px solid #e1e6ee;
          color: #68758a;
          background: #ffffff;
        }


        .profile-image-cancel:hover {
          background: #f5f7fa;
        }


        .profile-image-upload {
          border: 1px solid #4f7df3;
          color: #ffffff;
          background: #4f7df3;
        }


        .profile-image-upload:hover {
          background: #3f6fe8;
        }


        .profile-image-upload:disabled,
        .profile-image-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }


        .profile-image-success {
          margin-bottom: 15px;
          padding: 9px 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #dcefe4;
          border-radius: 8px;
          color: #18794e;
          background: #f4fbf7;
          font-size: 10px;
          font-weight: 650;
        }


        .profile-image-error {
          margin-bottom: 15px;
          padding: 9px 11px;
          border: 1px solid #f0d8d8;
          border-radius: 8px;
          color: #b44747;
          background: #fff7f7;
          font-size: 10px;
          line-height: 1.4;
        }


        .profile-card-identity {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }


        .profile-card-identity h2 {
          margin: 0;
          color: #172033;
          font-size: 16px;
          font-weight: 750;
        }


        .profile-card-identity p {
          margin: 0;
          color: #68758a;
          font-size: 11px;
          word-break: break-word;
        }


        .profile-header-status {
          margin-left: auto;
        }


        .profile-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 27px;
          padding: 0 9px;
          box-sizing: border-box;
          border-radius: 7px;
          color: #15965a !important;
          background: #eaf9f1;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }


        .profile-divider {
          height: 1px;
          width: 100%;
          background: #edf0f5;
        }


        .profile-section {
          padding: 23px 0 8px;
        }


        .profile-section + .profile-section {
          margin-top: 5px;
        }


        .profile-section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 13px;
        }


        .profile-section-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #4f7df3;
          background: #eef4ff;
        }


        .profile-section-heading h3 {
          margin: 0;
          color: #25324a;
          font-size: 13px;
          font-weight: 750;
        }


        .profile-section-heading p {
          margin: 3px 0 0;
          color: #7a8699;
          font-size: 10px;
          line-height: 1.4;
        }


        .profile-information {
          width: 100%;
          border: 1px solid #e9edf3;
          border-radius: 10px;
          overflow: hidden;
          background: #fafbfd;
        }


        .profile-information-item {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 8px 13px;
          box-sizing: border-box;
          border-bottom: 1px solid #edf0f5;
        }


        .profile-information-item:last-child {
          border-bottom: 0;
        }


        .profile-information-label {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #68758a;
          font-size: 11px;
        }


        .profile-information-label svg {
          flex-shrink: 0;
          color: #6489ed;
        }


        .profile-information-item strong {
          max-width: 55%;
          color: #25324a;
          font-size: 11px;
          font-weight: 650;
          text-align: right;
          word-break: break-word;
        }


        .profile-name-display {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          max-width: 70%;
        }


        .profile-name-display strong {
          max-width: 100%;
        }


        .profile-name-edit {
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 0 8px;
          border: 1px solid #dfe6f2;
          border-radius: 6px;
          color: #4f7df3;
          background: #ffffff;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
        }


        .profile-name-edit:hover {
          background: #eef4ff;
          border-color: #cddcff;
        }


        .profile-name-editor {
          max-width: 70%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }


        .profile-name-input {
          width: 210px;
          min-height: 31px;
          box-sizing: border-box;
          padding: 0 9px;
          border: 1px solid #cbd6e8;
          border-radius: 7px;
          outline: none;
          color: #25324a;
          background: #ffffff;
          font-size: 11px;
          font-weight: 550;
        }


        .profile-name-input:focus {
          border-color: #4f7df3;
          box-shadow: 0 0 0 2px rgba(79, 125, 243, 0.10);
        }


        .profile-name-save {
          min-height: 31px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 0 9px;
          border: 1px solid #4f7df3;
          border-radius: 7px;
          color: #ffffff;
          background: #4f7df3;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
        }


        .profile-name-save:hover {
          background: #3f6fe8;
        }


        .profile-name-save:disabled,
        .profile-name-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }


        .profile-name-cancel {
          width: 31px;
          height: 31px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #e1e6ee;
          border-radius: 7px;
          color: #68758a;
          background: #ffffff;
          cursor: pointer;
          flex-shrink: 0;
        }


        .profile-name-cancel:hover {
          background: #f5f7fa;
        }


        .profile-name-error {
          padding: 7px 13px;
          border-bottom: 1px solid #edf0f5;
          color: #b44747;
          background: #fff7f7;
          font-size: 9px;
          line-height: 1.4;
        }


        .profile-role {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          padding: 0 9px;
          border-radius: 6px;
          color: #64748b !important;
          background: #f0f2f5;
          font-size: 10px !important;
          font-weight: 750 !important;
        }


        .profile-role.admin {
          color: #4f6fc4 !important;
          background: #eef4ff;
        }


        .profile-security {
          margin-top: 18px;
          padding: 13px 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid #dcefe4;
          border-radius: 10px;
          background: #f4fbf7;
        }


        .profile-security-icon {
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #15965a;
          background: #e5f7ed;
        }


        .profile-security-content {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .profile-security-content strong {
          color: #18794e;
          font-size: 11px;
          font-weight: 750;
        }


        .profile-security-content span {
          color: #658172;
          font-size: 10px;
          line-height: 1.45;
        }


        .profile-security-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #15965a;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }


        /* =====================================
           DANGER ZONE
           ===================================== */

        .profile-danger-zone {
          margin-top: 22px;
          padding: 16px;
          border: 1px solid #f0d9d9;
          border-radius: 11px;
          background: linear-gradient(
            180deg,
            #fffafa 0%,
            #fff7f7 100%
          );
        }


        .profile-danger-header {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }


        .profile-danger-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #c65353;
          background: #fdeaea;
          border: 1px solid #f5d6d6;
        }


        .profile-danger-eyebrow {
          display: block;
          margin-bottom: 3px;
          color: #b44747;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.25px;
        }


        .profile-danger-header h3 {
          margin: 0;
          color: #7f3030;
          font-size: 13px;
          font-weight: 800;
        }


        .profile-danger-header p {
          margin: 4px 0 0;
          color: #9a6868;
          font-size: 10px;
          line-height: 1.45;
        }


        .profile-danger-content {
          margin-top: 14px;
          padding-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid #f2dddd;
        }


        .profile-danger-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }


        .profile-danger-copy strong {
          color: #6f3434;
          font-size: 10px;
          font-weight: 750;
        }


        .profile-danger-copy span {
          color: #9a6868;
          font-size: 9px;
          line-height: 1.45;
        }


        .profile-delete-button {
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 0 12px;
          border: 1px solid #d65b5b;
          border-radius: 7px;
          color: #ffffff;
          background: #c94d4d;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(180, 60, 60, 0.12);
        }


        .profile-delete-button:hover {
          background: #b94141;
          border-color: #b94141;
        }


        .profile-delete-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }


        .profile-delete-error {
          margin-top: 12px;
          padding: 9px 10px;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #f0d0d0;
          border-radius: 7px;
          color: #a43e3e;
          background: #fff1f1;
          font-size: 9px;
          font-weight: 650;
          line-height: 1.4;
        }


        .profile-delete-error svg {
          flex-shrink: 0;
        }


        .profile-loading {
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e7ebf2;
          border-radius: 14px;
          color: #68758a;
          background: #ffffff;
          font-size: 11px;
        }


        .profile-loading-spinner {
          animation: profile-spin 0.9s linear infinite;
        }


        @keyframes profile-spin {

          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }

        }


        .profile-error {
          padding: 16px;
          border: 1px solid #f0d8d8;
          border-radius: 10px;
          color: #b44747;
          background: #fff7f7;
          font-size: 11px;
        }


        @media (max-width: 760px) {

          .profile-page {
            padding: 22px 18px 36px;
          }


          .profile-card {
            padding: 0 17px 18px;
          }


          .profile-card-header {
            min-height: 96px;
          }


          .profile-header-status {
            display: none;
          }


          .profile-danger-content {
            align-items: stretch;
            flex-direction: column;
          }


          .profile-delete-button {
            width: 100%;
          }

        }


        @media (max-width: 520px) {

          .profile-page-header h1 {
            font-size: 24px;
          }


          .profile-card-header {
            align-items: flex-start;
            padding: 19px 0;
          }


          .profile-image-actions {
            align-items: stretch;
            flex-direction: column;
          }


          .profile-image-buttons {
            width: 100%;
          }


          .profile-image-cancel,
          .profile-image-upload {
            flex: 1;
          }


          .profile-information-item {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
            padding: 10px 12px;
          }


          .profile-information-item strong {
            max-width: 100%;
            padding-left: 24px;
            text-align: left;
          }


          .profile-name-display {
            width: 100%;
            max-width: 100%;
            justify-content: flex-start;
            padding-left: 24px;
          }


          .profile-name-editor {
            width: 100%;
            max-width: 100%;
            padding-left: 24px;
            justify-content: flex-start;
            flex-wrap: wrap;
          }


          .profile-name-input {
            width: 100%;
            flex: 1;
            min-width: 160px;
          }


          .profile-name-error {
            padding-left: 36px;
          }


          .profile-security {
            align-items: flex-start;
          }


          .profile-security-status {
            display: none;
          }


          .profile-danger-zone {
            padding: 14px;
          }

        }

      `}</style>

    </div>

  );

};


export default Profile;