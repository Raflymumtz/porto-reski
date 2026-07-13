// Central configuration. Override any value with environment variables.
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Default password is "reski123" — change it by setting ADMIN_PASSWORD (plain)
// or ADMIN_PASSWORD_HASH (a bcrypt hash) in the environment.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'reski123';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(ADMIN_PASSWORD, 10);

module.exports = {
  port: Number(process.env.PORT) || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'reski-portfolio-secret-change-me',
  admin: {
    username: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD_HASH,
  },
  // If true, admin panel is only reachable via the `admin.` subdomain
  // (e.g. admin.localhost:3000). If false, it is ALSO reachable at /admin
  // on the public host — convenient for local development.
  strictSubdomain: process.env.STRICT_SUBDOMAIN === 'true',
};
