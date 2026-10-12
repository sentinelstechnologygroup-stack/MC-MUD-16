# MCMUD 16 Public Website Launch Audit

Reviewed October 10, 2026. Update October 12: the website owner supplied approved district confirmation that $0.988 per $100 is the effective 2026 tax rate. The public notice is updated; supporting meeting minutes remain forthcoming. An exact effective date and component rates have not been supplied. The redesigned public website can run independently of the unfinished staff portal. Do not move DNS until the district approves the public information and the cutover checks below are completed.

## Findings and fixes

- Added the current October 13, 2026 Regular Meeting and original two-page agenda from the district's existing site. The agenda gives 7:00 p.m. at EMC Community Development Center, 16401 1st St, Splendora, TX 77372. Posted October 7. Its original bytes are retained in `/migrated/agenda-2026-10-13.pdf`.
- Removed a hard-coded recurring meeting address from the Meetings page because it differs from the current agenda. Individual posted notices control the time, location and attendance instructions. Future recurring dates remain disabled pending confirmation.
- Corrected upcoming/past grouping so a meeting remains upcoming on its calendar date rather than disappearing at midnight.
- Retained 56 originally migrated PDFs, all five supplied stormwater PDFs and the newly posted agenda: 62 PDF files. Verified original asset sizes, supplied stormwater checksums, PDF headers and document-to-meeting links. The 2025 annual financial report was already preserved and remains available.
- Corrected the consultant's Regional Water link to the working homepage and upgraded the tax consultant link to its working HTTPS homepage. No payment transaction was performed.
- Added unique titles/descriptions, canonical links, Open Graph sharing metadata, a sitemap and robots settings. Direct public page requests receive their own metadata without requiring JavaScript for the head tags. Page bodies still use the React application.
- Kept preview indexing disabled. `VITE_INDEX_PUBLIC_SITE=true` must be set only at the approved public launch and followed by a rebuild. Staff administration remains noindex. Canonicals and the sitemap use the planned primary domain `https://mcmud16.com`.
- Replaced the broad SPA rewrite with explicit known-page routes so unknown direct URLs and missing documents can return HTTP 404. Existing district page paths are preserved; no legacy page rename requires a redirect.
- Improved heading hierarchy, added consistent keyboard focus outlines and changed small teal links from approximately 4.10:1 to 6.97:1 contrast against white. This addresses the measured issue; it is not a complete accessibility certification.
- Retained actual email/telephone contact links, consent-controlled Google Maps and honest pending-rate/draft-policy labels. No inactive contact form or simulated successful staff publishing is presented.

## Verification

All 11 public pages and the locked staff landing page were visited in the browser. Each had one H1, a main landmark and no images missing an alt attribute. All 11 public pages were checked at a 390-pixel mobile width with no horizontal overflow or unnamed buttons. Mobile navigation opened, followed the selected page and closed. Document search found the October 13 agenda; calendar Next month and Today controls worked. No browser errors were captured during these checks. Cookie acceptance, decline and withdrawal were previously verified and are rechecked for this release.

Build, lint and public-data tests verify the release. The Firebase integration remains unactivated and the public site continues using the reviewed snapshot. Private drafts, local credentials and migration exports are excluded from the public bundle. Staff permissions and PDF upload restrictions have separate emulator tests; real staff sign-in and storage activation remain a separate milestone.

This review includes browser/structure checks and a PDF text/tag inventory. It does not constitute a full screen-reader audit, penetration test, legal compliance opinion or PDF accessibility certification. External services, Google Maps tile timing and Facebook availability remain outside the district website's control.

## District information required before DNS cutover

