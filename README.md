# LUCIANE English Academy

Private source backup for the existing LUCIANE English Academy Wix site.

## AI Tutor

- **Tutor application:** https://nuovqgybrszacjlolacy.supabase.co/functions/v1/luciane-app
- **Service status check:** https://nuovqgybrszacjlolacy.supabase.co/functions/v1/luciane-status
- **AI endpoint:** https://nuovqgybrszacjlolacy.supabase.co/functions/v1/luciane-tutor
- **Frontend source:** `tutor/`
- The tutor app is served by a Supabase Edge Function and uses Supabase Auth plus the protected `luciane-tutor` function.
- The status endpoint reports whether the private `OPENAI_API_KEY` secret is configured; it never returns the key itself.

## Backup

- `wix-source-export.zip` — complete original Wix Code Store export.
- Export revision: `9b4bd802286cbdf344885020a13ad4c22a8416f5`.
- The archive contains the original project files: `app.js`, `index.html`, `styles.css`, `sw.js`, and `icon.svg`.
- The archive was transferred from Wix and committed to this private repository.

## Existing Wix website

The original website remains hosted on Wix. Deploying the separate AI Tutor does not modify the existing Wix site, its pages, or its accounts.

## Security

Never commit API keys, passwords, access tokens, private student data, or environment files.


## LUCIANE Academic Sciences — migrated frontend

- **Primary portal source:** `sciences/index.html`, `sciences/staging.css`, `sciences/staging.js`.
- **Design refinement:** `sciences/staging-premium.css`.
- **Legacy static frontend retained:** `sciences/science.css` and `sciences/science.js`.
- **Deployment:** GitHub Actions workflow at `.github/workflows/pages.yml` publishes the React portal from `sciences/` to GitHub Pages.
- **Backend:** Supabase project `nuovqgybrszacjlolacy`; the database, authentication, curriculum and Edge Functions remain hosted there.

The GitHub Pages deployment requires Pages to be enabled for this repository and a successful Actions run. Add the final GitHub Pages URL to Supabase Auth's redirect URL allow-list before testing new sign-ups. Do not commit service-role keys or private credentials.

## AI practice batch generator

- **Edge Function:** `english-practice-batch` at `https://nuovqgybrszacjlolacy.supabase.co/functions/v1/english-practice-batch`.
- Generates exactly five exercises in one OpenAI Structured Outputs request.
- Validates unique learning targets, five distinct exercise formats, four distinct options per exercise, and the correct-option reference.
- Shuffles answer positions server-side with a balanced random distribution.
- Uses the server-side `OPENAI_API_KEY`; never expose that secret in browser code.
- The public static practice page sends the Supabase publishable key and is restricted by the function to the GitHub Pages origin.
- Persistent quota: five lesson generations per IP per minute. IP addresses are hashed before storage; the raw address is not stored.
- SQL setup: `supabase/sql/practice-generation-limits.sql`.
- Source: `supabase/functions/english-practice-batch/index.ts`.
