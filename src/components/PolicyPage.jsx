import { DistrictContacts } from "@/components/ManagedContent";
import { Link } from "react-router-dom";
export default function PolicyPage({title,children,notice}) {
 return <article className="max-w-4xl mx-auto px-5 lg:px-12 py-12 lg:py-16"><p className="text-xs font-semibold uppercase tracking-widest text-[#0c617b] mb-3">Website information</p><h1 className="font-heading text-4xl text-[#143c58] mb-6">{title}</h1><div role="note" className="border border-[#cbdcde] bg-[#edf4f5] rounded p-4 mb-8 text-sm text-[#39566a]">{notice}</div><div className="space-y-8 text-[#39566a] leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-[#143c58] [&_h2]:mb-3 [&_a]:underline [&_a]:text-[#0c617b] [&_p+p]:mt-3">{children}</div><nav aria-label="Website notices" className="border-t border-[#cbdcde] flex flex-wrap gap-5 mt-10 pt-6 text-sm text-[#0c617b] underline"><Link to="/accessibility">ADA & Accessibility</Link><Link to="/privacy-notice">Privacy Notice</Link><Link to="/terms-of-use">Terms of Use</Link></nav></article>;
}
export function LegacyDistrictContact() {return <p>District general contact: <a href="tel:+17136510111">(713) 651-0111</a><br/>Mail: Montgomery County Municipal Utility District No. 16, c/o Coats Rose, PC, 9 Greenway Plaza, Suite 1000, Houston, TX 77046.</p>;}

export function DistrictContact(){return <DistrictContacts/>;}
