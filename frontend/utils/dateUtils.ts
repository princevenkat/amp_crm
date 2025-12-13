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
