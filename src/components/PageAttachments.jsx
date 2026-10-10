import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import {publicDocuments} from "@/lib/document-sections";
import DocumentList from "@/components/DocumentList";
export default function PageAttachments(){const {pathname}=useLocation();const [docs,setDocs]=useState([]);useEffect(()=>{let active=true;setDocs([]);if(pathname==='/staff-portal')return;publicDocuments.filter({category:'page_attachment',page_path:pathname},'-date',500).then(d=>{if(active)setDocs(d);}).catch(()=>{});return ()=>{active=false;};},[pathname]);if(!docs.length)return null;return <section className="max-w-7xl mx-auto px-5 lg:px-12 pb-12"><h2 className="font-heading text-2xl text-[#143c58] mb-4">Additional documents</h2><DocumentList documents={docs} loading={false}/></section>;}
