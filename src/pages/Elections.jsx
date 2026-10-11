import { publicDocuments } from "@/lib/document-sections";
import { migratedAsset } from "@/lib/migrated-assets";
import { useEffect, useState } from "react";
import SectionHead from "@/components/SectionHead";
import DocumentList from "@/components/DocumentList";

export default function Elections() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicDocuments
      .filter({ $or: [{ category: "election" }, { title: "Notice of Deadline - 2026 Directors Election" }] }, "-date", 100)
      .then((items) => setDocs(items))
      .finally(() => setLoading(false));
  }, []);

  const bond = docs.filter((d) => /bond/i.test(d.title));
  const directors = docs.filter((d) => /director/i.test(d.title));
  const other = docs.filter((d) => !/bond|director/i.test(d.title));

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-20">
      <SectionHead level={1} title="Elections" />

      <h2 className="font-heading text-2xl text-[#143c58] mb-2">Bond Elections</h2>
      <DocumentList documents={bond} loading={loading} />

      <h2 className="font-heading text-2xl text-[#143c58] mt-14 mb-2">Directors Election</h2>
      <DocumentList documents={directors} loading={loading} />

      {other.length > 0 && (
        <>
          <h2 className="font-heading text-2xl text-[#143c58] mt-14 mb-2">
            Additional Election Information
          </h2>
          <DocumentList documents={other} loading={loading} />
        </>
      )}

      <section className="mt-10 border border-[#d5e3e5] rounded p-6"><h2 className="font-heading text-2xl mb-3">Historical Election Dates — 2020</h2><p className="text-sm text-muted-foreground mb-3">Preserved from the original site. These dates describe a past election.</p><ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground"><li>Election date: May 2, 2020.</li><li>First day to file for a place on the ballot: January 15, 2020.</li><li>Last day to file: February 14, 2020, at 5:00 p.m.</li><li>Write-in candidacy declaration deadline: February 18, 2020, at 5:00 p.m.</li></ul><a className="inline-block mt-4 text-[#0c617b] underline" href={migratedAsset("https://www.sos.state.tx.us/elections/forms/pol-sub/2-11f.pdf")} target="_blank" rel="noreferrer">Declaration of write-in candidacy form</a></section>
      <div className="mt-14 p-6 bg-[#edf4f5] rounded-[4px] border border-[#d5e3e5]">
        <h2 className="font-heading text-2xl text-[#143c58] mb-3">Running for the Board</h2>
        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            To run for election to the District's Board of Directors, a person must file an
            application for a place on the ballot. The application must be filed with the
            Secretary of the District's Board of Directors or his designated agent by mail, fax
            or in person. An application may be downloaded from the website of the Texas
            Secretary of State at{" "}
            <a
              href={migratedAsset("https://www.sos.state.tx.us/elections/forms/pol-sub/2-21f.pdf")}
              target="_blank"
              rel="noreferrer"
              className="text-[#0c617b] font-semibold hover:text-[#0c617b] underline"
            >
              sos.state.tx.us
            </a>
            .
          </p>
          <p>A candidate for a director seat must be:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>a resident of Texas</li>
            <li>an owner of taxable property in the district or a qualified voter within the district</li>
            <li>at least 18 years old</li>
          </ul>
          <p>
            A person may also run as a write-in candidate by filing a declaration of write-in
            candidacy with the Secretary of the Board. The location(s) for the election will be
            determined by the Montgomery County Election Supervisor and will be posted upon
            determination.
          </p>
        </div>
      </div>
    </div>
  );
}