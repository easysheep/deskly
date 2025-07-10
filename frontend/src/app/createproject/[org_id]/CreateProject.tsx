"use client";
import ProjectsList from "@/app/projectlist/[org_id]/page";
import React, { useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilZoom } from "@coreui/icons";
import { Card, Typography } from "@material-tailwind/react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
} from "@coreui/react";

import {
  cilChevronCircleRightAlt,
  cilSettings,
  cilBell,
  cilFilter,
  cilOptions,
} from "@coreui/icons";
import { toast } from "react-hot-toast";
interface CreateProjectProps {
  org_id: string; // org_id passed as a prop
}

interface FormData {
  project_name: string;
  description: string;
  task_ids: string; // We'll parse this to an array before sending to the API
  team_id: string;
}

const CreateProject: React.FC<CreateProjectProps> = ({ org_id }) => {
  const [formData, setFormData] = useState<FormData>({
    project_name: "",
    description: "",
    task_ids: "",
    team_id: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formVisible, setFormVisible] = useState<boolean>(false); // Track form visibility

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const org_id = localStorage.getItem("orgId"); // Retrieve org_id from localStorage

    if (!org_id) {
      setErrorMessage(
        "Organization ID is missing. Please refresh and try again."
      );
      setLoading(false);
      return;
    }

    const taskIdsArray = formData.task_ids
      .split(",")
      .map((id) => parseInt(id.trim()));

    await toast.promise(
      fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: formData.project_name,
          description: formData.description,
          task_ids: taskIdsArray,
          team_id: parseInt(formData.team_id),
          org_id: parseInt(org_id), // Ensure org_id is a number
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create project.");
        }
        return response.json();
      }),
      {
        loading: "Creating project...",
        success: "Project created successfully!",
        error: (err:any) => err.message || "Failed to create project.",
      }
    );

    setFormData({
      project_name: "",
      description: "",
      task_ids: "",
      team_id: "",
    });

    setFormVisible(false); // Hide the modal after successful submission
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] w-full ">
      <div className="flex items-center justify-between w-full py-2 px-2">
        {/* Left Section: Title */}
        <h2 className="font-bold font-spaceGrotesk text-2xl">Projects</h2>

        {/* Right Section: Input and Button */}
        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative w-[600px]">
            <CIcon
              icon={cilZoom}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-16 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search for projects in this organization"
            />
          </div>
          <CIcon
            customClassName="nav-icon cursor-pointer h-[25px]"
            icon={cilFilter}
            className="text-gray-600 cursor-pointer" // Ensure consistent size
          />
          {/* Add Project Button */}
          <button
            className="rounded bg-gradient-to-r from-[#f70cc0] to-[#a10080] text-white px-2.5 py-2 text-sm font-mono shadow-md hover:opacity-90 transition"
            type="button"
            onClick={() => {
              const role = localStorage.getItem("role"); // Get role from localStorage
              if (role !== "admin") {
                toast.error(
                  <div className="text-red-500 font-bold text-center">
                    Access Denied! <br />
                    You do not have admin privileges.
                  </div>,
                  { duration: 3000 }
                );
                return;
              }
              setFormVisible(true);
            }}
          >
            Add Project
          </button>
        </div>
      </div>

      {/* Modal */}
      {formVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded focus:ring-[#AC46B9] focus:border-[#AC46B9]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded focus:ring-[#AC46B9] focus:border-[#AC46B9]"
                  required
                />
              </div>
              {successMessage && (
                <p className="text-green-600 mb-4">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-600 mb-4">{errorMessage}</p>
              )}

              {/* <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                 
                  className="bg-[#5B6571] text-white py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4B49B6] text-white py-2 px-4 rounded hover:bg-purple-700"
                >
                 
                </button>
              </div> */}
              <CCol className="d-flex justify-content-end mt-3">
                <CButton
                  color="secondary"
                  onClick={() => setFormVisible(false)}
                  className="mr-2"
                >
                  Cancel
                </CButton>
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </CButton>
              </CCol>
            </form>
          </div>
        </div>
      )}

      {/* Scrollable Project List */}
      <div className="overflow-y-auto h-[85vh] w-full px-1 py-3 ">
        <ProjectsList org_id={org_id} />
      </div>
    </div>
  );
};

export default CreateProject;
