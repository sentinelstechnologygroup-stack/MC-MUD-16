import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Archive, CalendarDays, CheckCircle2, FileText, FolderOpen, LockKeyhole, Pencil, Plus, RefreshCw, Search, Upload, X } from "lucide-react";
import { district } from "@/api/districtClient";
import { PUBLIC_PAGES } from "@/lib/public-pages";
import { recordChange } from "@/lib/content-audit";
import WebsiteContentEditor from "@/components/WebsiteContentEditor";
import { documentLibrary } from "@/lib/document-library";
import { DOCUMENT_SECTIONS, sectionFor } from "@/lib/document-sections";
import { migratedAsset } from "@/lib/migrated-assets";
import { validateDocumentFile } from "@/lib/validate-document-file";

const inputClass = "w-full rounded border border-[#cbdcde] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#39a8b8]";
const primaryClass = "inline-flex items-center justify-center gap-2 rounded bg-[#143c58] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0c617b] disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryClass = "inline-flex items-center justify-center gap-2 rounded border border-[#cbdcde] bg-white px-3 py-2.5 text-sm font-semibold text-[#143c58] hover:bg-[#edf4f5] disabled:opacity-50";
const newDocument = category => ({ title:"", category, date:"", description:"", file_url:"", archived:false });
const newMeeting = () => ({ title:"Regular Meeting", date:"", time:"7:00 p.m.", type:"regular", status:"scheduled", location:"25374 Dogwood Ln, Splendora, TX 77372", notes:"", agenda_url:"" });
const readableDate = date => date ? new Date(date + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "Date not set";
const errorText = error => error?.status === 401 || error?.status === 403 ? "Your session has expired or you do not have staff access. Sign in with an authorized administrator account." : "We couldn't save this change. Please try again. Your form is still here.";

export default function StaffPortal() {
  const [access, setAccess] = useState("checking");
  const [user, setUser] = useState(null);
  const [accessError, setAccessError] = useState("");
  const [docs, setDocs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("documents");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const [editor, setEditor] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [meetingEditor, setMeetingEditor] = useState(null);
  const formRef = useRef(null);
  const documentSaveLock = useRef(false);

  useEffect(() => {
    let active = true;
    district.auth.me().then(current => {
      if (!active) return;
      setUser(current);
      setAccess(current.role === "admin" ? "admin" : "denied");
    }).catch(err => {
      if (!active) return;
      setAccess(err.status === 401 || err.status === 403 ? "signed-out" : "error");
      setAccessError("We couldn't verify your account. Refresh this page or sign in again.");
    });
    return () => { active = false; };
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [documents, calendar] = await Promise.all([
        documentLibrary.list(),
        district.entities.Meeting.list("-date", 5000),
      ]);
      setDocs(documents);
      setMeetings(calendar);
    } catch {
      setError("We couldn't load the document library. Refresh to try again.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (access === "admin") loadData();
  }, [access]);

  const liveDocs = useMemo(() => docs.filter(d => !d.archived), [docs]);
  const removedCount = docs.length - liveDocs.length;
  const filtered = useMemo(() => docs.filter(d =>
    Boolean(d.archived) === showRemoved &&
    (category === "all" || d.category === category) &&
    (d.title + " " + (d.description || "")).toLowerCase().includes(query.toLowerCase().trim())
  ), [docs, showRemoved, category, query]);

  function startDocument(doc = null, selectedCategory = category === "all" ? "agenda" : category) {
    setEditor(doc ? { ...doc, date:doc.date || "", description:doc.description || "" } : newDocument(selectedCategory));
    setFile(null);
    setUploadedUrl("");
    setError("");
    setMessage("");
    setArchiveTarget(null);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
      document.getElementById("document-title")?.focus({ preventScroll:true });
    });
  }

  function chooseFile(selected) {
    setError("");
    setUploadedUrl("");
    setFile(selected || null);
    if (selected && editor && !editor.title) {
      setEditor(current => ({ ...current, title:selected.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ") }));
    }
  }

  async function saveDocument(event) {
    event.preventDefault();
    if (!editor || saving || documentSaveLock.current) return;
    setError("");
    if(editor.category==="page_attachment"&&!editor.page_path){setError("Choose the page where this PDF belongs.");return;}
    if (!editor.title.trim()) { setError("Give the document a title."); return; }
    if (!file && !editor.file_url && !uploadedUrl) { setError("Choose a PDF to upload."); return; }
    documentSaveLock.current = true;
    setSaving(true);
    let saved;
    try {
      if (file) { const validation = await validateDocumentFile(file); if (validation) { setError(validation); return; } }
      let url = uploadedUrl || editor.file_url;
      if (file && !uploadedUrl) {
        setStage("Uploading PDF…");
        const upload = await district.integrations.Core.UploadFile({ file });
        if (!upload.file_url) throw new Error("Upload did not return a file");
        url = upload.file_url;
        setUploadedUrl(url);
      }
      setStage("Publishing document…");
      const data = { title:editor.title.trim(), category:editor.category, date:editor.date || null, description:editor.description.trim(), file_url:url, archived:false, page_path:editor.page_path||"", meeting_id:editor.meeting_id||"", adoption_date:editor.adoption_date||null, effective_date:editor.effective_date||null, supersedes_id:editor.supersedes_id||"" };
      saved = await documentLibrary.save(editor,data);
      await recordChange("document",editor.id?editor:null,saved,"Published document: "+saved.title);
      setDocs(current => [saved, ...current.filter(d => d.id !== saved.id && d.id !== editor.id && !(saved.seed_key && d.seed_key===saved.seed_key))]);
      setMessage((editor.id ? "Updated" : "Published") + ' “' + saved.title + '” in ' + sectionFor(saved.category).page + ".");
      setEditor(null);
      setFile(null);
      setUploadedUrl("");
      setShowRemoved(false);
      setCategory(saved.category);
    } catch (err) { setError(errorText(err)); }
    finally { documentSaveLock.current = false; setSaving(false); setStage(""); }
    // Keep calendar links consistent when replacing a previously attached agenda.
    if (saved && editor.id && editor.category === "agenda" && editor.file_url !== saved.file_url) {
      const attached = meetings.filter(m => m.agenda_url === editor.file_url);
      try {
        const updated = await Promise.all(attached.map(m => district.entities.Meeting.update(m.id, { agenda_url:saved.file_url })));
        if (updated.length) setMeetings(current => current.map(m => updated.find(u => u.id === m.id) || m));
      } catch { setError("The document was published, but an attached meeting agenda could not be updated. Open Meeting calendar and reselect the agenda."); }
    }
  }

  async function changeVisibility(doc, archived) {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await documentLibrary.save(doc,{...doc,archived});
      await recordChange("document",doc,updated,(archived?"Archived document: ":"Restored document: ")+doc.title);
      setDocs(current => current.map(d => d.id === doc.id ? updated : d));
      setMessage(archived ? 'Removed “' + doc.title + '” from the website. You can restore it from Removed documents.' : 'Restored “' + doc.title + '” to ' + sectionFor(doc.category).page + ".");
      setArchiveTarget(null);
    } catch (err) { setError(errorText(err)); }
    finally { setSaving(false); }
  }

  async function saveMeeting(event) {
    event.preventDefault();
    if (saving || !meetingEditor) return;
    setSaving(true);
    setError("");
    try {
      const data = {
        title:meetingEditor.title.trim(), date:meetingEditor.date,
        time:meetingEditor.time.trim(), type:meetingEditor.type,
        status:meetingEditor.status, location:meetingEditor.location.trim(),
        notes:meetingEditor.notes.trim(), agenda_url:meetingEditor.agenda_url || "",
      };
      const saved = meetingEditor.id ? await district.entities.Meeting.update(meetingEditor.id, data) : await district.entities.Meeting.create(data);
      await recordChange("meeting",meetingEditor.id?meetingEditor:null,saved,"Saved meeting: "+saved.title);
      setMeetings(current => [saved, ...current.filter(m => m.id !== saved.id)].sort((a,b) => b.date.localeCompare(a.date)));
      setMeetingEditor(null);
      setMessage("Meeting saved. The public calendar and next-meeting panel will use these details.");
    } catch (err) { setError(errorText(err)); }
    finally { setSaving(false); }
  }

  if (access !== "admin") return (
    <section className="max-w-lg mx-auto px-5 py-20 text-center">
      <LockKeyhole className="w-10 h-10 mx-auto mb-5 text-[#0789a3]" />
      <h1 className="font-heading text-3xl text-[#143c58]">Staff portal</h1>
      <p className="mt-4 text-muted-foreground">
        {access === "checking" ? "Checking your account…" : access === "denied" ? "This account does not have administrator access. Ask the district’s website administrator to authorize your account." : access === "error" ? accessError : "Staff publishing is being configured. The public website and district documents are available. Contact the district website administrator for staff access once setup is complete."}
      </p>
      
      <Link to="/" className="block mt-5 text-sm text-[#0789a3]">Return to the public website</Link>
    </section>
  );

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-12 py-12">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-xs font-semibold tracking-widest text-[#0789a3] uppercase mb-2">District administration</p><h1 className="font-heading text-4xl text-[#143c58]">Staff portal</h1><p className="text-muted-foreground mt-3">Publish documents in the right place. Keep residents informed.</p></div>
        <div className="flex flex-wrap items-center gap-3">{tab === "documents" && <button type="button" className={primaryClass} disabled={saving || loading} onClick={()=>startDocument()}><Plus className="w-4 h-4" /> Add document</button>}<Link to="/" className={secondaryClass}><ArrowLeft className="w-4 h-4" /> View website</Link><button type="button" className={secondaryClass} disabled={loading || saving} onClick={loadData}><RefreshCw className="w-4 h-4" /> Refresh</button></div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Signed in as {user?.full_name || user?.email} · Administrator</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
        {[["Published documents",liveDocs.length],["Meeting agendas",liveDocs.filter(d=>d.category==="agenda").length],["Meeting minutes",liveDocs.filter(d=>d.category==="minutes").length],["Elections",liveDocs.filter(d=>d.category==="election").length]].map(([label,count]) => <div key={label} className="bg-white border border-[#d4e1e4] rounded p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="font-heading text-3xl text-[#143c58] mt-2">{loading ? "—" : count}</p></div>)}
      </div>

      <div className="flex flex-wrap gap-6 border-b border-[#cbdcde] mb-8" role="tablist" aria-label="Staff tools">
        {[{value:"documents",label:"Documents",Icon:FolderOpen},{value:"meetings",label:"Meeting records",Icon:CalendarDays},{value:"content",label:"Website content",Icon:Pencil}].map(({value,label,Icon}) => <button type="button" key={value} role="tab" aria-selected={tab===value} onClick={()=>{setTab(value);setError("");setMessage("");}} className={"flex items-center gap-2 pb-3 border-b-2 text-sm font-semibold " + (tab===value ? "border-[#39a8b8] text-[#143c58]" : "border-transparent text-muted-foreground")}><Icon className="w-4 h-4" />{label}</button>)}
      </div>

      {message && <div role="status" className="flex items-start gap-3 rounded border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 mb-6"><CheckCircle2 className="w-5 h-5 shrink-0" />{message}</div>}
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800 mb-6">{error}</div>}

      {tab === "content" ? <WebsiteContentEditor actor={user.email||user.full_name||user.id}/> : tab === "documents" ? (
        <>
          {editor && <form ref={formRef} onSubmit={saveDocument} className="scroll-mt-28 bg-white border border-[#d4e1e4] rounded p-5 md:p-7 mb-8">
            <div className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-2xl text-[#143c58]">{editor.id ? "Edit document" : "Add a document"}</h2><p className="mt-2 text-sm text-muted-foreground">Choose a section, add the PDF, then publish. New documents appear on the website immediately.</p></div><button type="button" disabled={saving} aria-label="Close document form" className="p-2" onClick={()=>{setEditor(null);setFile(null);setUploadedUrl("");}}><X className="w-5 h-5" /></button></div>
            <div className="grid md:grid-cols-2 gap-5 mt-6">
              <Field label="Document title" id="document-title"><input id="document-title" className={inputClass} required maxLength={200} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})} disabled={saving} placeholder="e.g. Agenda — November 10, 2026" /></Field>
              <Field label="Page and document type" id="document-category"><select id="document-category" className={inputClass} value={editor.category} onChange={e=>setEditor({...editor,category:e.target.value})} disabled={saving}>{DOCUMENT_SECTIONS.map(s=><option key={s.value} value={s.value}>{s.page}</option>)}</select></Field>
              <Field label={editor.category==="agenda" || editor.category==="minutes" ? "Meeting date" : "Document date (optional)"} id="document-date"><input id="document-date" type="date" required={["agenda","minutes"].includes(editor.category)} className={inputClass} value={editor.date} onChange={e=>setEditor({...editor,date:e.target.value})} disabled={saving} /></Field>
              <Field label={editor.id ? "Replace PDF (optional)" : "Upload PDF"} id="document-file"><input id="document-file" type="file" accept=".pdf,application/pdf" className={inputClass} onChange={e=>chooseFile(e.target.files?.[0])} disabled={saving} /><p className="text-xs text-muted-foreground mt-2">PDF only · up to 20 MB · Public district documents only</p>{file && <p className="text-sm mt-2">{file.name} · {(file.size/1024/1024).toFixed(2)} MB</p>}{editor.file_url && <a href={migratedAsset(editor.file_url)} target="_blank" rel="noreferrer" className="inline-block text-sm text-[#0789a3] underline mt-2">View current PDF</a>}</Field>
              {editor.category==="page_attachment"&&<Field label="Page for this PDF" id="document-page"><select id="document-page" className={inputClass} required value={editor.page_path||""} disabled={saving} onChange={e=>setEditor({...editor,page_path:e.target.value})}><option value="">Choose a page</option>{PUBLIC_PAGES.map(([route,label])=><option key={route} value={route}>{label}</option>)}</select></Field>}<Field label="Related meeting (optional)" id="document-meeting"><select id="document-meeting" className={inputClass} value={editor.meeting_id||""} onChange={e=>{const m=meetings.find(m=>m.id===e.target.value);setEditor({...editor,meeting_id:e.target.value,date:m?m.date:editor.date});}}><option value="">No meeting selected</option>{meetings.map(m=><option key={m.id} value={m.id}>{readableDate(m.date)} - {m.title}</option>)}</select></Field><Field label="Effective date (optional)" id="document-effective"><input id="document-effective" className={inputClass} type="date" value={editor.effective_date||""} onChange={e=>setEditor({...editor,effective_date:e.target.value})}/></Field><Field label="Adoption date (optional)" id="document-adoption"><input id="document-adoption" className={inputClass} type="date" value={editor.adoption_date||""} onChange={e=>setEditor({...editor,adoption_date:e.target.value})}/></Field><Field label="Supersedes a document (optional)" id="document-supersedes"><select id="document-supersedes" className={inputClass} value={editor.supersedes_id||""} onChange={e=>setEditor({...editor,supersedes_id:e.target.value})}><option value="">Does not supersede another record</option>{docs.filter(d=>d.id!==editor.id).map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></Field><div className="md:col-span-2"><Field label="Short description (optional)" id="document-description"><textarea id="document-description" className={inputClass} rows={2} maxLength={1000} value={editor.description} onChange={e=>setEditor({...editor,description:e.target.value})} disabled={saving} /></Field></div>
            </div>
            <div className="rounded bg-[#edf4f5] p-4 mt-5 text-sm"><span className="font-semibold text-[#143c58]">Appears in: </span>{editor.page_path?PUBLIC_PAGES.find(p=>p[0]===editor.page_path)?.[1]:sectionFor(editor.category).page}<Link to={editor.page_path||sectionFor(editor.category).route} target="_blank" className="ml-3 text-[#0789a3] underline">Preview section</Link></div>
            <p className="text-xs text-muted-foreground mt-3">Publishing makes the document and its PDF publicly accessible. Replacing a PDF keeps the previous file available through any existing direct links.</p>
            <div className="flex flex-wrap gap-3 mt-6"><button type="submit" disabled={saving || loading} className={primaryClass}><Upload className="w-4 h-4" />{saving ? stage || "Saving…" : editor.id ? "Save and publish changes" : "Publish document"}</button><button type="button" disabled={saving} className={secondaryClass} onClick={()=>{setEditor(null);setFile(null);setUploadedUrl("");}}>Cancel</button></div>
          </form>}

          <div className="grid lg:grid-cols-[230px_1fr] gap-7">
            <aside className="bg-white border border-[#d4e1e4] rounded p-4 h-fit" aria-label="Document sections">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground px-2 mb-3">Page libraries</p>
              {[{value:"all",label:"All documents"},...DOCUMENT_SECTIONS].map(s=><button type="button" key={s.value} className={"w-full flex items-center justify-between gap-3 text-left rounded px-3 py-2.5 text-sm " + (category===s.value ? "bg-[#edf4f5] text-[#143c58] font-semibold" : "text-muted-foreground hover:bg-slate-50")} onClick={()=>setCategory(s.value)}>{s.value==="all"?s.label:s.page}<span className="text-xs">{docs.filter(d=>Boolean(d.archived)===showRemoved && (s.value==="all" || d.category===s.value)).length}</span></button>)}
            </aside>
            <div className="min-w-0">
              <div className="border-2 border-dashed border-[#39a8b8] bg-[#edf4f5] rounded p-7 mb-6" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(saving)return;const pdf=e.dataTransfer.files[0];if(!pdf)return;const destination=category==="all"?"other":category;setEditor({...newDocument(destination),title:pdf.name.replace(/\.pdf$/i,"").replace(/[_-]+/g," ")});setFile(pdf);setUploadedUrl("");setError("");}}><p className="font-semibold text-[#143c58]">Drop a PDF into this page library</p><p className="text-sm mt-2 text-[#39566a]">{category==="all"?"Choose a page library first, or set the destination in the document form.":"Destination: "+sectionFor(category).page} Review the title and date, then publish. The website creates the links automatically.</p><button type="button" className={secondaryClass+" mt-4"} onClick={()=>startDocument()}>Choose a PDF</button></div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5"><h2 className="font-heading text-2xl text-[#143c58]">{showRemoved ? "Removed documents" : category==="all" ? "Document library" : sectionFor(category).label}</h2></div>
              <div className="flex flex-wrap items-center gap-3 mb-5"><div className="relative flex-1 min-w-[180px]"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><label className="sr-only" htmlFor="document-search">Search documents</label><input id="document-search" type="search" className={inputClass + " pl-9"} placeholder="Search document titles…" value={query} onChange={e=>setQuery(e.target.value)} /></div><button type="button" aria-pressed={showRemoved} className={secondaryClass} onClick={()=>{setShowRemoved(!showRemoved);setArchiveTarget(null);}}><Archive className="w-4 h-4" />{showRemoved ? "Show published" : "Removed ("+removedCount+")"}</button></div>
              {loading ? <p role="status" className="text-muted-foreground py-8">Loading document library…</p> : filtered.length===0 ? <div className="bg-white border border-dashed border-[#cbdcde] rounded p-10 text-center"><FolderOpen className="w-8 h-8 mx-auto mb-3 text-[#0789a3]" /><p className="font-semibold text-[#143c58]">No documents here yet</p><p className="mt-2 text-sm text-muted-foreground">{query ? "Try a different search or section." : showRemoved ? "Documents removed from the website will appear here." : "Use Add document to publish the first PDF in this section."}</p></div> : <ul className="divide-y divide-[#dce7e9] bg-white border border-[#d4e1e4] rounded">{filtered.map(d=><li key={d.id} className="p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><a href={migratedAsset(d.file_url)} target="_blank" rel="noreferrer" className="font-semibold text-[#143c58] hover:text-[#0789a3] break-words">{d.title}</a><p className="mt-2 text-xs text-muted-foreground">{sectionFor(d.category).label} · {readableDate(d.date)}{d.archived ? " · Removed from website" : " · Published"}</p>{d.description && <p className="text-sm text-muted-foreground mt-2">{d.description}</p>}</div><div className="flex flex-wrap gap-2"><a href={migratedAsset(d.file_url)} target="_blank" rel="noreferrer" className={secondaryClass}><FileText className="w-4 h-4" /> View PDF</a>{d.archived ? <button type="button" className={secondaryClass} disabled={saving} onClick={()=>changeVisibility(d,false)}>Restore</button> : <><button type="button" className={secondaryClass} disabled={saving} onClick={()=>startDocument(d)}><Pencil className="w-4 h-4" /> Edit</button><button type="button" aria-label={"Remove "+d.title+" from website"} className={secondaryClass} disabled={saving} onClick={()=>setArchiveTarget(d.id)}><Archive className="w-4 h-4" /><span className="sr-only">Remove from website</span></button></>}</div></div>
                {archiveTarget===d.id && <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-4"><p className="text-sm text-amber-950">Remove this document from the website? You can restore it later. Existing direct PDF links will still work.{d.category==="agenda" && meetings.some(m=>m.agenda_url===d.file_url) ? " It is attached to a meeting; update that meeting if needed." : ""}</p><div className="flex gap-3 mt-3"><button type="button" className={primaryClass} disabled={saving} onClick={()=>changeVisibility(d,true)}>Remove from website</button><button type="button" className={secondaryClass} disabled={saving} onClick={()=>setArchiveTarget(null)}>Keep published</button></div></div>}
              </li>)}</ul>}
              <p className="text-xs text-muted-foreground mt-4">Removed documents stay in the library and can be restored. Original migrated files are preserved.</p>
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5"><div><h2 className="font-heading text-2xl text-[#143c58]">Meeting calendar</h2><p className="text-sm text-muted-foreground mt-2">Confirm a meeting’s details and choose its published agenda.</p></div><button type="button" className={primaryClass} disabled={saving || loading} onClick={()=>{setMeetingEditor(newMeeting());setError("");setMessage("");}}><Plus className="w-4 h-4" /> Add meeting</button></div>
          {meetingEditor && <form onSubmit={saveMeeting} className="bg-white border border-[#d4e1e4] rounded p-5 md:p-7 mb-7"><h3 className="font-heading text-xl text-[#143c58]">{meetingEditor.id ? "Edit meeting" : "Add meeting"}</h3><div className="grid md:grid-cols-2 gap-5 mt-5">
            <Field label="Meeting title" id="meeting-title"><input id="meeting-title" required maxLength={200} className={inputClass} value={meetingEditor.title} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,title:e.target.value})} /></Field>
            <Field label="Meeting date" id="meeting-date"><input id="meeting-date" type="date" required className={inputClass} value={meetingEditor.date} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,date:e.target.value})} /></Field>
            <Field label="Time" id="meeting-time"><input id="meeting-time" required maxLength={100} className={inputClass} value={meetingEditor.time} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,time:e.target.value})} /></Field>
            <Field label="Meeting type" id="meeting-type"><select id="meeting-type" className={inputClass} value={meetingEditor.type} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,type:e.target.value})}><option value="regular">Regular meeting</option><option value="special">Special meeting</option></select></Field>
            <Field label="Status" id="meeting-status"><select id="meeting-status" className={inputClass} value={meetingEditor.status} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,status:e.target.value})}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field>
            <Field label="Location" id="meeting-location"><input id="meeting-location" required maxLength={300} className={inputClass} value={meetingEditor.location} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,location:e.target.value})} /></Field>
            <div className="md:col-span-2"><Field label="Attach published agenda" id="meeting-agenda"><select id="meeting-agenda" className={inputClass} value={meetingEditor.agenda_url} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,agenda_url:e.target.value})}><option value="">No agenda posted yet</option>{meetingEditor.agenda_url && !liveDocs.some(d=>d.category==="agenda" && d.file_url===meetingEditor.agenda_url) && <option value={meetingEditor.agenda_url}>Keep existing attached agenda</option>}{liveDocs.filter(d=>d.category==="agenda").sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(d=><option key={d.id} value={d.file_url}>{d.title}</option>)}</select><p className="text-xs text-muted-foreground mt-2">Publish the agenda in Documents first, then select it here.</p></Field></div>
            <div className="md:col-span-2"><Field label="Meeting notes (optional)" id="meeting-notes"><textarea id="meeting-notes" rows={2} maxLength={1000} className={inputClass} value={meetingEditor.notes} disabled={saving} onChange={e=>setMeetingEditor({...meetingEditor,notes:e.target.value})} /></Field></div>
          </div><div className="flex gap-3 mt-5"><button type="submit" className={primaryClass} disabled={saving}>{saving ? "Saving…" : "Save meeting"}</button><button type="button" className={secondaryClass} disabled={saving} onClick={()=>setMeetingEditor(null)}>Cancel</button></div></form>}
          <p className="text-xs text-muted-foreground mb-4">Only saved meeting records are shown by default. Add a meeting to publish its confirmed date, time and location. Link agendas and minutes to that meeting in its page library.</p>
          {loading ? <p role="status">Loading meetings…</p> : <ul className="bg-white border border-[#d4e1e4] rounded divide-y divide-[#dce7e9]">{meetings.map(m=><li key={m.id} className="p-5 flex flex-wrap justify-between items-start gap-4"><div><p className="font-semibold text-[#143c58]">{m.title}</p><p className="text-sm text-muted-foreground mt-1">{readableDate(m.date)} · {m.time} · <span className="capitalize">{m.status}</span></p><p className="text-xs text-muted-foreground mt-2">{m.agenda_url ? "Agenda attached" : "No agenda attached"}</p></div><button type="button" className={secondaryClass} disabled={saving} onClick={()=>{setMeetingEditor({...m,time:m.time||"",location:m.location||"",notes:m.notes||"",agenda_url:m.agenda_url||""});setError("");setMessage("");}}><Pencil className="w-4 h-4" /> Edit meeting</button></li>)}</ul>}
          <Link to="/meetings" target="_blank" className="inline-block mt-5 text-sm text-[#0789a3] underline">Preview public calendar</Link>
        </div>
      )}
    </section>
  );
}

function Field({ label, id, children }) {
  return <div><label htmlFor={id} className="block text-sm font-semibold text-[#143c58] mb-2">{label}</label>{children}</div>;
}
