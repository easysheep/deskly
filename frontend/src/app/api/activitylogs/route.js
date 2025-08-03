import { query } from "../../../utils/db"; // Adjust the path to your database query utility

export const POST = async (req) => {
  try {
    // Parse the request body
    const {
      table,
      operation,
      old_data,
      new_data,
      kafka_offset,
      kafka_partition,
    } = await req.json();

    // Extract `org_id` from `new_data`
    const org_id = new_data?.org_id || old_data?.org_id;

    // Current timestamp for `created_at`
    const created_at = new Date().toISOString();

    // Log parsed data for debugging
    console.log("Parsed data for insertion:", {
      table,
      operation,
      org_id,
      old_data,
      new_data,
      created_at,
      kafka_offset,
      kafka_partition,
    });

    // Insert query for `activitylogs` table
    // const result = await query(
    //   `INSERT INTO activitylogs (
    //       table_name, 
    //       operation_type, 
    //       org_id, 
    //       old_data, 
    //       new_data, 
    //       created_at, 
    //       kafka_offset, 
    //       kafka_partition
    //     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    //   [
    //     table, // Maps to table_name
    //     operation, // Maps to operation_type
    //     org_id, // Extracted from new_data
    //     old_data, // Maps to old_data
    //     new_data, // Maps to new_data
    //     created_at, // Current timestamp
    //     kafka_offset, // Maps to kafka_offset
    //     kafka_partition, // Maps to kafka_partition
    //   ]
    // );

    // Success response
    return new Response(
      JSON.stringify({ message: "Log inserted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inserting log data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to insert log data" }),
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    // Extract `org_id` from query parameters
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id");

    if (!org_id) {
      return new Response(JSON.stringify({ error: "org_id is required" }), {
        status: 400,
      });
    }

    // Log `org_id` for debugging
    console.log("Fetching data for org_id:", org_id);

    // Query the database to fetch records related to `org_id`
    const result = await query(`SELECT * FROM activitylogs WHERE org_id = $1`, [
      org_id,
    ]);

    // Check if any records were found
    if (result.rowCount === 0) {
      return new Response(
        JSON.stringify({ message: "No records found for the provided org_id" }),
        { status: 404 }
      );
    }

    // Success response with fetched data
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
};
