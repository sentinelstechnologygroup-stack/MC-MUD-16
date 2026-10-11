import { useWebsiteContent } from "@/lib/website-content";
import { publicDocuments } from "@/lib/document-sections";
import { migratedAsset } from "@/lib/migrated-assets";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, FileText } from "lucide-react";
import { district } from "@/api/districtClient";
import SectionHead from "@/components/SectionHead";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Meetings() {
  const schedule=useWebsiteContent("meeting_schedule");
  const [records, setRecords] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => {
    Promise.all([district.entities.Meeting.filter({}, "date", 5000), publicDocuments.filter({category:{$in:["agenda","minutes"]}}, "-date", 5000)])
      .then(([items, agendas]) => { setRecords(agendas); const available = new Set(agendas.filter(d=>d.category==="agenda").map(d=>d.file_url)); setMeetings(items.map(m=>({...m,agenda_url:available.has(m.agenda_url) ? m.agenda_url : ""}))); })
      .finally(() => setLoading(false));
  }, []);

  const displayedMeetings = useMemo(() => {
    const result = [...meetings];
    const months = [cursor, ...Array.from({length: 12}, (_, i) => addMonths(new Date(), i))];
    for (const month of schedule.show_recurring ? months : []) {
      const first = startOfMonth(month);
      const day = new Date(first.getFullYear(), first.getMonth(), 1 + ((2 - first.getDay() + 7) % 7) + 7);
      const date = format(day, "yyyy-MM-dd");
      if (date >= format(new Date(), "yyyy-MM-dd") && !result.some(m => m.date === date)) result.push({id: "recurring-" + date, title: "Regular Meeting — recurring schedule", date, type: "regular", time: "Verify agenda for time", location: "Verify agenda for location", tentative: true, notes: "Based on the published second-Tuesday schedule. An agenda has not been posted; confirm details with the District."});
    }
    return result;
  }, [meetings, cursor, schedule.show_recurring]);

  const byDay = useMemo(() => {
    const map = {};
    displayedMeetings.forEach((m) => {
      const key = format(parseISO(m.date), "yyyy-MM-dd");
      (map[key] = map[key] || []).push(m);
    });
    return map;
  }, [displayedMeetings]);

  const gridDays = useMemo(() => {
    const ms = startOfMonth(cursor);
    const me = endOfMonth(cursor);
    const gs = startOfWeek(ms, { weekStartsOn: 0 });
    const ge = endOfWeek(me, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gs, end: ge });
  }, [cursor]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = displayedMeetings
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = displayedMeetings
    .filter((m) => m.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-20">
      <SectionHead level={1} title="Meetings" /><p className="text-[#39566a] mb-6">{schedule.description}</p>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Each posted agenda provides the meeting location, time and attendance instructions.
        Confirm those details before attending; locations and arrangements may change.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
        <div className="border border-[#d4e1e4] bg-white rounded-[4px] p-5 shadow-[0_5px_18px_rgba(20,59,82,0.055)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl text-[#143c58]">
              {format(cursor, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCursor(addMonths(cursor, -1))}
                className="w-9 h-9 rounded-[4px] border border-[#d4e1e4] text-[#39566a] hover:bg-[#eef9fa] hover:text-[#0c617b] flex items-center justify-center transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="px-3 h-9 rounded-[4px] border border-[#d4e1e4] text-[#39566a] hover:bg-[#eef9fa] hover:text-[#0c617b] text-sm font-semibold transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCursor(addMonths(cursor, 1))}
                className="w-9 h-9 rounded-[4px] border border-[#d4e1e4] text-[#39566a] hover:bg-[#eef9fa] hover:text-[#0c617b] flex items-center justify-center transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold tracking-wider text-muted-foreground py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayMeetings = byDay[key] || [];
              const inMonth = isSameMonth(day, cursor);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={key}
                  className={`min-h-[72px] rounded-[3px] border p-1.5 text-left ${
                    inMonth
                      ? "border-[#eaf0f1] bg-white"
                      : "border-transparent bg-[#f6fafb] text-muted-foreground/60"
                  } ${isToday ? "ring-1 ring-[#39a8b8]" : ""}`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? "text-[#0c617b]" : inMonth ? "text-foreground" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayMeetings.map((m) => (
                      <span
                        key={m.id}
                        className={`block text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                          m.type === "special"
                            ? "bg-[#fce8d8] text-[#9a5a1f]"
                            : "bg-[#dff2f4] text-[#0c617b]"
                        }`}
                        title={`${m.title} · ${m.time}`}
                      >
                        {m.status === "cancelled" ? "Cancelled" : m.tentative ? "Recurring*" : (m.time || "See agenda").replace(/\.m\./, "")}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">* Recurring dates follow the published schedule. Check the agenda to confirm each meeting.</p>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#dff2f4]" /> Regular
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#fce8d8]" /> Special
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl text-[#143c58] mb-4">Upcoming</h2>
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {!loading && upcoming.length === 0 && (
            <p className="text-muted-foreground text-sm">No upcoming meetings scheduled.</p>
          )}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {upcoming.map((m) => (
              <MeetingCard key={m.id} m={m} records={records} />
            ))}
          </div>

          <h2 className="font-heading text-2xl text-[#143c58] mt-8 mb-4">Past Meetings</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {past.map((m) => (
              <MeetingCard key={m.id} m={m} records={records} past />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({ m, past = false, records=[] }) {
  return (
    <div
      className={`border rounded-[4px] p-4 ${
        past
          ? "border-[#eaf0f1] bg-white"
          : "border-[#d5e3e5] bg-[#edf4f5]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-lg text-[#173e59]">{m.title}{m.status === "cancelled" && <span className="ml-2 text-sm font-semibold text-red-700">Cancelled</span>}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(parseISO(m.date), "EEEE, MMMM d, yyyy")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {m.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {m.location || "Splendora, TX"}
            </span>
          </div>
          {m.notes && <p className="text-xs text-muted-foreground mt-2">{m.notes}</p>}
          <ul className="space-y-2 mt-3 text-sm">{records.filter(d=>d.meeting_id===m.id||(!d.meeting_id&&d.date===m.date)).map(d=><li key={d.id}><a className="underline text-[#0c617b]" href={migratedAsset(d.file_url)} target="_blank" rel="noreferrer">{d.title} (PDF)</a></li>)}</ul>
        </div>
        {m.agenda_url && (
          <a
            href={migratedAsset(m.agenda_url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0c617b] hover:text-[#0c617b] shrink-0"
          >
            <FileText className="w-4 h-4" /> Agenda
          </a>
        )}
      </div>
    </div>
  );
}
