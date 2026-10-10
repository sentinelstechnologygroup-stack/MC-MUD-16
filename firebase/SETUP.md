# Firebase staff portal activation

Dedicated project: `mcmud16-district`. Website hosting remains on the linked Vercel `mcmud16` project. Do not change the district custom domain.

## Completed

- Firestore created and reviewed public records imported with existing IDs and document links preserved.
- Firestore permissions deployed. Private drafts and audit records require a verified account carrying the server-assigned `districtAdmin` custom claim. Public visitors cannot write.
- Firebase client adapter supports live public reads, staff sign-in/reset/sign-out, meeting/document/content writes, and PDF uploads.
- Content writes and an audit entry commit in the same Firestore batch. Existing UI history entries may also be recorded.
- PDF upload rules allow verified staff to create PDF files up to 20 MB, with immutable object names. The public-documents folder is public; never upload confidential files there. Private page drafts are held separately in Firestore.

## Required before enabling production

1. Link this Firebase project to the approved existing Blaze billing account. Cloud Storage provisioning requires Blaze. Do not assume usage will always remain free.
2. Enable email/password sign-in and password reset in Firebase Authentication. Register the Vercel and local development URLs as appropriate for authentication actions. Disable end-user account creation through the Authentication configuration; provision approved staff centrally.
3. Create the default Cloud Storage bucket, select its region, and deploy `firebase/storage.rules` using `firebase deploy --only storage --project mcmud16-district`.
4. Obtain the approved staff email list. Create accounts without emailing credentials; let staff establish their own passwords. Verify email ownership and assign `districtAdmin: true` through a trusted administrator operation. Never grant staff permissions based on a browser-side role field. Provide a process to revoke the claim and active sessions when staff leave.
5. Copy public Firebase web configuration into local/Vercel environment variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_APP_ID`. These are Firebase client identifiers, not administrative credentials. No service-account private key belongs in a VITE variable.
6. Deploy a preview. Verify a real authorized account can save a Regular and Special meeting, publish/restore a PDF in its selected section, publish a board change, and save a private draft. Verify public visitors see published changes on a fresh visit and cannot read drafts or write data. Reverse any test changes and preserve audit history.
7. Verify the live PDF upload/download path, password reset, signed-out/unauthorized errors, and storage rules. Establish database and file backups with a restore check. Configure usage alerts. MFA is not yet implemented and must be evaluated/configured before claiming it is enforced.
8. Update privacy wording to describe the actual enabled Firebase services, then enable production configuration and redeploy. Until activation, the existing snapshot and locked portal remain in use.

## Checks

Run `npm run build`, `npm run lint`, `npm test`, and `npm run test:firebase`. The Firebase test command uses a separate demo emulator project and never writes test records to production.

Existing originals stay under `public/migrated` and `public/stormwater`. Archived document metadata becomes staff-only, while historical direct file links remain available. Do not use archive as a confidentiality mechanism.
