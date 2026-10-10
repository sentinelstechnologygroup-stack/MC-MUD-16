import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { consentCookie, parseConsent } from '@/lib/cookie-consent';
import { useWebsiteContent } from '@/lib/website-content';

const CookieContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [choice, setChoice] = useState(() => parseConsent(document.cookie));
  const [open, setOpen] = useState(() => !parseConsent(document.cookie));
  const panel = useRef(null);
  const returnFocus = useRef(null);
  const copy = useWebsiteContent('cookie_notice');
  useEffect(() => { if (open && returnFocus.current) panel.current?.focus(); }, [open]);

  function choose(next) {
    document.cookie = consentCookie(next, window.location.protocol === 'https:');
    setChoice(next);
    setOpen(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  }
  function openPreferences() {
    returnFocus.current = document.activeElement;
    setOpen(true);
  }
  return <CookieContext.Provider value={{ choice, mapsAllowed: choice === 'accepted', openPreferences }}>
    {children}
    {open && <section ref={panel} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description" className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[430px] z-50 rounded-lg bg-[#143c58] p-6 text-white shadow-2xl border border-[#40768a] max-h-[80dvh] overflow-auto">
      <h2 id="cookie-title" className="font-heading text-2xl mb-3">{copy.title}</h2>
      <p id="cookie-description" className="text-sm leading-relaxed text-[#e0eef1]">{copy.body}</p>
      <Link to="/privacy-notice" className="inline-block mt-3 underline text-sm text-white">Read our privacy notice</Link>
      <div className="grid grid-cols-2 gap-4 mt-5">
        <button type="button" onClick={() => choose('declined')} className="rounded bg-white text-[#143c58] px-4 py-3 font-semibold text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Decline</button>
        <button type="button" onClick={() => choose('accepted')} className="rounded bg-white text-[#143c58] px-4 py-3 font-semibold text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Accept</button>
      </div>
    </section>}
  </CookieContext.Provider>;
}

export function useCookieConsent() {
  const consent = useContext(CookieContext);
  if (!consent) throw new Error('CookieConsentProvider is required');
  return consent;
}
