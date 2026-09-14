# Going live: checklist

Work through this top to bottom once. When every box is ticked, the site, donations and contact
form will run without you having to come back to it.

Time needed: about an hour of your time, plus waiting for Flutterwave to approve the account
(this can take a few business days, so **start step 1 first**).

---

## 1. Flutterwave: get approved for live payments

Donations run through Flutterwave. You can't take real money until the account is approved.

- [ ] Sign in at <https://app.flutterwave.com> (or create an account) **as the foundation**, not as a person.
- [ ] Complete **Compliance / KYC**. For an NGO, expect to be asked for:
  - CAC registration certificate (Incorporated Trustees, Part F of CAMA 2020)
  - Constitution / trust deed and the trustees' details and ID
  - Proof of address and a bank account **in the foundation's name** for settlement
  - The website URL (use the final domain, e.g. `https://trofng.org`)
- [ ] Wait for the account to show as **Live / approved**.
- [ ] **Settings → Business preferences → Currencies:** check that NGN, USD, GBP, EUR and CAD are
      enabled for collection. If any currency isn't available on your account, remove it from
      `shared/donation.ts` (one line each) so donors are never offered it.
- [ ] **Settings → Payment methods:** turn on the ones you want (card, bank transfer, USSD, etc.).
- [ ] **Settings → Business preferences:** make sure **email receipts to customers** are on.
      The thank-you screen tells donors a receipt is coming.
- [ ] **Settings → API keys:** copy the **live Secret Key** (`FLWSECK-…`). You'll need it in step 3.
      Never paste it anywhere else, and never commit it to Git.

While you wait for approval, you can test everything with **test keys** (`FLWSECK_TEST-…`) and
Flutterwave's [test cards](https://developer.flutterwave.com/docs/test-cards).

## 2. Resend: email for the contact form and donation alerts

- [ ] Create a free account at <https://resend.com>.
- [ ] **Domains → Add domain** → `trofng.org`, then add the DNS records it shows at your domain registrar.
      Wait until it shows **Verified**.
- [ ] **API Keys → Create** with "Sending access" only. Copy it (`re_…`).

If you skip this, the site still works: the contact form shows an error with your email address,
and you'll see donations in the Flutterwave dashboard instead of getting an email.

## 3. Vercel: deploy

- [ ] Push this repository to GitHub.
- [ ] At <https://vercel.com/new>, import the repository. Vercel detects Vite automatically.
      Don't change the build settings.
- [ ] **Settings → Environment Variables** (Production), add:

  | Name | Value |
  | --- | --- |
  | `SITE_URL` | `https://trofng.org` (your final domain, no trailing slash) |
  | `FLW_SECRET_KEY` | live secret key from step 1 |
  | `FLW_WEBHOOK_HASH` | a long random string. Generate one with `openssl rand -hex 32` |
  | `RESEND_API_KEY` | from step 2 |
  | `EMAIL_FROM` | `Timothy & Ruth Oyelakun Foundation <website@trofng.org>` |
  | `CONTACT_TO_EMAIL` | the inbox that should receive messages, e.g. `info@trofng.org` |
  | `DONATION_NOTIFY_EMAIL` | *(optional)* inbox for donation alerts, if different |

  For **Preview** deployments, use the *test* Flutterwave key so previews can never take real money.

- [ ] **Settings → Domains:** add `trofng.org` and `www.trofng.org`, set the DNS records Vercel shows,
      and set `www` to redirect to the bare domain (or the other way round; just match `SITE_URL`).
- [ ] Redeploy after adding the variables (**Deployments → ⋯ → Redeploy**).

## 4. Connect Flutterwave to the live site

- [ ] Flutterwave **Settings → Webhooks**:
  - URL: `https://trofng.org/api/donations/webhook`
  - Secret hash: **exactly** the same value as `FLW_WEBHOOK_HASH`
  - Enable **webhook retries** and **"charge.completed"** events
- [ ] Save.

## 5. Protect the endpoints (5 minutes, free)

The code already validates everything and throttles abuse per server instance. Vercel's firewall
adds a global limit on top:

- [ ] Vercel **Project → Firewall → Configure → New rule**:
  - If *Request path* **starts with** `/api/`
  - Then **Rate limit**: 30 requests per 60 seconds per IP → **Deny**
- [ ] **Firewall → Bot protection**: turn on **Bot Protection / BotID** if it's available on your plan.
- [ ] Turn on **Vercel Authentication** for *Preview* deployments only (Settings → Deployment Protection).

## 6. Final test on the live domain

- [ ] Make a **real** small donation (e.g. ₦500) with your own card. Check that:
  - [ ] you're sent to Flutterwave's checkout, pay, and come back to a "Thank you" screen with the right amount
  - [ ] you receive Flutterwave's receipt email
  - [ ] the foundation inbox receives a "New donation" email (confirms the webhook works)
  - [ ] the payment appears in Flutterwave **Transactions**
- [ ] Start a donation and press **Cancel** on the checkout. You should see "No problem."
- [ ] Send a message through the contact form and check that it arrives, and that replying goes to the sender.
- [ ] Refund the test donation from the Flutterwave dashboard if you want.
- [ ] Check the headers at <https://securityheaders.com/?q=trofng.org>. It should score **A** or **A+**.

---

## Things to decide (not blockers)

- **Monthly giving.** The site currently says "write to us and we'll set it up". Flutterwave supports
  recurring payment plans; adding a "Give monthly" toggle is a small follow-up once you've confirmed
  it's enabled on your account.
- **Bank transfer details.** Some donors prefer a direct transfer. If you want the foundation's account
  number on the site, add it to the Donate section.
- **Privacy policy.** You collect names, emails and phone numbers. Under Nigeria's Data Protection Act
  (NDPA 2023), and GDPR for donors in the UK/EU, you should publish a short privacy notice. Ask
  and it can be added as a page.
- **Registration number.** If the foundation is registered with CAC, showing "RC/IT number …" in the
  footer builds donor trust.
- **More photographs.** The site is designed so that photos of real programmes (with permission from
  the people in them) can be dropped in later.

## Ongoing maintenance

Nothing needs regular attention. Once or twice a year:

- `npm outdated` then `npm update`, `npm run build`, and push. Vercel redeploys automatically.
- If Flutterwave emails about API changes, the only code that talks to it is in `api/_lib/flutterwave.ts`.
- If you ever suspect a key has leaked, roll it in Flutterwave/Resend, update it in Vercel, and redeploy.
