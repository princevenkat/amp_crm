// export function splitDateTime(dateString: string): {
//   date: string;
//   time: string;
// } {
//   if (!dateString) return { date: "", time: "" };

//   const dateObj = new Date(dateString);

//   // Format date as YYYY-MM-DD
//   const date = dateObj.toLocaleDateString("en-CA");

//   // Format time as HH:MM in 24h
//   const time = dateObj.toLocaleTimeString("en-GB", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return { date, time };
// }

export function splitDateTime(dateString: string): {
  date: string;
  time: string;
} {
  if (!dateString) return { date: "", time: "" };

  const dateObj = new Date(dateString);

  // Date in YYYY-MM-DD format
  const date = dateObj.toLocaleDateString("en-CA");

  // Time in 12-hour format with AM/PM
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date, time };
}

export function formatDbTime(time?: string): string {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);

  const meridiem = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${meridiem}`;
}
