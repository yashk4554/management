// Usage: node backend/scripts/createAdmin.js <email> <password> <name>
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const [,, email, password, name] = process.argv;

if (!email || !password || !name) {
  console.error('Usage: node createAdmin.js <email> <password> <name>');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.password = await bcrypt.hash(password, 10);
    user.name = name;
    await user.save();
    console.log('Updated existing user to admin:', email);
  } else {
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'admin'
    });
    await user.save();
    console.log('Created new admin user:', email);
  }
  await mongoose.disconnect();
  process.exit(0);
})();
