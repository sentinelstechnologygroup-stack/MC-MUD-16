import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useWebsiteContent } from '@/lib/website-content';
import { useCookieConsent } from '@/components/CookieConsent';
import { isGoogleMapEmbed } from '@/lib/cookie-consent';

function MapEmbed({ url, address }) {
  const container = useRef(null);
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setStarted(true); observer.disconnect(); }
    }, { rootMargin: '1200px 0px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started || loaded) return;
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [started, loaded]);
  return <div ref={container} className="relative h-[360px] lg:h-[450px] bg-[#edf4f5]">
    {!loaded && <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#39566a] pointer-events-none" role="status">
      <MapPin className="w-8 h-8 mb-3" aria-hidden="true"/>
      <p>{slow ? 'Google Maps is taking longer than usual.' : 'Loading district map…'}</p>
      <p className="mt-2 text-sm">You can use Get directions above at any time.</p>
    </div>}
    {started && <iframe title={'Google Map: ' + address} src={url} onLoad={() => setLoaded(true)} className={'relative block w-full h-full border-0 transition-opacity ' + (loaded ? 'opacity-100' : 'opacity-0')} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>}
  </div>;
}

export default function DistrictMap() {
  const contacts = useWebsiteContent('contacts');
  const { mapsAllowed, openPreferences } = useCookieConsent();
  if (contacts.show_map === false) return null;
  const validEmbed = isGoogleMapEmbed(contacts.map_embed_url);
  const directions = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(contacts.address);
  return <section aria-labelledby="district-map-title" className="mt-10 rounded-lg overflow-hidden border border-[#cbdcde] bg-white">
    <div className="p-6 flex flex-wrap justify-between items-center gap-5">
      <div><h3 id="district-map-title" className="font-heading text-2xl text-[#143c58]">District location</h3><p className="text-sm text-[#39566a] mt-2">{contacts.address}</p></div>
      <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-[#143c58] text-white px-5 py-3 font-semibold text-sm"><Navigation className="w-4 h-4" aria-hidden="true"/>Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span></a>
    </div>
    {mapsAllowed && validEmbed ? <MapEmbed key={contacts.map_embed_url} url={contacts.map_embed_url} address={contacts.address}/> : <div className="min-h-[250px] p-8 flex flex-col items-center justify-center text-center bg-[#edf4f5] text-[#39566a]">
      <MapPin className="w-8 h-8 text-[#0c617b] mb-4" aria-hidden="true"/>
      <p>{validEmbed ? 'The embedded Google Map is off until you accept optional cookies. You can still open directions in a new tab.' : 'Use the directions link to view this location in Google Maps.'}</p>
      {validEmbed && <button type="button" className="mt-4 underline font-semibold text-[#0c617b]" onClick={openPreferences}>Cookie preferences</button>}
    </div>}
  </section>;
}
