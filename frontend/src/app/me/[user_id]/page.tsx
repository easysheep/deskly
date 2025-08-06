"use client";

import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Eye, EyeOff } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimations";

import toast from "react-hot-toast";
interface UserDetails {
  id: string;
  user_id: string;
  org_id: string;
  username: string;
  password: string;
  role: string;
  jobtitle: string;
  createdAt: string;
  created_at: string;
  teams: number[];
  projects: number[];
}

interface Team {
  team_id: number;
  team_name: string;
  team_members: number[];
}

interface Project {
  project_id: number;
  project_name: string;
}

interface Task {
  task_id: number;
  task_name: string;
  org_id: string;
  assignee_id: string[];
}

const Me: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserDetails>>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // const router = useRouter();
  const userId = localStorage.getItem("userId");
  const org_id = localStorage.getItem("orgId");

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

  useEffect(() => {
    if (!user) return; // Ensure user is fetched before running this effect

    const fetchTeams = async () => {
      try {
        const response = await fetch(`/api/teams?org_id=${org_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const teamsData = await response.json();

        console.log("Fetched Teams:", teamsData);
        console.log("User ID:", user?.user_id);

        const filteredTeams = teamsData.filter(
          (team: Team) => team.team_members.includes(Number(user?.user_id))
        );

        console.log("Filtered Teams:", filteredTeams);
        setTeams(filteredTeams);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projectlist?org_id=${org_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();

        const filteredProjects = data.filter((project: Project) =>
          user?.projects.includes(Number(project.project_id))
        );

        setProjects(filteredProjects);
        console.log("Projects:", JSON.stringify(data, null, 2));
        console.log("Filtered Projects:", filteredProjects);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData = await response.json();

        // Step 1: Filter tasks by `org_id`
        const orgFilteredTasks = tasksData.filter(
          (task: Task) => task.org_id === user?.org_id
        );

        // Step 2: Filter tasks where `assignee_id` includes `user.user_id`
        const assignedTasks = orgFilteredTasks.filter(
          (task: Task) => task.assignee_id && task.assignee_id.includes(user?.user_id || '')
        );

        setTasks(assignedTasks);
        console.log("Filtered Tasks:", assignedTasks);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTeams().then(fetchProjects).then(fetchTasks);
  }, [user]); // Runs when `user` is set

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  if (loading) {
    return <LoadingAnimation></LoadingAnimation>;
  }

  return (
    <div className="flex space-x-4">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 h-">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="h-[56.8px] px-4 py-2">

          <div className="bg-zz text-white px-4 py-2 rounded-lg shadow-md">
            <h1 className="text-xl font-bold font-dm">User Details</h1>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-4 font-spaceGrotesk">
                <p>
                  <span className="font-semibold mr-3">Username:</span>{" "}
                  {user?.username}
                </p>
                <p>
                  <span className="font-semibold mr-3">Job Title:</span>{" "}
                  {user?.jobtitle || "N/A"}
                </p>
                <p>
                  <span className="font-semibold mr-3">Role:</span>{" "}
                  {user?.role || "N/A"}
                </p>
                <p>
                  <span className="font-semibold mr-3">Created At:</span>{" "}
                  {user?.created_at
                    ? new Date(user?.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-zz">Update User Details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-zz focus:border-zz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-zz focus:border-zz"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              className="mt-4 px-4 py-2 rounded-md text-white bg-zz hover:bg-opacity-90"
            >
              Update Changes
            </button>
          </div>

          {/* Tasks & Teams Section */}

          {localStorage.getItem("role") === "employee" && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-zz">Teams</h2>
                <ul className="mt-2 space-y-2">
                  {loading ? (
                    <p>Loading teams...</p>
                  ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : teams.length > 0 ? (
                    teams.map((team, index) => (
                      <li
                        key={index}
                        className="p-2 bg-gray-100 rounded-md shadow-sm font-spaceGrotesk"
                      >
                        {team?.team_name}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No teams joined.</p>
                  )}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-zz">Projects</h2>
                <ul className="mt-2 space-y-2">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <li
                        key={index}
                        className="p-2 bg-gray-100 rounded-md shadow-sm font-spaceGrotesk"
                      >
                        {project.project_name}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No projects assigned.
                    </p>
                  )}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-zz">Tasks</h2>
                <ul className="mt-2 space-y-2">
                  {tasks.length > 0 ? (
                    tasks.map((task, index) => (
                      <li
                        key={index}
                        className="p-2 bg-gray-100 rounded-md shadow-sm font-spaceGrotesk"
                      >
                        {task?.task_name}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tasks assigned.</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Me;
