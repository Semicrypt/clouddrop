export function detectFileCategory(mimeType) {
  if (mimeType.startsWith("image/")) {
    return "images";
  }

  if (
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType.includes("presentation")
  ) {
    return "documents";
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType === "text/csv"
  ) {
    return "spreadsheets";
  }

  if (mimeType === "application/zip") {
    return "archives";
  }

  if (mimeType.startsWith("text/")) {
    return "text";
  }

  return "other";
}
