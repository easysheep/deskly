"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import CIcon from "@coreui/icons-react";
import {
  cilZoom,
  cilSettings,
  cilBell,
} from "@coreui/icons";
import { Card, Typography } from "@material-tailwind/react";
import { UserButton } from "@clerk/nextjs";
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

// Flattened row type for display
type TableRow = {
  user_id: number;
  name: string;
  role: string;
  jobtitle: string;
  joindate: string;
};

const Members: React.FC = () => {
  const { org_id } = useParams();
  const [members, setMembers] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [jobtitle, setJobtitle] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Handle clicking a row: open delete confirmation
  const handleRowClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  useEffect(() => {
    if (!org_id) return;
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/members?org_id=${org_id}`);
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json(); // assume original shape includes username, jobtitle, created_at
        const rows: TableRow[] = data.map((u: any) => ({
          user_id: u.user_id,
          name: u.username,
          role: u.role,
          jobtitle: u.jobtitle,
          joindate: formatTimestamp(u.created_at),
        }));
        setMembers(rows);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [org_id]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const deleteUser = async (user_id: number) => {
    try {
      const res = await fetch(`/api/members?user_id=${user_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setShowModal(false);
      setMembers(members.filter(m => m.user_id !== user_id));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role || !jobtitle) {
      toast.error("All fields are required.");
      return;
    }
    try {
      const res = await fetch(`/api/members?org_id=${org_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, jobtitle, org_id }),
      });
      if (!res.ok) throw new Error("Failed to add user");
      const newUser = await res.json();
      const newRow: TableRow = {
        user_id: newUser.user_id,
        name: newUser.username,
        role: newUser.role,
        jobtitle: newUser.jobtitle,
        joindate: formatTimestamp(newUser.created_at),
      };
      setMembers([...members, newRow]);
      setUsername(""); setPassword(""); setRole(""); setJobtitle("");
      setShowPopup(false);
      toast.success("User added successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingAnimation />;

  return (
    <div className="flex space-x-4">
      <div className="w-60"><Sidebar /></div>
      <div className="flex-grow">
        <div className="h-[56.8px] flex px-4 py-2">
          <div className="w-9/12 flex items-center">
            <div className="relative w-[600px]">
              <CIcon icon={cilZoom} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-16 py-2 border rounded-md" />
            </div>
            <button
              className="ml-3 px-2.5 py-1 bg-gradient-to-r from-[#f70cc0] to-[#a10080] text-white rounded font-bold"
              onClick={() => {
                if (localStorage.getItem("role") !== "admin") {
                  toast.error("Access Denied: Admins only");
                } else setShowPopup(true);
              }}
            >Add Members</button>
            {showPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded shadow w-[400px]">
                  <CForm onSubmit={addUser}>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="username">Username</CFormLabel>
                      <CFormInput id="username" value={username} onChange={e => setUsername(e.target.value)} />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="password">Password</CFormLabel>
                      <CFormInput type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="roleSelect">Role</CFormLabel>
                      <CFormSelect id="roleSelect" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="" disabled>Select a role</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </CFormSelect>
                    </CCol>
                    <CCol className="mb-3">
                      <CFormLabel htmlFor="jobTitle">Job Title</CFormLabel>
                      <CFormInput id="jobTitle" value={jobtitle} onChange={e => setJobtitle(e.target.value)} />
                    </CCol>
                    <CCol className="flex justify-end space-x-2 mt-3">
                      <CButton color="secondary" onClick={() => setShowPopup(false)}>Cancel</CButton>
                      <CButton color="primary" type="submit">Add User</CButton>
                    </CCol>
                  </CForm>
                </div>
              </div>
            )}
          </div>
          <div className="w-3/12 flex justify-end items-center space-x-4">
            <CIcon icon={cilBell} className="cursor-pointer" />
            <CIcon icon={cilSettings} className="cursor-pointer" />
            <UserButton />
          </div>
        </div>

        <div className="mt-8 px-4">
          <h2 className="font-bold text-xl">Organization Members</h2>
          <p className="text-gray-600">Connect with other members from your organization</p>
        </div>

        <div className="h-[505px] w-full mt-4">
          <Card color="transparent" className="h-full w-full px-6" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full table-auto text-left border">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f70cc0] to-[#a10080]">
                    {['Name','Role','Job Title','Date Joined'].map(head => (
                      <th key={head} className="py-2 px-2 text-white">
                        <Typography as="span" variant="small" color="white" className="font-bold text-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {error || members.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">{error ? 'Error loading members' : 'No members yet'}</td></tr>
                  ) : (
                    members.map(member => (
                      <tr key={member.user_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(member.user_id)}>
                        <td className="py-4"><span className="font-bold">{member.name}</span></td>
                        <td className="py-4">{member.role}</td>
                        <td className="py-4">{member.jobtitle}</td>
                        <td className="py-4">{member.joindate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {showModal && selectedUserId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this user?</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button onClick={() => deleteUser(selectedUserId)} className="px-4 py-2 bg-red-500 text-white rounded">Delete User</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
