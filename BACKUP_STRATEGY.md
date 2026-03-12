# Database Backup & Disaster Recovery Plan

## Automated Backup Strategy

### 1. MongoDB Atlas Built-in Backups (RECOMMENDED)
MongoDB Atlas provides automatic continuous backups:

**Setup Steps:**
1. Go to MongoDB Atlas Dashboard
2. Select your cluster (Cluster0)
3. Click "Backup" tab
4. Enable "Continuous Cloud Backup"
5. Configure retention policy:
   - Snapshot frequency: Every 6 hours
   - Retention: 7 days (free tier) or 30+ days (paid)
   - Point-in-time restore available

**Benefits:**
- ✅ Automatic snapshots every 6 hours
- ✅ Point-in-time recovery
- ✅ No manual intervention needed
- ✅ Stored in Atlas cloud (separate from your cluster)
- ✅ One-click restore

### 2. Local Backup Script (Additional Layer)
Location: `backend/scripts/backup.js`

**Run Manual Backup:**
```bash
cd backend
node scripts/backup.js
```

**Schedule Automated Backups:**

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Name: "UniHostel DB Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `node`
   - Arguments: `C:\Users\user\Desktop\Hostel Hub\backend\scripts\backup.js`
   - Start in: `C:\Users\user\Desktop\Hostel Hub\backend`

**Linux/Mac (Cron):**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/backend && node scripts/backup.js
```

**Backup Details:**
- Location: `backend/backups/`
- Format: Compressed (.gz)
- Retention: 7 days (auto-cleanup)
- Naming: `backup-YYYY-MM-DD-timestamp.gz`

### 3. Backup Storage Locations

**Primary:** MongoDB Atlas Cloud Backups
**Secondary:** Local backups folder
**Recommended:** Upload to cloud storage (AWS S3, Google Drive, Dropbox)

## Disaster Recovery Procedures

### Scenario 1: Database Corruption
**Recovery Time: 5-10 minutes**

1. Go to MongoDB Atlas Dashboard
2. Click "Backup" → "Snapshots"
3. Select latest snapshot
4. Click "Restore"
5. Choose "Download" or "Restore to cluster"

### Scenario 2: Accidental Data Deletion
**Recovery Time: 10-15 minutes**

1. Use Point-in-Time Restore (Atlas)
2. Select timestamp before deletion
3. Restore to new cluster
4. Verify data
5. Update connection string

### Scenario 3: Complete Cluster Failure
**Recovery Time: 15-30 minutes**

**From Atlas Backup:**
1. Create new cluster
2. Restore from snapshot
3. Update MONGO_URI in .env
4. Restart application

**From Local Backup:**
```bash
# Restore from local backup
mongorestore --uri="NEW_MONGO_URI" --archive="backups/backup-file.gz" --gzip
```

### Scenario 4: Region Outage
**Recovery Time: 30-60 minutes**

1. Create cluster in different region
2. Restore from Atlas snapshot
3. Update DNS/connection strings
4. Restart services

## Backup Verification

**Monthly Verification Checklist:**
- [ ] Verify Atlas backups are running
- [ ] Test restore from latest snapshot
- [ ] Check local backup files exist
- [ ] Verify backup file integrity
- [ ] Test disaster recovery procedure

## Data Retention Policy

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Atlas Snapshots | Every 6 hours | 7-30 days | Atlas Cloud |
| Local Backups | Daily | 7 days | Local disk |
| Critical Backups | Weekly | 90 days | Cloud storage |

## Emergency Contacts

**Database Issues:**
- MongoDB Atlas Support: https://support.mongodb.com
- Admin Email: 1mikedwin@gmail.com

## Backup Monitoring

**Check Backup Status:**
```bash
# List recent backups
ls -lh backend/backups/

# Check Atlas backup status
# Go to: https://cloud.mongodb.com → Cluster → Backup
```

## Recovery Testing Schedule

- **Monthly:** Test restore from Atlas snapshot
- **Quarterly:** Full disaster recovery drill
- **Annually:** Review and update recovery procedures

## Important Notes

⚠️ **CRITICAL:**
- Never delete Atlas backups manually
- Keep at least 2 backup copies (Atlas + Local)
- Test recovery procedures regularly
- Document any changes to backup strategy

✅ **Best Practices:**
- Enable Atlas continuous backups (PRIORITY)
- Run local backups as secondary layer
- Store critical backups off-site
- Monitor backup success/failures
- Keep backup credentials secure

## Restore Commands

**Restore from local backup:**
```bash
mongorestore --uri="mongodb+srv://..." --archive="backup-file.gz" --gzip
```

**Restore specific collection:**
```bash
mongorestore --uri="mongodb+srv://..." --archive="backup-file.gz" --gzip --nsInclude="unihostel.users"
```

## Backup Size Estimates

Current database size: ~50-100MB
Compressed backup: ~10-20MB
Expected growth: 5-10MB/month

## Next Steps

1. ✅ Enable MongoDB Atlas Continuous Backups (PRIORITY)
2. ✅ Schedule local backup script (Task Scheduler/Cron)
3. ✅ Set up cloud storage for critical backups
4. ✅ Test restore procedure
5. ✅ Document recovery in runbook
