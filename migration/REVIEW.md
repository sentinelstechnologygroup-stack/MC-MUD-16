# MCMUD 16 redesign migration review

Source: https://mcmud16.com, captured October 6, 2026.
Base44 prototype: https://app.base44.com/apps/6ac5521849be3e071a6fbb15/editor/preview

## Inventory

- Seven public sitemap pages: Home, District Information, Notice, Important Documents, Elections, Meetings, Consultants.
- 56 unique PDF URLs, after removing cache query strings and duplicate references.
- One original water infrastructure photograph, repeated as a background and consultant image. Transparent loading placeholders are excluded.
- All 56 PDFs and the original photograph downloaded successfully into `assets/`. `asset-manifest.json` maps original URLs to saved files.
- Full source HTML for each page and extracted text, links, image references, and iframe references are saved alongside this report.

## Calendars

No embedded calendar, external calendar feed, or ICS link was found in the seven public pages. The Meetings page states that regular meetings take place on the second Tuesday of each month. Preserve this rule and distinguish calculated schedule dates from posted, confirmed meetings. The directions link points to 25374 Dogwood Lane, Splendora, TX 77372. Agendas are the authoritative source for individual meeting details.

## Historical review notes (superseded where noted below)

- Home lists September 8, 2026 at 7 p.m. as the next meeting, now in the past. It labels that same date both Regular and Special.
- Elections contains historic 2020 filing dates and election information; Home links a 2026 directors election deadline document.
- Board information includes a vacancy and terms ending May 2026. Preserve published information pending district confirmation.
- Footer describes a 2025 tax rate, while District Information includes older annual rates. Keep year labels explicit.
- Water conservation text mentions New England despite the district being in Texas. Preserve the original while requesting district review.
- Subscription and contact forms need real delivery and consent configuration before launch; never simulate successful submissions.

This prototype is for review. No production-domain change has been made.

## Prototype verification

- All seven source routes are implemented and checked in the Base44 preview.
- All 56 unique PDFs are represented in Document records; comparison found zero missing source URLs.
- PDFs and the photograph are copied into `public/migrated/` in the Base44 app, with a source-to-prototype manifest. Page links resolve through this mapping, preserving the original URLs in editable records.
- The calendar includes 26 historical meeting dates from agendas and minutes. Future second-Tuesday dates are calculated and explicitly marked as recurring, with agenda confirmation required.
- Calendar month navigation, document tabs, board/budget/audit records, election documents, notices, consultant records, and mobile navigation were checked in the browser.
- Build and lint pass. The template's full typecheck reports existing typing issues in its authentication and UI component files; the redesign's own Home and MeetingCard typing issues were repaired.
- Fred Paris is preserved as President and Thomas Enix as Secretary / Treasurer, verified against the rendered source page rather than duplicate hidden headings in source HTML.
- Dates not supported by the source were removed from six document records.
- Email signup is a disabled prototype preview pending delivery configuration. Contact uses telephone and email links; the former hosted contact form has not been recreated as an email-delivery service.
- The live mcmud16.com site and domain remain unchanged.

## Staff portal

The prototype now has `/staff-portal`, linked from the public site's footer. Existing Base44 app administrators can access it; other accounts see the staff sign-in/access message. Document and Meeting write rules remain administrator-only.

Staff can add a PDF, choose its website section, add a title/date/description, preview its destination, and publish it. The nine choices are meeting agendas, meeting minutes, elections, budgets, annual financial reports, tax hearing notices, public notices, rate orders, and other documents. Agendas and minutes require a meeting date. PDF validation checks the extension, actual PDF header, nonempty content, and a 20 MB limit. Retrying a failed record save reuses an already uploaded file.

The document library supports search, section filters, edits, PDF replacement, removal from public listings, and restoration. Removed files are preserved and existing direct PDF URLs remain accessible. Calendar and home-page agenda links only appear for published documents. Staff can also add/edit meetings, choose regular/special status, mark cancellations, set time/location, and attach a published agenda.

Verified in the preview: administrator access, the complete 56-document original library, changing a sample document to Elections and publishing it, its appearance on the public Elections page, removing it from that page, restoring it, and saving existing meeting details with the attached agenda. Desktop and mobile layouts were checked. A clearly labeled sample verification record remains removed from the public website; original district documents were not removed.

