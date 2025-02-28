"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams from next/navigation
import CreateProject from "@/app/createproject/[org_id]/CreateProject";
import { Sidebar } from "@/components/Sidebar";
import { useUser, UserButton } from "@clerk/nextjs";
import CIcon from "@coreui/icons-react";
import { cilSettings, cilBell } from "@coreui/icons";
import LoadingAnimation from "@/components/LoadingAnimations";
import ActivityLogs from "@/app/activitylogs/[org_id]/page";
const OrgBoardPage = () => {
  const params = useParams(); // Get the dynamic params object
  const orgname = localStorage.getItem("orgname");
  const user_name=localStorage.getItem("username");
  const org_id = Array.isArray(params.org_id)
    ? params.org_id[0]
    : params.org_id; // Ensure org_id is a string

  const [orgName, setOrgName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();
  const [stats, setStats] = useState({
    projects: 1,
    tasks: 0,
    teams: 0,
    members: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel fetch requests using Promise.all
        const [
          projectsResponse,
          membersResponse,
          teamsResponse,
          tasksResponse,
        ] = await Promise.all([
          fetch(`/api/projectlist?org_id=${org_id}`),
          fetch(`/api/members?org_id=${org_id}`),
          fetch(`/api/teams?org_id=${org_id}`),
          fetch(`/api/tasks`),
        ]);

        // Parsing responses
        const projectsData = await projectsResponse.json();
        const membersData = await membersResponse.json();
        const teamsData = await teamsResponse.json();
        const tasksData = await tasksResponse.json();

        // Calculate counts
        const projectsCount = projectsData.length;
        const membersCount = membersData.length;
        const teamsCount = teamsData.length;
        const tasksCount = tasksData.filter(
          (task: any) => String(task.org_id) === org_id
        ).length;

        // Update state with counts
        setStats({
          projects: projectsCount,
          tasks: tasksCount,
          teams: teamsCount,
          members: membersCount,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [org_id]);

  useEffect(() => {
    // Fetch the organization name from localStorage
    const storedOrgName = localStorage.getItem("orgname");
    setOrgName(storedOrgName);
  }, []); // Runs only once after the component is mounted

  if (loading) {
    return <LoadingAnimation></LoadingAnimation>;
  }
  return (
    <div className="flex space-x-4">
      {/* Sidebar with a fixed width */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content with remaining space */}
      <div className="flex-1  min-h-screen pt-2">
        {/* Content goes here */}

        <div className="top bg-white h-[56.8px] flex items-center justify-between px-4">
          {/* Organization Name */}
          <p className="text-3xl font-dm">{orgname}</p>

          {/* Icons and UserButton Section */}
          <div className="flex items-start gap-4 pt-1 h-[56.8px]">
            <CIcon
              customClassName="nav-icon cursor-pointer h-[25px]"
              icon={cilBell}
              className="text-gray-600 cursor-pointer" // Ensure consistent size
            />
            <CIcon
              customClassName="nav-icon h-[25px] cursor-pointer"
              icon={cilSettings}
              className="text-gray-600 " // Ensure consistent size
            />
            <UserButton />
          </div>
        </div>

        <div className="bottom flex ">
          <div className="flex h-[calc(100vh-65px)] w-full">
            <div className="left w-9/12 flex items-center  justify-center pr-1">
              {org_id && <CreateProject org_id={org_id} />}
            </div>
            <div className="right w-3/12  flex items-center justify-center flex-col bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-2">
              <div className="my h-2/5 w-full px-2 bg-white rounded-lg shadow">
                {/* Header Section */}
                <div className="flex items-center mb-4 pt-2 px-1 justify-center gap-4">
                  <div className="flex flex-col ">
                    <div className="text-lg ml-4">Hi,</div>
                    <div className="text-xl font-poppins">{user_name}</div>
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={user?.imageUrl || "https://via.placeholder.com/150"}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Total Projects */}
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-roboto">
                        Total Projects
                      </h3>
                      <p className="text-lg font-bold">
                        {stats?.projects ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Total Tasks */}
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-roboto">
                        Total Tasks
                      </h3>
                      <p className="text-lg font-bold">{stats?.tasks ?? 0}</p>
                    </div>
                  </div>

                  {/* Total Teams */}
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-roboto">
                        Total Teams
                      </h3>
                      <p className="text-lg font-bold">{stats?.teams ?? 0}</p>
                    </div>
                  </div>

                  {/* Total Members */}
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-roboto">
                        Total Members
                      </h3>
                      <p className="text-lg font-bold">{stats?.members ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-grow h-3/5 feed mx-2 w-full bg-white  overflow-hidden mt-2">
                {/* Header */}
                <div className="bg-white px-3 py-1 border-b border-gray-300 sticky top-0 z-10">
                  <h2 className="text-lg font-semibold text-gray-800 font-playfair">
                    Activity Feed
                  </h2>
                </div>

                {/* Activity Content */}
                <div className="bg-[#FAFAFA]">
                  <ActivityLogs></ActivityLogs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgBoardPage;
