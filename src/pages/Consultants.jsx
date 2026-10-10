import { useWebsiteContent } from "@/lib/website-content";
import { originalPhoto } from "@/lib/migrated-assets";
import { useEffect, useState } from "react";
import { Phone, Mail, Globe, MapPin, User } from "lucide-react";
import { district } from "@/api/districtClient";
import SectionHead from "@/components/SectionHead";

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const publishedConsultants = useWebsiteContent("consultants",consultants);

  useEffect(() => {
    district.entities.Consultant
      .filter({}, "order", 50)
      .then((items) => setConsultants(items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-20">
      <SectionHead level={1} title="Consultants" />
      <p className="text-muted-foreground mb-8 max-w-2xl">
        The professional firms and individuals who provide services to Montgomery County
        Municipal Utility District #16.
      </p>

      <img src={originalPhoto} alt="Original site photograph: water infrastructure with blue valves outdoors" className="w-full h-56 object-cover rounded mb-8" />

      {loading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedConsultants.map((c,i) => (
          <div
            key={c.id||i}
            className="border border-[#d4e1e4] bg-white rounded-[4px] p-6 shadow-[0_5px_18px_rgba(20,59,82,0.055)] flex flex-col"
          >
            <p className="text-xs font-semibold tracking-wider text-[#0789a3] uppercase">
              {c.role}
            </p>
            <p className="font-heading text-xl text-[#173e59] mt-2">{c.company}</p>
            {c.contact_name && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {c.contact_name}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {c.address}
                </p>
              )}
              {c.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} className="hover:text-[#0789a3]">
                    {c.phone}
                  </a>
                </p>
              )}
              {c.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a
                    href={`mailto:${c.email}`}
                    className="hover:text-[#0789a3] break-all"
                  >
                    {c.email}
                  </a>
                </p>
              )}
              {c.website && (
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" />
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#0789a3] break-all"
                  >
                    Website
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}