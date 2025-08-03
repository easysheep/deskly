import { query } from "../../../utils/db"; // Adjust the path to your db query utility
import { NextResponse } from "next/server";
import {redis} from "../../../services/redis"; // Import centralized Redis instance

const generateRedisKey = (projectId) => {
  return `messages:${projectId}`;
};

export const POST = async (req) => {
  try {
    const { text, username, projectId, time } = await req.json();

    // Ensure all required fields are present
    if (!text || !username || !projectId || !time) {
      return NextResponse.json(
        { error: "Missing required fields: text, username, projectId, time" },
        { status: 400 }
      );
    }

    // Insert the message into the database
    const result = await query(
      `INSERT INTO messages (text, username, project_id, time) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
      [text, username, projectId, time]
    );

    const newMessage = result.rows[0];

    // Update Redis cache
    const redisKey = generateRedisKey(projectId);
    await redis.rpush(redisKey, JSON.stringify(newMessage)); // Add message to Redis list
    await redis.expire(redisKey, 86400); // Set expiry to 24 hours (86400 seconds)

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
};

// Handle GET requests to fetch messages
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId query parameter" },
        { status: 400 }
      );
    }

    const redisKey = generateRedisKey(projectId); // Correctly generate the Redis key

    // Try fetching messages from Redis
    console.log(`Checking Redis cache for projectId: ${projectId}`); // Log Redis check
    const cachedMessages = await redis.lrange(redisKey, 0, -1);

    if (cachedMessages.length > 0) {
      // Log that data was found in Redis
      console.log(`Data found in Redis for projectId: ${projectId}`);

      // Parse Redis messages and return them
      const parsedMessages = cachedMessages.map((msg) => JSON.parse(msg));
      return NextResponse.json(parsedMessages, { status: 200 });
    }

    // If not found in Redis, fetch from the database
    console.log(
      `Data not found in Redis. Querying database for projectId: ${projectId}`
    ); // Log database query
    const result = await query(
      `SELECT * FROM messages WHERE project_id = $1 ORDER BY time ASC`,
      [projectId]
    );

    const messages = result.rows;

    // Log that we are updating the cache
    if (messages.length > 0) {
      console.log(
        `Caching ${messages.length} messages for projectId: ${projectId} in Redis`
      );
      await redis.del(redisKey); // Clear any existing cache
      const pipeline = redis.pipeline();
      messages.forEach((message) =>
        pipeline.rpush(redisKey, JSON.stringify(message))
      );
      pipeline.expire(redisKey, 86400); // Set expiry to 24 hours
      await pipeline.exec();
    }

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
};
