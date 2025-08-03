"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
const Join: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginPromise = (async () => {
      // Send request to backend to check if user exists
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.org_id) {
        // User exists, save data to localStorage
        localStorage.setItem("username", username);
        localStorage.setItem("role", data.role); // assuming role is returned from the backend
        localStorage.setItem("orgId", data.org_id);
        localStorage.setItem("orgname", data.org_name);
        localStorage.setItem("userId", data.user_id); // Save user_id as userId

        // Redirect to orgboard page with the organization ID
        router.push(`/orgboard/${data.org_id}`);
        console.log(data);
        return data;
      } else {
        // If user does not exist or error occurred, throw error to be caught
        throw new Error(data.error || "An error occurred");
      }
    })();

    toast
      .promise(loginPromise, {
        loading: "Logging in...",
        success: "Logged in successfully!",
        error: "Failed to log in.",
      })
      .catch((err) => {
        console.error("Error during login:", err);
        setError("An unexpected error occurred");
      });
  };

  return (
    <div
      className="mx-auto bg-white rounded-xl shadow-md space-y-4 w-full h-screen flex"
      style={{
        backgroundImage: "url('/join.svg')",
        backgroundSize: "cover", // Ensures full screen coverage
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", // Prevents tiling
      }}
    >
      <Link href="/admin">
        <button className="px-4 py-2 top-4 right-4 absolute bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-full transition-all hover:from-[#a10080] hover:to-[#c8009c] hover:border-2 hover:border-white">
          Create Organization
        </button>
      </Link>
      <div className="w-5/12 h-screen"></div>

      {/* Form moved to the right side */}
      <div className="w-7/12">
        <div className="flex flex-col py-12 px-6 h-screen">
          <h1 className="text-6xl font-extrabold text-gray-800">Join</h1>
          <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <p>Organization</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white bg-opacity-70 p-6 rounded-lg shadow-sm w-full max-w-lg mt-10"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-full transition-all hover:from-[#a10080] hover:to-[#c8009c]"
            >
              Join Organization
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Join;
