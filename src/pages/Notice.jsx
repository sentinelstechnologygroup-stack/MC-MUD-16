import { ManagedSections } from "@/components/ManagedContent";
import { publicDocuments } from "@/lib/document-sections";
import { migratedAsset } from "@/lib/migrated-assets";
import { useEffect, useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { format, parseISO } from "date-fns";

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicDocuments
      .filter({ category: "notice" }, "-date", 20)
      .then((items) => setNotices(items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-20">
      <SectionHead level={1} title="Notice" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10">
        <div>
          <h3 className="font-heading text-2xl text-[#143c58] mb-4">
            Official Notices
          </h3>
          <div className="rounded-[4px] border border-[#d5e3e5] bg-[#edf4f5] p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#0789a3] shrink-0 mt-0.5" />
              <div>
                <p className="font-heading text-lg text-[#173e59]">
                  Extreme Weather Emergencies
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The District posts notices regarding extreme weather emergencies and other
                  official announcements below.
                </p>
              </div>
            </div>
            <ul className="mt-5 divide-y divide-[#d5e3e5]">
              {loading && <p className="text-sm text-muted-foreground py-3">Loading…</p>}
              {!loading && notices.length === 0 && (
                <p className="text-sm text-muted-foreground py-3">No notices posted.</p>
              )}
              {notices.map((n) => (
                <li key={n.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {n.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(n.date), "MMMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <a
                    href={migratedAsset(n.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0789a3] hover:text-[#0c617b] shrink-0"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-2xl text-[#143c58] mb-4">
            Water Conservation Tips for Residents
          </h3>
          <ManagedSections contentKey="conservation"/>
        </div>
      </div>
    </div>
  );
}