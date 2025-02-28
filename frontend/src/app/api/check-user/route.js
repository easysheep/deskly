import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse

export const POST = async (req) => {
  const { username, password } = await req.json();

  try {
    // Modified query to include user_id and join with the organization table
    const result = await query(
      `
      SELECT 
        u.user_id, 
        u.org_id, 
        u.role, 
        o.org_name 
      FROM "user" u
      JOIN "organization" o ON u.org_id = o.org_id
      WHERE u.username = $1 AND u.password = $2
      `,
      [username, password]
    );

    if (result.rows.length > 0) {
      // User found, send org_id, role, user_id, and org_name
      return NextResponse.json(
        {
          user_id: result.rows[0].user_id,
          org_id: result.rows[0].org_id,
          role: result.rows[0].role,
          org_name: result.rows[0].org_name,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
};

export const PUT = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { username, password } = await req.json();

  // Ensure the user ID is provided
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Ensure at least one field to update (username or password) is provided
  if (!username && !password) {
    return NextResponse.json(
      { error: "At least one field (username or password) is required" },
      { status: 400 }
    );
  }

  try {
    let queryText = "";
    let values = [];

    // Handle each case for updating
    if (username && password) {
      queryText = `
        UPDATE "user"
        SET username = $1, password = $2, updated_at = NOW()
        WHERE user_id = $3
        RETURNING *`;
      values = [username, password, id];
    } else if (username) {
      queryText = `
        UPDATE "user"
        SET username = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING *`;
      values = [username, id];
    } else if (password) {
      queryText = `
        UPDATE "user"
        SET password = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING *`;
      values = [password, id];
    }

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
};
