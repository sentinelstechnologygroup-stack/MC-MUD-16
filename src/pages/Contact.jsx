import { DistrictContacts } from "@/components/ManagedContent";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
    <h1 className="font-serif text-4xl text-[#143c58] mb-5">Contact Us</h1>
    <p className="text-[#39566a] mb-6">Contact Montgomery County Municipal Utility District No. 16 using the form below, email or telephone.</p>
    <DistrictContacts/>
    <p role="status" className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-[#143c58]">The contact form is being verified. Please use the email or telephone above until message delivery is confirmed.</p>
    <ContactForm/>
  </div>;
}
