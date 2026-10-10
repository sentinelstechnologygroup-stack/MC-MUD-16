# MCMUD 16 admin portal and migration handoff

Updated October 10, 2026. The Base44 prototype now models routine content maintenance; the public domain is unchanged.

Migration repository: https://github.com/sentinelstechnologygroup-stack/MC-MUD-16.git (confirmed by the project owner). The remote was reachable and advertised no branches when checked. The current workspace contains migration materials but is not yet a standalone checkout of this repository. Initialize or clone this repository within the project directory during migration; do not use the unrelated repository detected at C:/.

## Staff workflow

- **Website content:** select Board members, Tax rate update, Historical tax rates, District contacts, Consultants, Meeting instructions, District alert, Home page, Budget summary, Conservation guidance, Stormwater page, ADA & accessibility, Privacy notice, Terms of use, or Email signup. Save a private draft or publish approved content.
- **Page libraries:** select the destination, drop a PDF or choose a file, review the title and metadata, then publish. The page creates the link automatically. Additional documents can target any of the 11 public pages.
- **Meeting records:** maintain meeting date, time, location, type and cancellation status. Attach agendas and minutes from the document editor using Related meeting. Public meeting cards list related records.
- **Document maintenance:** search, edit, replace PDFs, archive and restore. Record adoption/effective dates and identify superseded documents. Archiving removes public listings while preserving files and existing direct links.

## Accuracy controls

The supplied five-member board roster is editable through published backend content. Terms, approved public contacts, service start dates and appointment/election evidence remain blank or unspecified until supported. A vacant seat can be marked explicitly.

The supplied $0.988 per $100 rate remains pending. Publishing it as confirmed requires a tax year, effective date and supporting document. The existing utility rate order is separate from property tax records. These checks require fields; district staff must still verify the evidence itself.

Accessibility, privacy and terms notices remain drafts. General district contact information is not assigned an official coordinator or reporting role. Tentative recurring meeting dates are disabled by default. Email signup remains hidden until configured with an actual service URL.

## Data to carry into the local application

| Data | Purpose |
| --- | --- |
| WebsiteContent | Published structured page content; key and JSON value |
| WebsiteDraft | Private staff drafts; never expose publicly |
| ContentChange | Publishing history with before/after values and actor |
| Document | PDF metadata, category, page destination, meeting link, dates, superseded record, archive state |
| Meeting | Calendar records and agenda association |
| TaxRate and Consultant | Legacy fallback data for content groups not yet published |
| Static migration manifests and assets | Original PDF/image files and source mappings |
| Stormwater seed records | Five supplied PDFs; merge backend overrides using seed_key or original file URL |

Export the published and private records, not just the frontend code. Preserve record IDs or remap meeting_id and supersedes_id. Materialize fallback content and virtual stormwater seed records into the replacement database. Apply backend overrides before importing seeds to avoid duplicates or restoring archived documents. Legacy BoardMember records are not the current public roster and must not overwrite WebsiteContent board_members.

Keep the original files and source-to-local mapping. Replace Base44 upload/auth/entity calls with the chosen local backend. Vercel hosting alone does not replace the content database, staff authentication or permanent PDF storage. Use durable object storage for uploaded PDFs.

## Before production launch

1. Confirm district facts and obtain the official records listed in the companion records request.
2. Transfer all records and files, preserve old paths with redirects, and check every public link.
3. Enforce staff permissions on the server, keep drafts/history private, validate PDF uploads, and test unauthorized access.
4. Verify an actual staff PDF upload, page publication, agenda/minutes association, replacement, archive and restore against the replacement backend.
5. Complete keyboard/mobile/accessibility review including PDF accessibility; have the district approve policy notices and actual contact designations.
6. Update the privacy notice to the final hosting, storage and authentication providers. Establish backups, recovery and staff handoff instructions.

## Verification completed

Build and lint pass. In the preview, private draft save and board publication succeeded; the public roster matches the supplied names. Missing evidence blocked confirmed-rate publication. Editing the supplied permit produced one backend override while retaining five public stormwater documents and 61 total public documents. All 11 page attachment destinations are available. The five supplied PDF files passed byte-for-byte integrity and file-serving checks.

The new upload picker flow still needs a real-file verification. Production staff permissions, storage and authentication must be tested after replacement services are connected. Publishing history is a prototype audit model; it is not a tamper-proof records system. This does not certify legal compliance or make the draft notices adopted district policy.


## Independent deployment — October 10, 2026

The complete app source and public assets are now in the local project. The original administrative export is retained privately at migration/private/content-export.json. Published public content has been materialized in src/data/public-content.json. Public runtime no longer calls Base44; staff writes remain locked until the replacement server backend is completed. The GitHub destination is MC-MUD-16, superseding the earlier repository name.

