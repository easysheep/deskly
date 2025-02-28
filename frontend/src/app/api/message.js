import { query } from "@/utils/db";
import redisClient from "@/utils/redis";

export default async function handler(req, res) {
  const { user } = req.query;

  // Fetch messages from Redis
  const redisMessages = await redisClient.lrange(`chat:${user}`, 0, -1);

  // Fetch messages from PostgreSQL
  const { rows } = await query(
    "SELECT sender, content, timestamp FROM messages WHERE recipient = $1 ORDER BY timestamp ASC",
    [user]
  );

  const messages = [...redisMessages.map((msg) => JSON.parse(msg)), ...rows];

  res.status(200).json(messages);
}
