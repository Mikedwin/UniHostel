# 🚨 DISASTER RECOVERY GUIDE

## When Something Goes Wrong

### Scenario 1: Database Data Lost/Corrupted

**Steps to Recover:**

1. **Download your backup from Google Drive**
   - Go to Google Drive → UniHostel Backups folder
   - Download the latest backup file (e.g., `backup-2026-01-24-1769262554742.json`)
   - Save to: `C:\Users\user\Desktop\Hostel Hub\backend\backups\manual\`

2. **Run the restore command:**
   ```bash
   cd backend
   npm run restore backup-2026-01-24-1769262554742.json
   ```

3. **Wait 5 seconds** (gives you time to cancel if needed)

4. **Restore completes** - Your data is back!

5. **Restart your server:**
   ```bash
   npm start
   ```

6. **Test your website** - Everything should work now

---

### Scenario 2: Entire Server/Computer Crashed

**Steps to Recover:**

1. **Get your code from GitHub:**
   ```bash
   git clone https://github.com/Mikedwin/UniHostel.git
   cd UniHostel
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Create .env file** in backend folder with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```
   (Get actual values from your secure backup)

4. **Download backup from Google Drive**

5. **Restore database:**
   ```bash
   cd backend
   npm run restore backup-file-name.json
   ```

6. **Start servers:**
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (new terminal)
   cd frontend
   npm start
   ```

---

### Scenario 3: Accidentally Deleted Important Data

**Steps to Recover:**

1. **STOP immediately** - Don't make more changes

2. **Download latest backup** from Google Drive

3. **Restore database:**
   ```bash
   cd backend
   npm run restore backup-2026-01-24-1769262554742.json
   ```

4. **Data is restored** to the backup point

---

### Scenario 4: MongoDB Atlas Account Issues

**Steps to Recover:**

1. **Create new MongoDB Atlas cluster**
   - Go to https://cloud.mongodb.com
   - Create new cluster
   - Get new connection string

2. **Update .env file** with new MONGO_URI

3. **Restore data from backup:**
   ```bash
   npm run restore backup-file-name.json
   ```

4. **Update deployed app** with new MONGO_URI

---

## Quick Recovery Commands

### Backup (Do Weekly)
```bash
cd backend
npm run backup-now
```

### Restore (When Disaster Strikes)
```bash
cd backend
npm run restore backup-2026-01-24-1769262554742.json
```

### List Available Backups
```bash
dir backend\backups\manual
```

---

## Important Files to Keep Safe

1. **Backup files** (Google Drive)
2. **.env file** (keep copy in safe place)
3. **GitHub repository** (always push changes)

---

## Recovery Time Estimates

| Scenario | Recovery Time |
|----------|---------------|
| Data corruption | 5 minutes |
| Server crash | 15-30 minutes |
| Complete disaster | 1-2 hours |

---

## Prevention Checklist

- [ ] Weekly backups to Google Drive
- [ ] Push code to GitHub regularly
- [ ] Keep .env file backup
- [ ] Test restore monthly
- [ ] Keep 4 recent backups

---

## Emergency Contacts

**Your Info:**
- Email: 1mikedwin@gmail.com
- GitHub: https://github.com/Mikedwin/UniHostel

**MongoDB Atlas:**
- Dashboard: https://cloud.mongodb.com
- Support: https://support.mongodb.com

**Vercel (Hosting):**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

---

## Test Your Recovery (Do This Monthly)

1. Create test backup
2. Try restoring to verify it works
3. Check all data is intact
4. Document any issues

**Remember: A backup is only good if you can restore from it!**
