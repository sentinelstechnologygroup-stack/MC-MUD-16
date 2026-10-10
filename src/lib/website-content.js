import { useQuery } from "@tanstack/react-query";
import { district } from "@/api/districtClient";
import { WEBSITE_DEFAULTS } from "@/lib/website-defaults";
export function useWebsiteContent(key,fallback=WEBSITE_DEFAULTS[key]) {
 const query=useQuery({queryKey:["website-content",key],queryFn:async()=>{const rows=await district.entities.WebsiteContent.filter({key},"-updated_date",1);return rows[0]?JSON.parse(rows[0].value):null;},staleTime:0});
 return query.data??fallback;
}
export function validPublicUrl(value){return !value || /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value);}
