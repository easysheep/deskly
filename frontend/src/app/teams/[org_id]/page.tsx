"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import { cilDelete, cilTrash, cilZoom } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { Card, Typography } from "@material-tailwind/react";
import LoadingAnimation from "@/components/LoadingAnimations";
import toast from "react-hot-toast";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
} from "@coreui/react";

import { cilSettings, cilBell, cilPlus } from "@coreui/icons";
interface Team {
  team_id: string;
  team_name: string;
  team_members: string[];
  description: string;
  team_lead: string;
  created_at: string;
}

interface User {
  user_id: number;
  username: string;
  org_id: string;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newMember, setNewMember] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [teamLead, setTeamLead] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { org_id } = useParams();
  const [showTeamPopup, setShowTeamPopup] = useState<boolean>(false);
  const { user } = useUser();

  const [users, setUsers] = useState<{ user_id: number; username: string }[]>(
    []
  );
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("edit");

  const handleRowClick = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
    setIsModalOpen(false);
  };

  const TABLE_HEAD: string[] = [
    "Team Name",
    "Description",
    "Team Lead",
    "Date Created",
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`/api/teams?org_id=${org_id}`, {
          method: "GET",
        });
        if (response.ok) {
          const result = await response.json();
          setTeams(result);
          setLoading(false);
        } else {
          setErrorMessage("Failed to fetch teams.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching teams.");
        setLoading(false);
      }
    };

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

        // Filter users by orgId and update state
        const filteredUsers = userData.filter(
          (user: { org_id: number }) => Number(user.org_id) === orgId
        );
        console.log("Filtered users:", filteredUsers);

        setUsers(filteredUsers); // Directly set the filtered users
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", (err as Error).message);
        setLoading(false);
      }
    };

    fetchTeams();
    fetchUsers();
  }, [org_id]);

  const addTeam = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Construct the payload
    const payload = {
      team_name: teamName,
      description: description,
      team_lead: Number(teamLead), // This will already contain the selected user's id
    };

    console.log(payload);

    // Wrap the fetch call in a promise for toast notifications
    const addTeamPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/teams?org_id=${org_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        console.log("Team created successfully:", data.team);
        resolve("Team created successfully");
        setShowTeamPopup(false);
      } catch (error: any) {
        console.error("Error adding team:", error.message);
        reject(error.message || "Error adding team");
      }
    });

    // Show toast notification while the request is in progress
    toast.promise(addTeamPromise, {
      loading: "Creating team...",
      success: "Team created successfully!",
      error: "Failed to create team.",
    });
  };

  const handleUpdate = async (team: Team) => {
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/teams?id=${team.team_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateDetails",
            team_name: team.team_name,
            description: team.description,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return reject(data.error || "Failed to update team.");
        }

        console.log("Team updated successfully:", data);
        setSelectedTeam(data);
        setIsModalOpen(false);
        resolve("Team updated successfully!");
      } catch (error) {
        reject(error.message || "Error updating team.");
      }
    });

    toast.promise(updatePromise, {
      loading: "Updating team...",
      success: "Team updated successfully!",
      error: "Failed to update team.",
    });
  };

  // Function to add a user to the team
  const handleAddUserToTeam = async (userId) => {
    const addUserPromise = new Promise(async (resolve, reject) => {
      try {
        // Add user to the team
        const teamResponse = await fetch(
          `/api/teams?id=${selectedTeam.team_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "addMember", user_id: userId }),
          }
        );

        const teamData = await teamResponse.json();
        if (!teamResponse.ok)
          return reject(teamData.error || "Failed to add user to team.");

        console.log("User added to team successfully:", teamData);

        // Update user's team data
        const userResponse = await fetch(`/api/team-user?id=${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "addTeam",
            team_id: selectedTeam.team_id,
          }),
        });

        const userData = await userResponse.json();
        if (!userResponse.ok)
          return reject(userData.error || "Failed to update user.");

        console.log("User's teams field updated successfully:", userData);

        // Update local state
        setSelectedTeam((prev) => ({
          ...prev,
          team_members: [...prev.team_members, userId],
        }));

        resolve("User added to the team successfully!");
      } catch (error) {
        reject(error.message || "Error adding user to the team.");
      }
    });

    toast.promise(addUserPromise, {
      loading: "Adding user...",
      success: "User added to the team!",
      error: "Failed to add user.",
    });
  };

  // Function to remove a user from the team
  const handleRemoveUserFromTeam = async (userId) => {
    const removeUserPromise = new Promise(async (resolve, reject) => {
      try {
        // Remove user from the team
        const teamResponse = await fetch(
          `/api/teams?id=${selectedTeam.team_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "removeMember", user_id: userId }),
          }
        );

        const teamData = await teamResponse.json();
        if (!teamResponse.ok)
          return reject(teamData.error || "Failed to remove user from team.");

        console.log("User removed from team successfully:", teamData);

        // Update user's team data
        const userResponse = await fetch(`/api/team-user?id=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "removeTeam",
            team_id: selectedTeam.team_id,
          }),
        });

        const userData = await userResponse.json();
        if (!userResponse.ok)
          return reject(userData.error || "Failed to update user.");

        console.log("User's teams field updated successfully:", userData);

        // Update local state
        setSelectedTeam((prev) => ({
          ...prev,
          team_members: prev.team_members.filter((id) => id !== userId),
        }));

        resolve("User removed from the team successfully!");
      } catch (error) {
        reject(error.message || "Error removing user from the team.");
      }
    });

    toast.promise(removeUserPromise, {
      loading: "Removing user...",
      success: "User removed from the team!",
      error: "Failed to remove user.",
    });
  };

  const handleDeleteTeam = async (teamId: string) => {
    console.log(teamId);
    try {
      const response = await fetch(`/api/teams?id=${teamId.team_id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccessMessage("Team deleted successfully.");
        setTeams((prev) => prev.filter((team) => team.team_id !== teamId));
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to delete team.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete team.");
    } finally {
      setLoading(false);
    }
  };

  // Utility function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    // Convert the timestamp to a Date object
    const date = new Date(timestamp);

    // Format the date (you can customize the format as needed)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingAnimation></LoadingAnimation>;
  }

  return (
    <div className="flex space-x-4">
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-grow ">
        <div className="h-[56.8px] px-4 py-1 flex ">
          <div className="w-9/12 flex ">
            <div className="relative w-[600px]">
              <CIcon
                icon={cilZoom}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-16 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Search for teams in this organization"
              />
            </div>
            <button
              className="ml-3 font-roboto font-bold rounded bg-slate-800 px-2.5 border border-transparent text-center text-sm text-black bg-gradient-to-r from-[#f70cc0] to-[#a10080] text-white"
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
                setShowTeamPopup(true);
              }}
            >
              Add Team
            </button>
            {showTeamPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                  <CForm onSubmit={addTeam}>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="teamName">Team Name</CFormLabel>
                      <CFormInput
                        id="teamName"
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="description">Description</CFormLabel>
                      <CFormTextarea
                        id="description"
                        placeholder="Enter team description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="teamLead">Team Lead</CFormLabel>
                      <CFormSelect
                        id="teamLead"
                        value={teamLead}
                        onChange={(e) => setTeamLead(e.target.value)}
                        size={5} // Show 5 options at a time
                      >
                        <option value="" disabled>
                          Select a team lead
                        </option>
                        {users.map((user) => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.username}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol className="d-flex justify-content-end mt-3">
                      <CButton
                        color="secondary"
                        onClick={() => setShowTeamPopup(false)}
                        className="mr-2"
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" type="submit">
                        Add Team
                      </CButton>
                    </CCol>
                  </CForm>
                </div>
              </div>
            )}
          </div>
          <div className="w-3/12 max-h-full">
            <div className="flex items-start px-1 justify-end gap-4 h-[56.8px]">
              <CIcon
                customClassName="nav-icon h-[25px] cursor-pointer" // Keeping this as is
                icon={cilBell}
                className="text-gray-600" // Color adjustment only
              />
              <CIcon
                customClassName="nav-icon h-[25px] cursor-pointer" // Keeping this as is
                icon={cilSettings}
                className="text-gray-600" // Color adjustment only
              />
              <div className="flex items-center">
                <UserButton />
              </div>
            </div>
          </div>
        </div>

        <div className="h-24 py-1 px-4 mt-8">
          <h2 className="bold font-mono">Organization Teams</h2>
          <h6 className="font-thin">
            Meet Our Teams: The Driving Force Behind Our Organization{" "}
          </h6>
        </div>

        <div className="h-[505px] w-full">
          <Card className="h-full w-full px-6">
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full min-w-max table-auto text-left border-1">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f70cc0] to-[#a10080]">
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="py-2 px-2 text-white align-middle"
                      >
                        <Typography
                          variant="small"
                          color="white"
                          className="font-bold font-spaceGrotesk text-xl leading-none pt-1"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.length > 0 ? (
                    teams.map((team) => {
                      const isLast = teams.indexOf(team) === teams.length - 1;
                      const classes = isLast
                        ? "py-4"
                        : "py-4 border-b border-gray-300";
                      return (
                        <tr
                          key={team.team_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedTeam(team);
                            setIsModalOpen(true);
                          }}
                        >
                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold px-2 font-robotoMono"
                            >
                              {team.team_name}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant="small"
                              className="font-normal text-gray-600 font-robotoMono"
                            >
                              {team.description || "No description provided"}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant="small"
                              className="font-normal text-gray-600 font-robotoMono"
                            >
                              {users.find(
                                (user) =>
                                  user.user_id === Number(team.team_lead)
                              )?.username || "Not Assigned"}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              variant="small"
                              className="font-normal text-gray-600 font-robotoMono"
                            >
                              {new Date(team.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={TABLE_HEAD.length}
                        className="text-center py-4 text-gray-500"
                      >
                        No teams available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          {isModalOpen && selectedTeam && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                <h2 className="text-xl font-bold mb-4">
                  {selectedTab === "edit" ? "Edit Team" : "Add Members"}
                </h2>
                <div className="flex mb-4">
                  <button
                    onClick={() => setSelectedTab("edit")}
                    className={`flex-1 p-2 rounded-l-lg ${
                      selectedTab === "edit"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Edit Team
                  </button>
                  <button
                    onClick={() => setSelectedTab("addMembers")}
                    className={`flex-1 p-2 rounded-r-lg ${
                      selectedTab === "addMembers"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Add Members
                  </button>
                </div>
                <div className="h-[300px] overflow-auto border border-gray-300 rounded px-4 py-2">
                  {selectedTab === "edit" && (
                    <div>
                      <label className="block text-sm font-medium">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={selectedTeam.team_name}
                        onChange={(e) =>
                          setSelectedTeam({
                            ...selectedTeam,
                            team_name: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-2 w-full"
                      />

                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        value={selectedTeam.description}
                        onChange={(e) =>
                          setSelectedTeam({
                            ...selectedTeam,
                            description: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-2 w-full"
                      />

                      {/* List of users in the selected team */}
                      <label className="block text-sm font-medium mt-4">
                        Team Members
                      </label>
                      <ul className="mt-2 border border-gray-200 rounded p-2">
                        {users
                          .filter((user) =>
                            selectedTeam.team_members.includes(user.user_id)
                          ) // Correcting the matching field
                          .map((user) => (
                            <li
                              key={user.user_id}
                              className="flex justify-between items-center border-b py-2"
                            >
                              <span>{user.username}</span>
                              <button
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
                                  handleRemoveUserFromTeam(user.user_id);
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                              >
                                <CIcon
                                  customClassName="nav-icon h-[20px] cursor-pointer" // Keeping this as is
                                  icon={cilDelete}
                                  className="text-gray-600" // Color adjustment only
                                />
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {selectedTab === "addMembers" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Add Users to Team
                      </h3>
                      <div className=" px-2 max-h-60 overflow-auto">
                        {users
                          .filter(
                            (user) =>
                              !selectedTeam.team_members.includes(user.user_id)
                          )
                          .map((user) => (
                            <div
                              key={user.user_id}
                              className="flex items-center justify-between py-1"
                            >
                              <span className="text-sm font-medium">
                                {user.username}
                              </span>
                              <button
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
                                  handleAddUserToTeam(user.user_id);
                                }}
                                className="bg-green-500 text-white px-2 py-1 text-xs rounded"
                              >
                                <CIcon
                                  customClassName="nav-icon h-[20px] cursor-pointer" // Keeping this as is
                                  icon={cilPlus}
                                  className="text-gray-600" // Color adjustment only
                                />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
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
                      handleDeleteTeam(selectedTeam);
                    }}
                    className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-red-500 hover:!text-white"
                  >
                    Delete Team
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-300 text-black py-2 px-4 rounded"
                  >
                    Close
                  </button>
                  {selectedTab === "edit" && (
                    <button
                      onClick={() => handleUpdate(selectedTeam)}
                      className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
