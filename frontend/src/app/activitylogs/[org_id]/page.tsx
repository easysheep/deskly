"use client";
import React, { useEffect, useState, useRef } from "react";

interface ActivityLog {
  table_name: string;
  operation_type: string;
  org_id: number;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  created_at: string;
  kafka_offset: string;
  kafka_partition: number;
}

const ActivityLogs: React.FC = () => {
  const org_id = localStorage.getItem("orgId"); // Static org_id
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null); // Ref for the bottom of the logs
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username")
      : "Unknown User";

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const response = await fetch(`/api/activitylogs?org_id=${org_id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: ActivityLog[] = await response.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [org_id]);

  // Scroll to the bottom whenever logs are updated
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const formatLogMessage = (log: ActivityLog) => {
    const { table_name, operation_type, old_data, new_data } = log;
    let message = `Unknown operation on ${table_name}`;

    // Helper function to compare fields only if their values are different
    // (For other tables, if needed)
    const compareFields = (
      oldData: Record<string, any>,
      newData: Record<string, any>
    ) => {
      let changes = [];
      for (let key in oldData) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        // Skip if values are identical (or both empty arrays/objects)
        if (
          (Array.isArray(oldValue) &&
            Array.isArray(newValue) &&
            JSON.stringify(oldValue) !== JSON.stringify(newValue)) ||
          (typeof oldValue === "object" &&
            typeof newValue === "object" &&
            JSON.stringify(oldValue) !== JSON.stringify(newValue)) ||
          (oldValue !== newValue &&
            !(Array.isArray(oldValue) && oldValue.length === 0) &&
            oldValue !== "" &&
            newValue === "")
        ) {
          changes.push(`${key} changed from "${oldValue}" to "${newValue}"`);
        }
      }
      return changes.length > 0 ? changes.join(", ") : null;
    };

    if (operation_type === "INSERT") {
      if (table_name === "tasks") {
        message = `Task "${new_data?.task_name}" added in project ${new_data?.project_id}`;
      } else if (table_name === "projects") {
        message = `Project "${new_data?.project_name}" created`;
      } else if (table_name === "teams") {
        message = `Team "${new_data?.team_name}" created`;
      } else if (table_name === "user") {
        message = `User "${new_data?.username}" added to the organization`;
      }
    } else if (operation_type === "UPDATE") {
      if (table_name === "tasks" && old_data && new_data) {
        // For tasks, compare only the status and priority fields.
        let changes = [];
        if (old_data.status !== new_data.status) {
          changes.push(
            `status changed from "${old_data.status}" to "${new_data.status}"`
          );
        }
        if (old_data.priority !== new_data.priority) {
          changes.push(
            `priority changed from "${old_data.priority}" to "${new_data.priority}"`
          );
        }
        if (changes.length > 0) {
          message = `Task "${
            old_data.task_name
          }" updated. Changes: ${changes.join(", ")}`;
        } else {
          message = `Task "${old_data.task_name}" updated with no changes`;
        }
      } else if (table_name === "projects" && old_data && new_data) {
        const projectChanges = compareFields(old_data, new_data);
        if (projectChanges) {
          message = `Project "${old_data.project_name}" updated. Changes: ${projectChanges}`;
        } else {
          message = `Project "${old_data.project_name}" updated with no changes`;
        }
      } else if (table_name === "user" && old_data && new_data) {
        if (old_data.username !== new_data.username) {
          message = `User "${old_data.username}" updated. username changed from "${old_data.username}" to "${new_data.username}"`;
        }
      }
    } else if (operation_type === "DELETE") {
      if (table_name === "tasks" && old_data) {
        message = `Task "${old_data.task_name}" deleted`;
      } else if (table_name === "projects" && old_data) {
        message = `Project "${old_data.project_name}" deleted`;
      } else if (table_name === "teams" && old_data) {
        message = `Team "${old_data.team_name}" deleted`;
      } else if (table_name === "user" && old_data) {
        message = `User "${old_data.username}" deleted`;
      }
    }

    return `${message} by ${username}`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-800"></div>
      </div>
    );
  if (logs.length === 0)
    return (
      <p className="text-center text-gray-500 mt-4">
        No activity logs currently
      </p>
    );

  return (
    <div className="activity-logs-container bg-[#FAFAFA] rounded-lg shadow-lg">
      <div className="h-96 overflow-y-auto space-y-2 pt-24">
        {logs.map((log, index) => (
          <div
            key={index}
            className="bg-zz text-white text-center py-2 px-1 mx-2 my-1 rounded-lg shadow-md relative"
          >
            <p className="text-sm font-spaceGrotesk">{formatLogMessage(log)}</p>
            <div className="flex justify-between text-[10px] mt-2 absolute bottom-1 left-3 right-3">
              <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              <span>{new Date(log.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {/* Scroll to the bottom of the logs */}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default ActivityLogs;
