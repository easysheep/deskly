import Redis, { RedisOptions } from "ioredis";

// Define Redis connection options
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10), // Ensure the port is parsed as an integer
  password: process.env.REDIS_PASSWORD || "",
};

// Create a new Redis instance with the options
const redis = new Redis(redisOptions);

export default redis;
