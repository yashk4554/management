// Example utility function
exports.generateRandomString = (length = 8) => {
  return Math.random().toString(36).substr(2, length);
};
