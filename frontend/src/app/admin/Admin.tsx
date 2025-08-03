"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import LoadingAnimation from "@/components/LoadingAnimations";
import "../../styles/flip-card.css";
import CIcon from "@coreui/icons-react";
import { cilArrowCircleLeft} from "@coreui/icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
interface OrganizationFormData {
  org_name: string;
  owner_name: string;
}

const Admin: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<OrganizationFormData>({
    org_name: "",
    owner_name: "",
  });
  const [organization, setOrganization] = useState<any>(null); // Store organization info
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [showForm, setShowForm] = useState(true);

  const handleClick = () => {
    setShowForm(false); // Hide the form and show organization details
  };

  // Fetch organization data when the user is logged in
  useEffect(() => {
    if (user && user.id) {
      fetch(`/api/organization?id=${user.id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && !data.error) {
            setOrganization(data); // Set existing organization info
            console.log(data);
          } else {
            setError(data.error || "Failed to fetch organization.");
          }
        })
        .catch((error) =>
          setError("Error fetching organization: " + error.message)
        )
        .finally(() => setLoading(false)); // Set loading to false after fetch completes
    } else {
      setLoading(false); // Set loading to false if user is not available
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      console.error("User ID is required");
      toast.error("User ID is missing!");
      return;
    }

    const data = {
      ...formData,
      owner_user_id: user.id, // Pass the logged-in user's ID
    };

    const createOrganization = async () => {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create organization");

      const result = await response.json();
      localStorage.setItem("orgId", result.orgId); // Store the org ID in localStorage
      return result;
    };

    toast
      .promise(createOrganization(), {
        loading: "Creating organization...",
        success: "Organization created successfully!",
        error: "Failed to create organization.",
      })
      .then((result) => {
        setOrganization(result); // Set organization info to hide form
        const orgId = localStorage.getItem("orgId"); // Retrieve orgId
        if (orgId) {
          router.push(`/orgboard/${orgId}`); // Redirect to the org board
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className="mx-auto bg-white rounded-xl shadow-md space-y-4 w-full h-screen flex items-center justify-between"
      style={{
        backgroundImage: "url('/admin.svg')",
        backgroundSize: "cover", // Ensures full screen coverage
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", // Prevents tiling
      }}
    >
      <Link href="/join">
        <button className="px-4 py-2 top-4 right-4 absolute bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-full transition-all hover:from-[#a10080] hover:to-[#c8009c] hover:border-2 hover:border-white">
          Join Organization
        </button>
      </Link>

      {/* Form moved to the right side */}
      <div className="w-7/12 h-screen overflow-hidden">
        <div className="flex flex-col pt-12  px-6 h-full">
          {/* Conditional rendering */}
          {showForm ? (
            // Form to create an organization
            <>
              <h1 className="text-6xl font-extrabold text-gray-800">
                Create Your
              </h1>
              <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <p>Organization</p>
              </div>

              <form
                className="space-y-4 bg-white bg-opacity-70 p-6 rounded-lg w-full max-w-lg mt-10"
                onSubmit={handleSubmit}
              >
                <div>
                  <label
                    htmlFor="org_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="org_name"
                    name="org_name"
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="owner_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Owner Name
                  </label>
                  <input
                    type="text"
                    id="owner_name"
                    name="owner_name"
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-full transition-all hover:from-[#a10080] hover:to-[#c8009c] "
                >
                  Create Organization
                </button>
              </form>
            </>
          ) : (
            // Organization details
            <>
              <h1 className="text-6xl font-extrabold text-gray-800">
                Choose Your
              </h1>
              <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-10">
                <p>Organization</p>
              </div>

              {/* Show the existing organization details if available */}
              {organization && organization.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
                  {organization.map((org: any) => (
                    <div
                      key={org.org_id}
                      className="relative w-full h-28 group cursor-pointer perspective-1000"
                    >
                      <Link
                        href={`/orgboard/${org.org_id}`}
                        onClick={() => {
                          localStorage.setItem("username", org.owner_name);
                          localStorage.setItem("role", "admin");
                          localStorage.setItem("orgId", org.org_id);
                          localStorage.setItem("orgname", org.org_name);
                        }}
                      >
                        <div className="flip-card w-full h-48">
                          {/* Flip Card Inner */}
                          <div className="flip-card-inner w-full h-full">
                            {/* Front of the card */}
                            <div className="flip-card-front p-6 border-2 rounded-lg bg-[#DFE7F0] bg-opacity-70 shadow-lg flex flex-col justify-center items-center space-y-4">
                              <h2 className="font-semibold text-lg text-center font-spaceGrotesk">
                                {org.org_name}
                              </h2>
                              <p className="text-sm text-center font-dm">
                                <strong>Owner:</strong> {org.owner_name}
                              </p>
                            </div>

                            {/* Back of the card */}
                            <div className="flip-card-back p-6 bg-gradient-to-r from-pink-700 to-pink-500 rounded-lg shadow-xl flex flex-col justify-center items-center space-y-4 text-white">
                              <h2 className="font-semibold text-lg text-center font-spaceGrotesk">
                                {org.org_name}
                              </h2>
                              <p className="text-sm text-center font-dm">
                                <strong>Owner:</strong> {org.owner_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No organizations found.</p>
              )}
            </>
          )}

          {/* Click here to toggle between form and organizations */}
          {showForm ? (
            <div
              className="text-black pl-4 cursor-pointer"
              onClick={handleClick}
            >
              Select from your created organizations, Click here
            </div>
          ) : (
            <div
              className="text-black pl-4 cursor-pointer mt-20 flex gap-2 items-center "
              onClick={() => setShowForm(true)}
            >
              <CIcon icon={cilArrowCircleLeft} className="h-8" />
              Back to Create Organization
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
