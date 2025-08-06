"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Chat from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import LoadingAnimation from "@/components/LoadingAnimations";
import { cilSettings, cilBell, cilOptions } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { cilZoom } from "@coreui/icons";
import { UserButton, useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

interface Project {
  project_id: number;
  project_name: string;
  description: string;
  team_lead: string;
}

interface Task {
  task_id: number;
  project_id: number;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
}

interface User {
  user_id: number;
  username: string;
  org_id: string;
}

const ProjectPage = () => {
  const { project_id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const projectId = typeof project_id === "string" ? project_id : "";
  const [showModal, setShowModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const [newTask, setNewTask] = useState({
    task_name: "",
    description: "",
    due_date: "",
    status: "Pending",
    priority: "Medium",
  });

  const [users, setUsers] = useState<{ user_id: number; username: string }[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const handleChangeStatus = async (taskId: number, status: string) => {
    try {
      await toast.promise(
        fetch(`/api/tasks?id=${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
        {
          loading: "Updating status...",
          success: "Status updated successfully!",
          error: "Failed to update status",
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSetPriority = async (taskId: number, priority: string) => {
    try {
      await toast.promise(
        fetch(`/api/tasks?id=${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        }),
        {
          loading: "Updating priority...",
          success: "Priority updated successfully!",
          error: "Failed to update priority",
        }
      );
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const org_id = localStorage.getItem("orgId");

    const newTaskData = {
      ...newTask,
      project_id: Number(project_id),
      assignee_id: [], // Temporary hardcoded value; adjust as needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      org_id: Number(org_id),
    };

    await toast
      .promise(
        fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTaskData),
        }).then(async (response) => {
          if (!response.ok) throw new Error("Failed to create task");
          return response.json();
        }),
        {
          loading: "Creating task...",
          success: "Task created successfully!",
          error: "Failed to create task",
        }
      )
      .then((createdTask) => {
        setShowModal(false);
        setTasks((prevTasks) => [...prevTasks, createdTask]);

        setNewTask({
          task_name: "",
          description: "",
          due_date: "",
          status: "Pending",
          priority: "Medium",
        });
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const projectResponse = await fetch("/api/projects");
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projects: Project[] = await projectResponse.json();
        const matchedProject = projects.find(
          (p) => p.project_id === Number(project_id)
        );

        if (!matchedProject) {
          throw new Error("Project not found");
        }

        setProject(matchedProject);

        const tasksResponse = await fetch("/api/tasks");
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const tasksData: Task[] = await tasksResponse.json();
        const projectTasks = tasksData.filter(
          (task) => task.project_id === Number(project_id)
        );

        setTasks(projectTasks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [project_id]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      const orgId = Number(localStorage.getItem("orgId")); // Convert to number
      console.log("OrgId from localStorage (as number):", orgId);

      try {
        const response = await fetch(`/api/users`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const userData = await response.json();
        console.log("Fetched users:", userData);

        if (isMounted) {
          const filteredUsers = userData.filter(
            (user: User) => Number(user.org_id) === orgId
          ); // Compare as numbers
          console.log("Filtered users:", filteredUsers);

          setUsers(filteredUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", (err as Error).message);
      }
    };

    if (showAddMemberModal) {
      fetchUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [showAddMemberModal]);

  const handleAddToProject = async (userId: any) => {
    console.log("Attempting to add project to user:", { userId, project_id });

    await toast.promise(
      (async () => {
        // First PUT request to update the user with the project ID
        const userResponse = await fetch("/api/users", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, project_id }),
        });

        if (!userResponse.ok) {
          const userErrorDetails = await userResponse.text();
          console.error("Failed to update user:", userErrorDetails);
          throw new Error("Failed to add project to user");
        }

        const userData = await userResponse.json();
        console.log("User updated successfully:", userData);

        // Second PUT request to add the user_id to the assignee_id array in the tasks table
        const taskResponse = await fetch(`/api/tasks?id=${selectedTask}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignee_id: userId }),
        });

        if (!taskResponse.ok) {
          const taskErrorDetails = await taskResponse.text();
          console.error("Failed to update task:", taskErrorDetails);
          throw new Error("Failed to update task with assigned user");
        }

        const taskData = await taskResponse.json();
        console.log("Task updated successfully with assigned user:", taskData);
        return taskData;
      })(),
      {
        loading: "Adding user to project...",
        success: "User successfully added to project!",
        error: "Failed to add user to project",
      }
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    await toast.promise(
      (async () => {
        const response = await fetch(`/api/tasks?id=${taskId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        // Remove task from UI state
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.task_id !== taskId)
        );

        return "Task deleted successfully";
      })(),
      {
        loading: "Deleting task...",
        success: "Task deleted successfully!",
        error: "Failed to delete task",
      }
    );
  };

  if (loading) {
    return <LoadingAnimation></LoadingAnimation>;
  }

  if (error) {
    return <div className="p-6">Error: {error}</div>;
  }

  const timeSince = (date: string): string => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - createdDate.getTime()) / 1000
    );

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };

  return (
    <div className="flex space-x-4">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-full w-full flex-1">
        {/* Top Section */}
        <div className="h-[56.8px] px-4 py-2 flex ">
          <div className="w-9/12 flex ">
            <div className="relative w-[600px]">
              <CIcon
                icon={cilZoom}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-16 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Search for tasks in this project..."
              />
            </div>
          </div>
          <div className="w-3/12 max-h-full">
            <div className="flex items-start px-1 justify-end gap-4 h-[56.8px]">
              <CIcon
                customClassName="nav-icon h-[25px]" // Keeping this as is
                icon={cilBell}
                className="text-gray-600" // Color adjustment only
              />
              <CIcon
                customClassName="nav-icon h-[25px]" // Keeping this as is
                icon={cilSettings}
                className="text-gray-600" // Color adjustment only
              />
              <div className="flex items-center">
                <UserButton />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottm  flex-1 flex">
          {/* Tasks Section */}
          <div className="w-9/12 bg-white px-2">
            <div className="text-xl font-bold mb-4 px-3 flex justify-between ">
              Tasks
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#f70cc0] to-[#a10080] font-roboto text-white text-sm text-center  py-2 px-2.5 rounded-lg shadow transition-transform transform hover:scale-105"
              >
                Add New Task
              </button>
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                    <form onSubmit={handleSubmit} className="font-poppins">
                      <div className="mb-3">
                        <label
                          htmlFor="task_name"
                          className="block text-[#6c757d] text-lg "
                        >
                          Task Name
                        </label>
                        <input
                          id="task_name"
                          name="task_name"
                          placeholder="Enter task name"
                          value={newTask.task_name}
                          onChange={handleInputChange}
                          required
                          className="form-control w-full border border-gray-300 rounded px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="description"
                          className="block text-[#6c757d] text-lg "
                        >
                          Description
                        </label>
                        <input
                          id="description"
                          name="description"
                          placeholder="Enter description"
                          value={newTask.description}
                          onChange={handleInputChange}
                          required
                          className="form-control w-full border border-gray-300 rounded px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="due_date"
                          className="block text-[#6c757d] text-lg"
                        >
                          Due Date
                        </label>
                        <input
                          id="due_date"
                          name="due_date"
                          type="date"
                          value={newTask.due_date}
                          onChange={handleInputChange}
                          required
                          className="form-control w-full border border-gray-300 rounded px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="status"
                          className="block text-[#6c757d] text-lg "
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={newTask.status}
                          onChange={handleInputChange}
                          className="form-select w-full border border-gray-300 rounded px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="To Review">To Review</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="priority"
                          className="block text-[#6c757d] text-lg font-bold"
                        >
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={newTask.priority}
                          onChange={handleInputChange}
                          className="form-select w-full border border-gray-300 rounded px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="d-flex justify-content-end mt-3">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="btn btn-secondary mr-2"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Add Task
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div className="max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 z-1">
                {["Pending", "In Progress", "To Review", "Completed"].map(
                  (status) => (
                    <div key={status} className="flex flex-col">
                      <h3 className="text-lg font-bold mb-2 capitalize font-dm">
                        {status}
                      </h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(
                            (task) =>
                              task?.status?.toLowerCase() ===
                              status.toLowerCase()
                          )
                          .map((task) => (
                            <motion.div
                              key={task.task_id}
                              className="relative px-4 py-2 border rounded-lg shadow-md bg-[#FAFAFA]"
                            >
                              <CIcon
                                customClassName="absolute top-2 right-2 nav-icon cursor-pointer h-[20px] w-[20px] "
                                icon={cilOptions}
                                className="text-white"
                                onClick={() =>
                                  setSelectedTask(
                                    selectedTask === task.task_id
                                      ? null
                                      : task.task_id
                                  )
                                }
                              />

                              {selectedTask === task.task_id && (
                                <div
                                  className={`absolute top-8 ${
                                    status === "Pending" ? "left-20" : "right-2"
                                  } bg-white shadow-lg rounded-md text-sm p-2`}
                                >
                                  <button
                                    onClick={() => {
                                      const role = localStorage.getItem("role"); // Get role from localStorage
                                      if (role !== "admin") {
                                        toast.error(
                                          <div className="text-red-500 font-bold text-center">
                                            Access Denied! <br />
                                            Only Admins can delete tasks.
                                          </div>,
                                          { duration: 3000 }
                                        );
                                        return;
                                      }
                                      handleDeleteTask(task.task_id);
                                    }}
                                    className="block w-full text-left px-2 py-1 hover:bg-gray-200 text-black font-robotoMono"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => {
                                      const role = localStorage.getItem("role"); // Get role from localStorage
                                      if (role !== "admin") {
                                        toast.error(
                                          <div className="text-red-500 font-bold text-center">
                                            Access Denied! <br />
                                            Only Admins can assign users.
                                          </div>,
                                          { duration: 3000 }
                                        );
                                        return;
                                      }
                                      setShowAddMemberModal(true);
                                    }}
                                    className="block w-full text-left px-2 py-1 hover:bg-gray-200 text-black font-robotoMono"
                                  >
                                    Assign User
                                  </button>

                                  {showAddMemberModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                      <div className="bg-white z-50 p-8 rounded-lg shadow-lg w-full max-w-lg h-auto max-h-[90vh] overflow-y-auto">
                                        <h3 className="text-2xl font-bold mb-6 text-center text-black">
                                          Add Members to Project
                                        </h3>
                                        {users.length > 0 ? (
                                          <ul className="space-y-4">
                                            {users.map((user) => (
                                              <li
                                                key={user.user_id}
                                                className="flex justify-between items-center border-b pb-2"
                                              >
                                                <div>
                                                  <p className="font-semibold text-black">
                                                    {user.username}
                                                  </p>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    handleAddToProject(
                                                      user.user_id
                                                    )
                                                  }
                                                  className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                                >
                                                  Assign this task
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p className="text-gray-500 italic">
                                            No users found for this
                                            organization.
                                          </p>
                                        )}
                                        <div className="flex justify-end mt-6">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowAddMemberModal(false)
                                            }
                                            className="mr-2 bg-gray-300 text-[#AC46B9] hover:bg-gray-400 font-playfair px-4 py-2 rounded"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() =>
                                              setShowAddMemberModal(false)
                                            }
                                            className="bg-[#AC46B9] text-white hover:bg-purple-700 font-spaceGrotesk px-4 py-2 rounded"
                                          >
                                            Done
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      const role = localStorage.getItem("role"); // Get role from localStorage
                                      if (
                                        role !== "admin" &&
                                        role !== "employee"
                                      ) {
                                        toast.error(
                                          <div className="text-red-500 font-bold text-center">
                                            Access Denied! <br />
                                            Only Admins and Employees can change
                                            status.
                                          </div>,
                                          { duration: 3000 }
                                        );
                                        return;
                                      }
                                      setShowStatusModal(true);
                                    }}
                                    className="block w-full text-left px-2 py-1 hover:bg-gray-200 text-black font-robotoMono"
                                  >
                                    Change Status
                                  </button>
                                  {showStatusModal && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                      <div className="bg-white py-2 px-3 shadow-lg h-auto max-h-[90vh] w-max overflow-y-auto rounded-lg">
                                        <h3 className="text-2xl font-bold mb-6 text-center text-black font-poppins">
                                          Change Task Status
                                        </h3>
                                        <ul className="space-y-4">
                                          {[
                                            "pending",
                                            "in progress",
                                            "to review",
                                            "completed",
                                          ].map((status) => (
                                            <li
                                              key={status}
                                              onClick={() =>
                                                setSelectedStatus(status)
                                              } // Set selected status
                                              className={`cursor-pointer px-4 py-2 rounded font-roboto transition ${
                                                selectedStatus === status
                                                  ? "bg-purple-300 text-white font-bold" // Highlight selected status
                                                  : "hover:bg-gray-200"
                                              }`}
                                            >
                                              {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                            </li>
                                          ))}
                                        </ul>
                                        <div className="flex justify-end mt-6">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowStatusModal(false)
                                            }
                                            className="mr-2 bg-gray-300 text-[#AC46B9] hover:bg-gray-400 font-playfair px-4 py-2 rounded"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (selectedStatus) {
                                                handleChangeStatus(
                                                  task.task_id,
                                                  selectedStatus
                                                );
                                              }
                                              setShowStatusModal(false);
                                            }}
                                            className="bg-[#AC46B9] text-white hover:bg-purple-700 font-spaceGrotesk px-4 py-2 rounded"
                                          >
                                            Done
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      const role = localStorage.getItem("role"); // Get role from localStorage
                                      if (
                                        role !== "admin" &&
                                        role !== "employee"
                                      ) {
                                        toast.error(
                                          <div className="text-red-500 font-bold text-center">
                                            Access Denied! <br />
                                            Only Admins and Employees can set
                                            priority.
                                          </div>,
                                          { duration: 3000 }
                                        );
                                        return;
                                      }
                                      setShowPriorityModal(true);
                                    }}
                                    className="block w-full text-left px-2 py-1 hover:bg-gray-200 text-black font-robotoMono"
                                  >
                                    Set Priority
                                  </button>
                                  {showPriorityModal && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                      <div className="bg-white py-2 px-3 shadow-lg h-auto max-h-[90vh] w-max overflow-y-auto rounded-lg">
                                        <h3 className="text-2xl font-poppins mb-6 text-center text-black">
                                          Set Task Priority
                                        </h3>
                                        <ul className="space-y-4">
                                          {["high", "medium", "low"].map(
                                            (priority) => (
                                              <li
                                                key={priority}
                                                onClick={() =>
                                                  setSelectedPriority(priority)
                                                } // Set selected priority
                                                className={`cursor-pointer px-4 py-2 rounded font-roboto transition ${
                                                  selectedPriority === priority
                                                    ? "bg-purple-300 text-white font-bold" // Highlight selected priority
                                                    : "hover:bg-gray-200"
                                                }`}
                                              >
                                                {priority
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  priority.slice(1)}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                        <div className="flex justify-end mt-6">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowPriorityModal(false)
                                            }
                                            className="mr-2 bg-gray-300 text-[#AC46B9] hover:bg-gray-400 font-playfair px-4 py-2 rounded"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (selectedPriority) {
                                                handleSetPriority(
                                                  task.task_id,
                                                  selectedPriority
                                                );
                                              }
                                              setShowPriorityModal(false);
                                            }}
                                            className="bg-[#AC46B9] text-white hover:bg-purple-700 font-spaceGrotesk px-4 py-2 rounded"
                                          >
                                            Done
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Priority Section */}
                              <div className="flex items-center mb-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                    task.priority.toLowerCase() === "high"
                                      ? "bg-red-500"
                                      : task.priority.toLowerCase() === "medium"
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                  }`}
                                ></span>
                                <span className="text-xs font-roboto">
                                  {task.priority.charAt(0).toUpperCase() +
                                    task.priority.slice(1).toLowerCase()}
                                </span>
                              </div>

                              {/* Task Title */}
                              <h4 className="font-bold text-lg mb-2 font-robotoMono">
                                {task.task_name}
                              </h4>

                              {/* Description */}
                              <p className="text-sm font-spaceGrotesk">
                                {task.description}
                              </p>

                              {/* Due Date */}
                              <p className="text-sm mt-2 font-poppins">
                                Due By{" "}
                                {new Date(task.due_date).toLocaleDateString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>

                              {/* Created Ago */}
                              <p className="text-xs font-poppins">
                                Started {timeSince(task.created_at)}
                              </p>
                            </motion.div>
                          ))}
                        {tasks.filter(
                          (task) =>
                            task?.status?.toLowerCase() === status.toLowerCase()
                        ).length === 0 && (
                          <p className="text-gray-500 text-sm italic">
                            No tasks available.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className=" w-3/12 h-[calc(100vh-56.8px)] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-2 flex flex-col">
            {/* Project Details Section */}
            <div className="mb-2 overflow-y-auto h-2/5 bg-gray-50 rounded-lg shadow-md p-4">
              <h2 className="text-sm font-monte text-[#B83FAA] mb-4 border-b pb-2">
                Project Details
              </h2>
              {project ? (
                <div className="space-y-3">
                  <p className="text-2xl font-semibold text-gray-700 font-playfair">
                    {project.project_name}
                  </p>
                  <p className="text-sm  text-gray-600 leading-relaxed font-poppins">
                    <strong className="text-[#B83FAA] font-spaceGrotesk text-sm">
                      Description:
                    </strong>{" "}
                    {project.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 italic text-sm font-robotoMono">
                  Project details not available.
                </p>
              )}
            </div>

            {/* Chat Section */}
            <div className="h-3/5 bg-white rounded-lg shadow-lg overflow-hidden">
              <Chat projectId={projectId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
