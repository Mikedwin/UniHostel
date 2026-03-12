# Amazon Q Security Configuration

## Protected Files

This directory contains configuration to restrict Amazon Q's access to sensitive files.

### `.amazonq/ignore`
Blocks Amazon Q from accessing:
- `.env` files (all environment files)
- Backup files and database dumps
- Private keys and certificates
- AWS credentials
- SSH keys
- Log files with potential sensitive data

## How It Works

When you interact with Amazon Q, it will NOT be able to read files matching patterns in `.amazonq/ignore`.

## Best Practices

1. **Never commit `.env` to Git** - Already in `.gitignore`
2. **Amazon Q cannot access `.env`** - Blocked by `.amazonq/ignore`
3. **Rotate credentials regularly** - Especially after any exposure
4. **Use hosting platform env vars** - For production deployments

## Current Protection Status

✅ `.env` blocked from Amazon Q access
✅ `.env` excluded from Git (via `.gitignore`)
✅ Backup files protected
✅ Private keys protected
✅ Log files protected

## If You Need to Share Config

Instead of sharing actual `.env`, use `.env.example` with placeholder values:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_here
PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

## Verifying Protection

To verify a file is protected, try asking Amazon Q to read it. It should be blocked.

## Emergency: Credentials Exposed

If credentials are ever exposed:

1. **Immediately rotate ALL credentials:**
   - MongoDB password (Atlas Dashboard)
   - Paystack keys (Paystack Dashboard)
   - JWT secret (generate new random string)
   - Cloudinary secret (Cloudinary Dashboard)

2. **Check for unauthorized access:**
   - MongoDB Atlas → Metrics
   - Paystack → Transaction History
   - Cloudinary → Usage Stats

3. **Update `.env` with new credentials**

## Questions?

This security layer protects your local development environment. For production, always use your hosting platform's environment variable system.
