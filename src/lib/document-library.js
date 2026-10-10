import { district } from "@/api/districtClient";
import { STORMWATER_DOCUMENTS } from "@/lib/stormwater-documents";
export function mergeOriginalDocuments(records){return [...records,...STORMWATER_DOCUMENTS.filter(s=>!records.some(d=>d.seed_key===s.id||d.file_url===s.file_url)).map(s=>({...s,id:'seed:'+s.id,seed_key:s.id,category:'stormwater',archived:false}))];}
export const documentLibrary={async list(){return mergeOriginalDocuments(await district.entities.Document.list('-updated_date',5000));},async save(original,changes){const {id,created_date,updated_date,created_by,...data}={...original,...changes};return original.id&&!original.id.startsWith('seed:')?district.entities.Document.update(original.id,data):district.entities.Document.create(data);}};
