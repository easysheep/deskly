import { query } from "../../../utils/db"; // Adjust the path to your database connection file
import { NextResponse } from "next/server";




// Handle DELETE request for deleting a member by user_id
export const DELETE = async (req) => {
  try {
    // Extract user_id from the query string
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Query the database to delete the user by user_id
    const result = await query(
      `DELETE FROM "user" WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If deletion is successful, return a success message
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    // Extract org_id from the query string
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id");

    console.log("Received org_id:", org_id);

    if (!org_id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Query the database for projects with the given org_id
    const result = await query(
      `SELECT * FROM "user" WHERE org_id = $1`,
      [org_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No projects found for this organization" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows, { status: 200 }); // Return the projects
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
};

export const POST = async (req) => {
  try {
    const { username, password, role, org_id,jobtitle } = await req.json();

    if (!username || !password || !role || !org_id || !jobtitle) {
      return NextResponse.json(
        { error: "All fields (username, password, role, org_id,jobtitle) are required" },
        { status: 400 }
      );
    } 

    // Fetch the maximum user_id from the "user" table to generate the next user_id
    const result = await query(
      `SELECT MAX(user_id) AS max_id FROM "user" WHERE org_id = $1`,
      [org_id]
    );

    const maxId = result.rows[0]?.max_id || 0;
    const newUserId = maxId + 1;

    // Insert the new user into the "user" table
    const insertResult = await query(
      `INSERT INTO "user" 
        (user_id, username, password, role, teams, projects, created_at, updated_at, org_id,jobtitle)
       VALUES 
        ($1, $2, $3, $4, ARRAY[]::INTEGER[], ARRAY[]::INTEGER[], NOW(), NOW(), $5, $6) 
       RETURNING *`,
      [newUserId, username, password, role, org_id, jobtitle]
    );

    // Return the created user data
    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 }
    );
  }
};