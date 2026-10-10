import { mergeOriginalDocuments } from "@/lib/document-library";
import { district } from "@/api/districtClient";
export const DOCUMENT_SECTIONS = [
  {value:"agenda", label:"Meeting agendas", page:"Important Documents → Agendas", route:"/important-documents"},
  {value:"minutes", label:"Meeting minutes", page:"Important Documents → Minutes", route:"/important-documents"},
  {value:"election", label:"Elections", page:"Elections", route:"/elections"},
  {value:"budget", label:"Budgets", page:"District Information → Budget Information", route:"/district-information"},
  {value:"financial_report", label:"Annual financial reports", page:"District Information → Annual Audit", route:"/district-information"},
  {value:"tax_hearing", label:"Tax hearing notices", page:"District Information → Notice of Tax Hearing", route:"/district-information"},
  {value:"notice", label:"Public notices", page:"Notice and Home → Resident Resources", route:"/notice"},
  {value:"rate_order", label:"Rate orders", page:"Important Documents → Other Documents and Home → Resident Resources", route:"/important-documents"},
  {value:"stormwater", label:"Stormwater resources", page:"Stormwater Management → Additional resources", route:"/stormwater-management"},
  {value:"page_attachment", label:"Page attachments", page:"Choose a page → Additional documents", route:"/important-documents"},
  {value:"other", label:"Other documents", page:"Important Documents → Other Documents", route:"/important-documents"},
];
export const sectionFor = value => DOCUMENT_SECTIONS.find(s => s.value === value) || DOCUMENT_SECTIONS.find(s => s.value === "other");
export const publicDocuments = {
  async filter(query = {}, ...args) {
    if(query.category==="stormwater") {const rows=await district.entities.Document.list("-updated_date",5000);return mergeOriginalDocuments(rows).filter(d=>!d.archived&&d.category==="stormwater");}
    return district.entities.Document.filter({ ...query, archived: { $ne: true } }, ...args);
  }
};
