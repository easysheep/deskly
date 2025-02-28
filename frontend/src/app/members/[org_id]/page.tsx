"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
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

type TableRow = {
  name: string;
  role: string;
  jobtitle: string;
  joindate: string;
  user_id: number;
};

const Members: React.FC = () => {
  const { org_id } = useParams(); // Get org_id from URL
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [jobtitle, setjobtitle] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const { user } = useUser();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Handle clicking a row: save the user's ID and prefill the form with that member's data.
  const handleRowClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowModal(true);
    console.log("User ID passed:", userId);
    // Note: selectedUserId may not update immediately because state updates are asynchronous.
  };

  const TABLE_HEAD: string[] = ["Name", "Role", "Job Title", "Date Joined"];

  useEffect(() => {
    if (org_id) {
      const fetchMembers = async () => {
        try {
          const response = await fetch(`/api/members?org_id=${org_id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch members");
          }
          const data: User[] = await response.json();

          // Map fetched data to TableRow structure
          const tableRows: TableRow[] = data.map((user) => ({
            name: user.username,
            role: user.role,
            jobtitle: user.jobtitle,
            joindate: formatTimestamp(user.created_at),
            user_id: user.user_id,
          }));

          setMembers(tableRows); // Set the mapped data to state
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchMembers();
    }
  }, [org_id]);

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

  const deleteUser = async (user_id: number) => {
    try {
      const response = await fetch(`/api/members?user_id=${user_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      console.log(user_id);
      setShowModal(false);

      setMembers(members.filter((member) => member.user_id !== user_id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role || !jobtitle) {
      setError("Username, password, job title, and role are required.");
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`/api/members?org_id=${org_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role, org_id, jobtitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      const newUser = await response.json();
      setMembers([...members, newUser]);
      setUsername("");
      setPassword("");
      setRole("");
      setjobtitle("");
      setShowPopup(false);

      toast.success("User added successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingAnimation></LoadingAnimation>;
  }

  return (
    <div className=" flex space-x-4">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-grow ">
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
                placeholder="Search for users in this organization"
              />
            </div>
            <button
              className="font-roboto font-bold ml-3 rounded bg-slate-800 px-2.5 border border-transparent text-center text-sm text-black bg-gradient-to-r from-[#f70cc0] to-[#a10080] text-white font-mono"
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
                setShowPopup(true);
              }}
            >
              Add Members
            </button>
            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                  <CForm onSubmit={addUser}>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="username">Username</CFormLabel>
                      <CFormInput
                        id="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="password">Password</CFormLabel>
                      <CFormInput
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="roleSelect">Role</CFormLabel>
                      <CFormSelect
                        id="roleSelect"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a role
                        </option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </CFormSelect>
                    </CCol>

                    <CCol className="mb-3">
                      <CFormLabel htmlFor="jobTitle">Job Title</CFormLabel>
                      <CFormInput
                        id="jobTitle"
                        placeholder="Enter job title"
                        value={jobtitle}
                        onChange={(e) => setjobtitle(e.target.value)}
                      />
                    </CCol>
                    <CCol className="d-flex justify-content-end mt-3">
                      <CButton
                        color="secondary"
                        onClick={() => setShowPopup(false)}
                        className="mr-2"
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" type="submit">
                        Add User
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
          <h2 className="bold font-mono">Organization Members</h2>
          <h6 className="font-thin">
            Connect wih other members from your organization{" "}
          </h6>
        </div>

        {error ? (
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
                            className="font-bold font-spaceGrotesk pt-1 text-xl leading-none"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={TABLE_HEAD.length}
                        className="py-4 text-center text-gray-500"
                      >
                        No members yet
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
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
                            className="font-bold font-spaceGrotesk pt-1 text-xl leading-none"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={TABLE_HEAD.length}
                          className="py-4 text-center text-gray-500"
                        >
                          No members yet
                        </td>
                      </tr>
                    ) : (
                      members.map((member, index) => {
                        // Use member.user_id as the key if it's unique
                        return (
                          <tr
                            key={member.user_id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(member.user_id)}
                          >
                            <td className="py-4">
                              <span className="font-bold px-2 font-robotoMono">
                                {member.name}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="font-normal text-gray-600 font-robotoMono">
                                {member.role}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="font-normal text-gray-600 font-robotoMono">
                                {member.jobtitle}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="font-normal text-gray-600 font-robotoMono">
                                {member.joindate}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                      <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                      <p className="mb-4">
                        Are you sure you want to delete this user?
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="bg-gray-300 text-black px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const role = localStorage.getItem("role"); 
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
                            deleteUser(selectedUserId);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
