import { useWebsiteContent } from "@/lib/website-content";
import { DistrictContacts, TaxUpdate } from "@/components/ManagedContent";
import { publicDocuments } from "@/lib/document-sections";
import { useEffect, useState } from "react";
import { district } from "@/api/districtClient";
import SectionHead from "@/components/SectionHead";
import DocumentList from "@/components/DocumentList";

export default function DistrictInformation() {
  const members = useWebsiteContent("board_members");
  const budgetSummary = useWebsiteContent("budget_summary");
  const [budgets, setBudgets] = useState([]);
  const [reports, setReports] = useState([]);
  const [taxHearings, setTaxHearings] = useState([]);
  const [rates, setRates] = useState([]);
  const publishedRates = useWebsiteContent("tax_history",rates);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicDocuments.filter({ category: "budget" }, "-date", 50),
      publicDocuments.filter({ category: "financial_report" }, "-date", 50),
      publicDocuments.filter({ category: "tax_hearing" }, "-date", 50),
      district.entities.TaxRate.filter({}, "-year", 50),
    ])
      .then(([b, r, th, t]) => {
        setBudgets(b);
        setReports(r);
        setTaxHearings(th);
        setRates(t);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-20">
      <SectionHead level={1} title="District Information" />

      <h3 className="font-heading text-2xl text-[#143c58] mb-5">Board of Directors</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {members.map((m,i) => (
          <div
            key={m.id||i}
            className="border border-[#d4e1e4] bg-white rounded-[4px] p-6 shadow-[0_5px_18px_rgba(20,59,82,0.055)]"
          >
            <p className="text-xs font-semibold tracking-wider text-[#0789a3] uppercase">
              {m.role}
            </p>
            <p className="font-heading text-xl text-[#173e59] mt-2">
              {m.vacant ? "Vacant" : m.name}
            </p>
            {m.term_expires&&<p className="text-sm mt-2">Term ends: {m.term_expires}</p>}
            {m.public_contact&&<p className="text-sm mt-2">{m.public_contact}</p>}
            {m.service_basis&&m.service_basis!=="Not specified"&&<p className="text-sm mt-2">{m.service_basis}{m.service_start?" · Service began "+m.service_start:""}</p>}
            {m.source_document&&<a className="text-sm underline text-[#0c617b] mt-2 block" href={m.source_document} target="_blank" rel="noreferrer">Supporting official record (PDF)</a>}

          </div>
        ))}
      </div>

      <div className="mb-10"><DistrictContacts/></div>
      <h3 className="font-heading text-2xl text-[#143c58] mb-2">Budget Information</h3>
      <DocumentList documents={budgets} loading={loading} />
      <p className="mt-6 p-6 bg-[#edf4f5] whitespace-pre-line text-sm">{budgetSummary.body}</p>

      <h3 className="font-heading text-2xl text-[#143c58] mt-14 mb-2">
        Financial Information (Annual Audit)
      </h3>
      <DocumentList documents={reports} loading={loading} />

      <h3 className="font-heading text-2xl text-[#143c58] mt-14 mb-2">Notice of Tax Hearing</h3>
      <DocumentList documents={taxHearings} loading={loading} />

      <h3 className="font-heading text-2xl text-[#143c58] mt-14 mb-5">Tax Information</h3>
      <div className="mb-6"><TaxUpdate/></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#cbdcde] text-left text-muted-foreground">
              <th className="py-3 font-semibold">Year</th>
              <th className="py-3 font-semibold">Total Rate (per $100)</th>
              <th className="py-3 font-semibold">Maintenance & Operations</th>
              <th className="py-3 font-semibold">Debt Service</th>
            </tr>
          </thead>
          <tbody>
            {publishedRates.map((r) => (
              <tr key={r.id||r.year} className="border-b border-[#eef3f4]">
                <td className="py-3 font-medium text-foreground">
                  {r.year}

                </td>
                <td className="py-3">${Number(r.total).toFixed(3)}</td>
                <td className="py-3">
                  {r.maintenance_operations != null && r.maintenance_operations !== ""
                    ? `$${Number(r.maintenance_operations).toFixed(3)}`
                    : "—"}
                </td>
                <td className="py-3">
                  {r.debt_service != null && r.debt_service !== "" ? `$${Number(r.debt_service).toFixed(3)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}