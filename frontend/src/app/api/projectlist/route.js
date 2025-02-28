import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse


export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");

  console.log("Received org_id:", org_id);

  try {
    if (org_id) {
      const result = await query(
        `SELECT * FROM projects WHERE org_id = $1`,
        [org_id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "No projects found for this organization" },
          { status: 404 }
        );
      }
      return NextResponse.json(result.rows, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
};

