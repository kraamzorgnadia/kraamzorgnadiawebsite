module.exports = {
  url: (process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8080").replace(/\/$/, ""),
};
