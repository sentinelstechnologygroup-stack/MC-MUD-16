export const CONTACT_ENDPOINT = "https://formspree.io/f/xeaelpak";

export async function submitContact(formData, fetcher = fetch) {
  const response = await fetcher(CONTACT_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    throw new Error("Your submission could not be confirmed. Please try again or use the email or phone number above.");
  }
  return result;
}
