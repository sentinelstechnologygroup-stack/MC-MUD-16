import PageAttachments from "@/components/PageAttachments";
import { useWebsiteContent } from "@/lib/website-content";
import { DistrictContacts, PublicAlert, TaxUpdate } from "@/components/ManagedContent";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Facebook } from "lucide-react";
import { useCookieConsent } from "@/components/CookieConsent";

const NAV = [
  { label: "Home", to: "/" },
  { label: "District Information", to: "/district-information" },
  { label: "Notice", to: "/notice" },
  { label: "Important Documents", to: "/important-documents" },
  { label: "Elections", to: "/elections" },
  { label: "Meetings", to: "/meetings" },
  { label: "Consultants", to: "/consultants" },
  { label: "Stormwater Management", to: "/stormwater-management" },
];

export default function SiteLayout() {
  const { openPreferences } = useCookieConsent();
  const contacts=useWebsiteContent("contacts");
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-5 focus:py-3 focus:text-[#143c58] focus:underline">Skip to main content</a>
      <div className="bg-navy text-navy-foreground hidden sm:flex items-center justify-end px-6 lg:px-20 h-[42px] text-xs tracking-[0.08em]">
        <span>{contacts.address} · {contacts.phone}</span>
      </div>

      <header className="bg-white border-b border-[#dce7e9] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 lg:px-12 flex items-center justify-between gap-6 min-h-[80px] lg:flex-wrap lg:gap-x-6 lg:gap-y-3 lg:py-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-[#133b57] shrink-0"
            aria-label="Montgomery County Municipal Utility District 16 home"
          >
            <img src="/favicon-32.png" alt="" className="w-8 h-8"/><span className="font-heading text-xl lg:text-2xl">MC MUD 16</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-[#0c617b]"
                      : "text-[#39566a] hover:text-[#0c617b]"
                  } focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#39a8ba] focus-visible:outline-offset-[4px]`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="lg:hidden text-[#39566a] p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-[#dce7e9] bg-white">
            <nav aria-label="Mobile navigation" className="flex flex-col px-5 py-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `py-3 text-sm font-semibold border-b border-[#eef3f4] ${
                      isActive ? "text-[#0c617b]" : "text-[#39566a]"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <PublicAlert/>
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
        <PageAttachments/>
      </main>

      <footer className="bg-navy text-navy-foreground px-6 lg:px-12 pt-10 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_1.1fr_1.1fr] gap-8 lg:gap-12">
          <div>
            <h3 className="font-heading text-2xl leading-snug max-w-[390px]">
              Montgomery County Municipal Utility District #16
            </h3>
            <div className="mt-5 text-[#d4e5e9] [&_div]:text-inherit [&_div]:space-y-2"><DistrictContacts/></div>
            <a
              href={contacts.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-[#d4e5e9] hover:text-[#71d1d9] transition-colors"
            >
              <Facebook className="w-4 h-4" /> Facebook
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] uppercase text-[#71d1d9] mb-4">Explore</p>
            <nav aria-label="Footer navigation" className="grid grid-cols-1 gap-2.5 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="text-[#d4e5e9] hover:text-[#71d1d9] active:text-[#a9e4e8] transition-colors w-fit"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] uppercase text-[#71d1d9] mb-4">Public Information</p>
            <p className="text-sm text-[#d4e5e9] leading-relaxed">Public information requests: <a className="underline" href={"mailto:"+contacts.email}>{contacts.email}</a>, or mail to {contacts.mailing}.</p>
            <div className="mt-6 text-[#d4e5e9] [&>div]:bg-transparent [&>div]:border-white/20 [&>div]:text-inherit [&>div]:p-3 [&_p]:text-xs [&_p]:leading-relaxed"><TaxUpdate/></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-white/10 text-xs text-[#a9c4cb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>© {new Date().getFullYear()} Montgomery County Municipal Utility District #16. All Rights Reserved.</p>
          <Link to="/staff-portal" className="underline hover:text-white shrink-0">Staff portal</Link>
        </div>
        <nav aria-label="Accessibility and legal notices" className="max-w-7xl mx-auto mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[#d4e5e9] underline"><Link to="/accessibility">ADA & Accessibility</Link><Link to="/privacy-notice">Privacy Notice</Link><Link to="/terms-of-use">Terms of Use</Link><button type="button" onClick={openPreferences} className="underline text-left">Cookie preferences</button></nav>
      </footer>
    </div>
  );
}
