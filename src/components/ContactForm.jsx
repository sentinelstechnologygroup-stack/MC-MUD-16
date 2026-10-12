import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONTACT_ENDPOINT, submitContact } from "@/lib/contact-form";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const pending = useRef(false);
  async function handleSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    pending.current = true;
    setStatus("sending");
    setError("");
    try {
      await submitContact(new FormData(form));
      form.reset();
      setStatus("sent");
    } catch {
      setError("Your submission could not be confirmed. Please try again or use the email or phone number above.");
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }
  const inputStyle = "block w-full rounded border border-[#9bb2bf] bg-white px-3 py-2 mt-1 text-[#143c58]";
  return <section className="mt-6" aria-labelledby="contact-form-heading">
    <h3 id="contact-form-heading" className="font-semibold text-lg text-[#143c58]">Drop us a line</h3>
    <p className="text-sm text-[#39566a] mt-2">For general inquiries. For an immediate threat to life or safety, call 911. Do not include passwords, payment details or other sensitive information.</p>
    <form action={CONTACT_ENDPOINT} method="POST" onSubmit={handleSubmit} className="mt-4 space-y-4" aria-busy={status === "sending"}>
      <fieldset disabled={status === "sending"} className="space-y-4">
        <label className="block text-sm font-medium">Name (optional)<input className={inputStyle} name="name" autoComplete="name" maxLength={150}/></label>
        <label className="block text-sm font-medium">Email (required)<input className={inputStyle} type="email" name="email" required autoComplete="email" maxLength={254}/></label>
        <label className="block text-sm font-medium">Message (required)<textarea className={inputStyle} name="message" required rows={5} maxLength={5000}/></label>
        <div hidden aria-hidden="true"><label>Leave this blank<input name="_gotcha" tabIndex={-1} autoComplete="off"/></label></div>
        <input type="hidden" name="_subject" value="MCMUD 16 website contact"/>
        <p className="text-sm text-[#39566a]">Your name, email and message are sent through Formspree for delivery to the website’s configured recipient. See our <Link className="underline" to="/privacy-notice">Privacy Notice</Link>. Please use the published public-information request contact for records requests.</p>
        <button type="submit" className="rounded bg-[#143c58] text-white px-5 py-3 font-semibold text-sm disabled:opacity-60">{status === "sending" ? "Sending…" : "Send message"}</button>
      </fieldset>
      <p role="status" aria-live="polite" className="text-sm text-[#143c58]">{status === "sent" ? "Thank you. Formspree accepted your message for delivery." : ""}</p>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    </form>
  </section>;
}
