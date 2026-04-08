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

// export function splitDateTime(dateString: string): {
//   date: string;
//   time: string;
// } {
//   if (!dateString) return { date: "", time: "" };

//   const dateObj = new Date(dateString);

//   // Date in YYYY-MM-DD format
//   const date = dateObj.toLocaleDateString("en-CA");

//   // Time in 12-hour format with AM/PM
//   const time = dateObj.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return { date, time };
// }

/**
 * Split a date-time string into date and time
 * Date: DD/M/YYYY
 * Time: 24-hour format HH:mm
 */
export function splitDateTime(dateTime: string | undefined) {
  if (!dateTime) return { date: "", time: "" };

  const dt = new Date(dateTime);

  if (isNaN(dt.getTime())) return { date: "", time: "" };

  const day = dt.getDate(); // 1-31
  const month = dt.getMonth() + 1; // 0-indexed
  const year = dt.getFullYear();

  const hours = dt.getHours().toString().padStart(2, "0");
  const minutes = dt.getMinutes().toString().padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`, // e.g. 27/1/2026
    time: `${hours}:${minutes}`, // e.g. 14:05 (24-hour)
  };
}

/**
 * Convert HH:mm or HH:mm:ss from DB to 24-hour display
 */
export function formatDbTime(time?: string): string {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);
  const hh = hour.toString().padStart(2, "0");
  const mm = minute.toString().padStart(2, "0");

  return `${hh}:${mm}`; // 24-hour
}

/**
 * Format a date for <input type="date" /> (YYYY-MM-DD)
 */
export const formatDateForInput = (date?: string | Date | null): string => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateSafe = (value?: string) => {
  if (!value) return "—";

  const clean = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];

  const [y, m, d] = clean.split("-");
  return `${d}/${m}/${y}`;
};

/**
 * Format a date for display (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date?: string | Date | null): string => {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
