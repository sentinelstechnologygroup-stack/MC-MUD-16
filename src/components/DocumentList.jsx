import { migratedAsset } from "@/lib/migrated-assets";
import { format, parseISO } from "date-fns";
import { FileText, Download } from "lucide-react";

export default function DocumentList({ documents, loading }) {
  if (loading) {
    return <p className="text-muted-foreground py-6">Loading documents…</p>;
  }
  if (!documents?.length) {
    return <p className="text-muted-foreground py-6">No documents available.</p>;
  }
  return (
    <ul className="divide-y divide-[#dce7e9]">
      {documents.map((d) => (
        <li key={d.id} className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="w-5 h-5 text-[#39a8b8] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <a
                href={migratedAsset(d.file_url)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:text-[#0789a3] transition-colors block"
              >
                {d.title}
              </a>
              {d.date && (
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(d.date), "MMMM d, yyyy")}
                </p>
              )}
              {d.description && (
                <p className="text-sm text-muted-foreground italic">{d.description}</p>
              )}
            </div>
          </div>
          <a
            href={migratedAsset(d.file_url)}
            target="_blank"
            rel="noreferrer"
            aria-label={"Open " + d.title + " (PDF, opens in a new tab)"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0789a3] hover:text-[#0c617b] shrink-0 transition-colors"
          >
            <Download className="w-4 h-4" /> PDF
          </a>
        </li>
      ))}
    </ul>
  );
}