import { query } from "../../../utils/db"; // Adjust the path based on your db connection file
import { NextResponse } from "next/server";

// Create a new organization
export const POST = async (req) => {
  try {
    const { org_name, owner_name, owner_user_id } = await req.json();

    // Ensure all required fields are present
    if (!org_name || !owner_name || !owner_user_id) {
      return NextResponse.json(
        {
          error: "All fields are required: org_name, owner_name, owner_user_id",
        },
        { status: 400 }
      );
    }

    // Insert the organization into the database
    const result = await query(
      `INSERT INTO organization (org_name, owner_name, owner_user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [org_name, owner_name, owner_user_id]
    );

    // Return the created organization
    const newOrganization = result.rows[0];
    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id"); // Get user ID from query params

  try {
    if (userId) {
      const result = await query(
        `SELECT * FROM organization WHERE owner_user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      // Return all organizations for the user
      return NextResponse.json(result.rows, { status: 200 });
    }

    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
};

// Update an organization
export const PUT = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  const { org_name } = await req.json();

  if (!org_name) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 }
    );
  }

  try {
    const result = await query(
      `UPDATE organization 
       SET org_name = $1 
       WHERE org_id = $2 
       RETURNING *`,
      [org_name, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
};


// Delete an organization
export const DELETE = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await query(
      `DELETE FROM organization WHERE org_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Organization deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
};
