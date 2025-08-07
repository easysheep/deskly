const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "activity-logs",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "activity-logs-group" });

async function postLogDataToApi(logData, kafkaOffset, kafkaPartition) {
  const apiUrl = "http://localhost:3000/api/activitylogs";
  const bodyData = {
    ...logData,
    kafka_offset: kafkaOffset,
    kafka_partition: kafkaPartition,
  };

  console.log("Request body being sent to API:", JSON.stringify(bodyData, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const responseBody = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", responseBody);

    if (!response.ok) {
      throw new Error(`Failed to send log data: ${response.status}`);
    }

    console.log("Log data successfully inserted:", responseBody);
  } catch (error) {
    console.error("Error sending log data:", error.message);
  }
}

async function run() {
  try {
    await consumer.connect();
    console.log("Consumer connected to Kafka");

    const topic = "project_activity_logs";
    await consumer.subscribe({
      topic,
      fromBeginning: true,
    });
    console.log(`Consumer subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const logData = JSON.parse(message.value.toString());
          console.log('function called');
          console.log(`Consumed message from Kafka:`, logData);
          console.log('function calling');

          await postLogDataToApi(logData, message.offset, partition);
        } catch (err) {
          console.error("Error in eachMessage handler:", err.message);
        }
      },
    });

    console.log("Consumer is running and listening for messages...");
  } catch (err) {
    console.error(`Error starting consumer: ${err.message}`);
  }

  process.on("SIGINT", async () => {
    console.log("Shutting down consumer...");
    await consumer.disconnect();
    console.log("Consumer disconnected.");
    process.exit(0);
  });
}

run().catch(console.error);
