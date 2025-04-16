export function formatDate(dateString) {
  if (!dateString) return "Invalid Date";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      // Use locale-sensitive formatting
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return "Invalid Date";
  }
}
