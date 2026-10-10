import { useWebsiteContent } from "@/lib/website-content";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, Leaf, Car, Trash2, ArrowDown, ArrowRight } from "lucide-react";
import DocumentList from "@/components/DocumentList";
import { STORMWATER_DOCUMENTS } from "@/lib/stormwater-documents";
import { publicDocuments } from "@/lib/document-sections";

const tips = [
  {icon:Leaf,title:"Care for your yard",text:"Keep fertilizer and pesticides off pavement. Avoid applications before rain, and keep leaves and grass clippings out of storm drains."},
  {icon:Car,title:"Prevent vehicle pollution",text:"Repair oil and fluid leaks. Use a commercial car wash or direct wash water to a grassy area where appropriate, away from storm drains."},
  {icon:Trash2,title:"Keep drains clear",text:"Pick up pet waste and litter. Sweep driveways instead of hosing debris into the street. Never pour oil, paint or chemicals into a storm drain."},
];
export default function StormwaterManagement() {
  const text=useWebsiteContent("stormwater_text");
  const contacts=useWebsiteContent("contacts");
  const [additional,setAdditional]=useState(STORMWATER_DOCUMENTS);
  const [loadError,setLoadError]=useState(false);
  useEffect(()=>{let active=true; publicDocuments.filter({category:"stormwater"},"-date",500).then(d=>{if(active)setAdditional(d);}).catch(()=>{if(active)setLoadError(true);});return ()=>{active=false;};},[]);
  return <section className="max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-16">
    <div className="border-b border-[#cbdcde] pb-7 mb-9">
      <p className="text-xs font-semibold tracking-widest uppercase text-[#0c617b] mb-3">Protecting our waterways</p>
      <h1 className="font-heading text-[32px] lg:text-[44px] leading-tight text-[#143c58]">Stormwater Management</h1>
      <p className="max-w-3xl text-[#39566a] leading-relaxed mt-5 text-lg">{text.intro}</p>
      <a href="#stormwater-documents" className="inline-flex items-center gap-2 mt-5 font-semibold text-[#0c617b] underline underline-offset-4">View stormwater documents <ArrowDown className="w-4 h-4" aria-hidden="true" /></a>
    </div>
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 mb-12">
      <div><h2 className="font-heading text-3xl text-[#143c58] mb-4">Where does stormwater go?</h2><p className="text-[#39566a] leading-relaxed">{text.runoff}</p><p className="text-[#39566a] leading-relaxed mt-4">{text.receiving_water}</p>
        <div className="flex flex-wrap items-center gap-3 mt-6 p-5 rounded-lg bg-[#edf4f5] text-[#143c58] font-semibold" aria-label="Rain flows across land, into storm drains, and to waterways"><Droplets aria-hidden="true" /><span>Rain & runoff</span><ArrowRight className="w-4 h-4" aria-hidden="true" /><span>Storm drains</span><ArrowRight className="w-4 h-4" aria-hidden="true" /><span>Waterways</span></div>
      </div>
      <aside className="bg-[#143c58] text-white rounded-xl p-7"><p className="text-xs uppercase tracking-widest text-[#a9e4e8] font-semibold">The district’s program</p><h2 className="font-heading text-2xl mt-3 mb-4">A coordinated approach</h2><p className="leading-relaxed text-[#e0eef1]">{text.program}</p><p className="text-sm leading-relaxed text-[#e0eef1] mt-4">Read the plan and TCEQ authorization below for the district’s documented requirements and goals.</p></aside>
    </div>
    <h2 className="font-heading text-3xl text-[#143c58] mb-5">Be stormwater smart at home</h2>
    <div className="grid md:grid-cols-3 gap-5 mb-6">{tips.map(({icon:Icon,title,text})=><article key={title} className="border border-[#d4e1e4] bg-white rounded-lg p-6"><Icon className="w-7 h-7 text-[#0c617b] mb-4" aria-hidden="true"/><h3 className="font-heading text-xl text-[#143c58] mb-3">{title}</h3><p className="text-[#39566a] leading-relaxed text-sm">{text}</p></article>)}</div>
    <p className="text-sm text-[#39566a] mb-12">Tips adapted from the supplied EPA Be Stormwater Smart brochures. <a className="underline text-[#0c617b]" href="https://www.epa.gov/sourcewaterprotection/urbanization-and-stormwater-runoff" target="_blank" rel="noreferrer">Learn more from EPA (opens in a new tab)</a>.</p>
    <div className="grid md:grid-cols-2 gap-7 mb-12">{[{name:"know-what-happens",title:"Know What Happens When It Rains",text:"Follow the path of runoff and learn why clean stormwater matters."},{name:"suburban-steps",title:"Take Steps to Protect Our Waterways",text:"Practical ideas for your yard, driveway and community."}].filter(b=>additional.some(d=>(d.seed_key===(b.name==="know-what-happens"?"know":"steps"))||d.id===(b.name==="know-what-happens"?"know":"steps"))).map(b=><article key={b.name} className="rounded-xl overflow-hidden border border-[#d4e1e4] bg-white"><img src={"/stormwater/"+b.name+"-1.png"} alt={"Cover of EPA’s Be Stormwater Smart brochure: "+b.title+". A text summary and the full PDF are available below."} className="w-full h-auto" loading="lazy"/><div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[#0c617b]">EPA • September 2022</p><h3 className="font-heading text-2xl text-[#143c58] mt-2">{b.title}</h3><p className="text-[#39566a] mt-3">{b.text}</p><a href={additional.find(d=>d.seed_key===(b.name==="know-what-happens"?"know":"steps")||d.id===(b.name==="know-what-happens"?"know":"steps"))?.file_url} target="_blank" rel="noreferrer" className="inline-flex gap-2 items-center font-semibold text-[#0c617b] underline mt-5">Read brochure (PDF, opens in a new tab)<ArrowRight className="w-4 h-4" aria-hidden="true"/></a></div></article>)}</div>
    <div id="stormwater-documents" className="scroll-mt-48"><h2 className="font-heading text-3xl text-[#143c58] mb-3">District documents & resources</h2><p className="text-[#39566a] mb-4">Original documents supplied for Montgomery County MUD 16. All links open PDFs in a new tab.</p><DocumentList documents={additional} loading={false}/>{loadError && <p role="status" className="mt-5 text-sm text-[#39566a]">Additional resources could not be loaded. The five district documents above remain available. Please refresh to try again.</p>}</div>
    <div className="mt-10 p-6 rounded-lg border border-[#cbdcde] bg-[#edf4f5]"><h2 className="font-heading text-2xl text-[#143c58] mb-3">Questions or concerns?</h2><p className="text-[#39566a] leading-relaxed">{contacts.stormwater_contact ? "Stormwater reporting contact: "+contacts.stormwater_contact : "For the appropriate stormwater reporting contact, call the district’s general contact at "+contacts.phone+". This is not identified as a spill or emergency hotline."} Call 911 for an immediate threat to life or safety.</p><p className="text-sm text-[#39566a] mt-4">Need help accessing a document? <Link to="/accessibility" className="underline text-[#0c617b]">View accessibility assistance</Link>.</p></div>
  </section>;
}
