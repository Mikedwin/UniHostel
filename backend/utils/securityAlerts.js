const nodemailer = require('nodemailer');
const axios = require('axios');

// Email alert
const sendSecurityAlert = async (attackDetails) => {
  if (!process.env.SECURITY_ALERT_EMAIL) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.SECURITY_ALERT_EMAIL,
      subject: `🚨 Security Alert: ${attackDetails.attackType}`,
      html: `
        <h2>Security Breach Detected</h2>
        <p><strong>Attack Type:</strong> ${attackDetails.attackType}</p>
        <p><strong>IP Address:</strong> ${attackDetails.ip}</p>
        <p><strong>Severity:</strong> ${attackDetails.severity}</p>
        <p><strong>URL:</strong> ${attackDetails.url}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Action Taken:</strong> ${attackDetails.blocked ? 'IP Blocked' : 'Logged Only'}</p>
      `
    });
  } catch (error) {
    console.error('Email alert failed:', error.message);
  }
};

// Telegram alert
const sendTelegramAlert = async (attackDetails) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;

  try {
    const message = `🚨 *Security Alert*\n\n` +
      `*Attack:* ${attackDetails.attackType}\n` +
      `*IP:* ${attackDetails.ip}\n` +
      `*Severity:* ${attackDetails.severity}\n` +
      `*URL:* ${attackDetails.url}\n` +
      `*Blocked:* ${attackDetails.blocked ? 'Yes' : 'No'}`;

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      }
    );
  } catch (error) {
    console.error('Telegram alert failed:', error.message);
  }
};

// Discord alert
const sendDiscordAlert = async (attackDetails) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      embeds: [{
        title: '🚨 Security Alert',
        color: attackDetails.severity === 'critical' ? 0xFF0000 : 0xFFA500,
        fields: [
          { name: 'Attack Type', value: attackDetails.attackType, inline: true },
          { name: 'IP Address', value: attackDetails.ip, inline: true },
          { name: 'Severity', value: attackDetails.severity, inline: true },
          { name: 'URL', value: attackDetails.url, inline: false },
          { name: 'Blocked', value: attackDetails.blocked ? 'Yes' : 'No', inline: true }
        ],
        timestamp: new Date()
      }]
    });
  } catch (error) {
    console.error('Discord alert failed:', error.message);
  }
};

module.exports = {
  sendSecurityAlert,
  sendTelegramAlert,
  sendDiscordAlert
};
