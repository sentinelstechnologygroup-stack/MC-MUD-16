import { Link } from 'react-router-dom';
export default function PageNotFound() {
  return <main className="min-h-screen flex items-center justify-center p-6 bg-[#edf4f5]"><section className="max-w-lg text-center"><p className="text-sm font-semibold text-[#0c617b] mb-3">Montgomery County MUD 16</p><h1 className="font-heading text-4xl text-[#143c58]">Page not found</h1><p className="mt-5 text-[#39566a]">The requested page is unavailable. Find district information and public documents from the homepage.</p><Link to="/" className="inline-block mt-6 rounded bg-[#143c58] text-white px-5 py-3">Return to the district website</Link></section></main>;
}
