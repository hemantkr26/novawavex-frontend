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

    if (uploadingImage) {
      return;
    }


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

    if (uploadingImage) {
      return;
    }


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


    if (uploadingImage) {

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
   */

  const handleDeleteAccount = async () => {

    if (deletingAccount) {

      return;

    }


    setDeleteError("");


    const firstConfirmation =
      window.confirm(
        "Delete your NovaWavex account?\n\nThis action permanently removes your account and cannot be undone."
      );


    if (!firstConfirmation) {

      return;

    }


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


      await userService.deleteCurrentUser();


      logout();


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

          <div
            className={
              `profile-avatar-wrapper${
                imagePreview
                  ? " profile-avatar-wrapper-preview"
                  : ""
              }`
            }
          >

            <div className="profile-avatar-ring">

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
                  alt={
                    fullName !== "Not available"
                      ? `${fullName} profile`
                      : "Profile"
                  }
                  className="profile-avatar-image"
                  onError={
                    imagePreview
                      ? undefined
                      : handleProfileImageError
                  }
                />

              ) : (

                <div
                  className="profile-avatar-large"
                  aria-hidden="true"
                >

                  {avatarInitials}

                </div>

              )}

            </div>


            <button
              type="button"
              className="profile-avatar-camera"
              onClick={openFileSelector}
              disabled={uploadingImage}
              title="Change profile image"
              aria-label="Change profile image"
            >

              {uploadingImage ? (

                <Loader2
                  size={13}
                  className="profile-loading-spinner"
                />

              ) : (

                <Camera size={13} />

              )}

            </button>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="profile-image-input"
              aria-label="Choose profile image"
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

          <div
            className="profile-image-actions"
            aria-live="polite"
          >

            <div className="profile-image-selected">

              <div className="profile-image-file-icon">
                <Upload size={13} />
              </div>

              <div className="profile-image-file-copy">

                <span>
                  {selectedImage.name}
                </span>

                <small>
                  Image selected • Ready to upload
                </small>

              </div>

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
                aria-busy={uploadingImage}
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

          <div
            className="profile-image-success"
            role="status"
            aria-live="polite"
          >

            <CheckCircle2 size={14} />

            <span>
              {imageMessage}
            </span>

          </div>

        )}


        {imageError && (

          <div
            className="profile-image-error"
            role="alert"
            aria-live="assertive"
          >

            <AlertTriangle size={14} />

            <span>
              {imageError}
            </span>

          </div>

        )}


        {/* ===================================
            NAME MESSAGE
            =================================== */}

        {nameMessage && (

          <div
            className="profile-image-success"
            role="status"
            aria-live="polite"
          >

            <CheckCircle2 size={14} />

            <span>
              {nameMessage}
            </span>

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

            <div
              className={
                `profile-information-item${
                  editingName
                    ? " profile-information-item-editing"
                    : ""
                }`
              }
            >

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
                    aria-label="Full name"
                  />


                  <button
                    type="button"
                    className="profile-name-save"
                    onClick={handleSaveName}
                    disabled={savingName}
                    title="Save name"
                    aria-busy={savingName}
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
                    aria-label="Cancel name editing"
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
                    aria-label="Edit full name"
                  >

                    <Pencil size={13} />

                    Edit

                  </button>

                </div>

              )}

            </div>


            {nameError && (

              <div
                className="profile-name-error"
                role="alert"
                aria-live="assertive"
              >

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
              aria-busy={deletingAccount}
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

            <div
              className="profile-delete-error"
              role="alert"
              aria-live="assertive"
            >

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
          animation: profile-header-enter 0.45s ease both;
        }


        @keyframes profile-header-enter {

          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

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
          animation: profile-card-enter 0.5s ease 0.04s both;
        }


        @keyframes profile-card-enter {

          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        .profile-card-header {
          min-height: 108px;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
        }


        /* =====================================
           PROFILE IMAGE POLISH
           ===================================== */

        .profile-avatar-wrapper {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          position: relative;
          border-radius: 16px;
          isolation: isolate;
          transition:
            transform 0.22s ease,
            filter 0.22s ease;
        }


        .profile-avatar-wrapper:hover {
          transform: translateY(-1px);
          filter: brightness(1.01);
        }


        .profile-avatar-wrapper::before {
          content: "";
          position: absolute;
          inset: -3px;
          z-index: -1;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(79, 125, 243, 0.34),
              rgba(79, 125, 243, 0.05) 55%,
              rgba(120, 150, 230, 0.24)
            );
          opacity: 0.72;
          transition:
            opacity 0.22s ease,
            transform 0.22s ease;
        }


        .profile-avatar-wrapper:hover::before {
          opacity: 0.95;
          transform: scale(1.025);
        }


        .profile-avatar-ring {
          width: 58px;
          height: 58px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
          border-radius: 15px;
          background: #eef4ff;
          border: 1px solid #dce7ff;
          box-shadow:
            0 2px 7px rgba(45, 75, 130, 0.07);
          transition:
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }


        .profile-avatar-wrapper:hover
        .profile-avatar-ring {
          border-color: #cbdcff;
          box-shadow:
            0 7px 18px rgba(30, 50, 90, 0.13);
        }


        .profile-avatar-wrapper-preview {
          animation: profile-avatar-preview 0.35s ease both;
        }


        .profile-avatar-wrapper-preview::before {
          opacity: 1;
          animation: profile-avatar-ring-pulse 0.7s ease both;
        }


        @keyframes profile-avatar-preview {

          from {
            opacity: 0.7;
            transform: scale(0.94);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }

        }


        @keyframes profile-avatar-ring-pulse {

          0% {
            opacity: 0.35;
            transform: scale(0.96);
          }

          55% {
            opacity: 1;
            transform: scale(1.04);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }

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
          background:
            linear-gradient(
              145deg,
              #f3f7ff,
              #e9f0ff
            );
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.4px;
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }


        .profile-avatar-wrapper:hover
        .profile-avatar-large {
          transform: scale(1.025);
          box-shadow:
            inset 0 0 0 1px rgba(79, 125, 243, 0.05);
        }


        .profile-avatar-image {
          width: 58px;
          height: 58px;
          display: block;
          object-fit: cover;
          border-radius: 14px;
          background: #eef4ff;
          transition:
            transform 0.28s ease,
            filter 0.28s ease,
            opacity 0.25s ease;
        }


        .profile-avatar-wrapper:hover
        .profile-avatar-image {
          transform: scale(1.045);
          filter: brightness(1.035) saturate(1.02);
        }


        .profile-avatar-camera {
          position: absolute;
          right: -6px;
          bottom: -6px;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 2px solid #ffffff;
          border-radius: 50%;
          color: #ffffff;
          background: #4f7df3;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(30, 50, 90, 0.18);
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }


        .profile-avatar-camera:hover {
          background: #3f6fe8;
          transform: scale(1.1);
          box-shadow:
            0 4px 11px rgba(30, 50, 90, 0.23);
        }


        .profile-avatar-camera:active {
          transform: scale(0.92);
        }


        .profile-avatar-camera:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }


        .profile-avatar-camera:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }


        .profile-image-input {
          display: none;
        }


        /* =====================================
           IMAGE SELECTION PANEL
           ===================================== */

        .profile-image-actions {
          margin: 0 0 16px;
          padding: 11px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          position: relative;
          overflow: hidden;
          border: 1px solid #e4eaf4;
          border-radius: 9px;
          background:
            linear-gradient(
              135deg,
              #f8faff,
              #f5f8fd
            );
          box-shadow:
            0 2px 7px rgba(40, 65, 110, 0.035);
          animation: profile-image-panel-enter 0.28s ease both;
        }


        .profile-image-actions::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: #4f7df3;
          opacity: 0.72;
        }


        @keyframes profile-image-panel-enter {

          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        .profile-image-selected {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }


        .profile-image-file-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          color: #4f7df3;
          background: #eaf1ff;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }


        .profile-image-actions:hover
        .profile-image-file-icon {
          transform: translateY(-1px);
          box-shadow:
            0 3px 8px rgba(79, 125, 243, 0.10);
        }


        .profile-image-file-copy {
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
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }


        .profile-image-cancel {
          border: 1px solid #e1e6ee;
          color: #68758a;
          background: #ffffff;
        }


        .profile-image-cancel:hover {
          background: #f5f7fa;
          border-color: #d8e0ec;
          transform: translateY(-1px);
          box-shadow:
            0 3px 8px rgba(40, 55, 80, 0.06);
        }


        .profile-image-cancel:active {
          transform: scale(0.97);
        }


        .profile-image-upload {
          position: relative;
          overflow: hidden;
          border: 1px solid #4f7df3;
          color: #ffffff;
          background: #4f7df3;
        }


        .profile-image-upload:hover {
          background: #3f6fe8;
          box-shadow:
            0 4px 10px rgba(79, 125, 243, 0.18);
          transform: translateY(-1px);
        }


        .profile-image-upload:active {
          transform: scale(0.97);
        }


        .profile-image-upload:disabled,
        .profile-image-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }


        .profile-image-upload::after {
          content: "";
          position: absolute;
          left: -100%;
          top: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.24),
            transparent
          );
          pointer-events: none;
        }


        .profile-image-upload:disabled::after {
          animation: profile-upload-shimmer 1.2s linear infinite;
        }


        @keyframes profile-upload-shimmer {

          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(340%);
          }

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
          animation: profile-message-enter 0.25s ease both;
        }


        .profile-image-success svg {
          flex-shrink: 0;
          animation: profile-success-pop 0.35s ease both;
        }


        @keyframes profile-success-pop {

          0% {
            opacity: 0;
            transform: scale(0.65);
          }

          70% {
            transform: scale(1.12);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }

        }


        .profile-image-error {
          margin-bottom: 15px;
          padding: 9px 11px;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #f0d8d8;
          border-radius: 8px;
          color: #b44747;
          background: #fff7f7;
          font-size: 10px;
          line-height: 1.4;
          animation: profile-message-enter 0.25s ease both;
        }


        .profile-image-error svg {
          flex-shrink: 0;
        }


        @keyframes profile-message-enter {

          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

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
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .profile-section-heading:hover
        .profile-section-icon {
          transform: translateY(-1px);
          box-shadow:
            0 4px 10px rgba(79, 125, 243, 0.10);
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
          transition:
            background 0.18s ease;
        }


        .profile-information-item:hover {
          background: #f8faff;
        }


        .profile-information-item:last-child {
          border-bottom: 0;
        }


        /*
         * =====================================
         * FULL NAME EDITOR FIX
         * =====================================
         *
         * The label and editor now occupy separate
         * flexible areas so the input cannot cover
         * the "Full Name" label.
         */

        .profile-information-item-editing {
          align-items: center;
          gap: 24px;
        }


        .profile-information-label {
          min-width: 105px;
          flex: 0 0 auto;
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
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }


        .profile-name-display strong {
          min-width: 0;
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
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            border-color 0.16s ease;
        }


        .profile-name-edit:hover {
          background: #eef4ff;
          border-color: #cddcff;
          transform: translateY(-1px);
        }


        .profile-name-edit:active {
          transform: translateY(0);
        }


        .profile-name-edit:focus-visible,
        .profile-name-save:focus-visible,
        .profile-name-cancel:focus-visible,
        .profile-image-upload:focus-visible,
        .profile-image-cancel:focus-visible,
        .profile-delete-button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }


        /*
         * =====================================
         * FULL NAME EDITOR
         * =====================================
         */

        .profile-name-editor {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }


        .profile-name-input {
          width: 210px;
          min-width: 0;
          min-height: 31px;
          flex: 1 1 210px;
          box-sizing: border-box;
          padding: 0 9px;
          border: 1px solid #cbd6e8;
          border-radius: 7px;
          outline: none;
          color: #25324a;
          background: #ffffff;
          font-size: 11px;
          font-weight: 550;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .profile-name-input:focus {
          border-color: #4f7df3;
          box-shadow:
            0 0 0 2px rgba(79, 125, 243, 0.10);
        }


        .profile-name-input:disabled {
          opacity: 0.65;
          background: #f5f7fa;
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
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            box-shadow 0.16s ease;
        }


        .profile-name-save:hover {
          background: #3f6fe8;
          transform: translateY(-1px);
          box-shadow:
            0 4px 10px rgba(79, 125, 243, 0.18);
        }


        .profile-name-save:active {
          transform: translateY(0);
        }


        .profile-name-save:disabled,
        .profile-name-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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
          transition:
            transform 0.16s ease,
            background 0.16s ease;
        }


        .profile-name-cancel:hover {
          background: #f5f7fa;
          transform: translateY(-1px);
        }


        .profile-name-cancel:active {
          transform: translateY(0);
        }


        .profile-name-error {
          padding: 7px 13px;
          border-bottom: 1px solid #edf0f5;
          color: #b44747;
          background: #fff7f7;
          font-size: 9px;
          line-height: 1.4;
          animation: profile-message-enter 0.25s ease both;
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
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }


        .profile-delete-button:hover {
          background: #b94141;
          border-color: #b94141;
          transform: translateY(-1px);
          box-shadow:
            0 5px 12px rgba(180, 60, 60, 0.16);
        }


        .profile-delete-button:active {
          transform: translateY(0);
        }


        .profile-delete-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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
          animation: profile-message-enter 0.25s ease both;
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
          animation: profile-message-enter 0.3s ease both;
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
          display: flex;
          align-items: center;
          border: 1px solid #f0d8d8;
          border-radius: 10px;
          color: #b44747;
          background: #fff7f7;
          font-size: 11px;
          animation: profile-message-enter 0.3s ease both;
        }


        /* =====================================
           REDUCED MOTION
           ===================================== */

        @media (prefers-reduced-motion: reduce) {

          .profile-page-header,
          .profile-card,
          .profile-avatar-wrapper-preview,
          .profile-image-actions,
          .profile-image-success,
          .profile-image-error,
          .profile-name-error,
          .profile-delete-error,
          .profile-loading,
          .profile-error {
            animation: none !important;
          }


          .profile-avatar-wrapper,
          .profile-avatar-wrapper::before,
          .profile-avatar-ring,
          .profile-avatar-large,
          .profile-avatar-image,
          .profile-avatar-camera,
          .profile-image-file-icon,
          .profile-image-cancel,
          .profile-image-upload,
          .profile-name-edit,
          .profile-name-save,
          .profile-name-cancel,
          .profile-delete-button,
          .profile-section-icon {
            transition: none !important;
            transform: none !important;
          }


          .profile-image-upload::after {
            display: none;
          }


          .profile-loading-spinner {
            animation: none !important;
          }


          .profile-image-success svg {
            animation: none !important;
          }

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


          /*
           * Keep Full Name label and editor
           * separated on tablet widths.
           */

          .profile-information-item-editing {
            align-items: flex-start;
          }


          .profile-information-item-editing
          .profile-information-label {
            min-width: 105px;
            padding-top: 8px;
          }


          .profile-name-editor {
            min-width: 0;
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


          .profile-image-selected {
            width: 100%;
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


          /*
           * Mobile Full Name editor:
           * label gets its own row, then the editor
           * gets a completely separate row.
           *
           * This prevents the input from hiding
           * the Full Name label or section content.
           */

          .profile-information-item-editing {
            gap: 8px;
          }


          .profile-information-item-editing
          .profile-information-label {
            width: 100%;
            min-width: 0;
            padding-top: 0;
          }


          .profile-name-editor {
            width: 100%;
            max-width: 100%;
            padding-left: 24px;
            box-sizing: border-box;
            justify-content: flex-start;
            flex-wrap: wrap;
          }


          .profile-name-input {
            width: 100%;
            flex: 1 1 100%;
            min-width: 0;
          }


          .profile-name-save {
            flex: 0 0 auto;
          }


          .profile-name-cancel {
            flex: 0 0 auto;
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