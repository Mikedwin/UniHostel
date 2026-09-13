const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../backups');
const MONGO_URI = process.env.MONGO_URI;

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const getBackupFilename = () => {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `backup-${timestamp}-${Date.now()}.gz`;
};

const performBackup = () => {
  const backupFile = path.join(BACKUP_DIR, getBackupFilename());
  
  console.log(`Starting backup at ${new Date().toISOString()}`);
  console.log(`Backup location: ${backupFile}`);
  
  const mongodump = spawn('mongodump', [
    `--uri=${MONGO_URI}`,
    `--archive=${backupFile}`,
    '--gzip'
  ]);
  
  mongodump.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  mongodump.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  mongodump.on('close', (code) => {
    if (code === 0) {
      console.log(`Backup completed successfully: ${backupFile}`);
      cleanOldBackups();
    } else {
      console.error(`Backup failed with code ${code}`);
    }
  });
  
  mongodump.on('error', (error) => {
    console.error(`Backup failed: ${error.message}`);
  });
};

const cleanOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;
    
    if (age > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old backup: ${file}`);
    }
  });
};

performBackup();
