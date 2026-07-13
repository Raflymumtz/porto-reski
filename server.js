const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'reski.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
  })
);

// ---- Domain routing --------------------------------------------------------
// The admin CMS lives on the `admin.` subdomain (e.g. admin.localhost:3000).
// For convenience during local dev it is ALSO served at /admin on the public
// host, unless STRICT_SUBDOMAIN=true.
function isAdminHost(req) {
  const host = (req.hostname || '').toLowerCase();
  return host.startsWith('admin.') || host === 'admin';
}

app.use((req, res, next) => {
  res.locals.adminHost = isAdminHost(req);
  if (isAdminHost(req)) {
    // On the admin subdomain, mount admin routes at the root.
    return adminRoutes(req, res, next);
  }
  next();
});

// Public site
app.use('/', publicRoutes);

// Path-based admin (dev convenience) unless strict subdomain mode is on.
if (!config.strictSubdomain) {
  app.use('/admin', adminRoutes);
}

// 404
app.use((req, res) => {
  res.status(404).render('public/404', {
    title: 'Not found',
    profile: require('./lib/db').getProfile(),
    activeNav: '',
  });
});

app.listen(config.port, () => {
  console.log('\n  Reski Portfolio is running');
  console.log(`  Public site : http://localhost:${config.port}`);
  console.log(`  Admin CMS   : http://localhost:${config.port}/admin`);
  console.log(`                (or http://admin.localhost:${config.port} )`);
  console.log(`  Admin login : ${config.admin.username} / (your password)\n`);
});
