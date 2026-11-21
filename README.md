# Timothy & Ruth Oyelakun Foundation

The foundation's website, built with React, Vite, Tailwind CSS and Motion, with donations through
Flutterwave and the contact and scholarship forms through Resend. Hosted on Vercel.

Two pages: the home page (`index.html`) and the scholarship page (`scholarship.html`, served at `/scholarship`).

**Going live? Follow [DEPLOYMENT.md](DEPLOYMENT.md).**

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in test keys
npm run dev                  # http://localhost:5173 (site and /api together)
```

`npm run build` type-checks and builds. `npm run preview` serves the build with the same security
headers as production, so problems with the Content-Security-Policy show up before you deploy.

## Where things live

| What | Where |
| --- | --- |
| Text, contact details, office hours, programmes | `src/content.ts` |
| Scholarship deadline, PDF link, paper-application address | `SCHOLARSHIP` in `src/content.ts` |
| Scholarship questions, CGPA rules, document list | `shared/scholarship.ts` |
| Printable scholarship form | `public/forms/trof-scholarship-application-form.pdf` |
| Currencies, preset amounts, min/max gift | `shared/donation.ts` |
| Page sections | `src/components/` |
| Colours, fonts, easing curves | `src/styles/index.css` (`@theme`) |
| Serverless API (donations, webhook, contact, scholarship) | `api/` |
| Security headers | `vercel.json` |
| Photos and icons | `public/images/` |

## How donations work

1. The donor picks an amount → `POST /api/donations/create` validates it and asks Flutterwave for a
   hosted checkout link. Card details are only ever entered on Flutterwave's page.
2. After paying, Flutterwave sends the donor back to the site with a reference. The site calls
   `GET /api/donations/verify`, which asks Flutterwave directly whether the payment succeeded and
   returns only the outcome and amount.
3. Separately, Flutterwave calls `POST /api/donations/webhook`. The site checks the secret hash,
   re-confirms the payment with Flutterwave, and emails the foundation.

No database is needed; Flutterwave's dashboard is the record of every donation.

## How scholarship applications work

1. The applicant fills in six short steps at `/scholarship` and attaches their documents. Phone photos are
   shrunk in the browser so a whole application fits in one upload (Vercel allows 4.5 MB per request).
2. `POST /api/scholarship` checks everything again (same rules as the form, from `shared/scholarship.ts`),
   checks each file really is a PDF or photo, and emails the application with the documents attached to
   `CONTACT_TO_EMAIL` (info@trofng.org). Set `SCHOLARSHIP_TO_EMAIL` only to send them somewhere else.
3. The applicant sees a reference number like `TROF-S-2611-K7Q2M` and gets a short confirmation email.

Nothing is stored on the server; the foundation's inbox is the record of every application.
