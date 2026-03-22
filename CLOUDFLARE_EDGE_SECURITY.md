# Cloudflare Edge Security Setup

This guide adds a real Cloudflare protection layer in front of `Hostel Hub` without breaking the current app.

## Why this matters

Cloudflare only protects traffic that goes through a Cloudflare-proxied hostname.

Right now the frontend can call the backend directly on `https://unihostel.onrender.com`. If we only put Cloudflare in front of the frontend, attackers can still hit the Render API URL directly and bypass the edge WAF/rate limits.

To fix that, move production traffic to:

- `app.yourdomain.com` -> Vercel frontend
- `api.yourdomain.com` -> Render backend

Then point the frontend API base URL at the proxied API hostname.

## Required app settings

### Backend (Render)

Set these environment variables:

```env
FRONTEND_URL=https://app.yourdomain.com
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_DOMAIN=
TRUST_PROXY_HOPS=2
ENABLE_API_DOCS_IN_PRODUCTION=false
```

Notes:

- Leave `AUTH_COOKIE_DOMAIN` empty unless you have a specific reason to widen the cookie.
- `TRUST_PROXY_HOPS=2` is important when requests flow through `Cloudflare -> Render -> Express`.
- After adding a verified custom domain in Render, disable the default `onrender.com` subdomain so the API cannot bypass Cloudflare.

### Frontend (Vercel)

Set:

```env
VITE_API_URL=https://api.yourdomain.com
```

Keep your existing Paystack and Turnstile environment variables.

## DNS and platform setup

### 1. Put your domain on Cloudflare

- Add your domain to Cloudflare
- Update nameservers at your registrar

### 2. Connect the frontend custom domain in Vercel

- Add `app.yourdomain.com` to the Vercel project
- Use the DNS record Vercel gives you
- Keep the Cloudflare record proxied once verification is complete

### 3. Connect the backend custom domain in Render

- Add `api.yourdomain.com` to the Render web service
- Use the DNS record Render gives you
- Keep the Cloudflare record proxied once verification is complete
- After verification succeeds, disable the default `onrender.com` subdomain in Render

### 4. Cloudflare SSL/TLS

- Set SSL/TLS mode to `Full`
- Remove conflicting `AAAA` records for the Render hostname if they exist

## Cloudflare protections to enable

### Managed protections

Turn these on in Cloudflare:

- `WAF Managed Rules`
- `Browser Integrity Check`
- `Bot Fight Mode` or `Super Bot Fight Mode` if your plan supports it

### Important skip rule

Do not challenge or rate-limit the public Paystack webhook path. The backend already verifies its signature.

Create a skip rule for:

```text
http.request.uri.path eq "/api/payment/webhook"
```

Apply the skip only to the Cloudflare security features that would interfere with webhook delivery.

## Recommended rate limiting rules

Start with these conservative rules and adjust after observing real traffic.

### Rule 1: Login and MFA

Expression:

```text
(http.request.method eq "POST" and (
  http.request.uri.path eq "/api/auth/login" or
  http.request.uri.path eq "/api/auth/verify-mfa" or
  http.request.uri.path eq "/api/auth/mfa/resend"
))
```

Suggested threshold:

- `10 requests / 1 minute / IP`
- Action: `Managed Challenge` or `Block`
- Mitigation timeout: `10 minutes`

### Rule 2: Register and forgot password

Expression:

```text
(http.request.method eq "POST" and (
  http.request.uri.path eq "/api/auth/register" or
  http.request.uri.path eq "/api/auth/forgot-password"
))
```

Suggested threshold:

- `5 requests / 10 minutes / IP`
- Action: `Managed Challenge` or `Block`
- Mitigation timeout: `30 minutes`

### Rule 3: Payment initialization

Expression:

```text
(http.request.method eq "POST" and http.request.uri.path eq "/api/payment/initialize")
```

Suggested threshold:

- `10 requests / 5 minutes / IP`
- Action: `Block`
- Mitigation timeout: `15 minutes`

### Rule 4: Generic API burst protection

Expression:

```text
starts_with(http.request.uri.path, "/api/")
```

Suggested threshold:

- `120 requests / 1 minute / IP`
- Action: `Managed Challenge`
- Mitigation timeout: `10 minutes`

Use this one carefully. If dashboards make many rapid requests, raise the threshold.

## Rollout order

1. Add custom domains in Vercel and Render
2. Point Cloudflare DNS to the platform-provided targets
3. Update Render and Vercel environment variables
4. Redeploy backend and frontend
5. Disable the default `onrender.com` subdomain in Render
6. Enable Cloudflare managed protections
7. Add the webhook skip rule
8. Add rate limiting rules one by one
9. Test login, MFA, payments, and dashboards

## Live checks after rollout

Verify:

- `https://app.yourdomain.com` loads the app
- `https://api.yourdomain.com/api/health` returns healthy
- manager/admin login still reaches MFA
- Turnstile still works
- Paystack payment initialize works
- Paystack webhook still reaches `/api/payment/webhook`
- the old `onrender.com` backend URL returns `404`

## Recommended final production shape

- Frontend: `https://app.yourdomain.com`
- API: `https://api.yourdomain.com`
- Cloudflare proxy: enabled on both
- Render default subdomain: disabled
- Backend trust proxy hops: `2`

