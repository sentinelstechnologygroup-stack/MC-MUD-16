# Montgomery County MUD 16

Independent React/Vite website migrated from the Base44 prototype on October 10, 2026.

Repository: https://github.com/sentinelstechnologygroup-stack/MC-MUD-16

## Local development

Use Node.js 22.12 or newer. Install with `npm ci`, then start with `npm run dev`. Build with `npm run build`; preview the build with `npm run preview`. Run `npm run lint` and `npm test` before publishing.

The public application requires no Base44 credentials or runtime service. `src/data/public-content.json` contains reviewed public records. Original PDFs/images are under `public/migrated`; supplied stormwater files are under `public/stormwater`.

## Administration status

The document, meeting and structured page editors are preserved in source. Staff publishing is intentionally locked until replacement authentication, database, permanent upload storage and server permission checks are connected and verified. The public site never simulates successful writes. `src/api/districtClient.js` is the replacement integration boundary; its current implementation supplies public reads and rejects writes/private reads.

To complete the portal, replace this boundary with authenticated server endpoints using the models in `base44/entities`, migrate IDs and relationships, and retain private drafts and publishing history. Do not place private records or credentials in frontend bundles. The original complete export is saved locally in `migration/private/content-export.json`, excluded from Git and deployment. Archived records and original files are retained there for future backend import.

Until then, public content changes require updating the reviewed snapshot and redeploying. This is a transitional deployment, not completion of the production admin backend.

## Deployment

Vercel project: `mcmud16`, under Patrick's projects. The build is Vite with `dist` output. `vercel.json` supports direct page navigation. The custom district domain has not been moved; connecting it requires a separate cutover after district approval and final checks.

Keep `.env.local`, `.vercel`, private exports and temporary migration material out of Git. `.vercelignore` excludes migration material and legacy schemas from deployed files.

## District review

The supplied $0.988 figure remains pending supporting paperwork. Board terms and official coordinator/reporting contacts remain unspecified until confirmed. ADA, privacy and terms pages remain draft notices, not adopted district policies or compliance certification.

See [official records request](migration/MCMUD16%20Official%20Records%20Request.md) and [admin model handoff](migration/Admin%20Portal%20Model.md).

## Dependency notes

Unused template packages and Base44 runtime packages were removed. Router dependencies were updated to address the reported router advisories. Remaining dependency advisories concern Tailwind 3's build tooling; those packages do not execute as a deployed backend. A future Tailwind upgrade should be tested separately against the district design.
