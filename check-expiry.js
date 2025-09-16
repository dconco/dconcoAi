const fs = require('fs');
const path = require('path');

const quota = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/cache/db/quota.json'), 'utf8'));

const now = new Date();

quota.forEach(user => {
  const timestamp = new Date(user.timestamp);
  const expiryTime = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000);
  const timeLeft = expiryTime.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`${user.contact}: expires at ${expiryTime.toISOString()} (${hoursLeft}h ${minutesLeft}m left)`);
});