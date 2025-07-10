const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_PATH = path.join(__dirname, '../log.txt');
const MAX_LOG_SIZE = 1024 * 1024 * 2; // 2MB
const ROTATED_LOG_PATH = path.join(__dirname, '../log.old.txt');

function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(LOG_PATH)) {
      const stats = fs.statSync(LOG_PATH);
      if (stats.size > MAX_LOG_SIZE) {
        if (fs.existsSync(ROTATED_LOG_PATH)) fs.unlinkSync(ROTATED_LOG_PATH);
        fs.renameSync(LOG_PATH, ROTATED_LOG_PATH);
      }
    }
  } catch (err) {
    // Ignore rotation errors
  }
}

function log({ userId, userName, action, details = '', ip = '' }) {
  rotateLogIfNeeded();
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${userId || '-'}|${userName || '-'}] [${action}] [${ip}] ${details}${os.EOL}`;
  try {
    fs.appendFileSync(LOG_PATH, line);
  } catch (err) {
    // Optionally, log to console or fallback
    console.error('Log write error:', err);
  }
}

function readLogs({ search = '', action = '', userId = '', limit = 100 } = {}) {
  try {
    if (!fs.existsSync(LOG_PATH)) return [];
    let lines = fs.readFileSync(LOG_PATH, 'utf8').split(os.EOL).filter(Boolean);
    if (search) lines = lines.filter(l => l.toLowerCase().includes(search.toLowerCase()));
    if (action) lines = lines.filter(l => l.includes(`[${action}]`));
    if (userId) lines = lines.filter(l => l.includes(`[${userId}|`));
    return lines.slice(-limit).reverse();
  } catch (err) {
    return [`Log read error: ${err.message}`];
  }
}

module.exports = { log, readLogs };
