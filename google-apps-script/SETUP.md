# Google Sheets setup (RSVP + Wishes)

Spreadsheet: https://docs.google.com/spreadsheets/d/1xcZ9mZunxOYGp8xgLmEJG7_bHtxBWvVjPJghuL1DdMQ/edit

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Delete the default code and paste the full contents of `code.ts` (repo root).
3. Save, then run `setupSheets` once from the editor and accept the permissions.
   This creates the **RSVP** and **Wishes** sheets with styled headers
   (they are also auto-created on the first submission).
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web app URL (ends with `/exec`) into `GOOGLE_SCRIPT_URL` in `src/config.ts`,
   then commit and redeploy the site.

Sheet columns
- RSVP: Timestamp | Full Name | Phone | Attendance | No. of Guests | Notes | Invited As
- Wishes: Timestamp | Guest Name | Message | Invited As

If you later change `code.ts`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
