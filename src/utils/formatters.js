export function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Compact, human-friendly date used in the card meta row.
// The full date (formatDate) stays available for the tooltip.
export function formatRelativeDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date unknown";

  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / 3600000;

  // Relative wording only for the past; a future date (bad metadata,
  // timezone drift) falls through to the absolute short date.
  if (diffHours >= 0) {
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    const diffDays = diffHours / 24;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Hostname of a source URL, without a leading "www." ("" if unparseable)
export function sourceHost(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

// Function to format tags for display
export function formatTagForDisplay(tag) {
  if (!tag) return "";

  // Specific replacements first (case-insensitive, whole word)
  let formattedTag = tag
    .replace(/\bAi\b/gi, "AI")
    .replace(/\bCot\b/gi, "CoT")
    .replace(/\bMl\b/gi, "ML");

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
