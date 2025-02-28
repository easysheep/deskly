"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CIcon from "@coreui/icons-react";
import { cilOptions } from "@coreui/icons";
import { toast } from "react-hot-toast";
interface Project {
  project_id: number;
  project_name: string;
  description: string;
  task_ids: number[];
  team_id: number;
  org_id: string;
  created_at: string; // Date as a string
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

interface ProjectsListProps {
  org_id: string; // Receive org_id as a prop
}

const ProjectsList: React.FC<ProjectsListProps> = ({ org_id }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [deleteBoxVisible, setDeleteBoxVisible] = useState(null);

  const handleThreeDotsClick = (projectId: Number) => {
    setDeleteBoxVisible((prev) => (prev === projectId ? null : projectId));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the project.");
      }

      // Update the local state by filtering out the deleted project
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.project_id !== projectId)
      );

      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred while deleting the project.");
    }
    setDeleteBoxVisible(null);
  };

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch(
          `/api/projectlist?org_id=${org_id}`,
          {
            method: "GET",
          }
        );
        // if (!projectsResponse.ok) {
        //   throw new Error("Failed to fetch projects");
        // }
        const projectsData = await projectsResponse.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks", { method: "GET" });
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasksData: Task[] = await tasksResponse.json();
        setTasks(tasksData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [org_id]);

  const handleCardClick = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };

  const calculateCompletion = (projectId: number): number => {
    const projectTasks = tasks.filter((task) => task.project_id === projectId);
    const completedTasks = projectTasks.filter(
      (task) => task.status === "Completed"
    ).length;
    return projectTasks.length > 0
      ? Math.round((completedTasks / projectTasks.length) * 100)
      : 0;
  };

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-800"></div>
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-[78vh] py-6 px-2 bg-gray-100">
      {!projects || projects.length === 0 ? (
        <div className="text-center text-gray-500 font-dm text-lg mt-4">
          No projects available. Start by creating a new project.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {projects.map((project) => (
            <div
              key={project.project_id}
              onClick={() => handleCardClick(project.project_id)}
              className="relative px-4 py-2 text-black rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
            >
              {/* Three dots icon */}
              <CIcon
                customClassName="absolute top-2 right-2 nav-icon cursor-pointer h-[20px] w-[20px] text-zz"
                icon={cilOptions}
                className="text-white"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  handleThreeDotsClick(project.project_id);
                }}
              />

              {/* Delete box */}
              {deleteBoxVisible === project.project_id && (
                <div
                  className="absolute top-8 right-2 bg-white shadow-lg p-2 rounded-lg z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-2 py-1 hover:bg-gray-200 text-black font-robotoMono"
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
                      handleDeleteProject(project.project_id);
                    }}
                  >
                    Delete
                  </button>
                </div>



              )}


              {/* Project name */}
              <h2 className="text-xl mb-2 font-poppins">{project.project_name}</h2>
              {/* Description */}
              <p className="mb-2 text-sm font-playfair">{project.description}</p>

              {/* Completion Bar */}
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-4">
                <div
                  className="bg-zz h-2 rounded-full"
                  style={{
                    width: `${calculateCompletion(project.project_id)}%`,
                  }}
                ></div>
              </div>
              <p className="text-right mt-1 text-xs">
                {calculateCompletion(project.project_id)}% Completed
              </p>

              {/* Creation time */}
              <p className="mt-4 text-sm text-zz font-thin">
                Created {timeSince(project.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
