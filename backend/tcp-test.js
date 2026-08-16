import net from "net";

const socket = new net.Socket();

socket.setTimeout(10000);

socket.connect(3306, "77.37.35.180", () => {
  console.log("TCP CONNECTED");
});

socket.on("data", (data) => {
  console.log("RECEIVED BYTES:", data.length);
  console.log("HEX:");
  console.log(data.toString("hex"));

  console.log("\nRAW:");
  console.log(data.toString("latin1"));

  socket.destroy();
});

socket.on("close", () => {
  console.log("TCP CLOSED");
});

socket.on("error", (err) => {
  console.error("TCP ERROR:", err);
});

socket.on("timeout", () => {
  console.error("TCP TIMEOUT");
  socket.destroy();
});
