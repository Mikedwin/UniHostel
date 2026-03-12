# Intrusion Detection System (IDS) Setup Guide

## What It Does

The IDS monitors every request to your API and:
- ✅ Detects SQL injection attempts
- ✅ Detects XSS (Cross-Site Scripting) attacks
- ✅ Logs suspicious activity with IP addresses
- ✅ Sends real-time alerts via Email/Telegram/Discord
- ✅ Auto-bans attacker IPs (optional)

## Quick Start (Test Mode)

### 1. Enable IDS in Railway

Add these environment variables in Railway:

```
SECURITY_ENABLED=true
SECURITY_AUTO_BLOCK=false
SECURITY_ALERT_EMAIL=your-email@example.com
```

**Note:** `SECURITY_AUTO_BLOCK=false` means it will only LOG attacks, not block them. Good for testing.

### 2. Deploy

Railway will auto-deploy. Check logs to see:
```
🛡️ IDS Active - Monitoring for attacks
```

### 3. Test It

Try accessing:
```
https://your-api.railway.app/api/hostels?search=<script>alert('test')</script>
```

Check Railway logs - you should see:
```
Security event detected: xss
IP: xxx.xxx.xxx.xxx
```

## Full Setup (Production Mode)

### Step 1: Email Alerts

Already configured if you have email service set up. Uses same credentials as password reset emails.

### Step 2: Telegram Alerts (Optional)

1. **Create Telegram Bot:**
   - Open Telegram, search for `@BotFather`
   - Send `/newbot`
   - Follow instructions, get your `BOT_TOKEN`

2. **Get Chat ID:**
   - Search for `@userinfobot` on Telegram
   - Start chat, it will show your `Chat ID`

3. **Add to Railway:**
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=123456789
   ```

### Step 3: Discord Alerts (Optional)

1. **Create Webhook:**
   - Open Discord server
   - Server Settings → Integrations → Webhooks
   - Create webhook, copy URL

2. **Add to Railway:**
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/yyyyy
   ```

### Step 4: Enable Auto-Block

Once you're confident it's working:

```
SECURITY_AUTO_BLOCK=true
```

Now attackers will be automatically banned for 24 hours.

## How It Works

### Detection Patterns

**SQL Injection:**
- `' OR 1=1--`
- `UNION SELECT`
- `DROP TABLE`
- `INSERT INTO`

**XSS:**
- `<script>alert()</script>`
- `javascript:`
- `onerror=`
- `<iframe>`

### When Attack Detected

1. **Logs to database** (SecurityLog collection)
2. **Sends alerts** (Email/Telegram/Discord)
3. **Bans IP** (if auto-block enabled)
4. **Returns 403** to attacker

### Banned IPs

- Stored in `BannedIp` collection
- Auto-expire after 24 hours
- Can be manually removed via admin panel

## View Security Logs

### Via MongoDB Atlas

1. Go to MongoDB Atlas
2. Browse Collections → `securitylogs`
3. See all detected attacks

### Via Railway Logs

```bash
railway logs
```

Look for:
```
Security event detected: sql_injection
IP: 123.45.67.89
URL: /api/hostels?id=1' OR '1'='1
```

## Alert Examples

### Email Alert
```
Subject: 🚨 Security Alert: sql_injection

Attack Type: sql_injection
IP Address: 123.45.67.89
Severity: critical
URL: /api/hostels?id=1' OR '1'='1
Action Taken: IP Blocked
```

### Telegram Alert
```
🚨 Security Alert

Attack: sql_injection
IP: 123.45.67.89
Severity: critical
URL: /api/hostels?id=1' OR '1'='1
Blocked: Yes
```

## Testing the System

### Test SQL Injection Detection

```bash
curl "https://your-api.railway.app/api/hostels?search=1' OR '1'='1"
```

### Test XSS Detection

```bash
curl "https://your-api.railway.app/api/hostels?search=<script>alert(1)</script>"
```

### Check if IP is Banned

```bash
curl "https://your-api.railway.app/api/hostels"
```

If banned, you'll get:
```json
{ "message": "Access denied" }
```

## Disable IDS

If you need to turn it off:

```
SECURITY_ENABLED=false
```

Or remove the variable entirely. Your app will work normally without IDS.

## Important Notes

- ✅ **Won't break existing functionality** - IDS runs silently
- ✅ **Optional** - Disabled by default
- ✅ **Test mode available** - Log only, no blocking
- ✅ **Auto-expire bans** - IPs unbanned after 24 hours
- ✅ **No performance impact** - Runs async

## Troubleshooting

### "IDS not detecting attacks"

Check Railway logs:
```
🛡️ IDS Active - Monitoring for attacks
```

If not there, set `SECURITY_ENABLED=true`

### "False positives"

Legitimate requests being blocked? Set:
```
SECURITY_AUTO_BLOCK=false
```

Review logs to adjust detection patterns.

### "Not receiving alerts"

- **Email:** Check `EMAIL_USER` and `EMAIL_PASS` are set
- **Telegram:** Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
- **Discord:** Verify `DISCORD_WEBHOOK_URL`

## Environment Variables Summary

```env
# Required
SECURITY_ENABLED=true              # Enable IDS
SECURITY_AUTO_BLOCK=false          # Test mode (log only)

# Email Alerts (uses existing email config)
SECURITY_ALERT_EMAIL=admin@example.com

# Optional: Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Optional: Discord
DISCORD_WEBHOOK_URL=your_webhook_url
```

## Production Checklist

- [ ] Set `SECURITY_ENABLED=true` in Railway
- [ ] Set `SECURITY_AUTO_BLOCK=false` for testing
- [ ] Add `SECURITY_ALERT_EMAIL`
- [ ] Test with fake attacks
- [ ] Verify alerts are received
- [ ] Enable `SECURITY_AUTO_BLOCK=true` when ready
- [ ] Monitor Railway logs for 24 hours
- [ ] Check MongoDB for security logs

---

**You're now protected against common web attacks!** 🛡️
