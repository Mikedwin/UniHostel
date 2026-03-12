# Manual Backup Guide (Free Tier)

## Quick Manual Backup Steps

### Option 1: MongoDB Atlas Dashboard
1. Go to https://cloud.mongodb.com
2. Select Cluster0 → Browse Collections
3. For each collection (users, hostels, applications):
   - Click collection name
   - Click "Export Collection"
   - Download as JSON
4. Save files to: `C:\Users\user\Desktop\Hostel Hub\backups\manual\`

### Option 2: Install MongoDB Database Tools

**Download:**
https://www.mongodb.com/try/download/database-tools

**After installation, run this command weekly:**
```bash
cd "C:\Users\user\Desktop\Hostel Hub\backend"
mongodump --uri="mongodb+srv://1mikedwin_db_user:GguzgpD0t5XXe0ms@cluster0.paznchc.mongodb.net/unihostel" --out="backups\manual\backup-%date%"
```

**Backup Location:**
`C:\Users\user\Desktop\Hostel Hub\backend\backups\manual\`

## Backup Schedule (Recommended)

- **Daily:** If you have active users
- **Weekly:** For low activity
- **Before major changes:** Always backup first

## What to Backup

✅ All collections in "unihostel" database:
- users
- hostels  
- applications
- transactions
- adminlogs

## Storage Recommendations

1. **Local:** Keep on your computer (7 days)
2. **Cloud:** Upload to Google Drive/Dropbox (30 days)
3. **External:** USB drive (90 days)

## Restore Instructions

**If you need to restore:**
```bash
mongorestore --uri="YOUR_MONGO_URI" --dir="backups\manual\backup-folder"
```

## Important Notes

⚠️ Free tier = No automatic backups
⚠️ You MUST do manual backups regularly
⚠️ Test restore at least once per month
✅ Consider upgrading to M2 ($9/month) for auto-backups
