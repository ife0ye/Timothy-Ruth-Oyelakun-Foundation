# Timothy & Ruth Oyelakun Foundation

The foundation's website: a single-page site built with React, Vite, Tailwind CSS and Motion, with
donations through Flutterwave and a contact form through Resend. Hosted on Vercel.

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
| Currencies, preset amounts, min/max gift | `shared/donation.ts` |
| Page sections | `src/components/` |
| Colours, fonts, easing curves | `src/styles/index.css` (`@theme`) |
| Serverless API (donations, webhook, contact) | `api/` |
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
