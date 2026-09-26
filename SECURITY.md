# PerfectMockup Security

## Production invariants

- Google AI credentials are server-side only. Never expose them through Vite or any `VITE_*` variable.
- `/api/generate` uses `GOOGLE_API_KEY` from the server and an explicit model allowlist.
- Tester codes are validated server-side. Do not hardcode tester secrets in frontend source.
- Credit refunds are internal to failed server-side generation, not a public client action.
- Gallery ownership comes from the authenticated session.
- Gallery proxy requests are restricted to trusted HTTPS image hosts.
- Stripe checkout and billing portal derive identity server-side.
- Stripe webhook signatures remain mandatory and event IDs are deduplicated when KV is available.

## Required manual actions after this hardening

1. Rotate any Google AI/API credential that has ever been committed to Git. Deleting a file does not invalidate a leaked key.
2. Configure `GOOGLE_API_KEY`, `SESSION_SECRET`, `MAGIC_TOKEN_SECRET`, and preferably `GUEST_TRIAL_SECRET` in Vercel Production.
3. Configure `TESTER_UPGRADE_CODE` in Vercel. The owner may keep using the desired tester code, but the value must not be committed or exposed to the browser.
4. Configure `STRIPE_PRICE_CREATOR` and `STRIPE_PRICE_STUDIO` with the intended live Stripe Price IDs.
5. Ensure writable Vercel KV credentials are present in Production. Anonymous free generation intentionally fails closed without persistent KV.
6. Restrict the Google credential to the APIs required by PerfectMockup where supported.
7. Configure Google Cloud quota limits and billing alerts. Budget alerts are notifications and are not guaranteed hard spend caps.
8. Review Git history separately if you want to purge historical secret material. Rotation is still required even after history cleanup.

## Do not add

- `VITE_API_KEY`
- `VITE_TESTER_CODE`
- client-supplied Google provider keys
- client-controlled Stripe customer IDs or Price IDs
- shared request headers that bypass generation credits
