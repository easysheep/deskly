import React from "react";
import {
  CBadge,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavGroup,
  CNavItem,
  CNavTitle,
} from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import CIcon from "@coreui/icons-react";
import {
  cilCloudDownload,
  cilLayers,
  cilPuzzle,
  cilSpeedometer,
  cilApplications,
  cilBullhorn,
  cilContact,
  cilGroup,
  cilHome,
  cilSettings,
  cilMoodGood,
} from "@coreui/icons";

const org_id = localStorage.getItem("orgId");
const role = localStorage.getItem("role");
const user_id = localStorage.getItem("userId");
export const Sidebar = () => {
  return (
    <CSidebar className="border-right border-2 min-h-screen">
      <CSidebarHeader className="border-bottom text-white p-0 bg-[#F8F8F8]">
        <CSidebarBrand>
          <img
            src="/LOGO.png"
            alt="Logo"
            className="h-16 w-auto"
            style={{ objectFit: "contain" }}
          />
        </CSidebarBrand>
      </CSidebarHeader>

      <CSidebarNav className=" font-robotoMono  text-[#B83FAA]">
        <CNavTitle>Sidebar</CNavTitle>
        <CNavItem href="/">
          <CIcon
            customClassName="nav-icon text-zz"
            className="text-[#B83FAA] fill-current "
            icon={cilHome}
          />
          Home
        </CNavItem>

        <CNavItem href={`/orgboard/${org_id}`}>
          <CIcon customClassName="nav-icon" icon={cilApplications} /> Projects
        </CNavItem>
        <CNavItem href={`/members/${org_id}`}>
          <CIcon customClassName="nav-icon" icon={cilContact} /> Members
        </CNavItem>

        <CNavItem href={`/teams/${org_id}`}>
          <CIcon customClassName="nav-icon" icon={cilGroup} /> Teams
        </CNavItem>

        {(role === "Employee" || role === "viewer" || role==="employee") && (
          <div>
            <CNavItem href={`/me/${user_id}`}>
              <CIcon customClassName="nav-icon" icon={cilMoodGood} />
              Me
            </CNavItem>
          </div>
        )}

        {role === "admin" && (
          <div>
            <CNavItem href={`/settings/${org_id}`}>
              <CIcon customClassName="nav-icon" icon={cilSettings} />
              Settings
            </CNavItem>
          </div>
        )}
      </CSidebarNav>
    </CSidebar>
  );
};
