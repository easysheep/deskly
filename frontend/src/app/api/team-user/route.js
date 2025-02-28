import { query } from "../../../utils/db"; // Adjust the path as needed
import { NextResponse } from "next/server";

export async function PUT(req) {
    const { searchParams } = new URL(req.url); // Parse the request URL
    const id = searchParams.get("id"); // Extract the `id` from the query parameters
    const { action, team_id } = await req.json();

  if (!id || !action || !team_id) {
    return NextResponse.json(
      { error: "Missing required fields: id, action, or team_id" },
      { status: 400 }
    );
  }

  try {
    if (action === "addTeam") {
      // Append team_id to the user's teams array
      const updateQuery = `
        UPDATE "user"
        SET teams = array_append(teams, $1)
        WHERE user_id = $2;
      `;
      await query(updateQuery, [team_id, id]);

      return NextResponse.json({ message: "Team added to user successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url); // Parse the request URL
    const id = searchParams.get("id"); // Extract the `id` from the query parameters
    const { action, team_id } = await req.json();

  if (!id || !action || !team_id) {
    return NextResponse.json(
      { error: "Missing required fields: id, action, or team_id" },
      { status: 400 }
    );
  }

  try {
    if (action === "removeTeam") {
      // Remove team_id from the user's teams array
      const updateQuery = `
        UPDATE "user" 
        SET teams = array_remove(teams, $1)
        WHERE user_id = $2;
      `;
      await query(updateQuery, [team_id, id]);

      return NextResponse.json({ message: "Team removed from user successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
