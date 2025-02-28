// /app/dashboard/page.tsx
import React from "react";
import AddUserDashboard from "./Dashboard"; // Importing the Dashboard component if necessary

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <AddUserDashboard/> {/* Optional component */}
    </div>
  );
}
