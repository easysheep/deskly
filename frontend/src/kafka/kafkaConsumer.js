const { Kafka } = require("kafkajs");


// Kafka setup
const kafka = new Kafka({
  clientId: "activity-logs",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"], // Replace with your broker address
});

const consumer = kafka.consumer({ groupId: "activity-logs-group" });

// Function to send log data to your API
async function postLogDataToApi(logData, kafkaOffset, kafkaPartition) {
  const apiUrl = "http://localhost:3000/api/activitylogs"; // Ensure this URL is correct
  const bodyData = {
    ...logData,
    kafka_offset: kafkaOffset,
    kafka_partition: kafkaPartition,
  };

  console.log("Request body being sent to API:", JSON.stringify(bodyData, null, 2)); // Log the body data

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const responseBody = await response.text(); // Capture raw response text for debugging
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


// Function to consume messages and send them to the API
async function run() {
  try {
    // Connect to Kafka
    await consumer.connect();
    console.log("Consumer connected to Kafka");

    // Subscribe to the Kafka topic
    const topic = "project_activity_logs";
    await consumer.subscribe({
      topic,
      fromBeginning: true, // Start consuming from the beginning
    });
    console.log(`Consumer subscribed to topic: ${topic}`);

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const logData = JSON.parse(message.value.toString());
          console.log('function called');
          console.log(`Consumed message from Kafka:`, logData);
          console.log('function calling');

          // Send the log data to the /activitylogs API route after consuming the message
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

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down consumer...");
    await consumer.disconnect();
    console.log("Consumer disconnected.");
    process.exit(0);
  });
}

// Run the consumer
run().catch(console.error);
