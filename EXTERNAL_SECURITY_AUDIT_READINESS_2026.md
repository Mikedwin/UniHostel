# External Security Audit Readiness 2026

**Date:** March 22, 2026  
**Assessment Type:** Internal pentest-style verification and external-audit readiness review  
**Status:** Ready for an external audit, but not yet a substitute for one

## What was verified live

The current live deployment was checked against the public frontend and backend:

- Frontend: `https://uni-hostel-two.vercel.app`
- Backend: `https://unihostel.onrender.com`

### Confirmed strengths

- Backend returns core security headers, including `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, and `X-Content-Type-Options`
- Backend does not grant CORS access to a malicious origin
- Turnstile is enforced on:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/forgot-password`
- MFA endpoints are live:
  - `POST /api/auth/verify-mfa`
  - `POST /api/auth/mfa/resend`
- Production API docs are locked down and return `404`
- Anonymous access to `GET /api/auth/session` is rejected
- Manager/admin MFA, cookie auth, login-enumeration reduction, and reset-flow hardening are present in the current codebase

## Residual findings

### 1. No independent third-party pentest evidence yet

This remains true even though the app has undergone substantial hardening and internal verification. An external auditor would still ask for:

- an independent report from a third-party assessor
- test scope and rules of engagement
- testing window and evidence
- remediation log for any findings

### 2. The backend is still directly reachable on the default Render hostname

`https://unihostel.onrender.com` is still publicly reachable.

That means any future Cloudflare WAF or rate-limiting policy can still be bypassed until production moves to a Cloudflare-proxied custom API hostname such as `https://api.yourdomain.com`, and the default Render hostname is disabled.

### 3. Frontend edge headers were incomplete before this update

The live Vercel frontend did not expose explicit browser-facing security headers like:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Permissions-Policy`
- `Referrer-Policy`

This repo now includes a `vercel.json` update to add them, but that still needs deployment before it can be counted as a live control.

## What this means

The application is no longer in the category of “untested student project security.” It has real defensive controls and can be prepared for an outside review.

But the following statement would still be inaccurate today:

> “The app has already passed a full external pentest.”

The honest statement is:

> “The app has completed major internal hardening and pentest-style verification, and it is now ready to undergo an external security audit or third-party penetration test.”

## Recommended external audit scope

When you are ready to hire or schedule a real pentest, the scope should include:

### Public web application

- unauthenticated browsing and route discovery
- registration, login, forgot-password, reset-password
- Turnstile enforcement
- manager/admin MFA flow
- session handling and logout
- CORS and browser protections
- file/image upload paths

### Authenticated roles

- student access control
- manager access control
- admin access control
- IDOR checks across applications, hostels, payments, and admin tools
- privilege escalation attempts between roles

### Payments

- payment initialization
- payment verification routes
- webhook exposure and replay resistance
- authorization around payment status and manual verification

### Infrastructure and deployment

- frontend and backend domain exposure
- direct-origin bypass
- Cloudflare posture after custom domains are enabled
- TLS and header checks
- rate limiting behavior under abuse

## Evidence package to prepare for an external auditor

Before an external audit, have these ready:

- production URLs
- staging URLs if available
- test student account
- test manager account
- test admin account
- test payment flow instructions
- current architecture summary
- environment and provider list:
  - Vercel
  - Render
  - MongoDB Atlas
  - Cloudinary
  - Paystack
  - Cloudflare when enabled
- a list of known accepted risks

## Current honest readiness statement

As of March 22, 2026:

- the app has strong internal hardening
- the app has current live protections on auth and MFA
- the repo now includes a pentest-readiness check script:
  - `backend/pentest-readiness-check.js`
- the repo now documents the Cloudflare edge-hardening path:
  - `CLOUDFLARE_EDGE_SECURITY.md`

What is still missing is the actual independent audit itself.

## Next steps

1. Deploy the updated frontend `vercel.json` headers
2. Move the backend to a Cloudflare-proxied custom API domain and disable the default Render hostname
3. Run `npm run pentest:check` from `backend`
4. Keep this report as the handoff summary for a real external assessor
5. Schedule a third-party pentest or security review
