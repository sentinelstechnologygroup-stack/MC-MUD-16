export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export async function validateDocumentFile(file) {
  if (!/\.pdf$/i.test(file.name)) return "Please choose a PDF file.";
  if (file.size === 0 || file.size > MAX_PDF_BYTES) return "Choose a PDF smaller than 20 MB.";
  try {
    const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    return header === "%PDF-" ? "" : "This file does not appear to be a valid PDF. Export it as a PDF and try again.";
  } catch { return "We couldn't read this file. Choose it again and retry."; }
}
