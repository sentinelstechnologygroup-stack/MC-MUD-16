import { useWebsiteContent } from "@/lib/website-content";
import DistrictMap from "@/components/DistrictMap";
import { DistrictContacts } from "@/components/ManagedContent";
import { publicDocuments } from "@/lib/document-sections";
import DocumentList from "@/components/DocumentList";
import { originalPhoto } from "@/lib/migrated-assets";
import { migratedAsset } from "@/lib/migrated-assets";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { district } from "@/api/districtClient";
// Original photographs are served from the migrated asset archive.
import SectionHead from "@/components/SectionHead";
import { format, parseISO } from "date-fns";

const HERO_IMG = originalPhoto;

const QUICK = [
  { label: "District Information", to: "/district-information" },
  { label: "Important Documents", to: "/important-documents" },
  { label: "Meetings", to: "/meetings" },
  { label: "Elections", to: "/elections" },
];

const LINKS = [
  { label: "Notice", to: "/notice", desc: "Weather emergencies & water conservation" },
  { label: "Important Documents", to: "/important-documents", desc: "Agendas, minutes & reports" },
  { label: "Consultants", to: "/consultants", desc: "District service providers" },
];

export default function Home() {
  const contacts=useWebsiteContent("contacts");
  const home=useWebsiteContent("home");
  const schedule=useWebsiteContent("meeting_schedule");
  const newsletter=useWebsiteContent("newsletter");
  const [nextMeeting, setNextMeeting] = useState(null);
  const [residentDocs, setResidentDocs] = useState([]);

  useEffect(() => {
    publicDocuments.filter({ category: { $in: ["notice", "rate_order"] } }, "-date", 100).then(setResidentDocs).catch(() => setResidentDocs([]));
    district.entities.Meeting
      .filter({ status: "scheduled", date: { $gte: format(new Date(), "yyyy-MM-dd") } }, "date", 1)
      .then(async items => { const meeting=items[0]; if (!meeting) {setNextMeeting(null); return;} const published=await publicDocuments.filter({category:"agenda"},"-date",5000);const agenda=published.find(d=>d.file_url===meeting.agenda_url)||published.find(d=>d.meeting_id===meeting.id||(!d.meeting_id&&d.date===meeting.date));setNextMeeting({...meeting,agenda_url:agenda?.file_url||""}); })
      .catch(() => setNextMeeting(null));
  }, []);

  return (
    <div>
      <section className="relative isolate flex items-center px-6 lg:px-16 py-24 lg:py-0 lg:h-[554px] text-white overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Water infrastructure with blue valves from the original district website"
          className="absolute inset-0 w-full h-full object-cover -z-20 anim-reveal"
          
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,37,57,.88) 0%, rgba(14,56,78,.58) 48%, rgba(9,54,76,.1) 100%)",
          }}
        />
        <div className="max-w-[630px] anim-rise" style={{ animationDelay: ".12s" }}>
          <h1 className="font-heading text-4xl lg:text-[54px] leading-[1.12] tracking-tight mb-7">
            Montgomery County Municipal Utility District #16
          </h1>
          <div className="w-[76px] h-1 bg-[#54c2ce] rounded-lg" />
          <p className="mt-7 text-lg text-white/85 max-w-xl">
            {home.hero_text}
          </p>
          <a href={home.payment_url} target="_blank" rel="noreferrer" className="inline-flex mt-6 bg-white text-[#143c58] px-6 py-3 rounded font-semibold hover:bg-[#dff2f4]">Pay Your Bill <ArrowRight className="ml-3 w-5 h-5" /></a>
        </div>
      </section>

      <nav className="relative max-w-7xl mx-auto px-5 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 -mt-10 z-10">
        {QUICK.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="min-h-[126px] bg-white/96 border border-[#d6e3e6] rounded-[4px] shadow-[0_12px_28px_rgba(18,53,72,0.12)] p-6 flex items-center justify-between font-semibold text-[15px] text-[#193e58] hover:bg-[#eef9fa] hover:shadow-[0_15px_30px_rgba(18,53,72,0.18)] hover:text-[#087d98] active:bg-[#dff2f4] transition-all duration-200"
          >
            <span>{q.label}</span>
            <ArrowRight className="text-[#168da2] ml-3 w-5 h-5" />
          </Link>
        ))}
      </nav>

      <div className="px-5 lg:px-12 pt-20 lg:pt-24 max-w-7xl mx-auto">
        <SectionHead title="District Information" />
        <div className="max-w-4xl">
          <div className="py-4 flex flex-col justify-center">
            <div className="w-12 h-[3px] bg-[#41aabc] mb-6" />
            <p className="text-[17px] leading-[1.7] text-muted-foreground">
              {home.intro}
            </p>
            <Link
              to="/district-information"
              className="mt-6 inline-flex items-center text-[#0789a3] font-semibold hover:text-[#0c617b] transition-colors"
            >
              Learn more <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
          {LINKS.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className="min-h-[148px] border border-[#d4e1e4] bg-white rounded-[4px] p-6 shadow-[0_5px_18px_rgba(20,59,82,0.055)] flex flex-col justify-between anim-rise-delay"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <h3 className="font-heading text-[23px] leading-tight text-[#173e59]">
                {l.label}
              </h3>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
              <i className="h-[3px] w-10 bg-[#45aebd] mt-4 block" />
            </Link>
          ))}
        </div>
      </div>

      <section className="mt-16 bg-[#edf4f5] border-y border-[#d5e3e5] px-5 lg:px-12 py-14">
        <div className="max-w-7xl mx-auto">
          <div>
            <SectionHead title="Meetings" />
            <p className="text-base leading-relaxed text-[#476477]">
              {schedule.description}
            </p>
            {nextMeeting ? (
              <div className="mt-5 p-5 bg-white rounded-[4px] border border-[#d5e3e5]">
                <p className="text-xs font-semibold tracking-wider text-[#0789a3] uppercase">
                  Next Meeting
                </p>
                <p className="font-heading text-xl text-[#143c58] mt-1">{nextMeeting.title}</p>
                <p className="text-[#476477] mt-1">
                  {format(parseISO(nextMeeting.date), "EEEE, MMMM d, yyyy")} · {nextMeeting.time}
                </p>
                {nextMeeting.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{nextMeeting.notes}</p>
                )}
                {nextMeeting.agenda_url && (
                  <a
                    href={migratedAsset(nextMeeting.agenda_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center mt-3 text-[#0789a3] font-semibold hover:text-[#0c617b] transition-colors"
                  >
                    View Agenda <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-5 text-muted-foreground">No upcoming meeting agenda has been posted. Check back for confirmed meeting details.</p>
            )}
            <Link
              to="/meetings"
              className="mt-6 inline-flex items-center text-[#0789a3] font-semibold hover:text-[#0c617b] transition-colors"
            >
              Full meeting calendar <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 lg:px-12 py-16">
        <SectionHead title="Resident Resources" />
        <p className="text-muted-foreground mb-4">District rate order, election deadline notices, and the Notice to Purchaser needed for real estate sales.</p>
        <DocumentList documents={residentDocs} loading={false} />
        <div className="grid md:grid-cols-2 gap-10 mt-14">
          <div><SectionHead title="Contact Us"/><DistrictContacts/><a href={"mailto:"+contacts.email} className="inline-flex rounded bg-[#143c58] text-white px-5 py-3 mt-6 font-semibold text-sm">Drop us a line<span className="sr-only"> — opens your email app</span></a><p className="text-sm text-muted-foreground mt-3">Email the district using your email app, or call the number above.</p></div>
          {newsletter.enabled&&newsletter.signup_url&&<div><SectionHead title="Subscribe"/><a className="underline text-[#0c617b]" href={newsletter.signup_url}>Sign up for district email updates</a></div>}
        </div>
        <DistrictMap/>
      </section>
    </div>
  );
}
