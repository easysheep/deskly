import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse

// Create a new project
export const POST = async (req) => {
  try {
    const { project_name, description, task_ids, team_id, org_id } = await req.json();

    if (!org_id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO projects (project_name, description, task_ids, team_id, org_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [project_name, description, task_ids, team_id, org_id]
    );

    const newProject = result.rows[0];

    return NextResponse.json(newProject, { status: 201 }); // Success response
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    ); // Internal server error response
  }
};
// Get a specific project by ID or all projects
export const GET = async (req) => {
  const { searchParams } = new URL(req.url); // Parse the URL to get search params
  const id = searchParams.get("id"); // Get the "id" query parameter

  try {
    if (id) {
      // Fetch a specific project
      const result = await query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        ); // Not found
      }
      return NextResponse.json(result.rows[0], { status: 200 }); // Success
    } else {
      // Fetch all projects if no ID is provided
      const result = await query(`SELECT * FROM projects`);
      return NextResponse.json(result.rows, { status: 200 }); // Success
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    ); // Internal server error
  }
};

// Update project details
export const PUT = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Get the `id` from the URL query string

  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    ); // Bad Request if no `id`
  }

  const { project_name, description, task_ids, team_id } = await req.json();

  try {
    const result = await query(
      `UPDATE projects 
       SET project_name = $1, description = $2, task_ids = $3, team_id = $4
       WHERE project_id = $5 RETURNING *`,
      [project_name, description, task_ids, team_id, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 }); // Not Found
    }

    return NextResponse.json(result.rows[0], { status: 200 }); // Success
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    ); // Internal Server Error
  }
};

// Delete a project
export const DELETE = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Get the `id` from the URL query string

  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    ); // Bad Request if no `id`
  }

  try {
    const result = await query(
      `DELETE FROM projects WHERE project_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 }); // Not Found
    }

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    ); // Success
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    ); // Internal Server Error
  }
};
