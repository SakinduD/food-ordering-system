import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/userContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User, Mail, Shield, Edit2, Calendar, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

// API base URL - makes it easier to change in development/production
const API_BASE_URL = "http://localhost:5010/api";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // State for tabs
  const [deleteConfirm, setDeleteConfirm] = useState(false); // State for delete confirmation
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setApiError(false);
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Authentication token missing. Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add timeout to prevent long waits on connection issues
          timeout: 5000,
        });

        console.log("Profile data:", response.data);
        setProfile(response.data);
        
        // Pre-fill the form when profile is loaded
        setEditForm({
          name: response.data.name || "",
          email: response.data.email || "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);

        // Handle different error types
        if (
          error.code === "ECONNREFUSED" ||
          error.message.includes("Network Error")
        ) {
          setApiError(true);
          toast.error("Cannot connect to server. Is it running?");
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          // Redirect to login
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Validate form data
  const validateForm = () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (activeTab === "security" && editForm.newPassword) {
      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error("New passwords do not match");
        return false;
      }
      if (editForm.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
    }

    return true;
  };

  // Handle edit mode
  const handleEdit = () => {
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(true);
  };

  // Update profile function
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication failed. Please login again.");
      return;
    }

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
      };

      // Add new password if provided
      if (editForm.newPassword) {
        updateData.password = editForm.newPassword;
      }

      const response = await axios({
        method: "put",
        url: `${API_BASE_URL}/users/${profile.userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: updateData,
      });

      if (response.data) {
        setProfile(response.data);
        setUser((prev) => ({
          ...prev,
          name: response.data.name,
          email: response.data.email,
        }));

        toast.success("Profile updated successfully");
        setIsEditing(false);
        setEditForm({
          name: response.data.name,
          email: response.data.email,
          newPassword: "",
          confirmPassword: "",
        });

        // If password was changed, show additional notification
        if (editForm.newPassword) {
          toast.success("Password updated successfully", {
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication failed. Please login again.");
      return;
    }

    try {
      const updateData = {
        password: editForm.newPassword,
      };

      const response = await axios({
        method: "put",
        url: `${API_BASE_URL}/users/${profile.userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: updateData,
      });

      if (response.data) {
        toast.success("Password updated successfully");
        setEditForm({
          ...editForm,
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      await axios({
        method: "delete",
        url: `${API_BASE_URL}/users/${profile.userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear user data and token
      localStorage.removeItem("token");
      setUser(null);
      
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Account deletion failed:", error);
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this account");
      } else {
        toast.error("Failed to delete account. Please try again later.");
      }
      setDeleteConfirm(false);
    }
  };

  // Format date function for "member since" display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Connection Error
            </h2>
            <p className="text-gray-700 mb-6">
              We're having trouble connecting to our servers. Please check your
              internet connection or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Profile Unavailable
            </h2>
            <p className="text-gray-700 mb-6">
              Unable to load your profile information at this time.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header & Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-orange-400 to-orange-600 p-8 text-center">
              <div className="h-32 w-32 rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
                <User className="h-20 w-20 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-orange-100 mt-1">
                {profile.role || "Customer"}
              </p>

              <div className="mt-6 flex justify-center space-x-3">
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-white text-orange-500 hover:bg-orange-50 rounded-lg transition-colors flex items-center font-medium"
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 md:w-2/3">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`pb-3 px-4 font-medium text-sm ${
                    activeTab === "profile"
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile Information
                </button>
                <button
                  className={`pb-3 px-4 font-medium text-sm ${
                    activeTab === "activity"
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  Activity
                </button>
                <button
                  className={`pb-3 px-4 font-medium text-sm ${
                    activeTab === "security"
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  Security
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "profile" &&
                (isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">
                          Full Name
                        </p>
                        <p className="text-lg font-medium">{profile.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">
                          Email Address
                        </p>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-lg">{profile.email}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">
                          Member Since
                        </p>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span>
                            {profile.createdAt
                              ? formatDate(profile.createdAt)
                              : "Not available"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">
                          Role
                        </p>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-gray-400" />
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                              profile.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : profile.role === "restaurant"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {profile.role || "Customer"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {profile.role === "restaurant" && (
                      <div className="mt-6 border-t border-gray-100 pt-6">
                        <Link
                          to="/restaurant-profile"
                          className="inline-flex items-center px-4 py-2 border border-orange-300 text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100"
                        >
                          Manage Restaurant Profile
                        </Link>
                      </div>
                    )}
                  </div>
                ))}

              {activeTab === "activity" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Recent Activity
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Activity history will appear here
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Your Reviews
                    </h3>
                    <Link
                      to="/profile/reviews"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Star className="h-5 w-5" /> View Your Restaurant Reviews
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Change Password
                    </h3>
                    <form className="space-y-4" onSubmit={handlePasswordUpdate}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={editForm.newPassword}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={editForm.confirmPassword}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Account Settings
                    </h3>
                    {deleteConfirm ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 mb-4">
                          Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="w-full px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        onClick={() => setDeleteConfirm(true)}
                      >
                        Delete Account
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order History Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Order History
            </h2>
            <Link
              to="/orders"
              className="text-orange-500 hover:text-orange-700 font-medium"
            >
              View All Orders
            </Link>
          </div>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Your recent orders will appear here</p>
            <Link
              to="/menu"
              className="mt-4 inline-block text-orange-500 hover:text-orange-700 font-medium"
            >
              Browse menu to place an order
            </Link>
          </div>
        </div>

        {/* Reviews Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Reviews
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Share your experiences and help others make better food choices.
          </p>
          <Link
            to="/profile/reviews"
            className="px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center w-full sm:w-auto"
          >
            <FaStar className="mr-2" /> View Your Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;