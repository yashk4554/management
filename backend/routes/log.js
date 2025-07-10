const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Serve log.txt for admin dashboard
router.get('/log.txt', (req, res) => {
  const logPath = path.join(__dirname, '../log.txt');
  if (fs.existsSync(logPath)) {
    res.set('Content-Type', 'text/plain');
    res.send(fs.readFileSync(logPath, 'utf8'));
  } else {
    res.send('');
  }
});

module.exports = router;
