import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse

// Create a new user
export const POST = async (req) => {
  const { username, email, password_hash, role, team_id } = await req.json();

  try {
    const result = await query(
      "INSERT INTO users (username, email, password_hash, role, team_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, password_hash, role, team_id]
    );
    const newUser = result.rows[0];
    return NextResponse.json(newUser, { status: 201 }); // Return the created user with a 201 status
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    ); // Internal server error
  }
};

// Get a specific user by ID or all users
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Fetch a specific user
      const result = await query(`SELECT * FROM "user" WHERE user_id = $1`, [
        id,
      ]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 }); // Not found
      }
      return NextResponse.json(result.rows[0], { status: 200 }); // Success
    } else {
      // Fetch all users if no ID is provided
      const result = await query(`SELECT * FROM "user" `);
      return NextResponse.json(result.rows, { status: 200 }); // Success
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    ); // Internal server error
  }
};

// Update user details
export const PUT = async (req) => {
  const { user_id, project_id } = await req.json();
  console.log(user_id, project_id);

  // Validate input
  if (!user_id || !project_id) {
    return NextResponse.json(
      { error: "user_id and project_id are required" },
      { status: 400 }
    );
  }

  try {
    // Update the user's projects array in the database
    const result = await query(
      `
      UPDATE "user"
      SET projects = array_append(projects, $1)
      WHERE user_id = $2
      RETURNING *;
      `,
      [project_id, user_id]
    );

    // Check if the update was successful
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = result.rows[0];
    return NextResponse.json(updatedUser, { status: 200 }); // Return the updated user with a 200 status
  } catch (error) {
    console.error("Error updating user's projects:", error);
    return NextResponse.json(
      { error: "Failed to update user's projects" },
      { status: 500 }
    ); // Internal server error
  }
};

// Delete a user
export const DELETE = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Use nextUrl for query parameters

  try {
    const result = await query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 }); // Not found
    }
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    ); // Success
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    ); // Internal server error
  }
};