| Needed | Who should confirm | Decision needed |
| --- | --- | --- |
| Current board roster and officer organization | Secretary and district attorney | Approve the supplied five names/titles, spelling of Tomas Enix, terms, approved public contacts and supporting appointment/election and officer records. |
| Adopted tax-rate instrument | Attorney and tax assessor-collector | The effective 2026 total of $0.988 per $100 is now confirmed by the website owner. Provide the forthcoming supporting meeting minutes and signed rate instrument, component rates and exact effective date. The October 13 agenda proposes a tax hearing/adoption; an agenda does not establish adoption. Identify separate utility Rate Order changes. |
| Regular meeting schedule and attendance | Secretary | Confirm the recurring schedule and current location. Resolve the existing homepage's “no teleconference” wording versus Zoom instructions in the posted October 13 agenda. Supply any newer notices and approved minutes before launch. |
| Public notices and policies | District attorney or authorized district approver | Approve ADA/accessibility, privacy and terms wording and effective dates. Confirm accessibility assistance/grievance procedure, records request contact and additional required district postings. |
| Stormwater publication and reporting | Engineer and authorized district approver | Confirm current SWMP/MS4 documents and map approval, designated reporting contact and after-hours procedure. The general contact is not represented as a spill hotline. |
| Current elections and disclosures | Secretary and attorney | Confirm the applicable current election information, filing contact, any new notices and financial disclosures. Historical 2020 information remains clearly dated. |
| Resident contacts | Operator and district approver | Confirm general/service and after-hours water/wastewater contacts and the location map. White Oak Lane is a street-level location, not a verified office entrance or district boundary. |
| Contact delivery | Jonathan and district approver | Confirm the replacement form recipient and record handling if a form is required at launch. Otherwise approve the working email/phone contact approach. |
| Final release approval | Named district website approver | Approve the release and identify who will maintain public information while the staff portal is unfinished. |

## Accessible document follow-up

Seven PDF first pages yielded no extractable text. Request searchable, properly tagged public versions or an accessible equivalent while retaining the originals:

- Notice to Purchaser of Special Taxing or Assessment District.
- Amendment to Information Form — Recorded.
- Taxpayer Impact Statement — August 11, 2026.
- Rate Order — August 10, 2021.
- Approved Budget — September 30, 2024.
- Approved Budget — September 30, 2025.
- MS4 General Permit — Authorization.

Of the 62 PDF files, 45 contain a structure-tree entry and 17 do not. A tag entry alone does not establish correct reading order, descriptions or accessibility; text extraction alone does not prove the whole file is searchable. Ask the district's accessibility reviewer to prioritize the current essential documents and determine the appropriate treatment of historical records. Do not silently rewrite signed records.

## Technical cutover checklist

1. Obtain explicit domain-cutover authorization and access to the existing DNS zone. Export the complete zone and record a rollback plan.
2. Keep DNS hosting at GoDaddy unless the owner separately requests a nameserver transfer. Current nameservers are `ns69.domaincontrol.com` and `ns70.domaincontrol.com`; current web A records are `76.223.105.230` and `13.248.243.5`, with `www` pointing to the apex. Website migration normally needs web-record changes, not a nameserver move.
3. Add `mcmud16.com` and `www.mcmud16.com` to the linked Vercel project at the authorized cutover. Neither is currently attached to this project. Use the exact records Vercel supplies then; do not guess addresses or change unrelated TXT/MX records. No MX answer was observed during the lookup, but the full zone must still be preserved.
4. Use the apex as the primary address, redirect www consistently and verify domain ownership, HTTPS issuance and unauthenticated access. Current Vercel protection excludes custom domains; recheck the applied protection before launch.
5. Enable public indexing with `VITE_INDEX_PUBLIC_SITE=true`, rebuild and verify robots, sitemap, canonical tags and staff noindex. Submit the sitemap through the district's approved search account if available.
6. Repeat public-route and sample-PDF HTTP checks on the custom domain, test old page bookmarks, email/phone/payment links, the map, cookie controls and mobile navigation.
7. Confirm the October 13 meeting information is still current on the actual cutover date. Publish approved new records, rather than leaving this audit-date snapshot indefinitely.
8. Keep the old website backup and recoverable Vercel deployment available until the district accepts the launch. Only then consider cancellation of old hosting. Original GoDaddy-hosted PDF URLs are on a third-party domain and cannot be redirected by changing mcmud16.com DNS; the new site serves retained local copies.

## Separate staff portal milestone

The dedicated Firebase project and reviewed records exist. Blaze billing, Authentication setup, approved accounts, Cloud Storage deployment and real end-to-end publishing verification remain required before staff can self-manage. These do not prevent a public launch if the district approves the interim maintenance arrangement. Synchronize subsequent snapshot changes into Firebase before activating live reads.

## Sources

- [Current district homepage](https://mcmud16.com/).
- [Current district document list](https://mcmud16.com/important-documents).
- [October 13, 2026 posted agenda](https://img1.wsimg.com/blobby/go/e6b4b2f7-2a16-4240-8d4b-4e4c92563369/downloads/72019c95-d637-4e4d-9a81-9cf74fa398ff/AGENDA%20FOR%20October%2013%202026.pdf?ver=1791413610839).
- [Regional Water payment information](https://regionalwater.net/).
- [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