Build and lint pass. The portal and its helpers have no TypeScript diagnostics; unrelated template typing issues remain as noted above. Valid/invalid PDF, wrong extension, empty file, and oversized-file validation tests pass.

Pending verification: the browser automation file chooser did not open, so a real PDF upload through the picker still needs a manual check. The CLI upload test and anonymous role test could not run against an unpublished app; Base44 reports `not_deployed`. Recheck upload and non-administrator access once a review deployment is published. This is a verification limitation, not a simulated upload feature: the portal calls Base44's documented `Core.UploadFile` integration and stores the returned URL.

No staff invitations or role grants have been sent or changed. Staff accounts must be authorized as Base44 app administrators before they can publish.

## October 10 2026 initial update (superseded by admin model below)

Stormwater Management now includes all five supplied PDFs, byte-for-byte verified with SHA-256 and served successfully by the preview server. EPA brochure cover previews are derived from the supplied PDFs. MUD 15's Pennsylvania-specific flyer and its site-specific privacy language were reviewed and excluded.

The supplied five-member board roster is maintained in src/lib/district-board.js. Legacy BoardMember entity records remain unchanged because the connector needs reauthentication and CLI entity exec cannot resolve the unpublished site. The public roster uses the new versioned source; future board edits must update that source or restore entity-backed management after synchronizing records. Term dates are omitted until confirmed.

The supplied $0.988 per $100 figure appears in District Information and the footer with effective date pending confirmation. Historical rates remain intact and are not marked CURRENT. No adopted tax order or tax year was invented. The existing utility Rate Order remains separate.

ADA and Accessibility, Privacy Notice, and Terms of Use pages are linked in the footer and marked drafts for district review. General district contacts are not represented as a designated ADA coordinator or spill hotline. No accessibility conformance certification is claimed.

The staff portal includes a Stormwater resources category for future uploads. The five supplied originals are static district resources; additional portal documents render under Additional stormwater resources. These five static resources are not editable or removable through the portal.

Build and lint pass. Desktop, tablet and mobile layouts, notice routes, board/rate rendering, PDF links, loaded brochure images and stormwater category selection were checked. Browser automated PDF download timed out, so file-serving was verified through the preview server and integrity checks instead. This is still a prototype; no live domain change or publication was performed.

Customer-ready request checklist: migration/MCMUD16 Official Records Request.md.

## October 10 2026 completed admin content model

This section supersedes earlier statements about static board/rate content, immutable stormwater resources, calculated future meeting dates and disabled signup previews.

The public roster and supplied pending tax update now read WebsiteContent records, editable in the staff portal. Private WebsiteDraft records support review; ContentChange records track publications. Board supporting records, appointment/election basis, service start, vacancy, term and approved public contact fields are modeled. Tax adoption requires year, effective date and supporting record fields. No missing official facts were invented.

The five supplied stormwater PDFs are editable, replaceable, archivable and restorable through the same page library as other documents. Original seed records merge with backend overrides without duplication. PDFs can target all 11 public pages and link to meeting records. Public document search supports title, section and year. Agendas and minutes appear automatically on related meetings.

Contacts, consultants, tax history, alerts, meeting instructions, home copy/payment link, budget summary, conservation guidance, main stormwater copy and policy notices have structured dashboard editors. Email signup is hidden unless configured. Tentative recurring dates are disabled by default. Unsupported New England conservation wording and the old budget interpretation were replaced with appropriate neutral text.

Build and lint pass. Browser verification confirmed private draft saving, board publication and current roster rendering, missing-evidence tax validation, permit editing with five stormwater records remaining, all 11 page destinations and public stormwater links. Real-file upload through the picker and production authorization remain to be verified with the final backend.

Migration instructions and staff workflow: migration/Admin Portal Model.md. The live domain is unchanged; this app remains an unpublished prototype.

## Favicon and payment link review — October 10, 2026

The current mcmud16.com homepage was checked and includes PAY YOUR BILL under About Us, linking to Regional Water's MCMUD16 page. The existing external payment link is retained under the owner's stated condition. No payment processing integration has been added. The generated transparent water-droplet favicon replaces the number 16 browser icon, with 16/32 pixel PNGs, multi-size ICO and an Apple touch icon.

