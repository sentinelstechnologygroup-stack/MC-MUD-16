# Montgomery County MUD 16

Independent React/Vite website migrated from the Base44 prototype on October 10, 2026.

Repository: https://github.com/sentinelstechnologygroup-stack/MC-MUD-16

## Local development

Use Node.js 22.12 or newer. Install with `npm ci`, then start with `npm run dev`. Build with `npm run build`; preview the build with `npm run preview`. Run `npm run lint` and `npm test` before publishing.

The public application requires no Base44 credentials or runtime service. `src/data/public-content.json` contains reviewed public records. Original PDFs/images are under `public/migrated`; supplied stormwater files are under `public/stormwater`.

## Administration status

The document, meeting and structured page editors now have a Firebase integration. The dedicated project is `mcmud16-district`; reviewed public records are imported and Firestore rules are deployed. Production remains on its reviewed snapshot until billing/storage, Authentication and approved staff accounts are configured and the full publishing flow is verified. The public site never simulates successful writes. `src/api/districtClient.js` selects Firebase only when its VITE configuration is supplied; otherwise it retains snapshot reads and rejects writes/private reads.

To complete the portal, replace this boundary with authenticated server endpoints using the models in `base44/entities`, migrate IDs and relationships, and retain private drafts and publishing history. Do not place private records or credentials in frontend bundles. The original complete export is saved locally in `migration/private/content-export.json`, excluded from Git and deployment. Archived records and original files are retained there for future backend import.

Until activation, public content changes require updating the reviewed snapshot and redeploying. Follow [Firebase activation steps](firebase/SETUP.md). Run `npm run test:firebase` for isolated Firestore and PDF-storage permissions tests. No staff claims have been granted without an approved email list. This is a transitional deployment, not completion of the production admin backend.

## Deployment

Vercel project: `mcmud16`, under Patrick's projects. The build is Vite with `dist` output. `vercel.json` supports direct page navigation. The custom district domain has not been moved; connecting it requires a separate cutover after district approval and final checks.

Keep `.env.local`, `.vercel`, private exports and temporary migration material out of Git. `.vercelignore` excludes migration material and legacy schemas from deployed files.

## District review

## Cookies, map and contact delivery

The accept/decline notice stores the visitor's choice for 180 days. Google Maps loads only after acceptance; the footer's Cookie preferences control can withdraw that choice. No optional analytics is enabled. Notice copy and the Google Maps embed URL are structured WebsiteContent fields for the future staff editor.

The original GoDaddy contact form has optional Name, required Email and optional Message fields, with attachments disabled and reCAPTCHA v3 enabled. Its public code submits through GoDaddy's hosted contact service and does not expose the destination mailbox. [GoDaddy's contact-form documentation](https://www.godaddy.com/en-ca/help/use-web-contact-forms-with-godaddy-conversations-41127) describes routing through the Conversations inbox. Jonathan must confirm the actual inbox/notification recipient and who handles replies before replacement delivery is enabled. The public email address alone does not establish that recipient.

The homepage contact form submits to the user-provided Formspree endpoint `https://formspree.io/f/xeaelpak`. Name is optional; email and message are required. It includes a honeypot, duplicate-submit protection, a 20-second timeout and accessible status messages. Success is displayed only after Formspree explicitly accepts the request. Email/telephone links remain available. Formspree dashboard settings control recipients, spam filtering and retention; inbox delivery and those settings must be confirmed by the owner. No secret key is needed in the browser. Preserve existing contact records according to district instructions.

The supplied $0.988 figure remains pending supporting paperwork. Board terms and official coordinator/reporting contacts remain unspecified until confirmed. ADA, privacy and terms pages remain draft notices, not adopted district policies or compliance certification.

See [official records request](migration/MCMUD16%20Official%20Records%20Request.md) and [admin model handoff](migration/Admin%20Portal%20Model.md).

## Dependency notes

Unused template packages and Base44 runtime packages were removed. Router dependencies were updated to address the reported router advisories. Remaining dependency advisories concern Tailwind 3's build tooling; those packages do not execute as a deployed backend. A future Tailwind upgrade should be tested separately against the district design.
