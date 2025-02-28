import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse



// GET /teams or /teams?id=:id
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
      `SELECT * FROM teams WHERE org_id = $1`,
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

// PUT /teams?id=:id
// export const PUT = async (req) => {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   if (!id) {
//     return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
//   }

//   const { user_id } = await req.json();
//   if (!user_id || typeof user_id !== "number") {
//     return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
//   }

//   try {
//     const result = await query(
//       `UPDATE teams 
//        SET team_members = array_append(team_members, $1)
//        WHERE team_id = $2 RETURNING *`,
//       [user_id, id]
//     );

//     if (result.rows.length === 0) {
//       return NextResponse.json({ error: "Team not found" }, { status: 404 });
//     }

//     return NextResponse.json(result.rows[0], { status: 200 });
//   } catch (error) {
//     console.error("Error adding member:", error);
//     return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
//   }
// };
export const PUT = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const { action, user_id, team_name, description } = await req.json();

  try {
    if (action === "updateDetails") {
      if (!team_name || !description) {
        return NextResponse.json(
          { error: "Team name and description are required" },
          { status: 400 }
        );
      }

      const result = await query(
        `UPDATE teams SET team_name = $1, description = $2 WHERE team_id = $3 RETURNING *`,
        [team_name, description, id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0], { status: 200 });
    }

    if (action === "addMember") {
      if (!user_id || typeof user_id !== "number") {
        return NextResponse.json(
          { error: "Valid user ID is required" },
          { status: 400 }
        );
      }

      const result = await query(
        `UPDATE teams SET team_members = array_append(team_members, $1) WHERE team_id = $2 RETURNING *`,
        [user_id, id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0], { status: 200 });
    }

    if (action === "removeMember") {
      if (!user_id || typeof user_id !== "number") {
        return NextResponse.json(
          { error: "Valid user ID is required" },
          { status: 400 }
        );
      }

      const result = await query(
        `UPDATE teams SET team_members = array_remove(team_members, $1) WHERE team_id = $2 RETURNING *`,
        [user_id, id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0], { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};


// DELETE /teams?id=:id
export const DELETE = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  console.log(id);

  if (!id) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    const result = await query("DELETE FROM teams WHERE team_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Team deleted successfully", team: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
};

// PATCH /teams?id=:id
export const PATCH = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { team_name, description, team_lead, project_ids } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE teams 
       SET team_name = COALESCE($1, team_name),
           description = COALESCE($2, description),
           team_lead = COALESCE($3, team_lead),
           project_ids = COALESCE($4, project_ids)
       WHERE team_id = $5 RETURNING *`,
      [team_name, description, team_lead, project_ids, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating team details:", error);
    return NextResponse.json({ error: "Failed to update team details" }, { status: 500 });
  }
};

// POST /teams
export const POST = async (req) => {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");
  const { team_name, description, team_lead } = await req.json();

  // Validate required fields
  if (!team_name || !team_lead || !org_id) {
    return NextResponse.json(
      { error: "Team Name, Team Lead, and Organization ID are required" },
      { status: 400 }
    );
  }

  // Convert team_lead to a number
  const teamLeadNumber = Number(team_lead);
  if (isNaN(teamLeadNumber)) {
    return NextResponse.json(
      { error: "Team Lead must be a valid number" },
      { status: 400 }
    );
  }

  try {
    // Get the current maximum team_id
    const maxIdResult = await query(`SELECT MAX(team_id) AS max_id FROM teams`);
    const maxId = maxIdResult.rows[0]?.max_id || 0; // Default to 0 if no teams exist
    const newTeamId = maxId + 1;

    // Insert the new team into the database
    const result = await query(
      `INSERT INTO teams (team_id, team_name, description, created_at, updated_at, project_ids, team_lead, team_members, org_id)
       VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, $6, $7) RETURNING *`,
      [
        newTeamId,
        team_name,
        description || null,
        [], // Default empty array for project_ids
        teamLeadNumber,
        [], // Default empty array for team_members
        org_id,
      ]
    );

    return NextResponse.json(
      { message: "Team created successfully", team: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
};


