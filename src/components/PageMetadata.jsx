import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_METADATA, SITE_ORIGIN } from '@/lib/page-metadata';
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(()=>{
    const record=PAGE_METADATA[pathname];
    const title=record ? record[0]+(pathname==='/'?'':' | Montgomery County MUD 16') : 'Page Not Found | Montgomery County MUD 16';
    document.title=title;
    function meta(selector, attributes, value) {let element=document.head.querySelector(selector);if(!element){element=document.createElement('meta');Object.entries(attributes).forEach(([key,item])=>element.setAttribute(key,item));document.head.append(element);}element.setAttribute('content',value);}
    meta('meta[name="description"]',{name:'description'},record?.[1]||'The requested district website page could not be found.');
    meta('meta[name="robots"]',{name:'robots'},!record||pathname==='/staff-portal'||import.meta.env.VITE_INDEX_PUBLIC_SITE!=='true'?'noindex, nofollow':'index, follow');
    meta('meta[property="og:title"]',{property:'og:title'},title);
    meta('meta[property="og:description"]',{property:'og:description'},record?.[1]||'Page not found.');
    meta('meta[property="og:url"]',{property:'og:url'},SITE_ORIGIN+pathname);
    let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=SITE_ORIGIN+pathname;
  },[pathname]);
  return null;
}
