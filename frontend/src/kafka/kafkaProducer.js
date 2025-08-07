const { Kafka, Partitioners } = require("kafkajs");
const { Client } = require("pg");

const kafka = new Kafka({
  clientId: "activity-logs",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const pgClient = new Client({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "postgres",
  database: process.env.POSTGRES_DB || "DTSM",
  password: process.env.POSTGRES_PASSWORD || "kingcrimson69",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
});

const LISTEN_CHANNEL = "kafka_producer";

async function run() {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL");

    await producer.connect();
    console.log("Kafka producer connected");

    pgClient.on("notification", async (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        console.log("Payload received from PostgreSQL:", payload);

        await producer.send({
          topic: "project_activity_logs",
          messages: [{ value: JSON.stringify(payload) }],
        });

        console.log(`Produced message to Kafka: ${JSON.stringify(payload)}`);
      } catch (err) {
        console.error(`Error producing Kafka message: ${err.message}`);
      }
    });

    await pgClient.query(`LISTEN ${LISTEN_CHANNEL}`);
    console.log(`Listening to PostgreSQL channel: ${LISTEN_CHANNEL}`);
  } catch (err) {
    console.error(`Error setting up producer: ${err.message}`);
  }

  process.on("SIGINT", async () => {
    console.log("Shutting down producer...");
    await producer.disconnect();
    await pgClient.end();
    process.exit(0);
  });
}

run().catch(console.error);
