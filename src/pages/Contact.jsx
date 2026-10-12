import { DistrictContacts } from "@/components/ManagedContent";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
    <h1 className="font-serif text-4xl text-[#143c58] mb-5">Contact Us</h1>
    <p className="text-[#39566a] mb-6">Contact Montgomery County Municipal Utility District No. 16 using the form below, email or telephone.</p>
    <DistrictContacts/>
    <ContactForm/>
  </div>;
}
