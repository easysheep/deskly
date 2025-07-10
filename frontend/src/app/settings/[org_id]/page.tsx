"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import Chat from "@/components/Chat";
import CIcon from "@coreui/icons-react";
import {
  cilZoom,
  cilChevronCircleRightAlt,
  cilSettings,
  cilBell,
  cilArrowCircleRight,
} from "@coreui/icons";
import { Card, Typography } from "@material-tailwind/react";
import { UserButton, useUser } from "@clerk/nextjs";
import LoadingAnimation from "@/components/LoadingAnimations";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
} from "@coreui/react";

interface User {
  user_id: number;
  username: string;
  role: string;
  jobtitle: string;
  joindate: string;
  created_at: string;
}

interface UserDetails {
  username: string;
  password: string;
}

const Settings: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserDetails>>({
    username: "",
    password: "",
  });
  const [orgName, setOrgName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const userId = localStorage.getItem("userId");
  const org_id = localStorage.getItem("orgId");
  const router = useRouter(); // Initialize router for redirection

  useEffect(() => {
    const fetchUser = async (userId: string | null) => {
      if (!userId) {
        setError("No user ID provided");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/users?id=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data = await response.json();

        console.log("Fetched User:", data);
        setUser(data);
        setFormData({
          username: data.username,
          password: data.password,
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    const storedUserId = localStorage.getItem("userId");
    fetchUser(storedUserId);
  }, []); // Runs once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<UserDetails>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/check-user?id=${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user details");
        }

        const updatedUser = await response.json();
        setUser(updatedUser);
        setError(null);
        resolve("User updated successfully");
      } catch (err: any) {
        reject("Failed to update user");
      }
    });

    toast.promise(updatePromise, {
      loading: "Updating user...",
      success: "User updated successfully!",
      error: "Failed to update user.",
    });
  };

  useEffect(() => {
    // Fetch org name from localStorage on mount
    const storedOrgName = localStorage.getItem("orgname");
    if (storedOrgName) setOrgName(storedOrgName);
  }, []);

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgName(e.target.value);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true); // Show delete confirmation modal
  };

  const updateOrgName = async () => {
    try {
      const orgId = localStorage.getItem("orgId");
      if (!orgId) {
        toast.error("Organization ID not found!");
        return;
      }

      const updatePromise = fetch(`/api/organization?id=${orgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_name: orgName }),
      });

      await toast.promise(updatePromise, {
        loading: "Updating organization name...",
        success: "Organization name updated successfully!",
        error: "Failed to update organization name.",
      });

      localStorage.setItem("org_name", orgName);
    } catch (error) {
      console.error("Error updating organization name:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const confirmAndDeleteOrg = async () => {
    const orgId = localStorage.getItem("orgId");
   

    if (!orgId) {
      toast.error("Organization ID not found!");
      return;
    }

    try {
      const deletePromise = fetch(`/api/organization?id=${orgId}`, {
        method: "DELETE",
      });

      await toast.promise(deletePromise, {
        loading: "Deleting organization...",
        success: "Organization deleted successfully!",
        error: "Failed to delete organization.",
      });

      localStorage.removeItem("orgId");
      localStorage.removeItem("org_name");
      setOrgName(""); // Reset state

      router.push("/"); // Redirect to home page after deletion
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className=" flex space-x-4">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-grow ">
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-zz">
            Update Organization Name
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                name="orgName"
                value={orgName}
                onChange={handleOrgNameChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-zz focus:border-zz"
              />
            </div>
          </div>
          <button
            onClick={updateOrgName}
            className="mt-4 px-4 py-2 rounded-md text-white bg-zz hover:bg-opacity-90"
          >
            Update Organization Name
          </button>
        </div>

        {/* Delete Organization Section */}
        <div className="mt-2 bg-white px-4 py-1 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-purple-300">
            Delete Organization
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Click "Delete Organization" to initiate the deletion process.
          </p>
          <button
            onClick={handleDeleteClick}
            className="mt-4 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Delete Organization
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold text-purple-300">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Type "<strong>{orgName}</strong>" to confirm deletion.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder={`Type "${orgName}"`}
              />
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndDeleteOrg}
                  className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
