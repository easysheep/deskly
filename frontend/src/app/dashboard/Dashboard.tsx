"use client";
import React, { useState } from "react";

// Define the type for form data
interface FormData {
  username: string;
  email: string;
  password_hash: string;
  role: string;
  team_id: string;
}

const AddUserDashboard: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password_hash: "",
    role: "",
    team_id: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    try {
      const response = await fetch("/api/users", {
        method: "POST", // Send POST request
        headers: {
          "Content-Type": "application/json", // Specify that it's JSON data
        },
        body: JSON.stringify(formData), // Send the form data as JSON
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage("User created successfully!");
        setFormData({
          username: "",
          email: "",
          password_hash: "",
          role: "",
          team_id: "",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to create user.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Add New User</h2>
        {successMessage && (
          <p className="text-green-600 mb-4">{successMessage}</p>
        )}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password_hash"
              value={formData.password_hash}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a Role</option>
              <option value="admin">Admin</option>
              <option value="member">Employee</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="team_id"
              className="block font-medium text-gray-700"
            >
              Team ID
            </label>
            <input
              type="text"
              id="team_id"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserDashboard;
