export function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Function to format tags for display
export function formatTagForDisplay(tag) {
  if (!tag) return "";

  // Specific replacements first (case-insensitive, whole word)
  let formattedTag = tag
    .replace(/Ai/gi, "AI")
    .replace(/Cot/gi, "CoT")
    .replace(/Ml/gi, "ML");

  // Capitalize each word, preserving already uppercase specific cases
  formattedTag = formattedTag
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();
      if (lowerWord === "ai") return "AI";
      if (lowerWord === "cot") return "CoT";
      if (lowerWord === "ml") return "ML";
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1); // Keep original casing for rest of word for potential acronyms
    })
    .join(" ");

  return formattedTag;
}

export function noveltyClass(p) {
  if (p === null || p === undefined) return "";
  if (p >= 80) return "bg-green-100 text-green-800 ring-green-200";
  if (p >= 50) return "bg-yellow-100 text-yellow-800 ring-yellow-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}
