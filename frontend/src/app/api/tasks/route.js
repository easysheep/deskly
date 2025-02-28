import { query } from "../../../utils/db"; // Adjust path based on your db connection file
import { NextResponse } from "next/server"; // Import NextResponse

// GET /tasks or /tasks?id=:id
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Fetch specific task
      const result = await query("SELECT * FROM tasks WHERE task_id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0], { status: 200 });
    } else {
      // Fetch all tasks
      const result = await query("SELECT * FROM tasks");
      return NextResponse.json(result.rows, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
};

// // POST /tasks
// export const POST = async (req) => {
//   const {
//     task_id,
//     task_name,
//     description,
//     status,
//     priority,
//     due_date,
//     assignee_id,
//     project_id,
//   } = await req.json();

//   if (!task_id || !task_name || !status) {
//     return NextResponse.json(
//       { error: "Task ID, Task Name, and Status are required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const result = await query(
//       `INSERT INTO tasks (task_id, task_name, description, status, priority, due_date, assignee_id, project_id, created_at, updated_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
//       [
//         task_id,
//         task_name,
//         description || null,
//         status,
//         priority || null,
//         due_date || null,
//         assignee_id || null,
//         project_id || null,
//       ]
//     );

//     return NextResponse.json(
//       { message: "Task created successfully", task: result.rows[0] },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating task:", error);
//     return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
//   }
// };

export const POST = async (req) => {
  try {
    const {
      task_name,
      description,
      status,
      priority,
      due_date,
      assignee_id,
      project_id,
      org_id, // Add org_id to the request body
    } = await req.json();

    // Validate required fields
    if (!task_name || !status) {
      return NextResponse.json(
        { error: "Task Name and Status are required" },
        { status: 400 }
      );
    }

    if (!org_id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Generate task_id manually (fetch the max id and increment it)
    const maxIdResult = await query(`SELECT MAX(task_id) AS max_id FROM tasks`);
    const newTaskId = maxIdResult.rows[0]?.max_id + 1 || 1;

    // Insert task into the database with generated task_id and org_id
    const result = await query(
      `INSERT INTO tasks (task_id, task_name, description, status, priority, due_date, assignee_id, project_id, created_at, updated_at, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9) RETURNING *`,
      [
        newTaskId,
        task_name,
        description || null,
        status,
        priority || null,
        due_date || null,
        assignee_id || null,
        project_id || null,
        org_id, // Include org_id as the last value in the parameters array
      ]
    );

    return NextResponse.json(
      { message: "Task created successfully", task: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task. Please try again later." },
      { status: 500 }
    );
  }
};

// PUT /tasks?id=:id
export const PUT = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { assignee_id, status, priority } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  // Ensure only one field is being updated
  const updates = [assignee_id, status, priority].filter(Boolean);
  if (updates.length !== 1) {
    return NextResponse.json(
      {
        error:
          "Only one field (assignee_id, status, or priority) can be updated at a time",
      },
      { status: 400 }
    );
  }

  try {
    let queryText = "";
    let values = [];

    // Handle each case
    if (assignee_id) {
      queryText = `
        UPDATE tasks
        SET assignee_id = array_append(assignee_id, $1), updated_at = NOW()
        WHERE task_id = $2
        RETURNING *`;
      values = [assignee_id, id];
    } else if (status) {
      queryText = `
        UPDATE tasks
        SET status = $1, updated_at = NOW()
        WHERE task_id = $2
        RETURNING *`;
      values = [status, id];
    } else if (priority) {
      queryText = `
        UPDATE tasks
        SET priority = $1, updated_at = NOW()
        WHERE task_id = $2
        RETURNING *`;
      values = [priority, id];
    }

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
};

// DELETE /tasks?id=:id
export const DELETE = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const result = await query(
      "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Task deleted successfully", task: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
};

// PATCH /tasks?id=:id
export const PATCH = async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { task_name, description, status, priority, due_date, project_id } =
    await req.json();

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE tasks 
       SET task_name = COALESCE($1, task_name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           project_id = COALESCE($6, project_id),
           updated_at = NOW()
       WHERE task_id = $7 RETURNING *`,
      [task_name, description, status, priority, due_date, project_id, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating task details:", error);
    return NextResponse.json(
      { error: "Failed to update task details" },
      { status: 500 }
    );
  }
};
