# Awayline

Attach an away status to your phone number. People get one reply in Messages, and a link that shows why you're not answering.

iMessage does not let another app write presence onto a phone number. Awayline keeps the status on your number and speaks in the thread through an iPhone Shortcut you install yourself.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Twilio configured, the login code is shown on screen. That only happens outside production.

```bash
npm test
```

## Texting codes

Copy `.env.example` to `.env.local` and set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Production will not hand out codes until those are set.

## Messages

After you set a status, open Connect Messages. The page has the secret reply link and the Shortcut steps. The auto-reply runs on your iPhone. The status link works from any phone.

Local statuses are stored in `data/awayline.sqlite`. On Vercel, set `DATABASE_URL` (the Neon integration does this) and Awayline uses Postgres instead.
