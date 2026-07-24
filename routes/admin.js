const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const config = require('../config');
const db = require('../lib/db');
const resources = require('../lib/resources');
const { upload, UPLOAD_DIR } = require('../lib/upload');

const router = express.Router();

// Base path for links: '' on the admin subdomain, '/admin' otherwise.
router.use((req, res, next) => {
  res.locals.adminBase = res.locals.adminHost ? '' : '/admin';
  res.locals.resources = resources;
  res.locals.currentUser = req.session && req.session.user;
  res.locals.flash = req.session && req.session.flash;
  if (req.session) req.session.flash = null;
  next();
});

function setFlash(req, type, message) {
  if (req.session) req.session.flash = { type, message };
}

// ---- Auth ------------------------------------------------------------------
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect(`${res.locals.adminBase}/login`);
}

router.get('/login', (req, res) => {
  if (req.session && req.session.user) return res.redirect(`${res.locals.adminBase}/`);
  res.render('admin/login', { title: 'Admin Login', error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ok =
    username === config.admin.username &&
    bcrypt.compareSync(password || '', config.admin.passwordHash);
  if (!ok) {
    return res
      .status(401)
      .render('admin/login', { title: 'Admin Login', error: 'Wrong username or password.' });
  }
  req.session.user = { username };
  res.redirect(`${res.locals.adminBase}/`);
});

router.post('/logout', (req, res) => {
  const base = res.locals.adminBase;
  req.session.destroy(() => res.redirect(`${base}/login`));
});

// Everything below requires login.
router.use(requireAuth);

// ---- Dashboard -------------------------------------------------------------
router.get('/', (req, res) => {
  const counts = {};
  db.COLLECTIONS.forEach((c) => (counts[c] = db.list(c).length));
  res.render('admin/dashboard', {
    title: 'Dashboard',
    counts,
    profile: db.getProfile(),
  });
});

// ---- Profile ---------------------------------------------------------------
const profileUpload = upload.fields([
  { name: 'heroImageFile', maxCount: 1 },
  { name: 'aboutImageFile', maxCount: 1 },
  { name: 'aboutGalleryFiles', maxCount: 20 },
]);

router.get('/profile', (req, res) => {
  res.render('admin/profile', { title: 'Site Settings', profile: db.getProfile() });
});

router.post('/profile', profileUpload, (req, res) => {
  const files = req.files || {};
  const patch = { ...req.body };
  if (files.heroImageFile && files.heroImageFile[0]) {
    patch.heroImage = '/uploads/' + files.heroImageFile[0].filename;
  }
  if (files.aboutImageFile && files.aboutImageFile[0]) {
    patch.aboutImage = '/uploads/' + files.aboutImageFile[0].filename;
  }
  let kept = req.body.aboutGallery || [];
  if (typeof kept === 'string') kept = [kept];
  const removed = [].concat(req.body.aboutGallery__remove || []);
  kept = kept.filter((url) => url && !removed.includes(url));
  const uploaded = (files.aboutGalleryFiles || []).map((x) => '/uploads/' + x.filename);
  patch.aboutGallery = kept.concat(uploaded);
  delete patch.heroImageFile;
  delete patch.aboutImageFile;
  delete patch.aboutGalleryFiles;
  delete patch['aboutGallery__remove'];
  db.updateProfile(patch);
  setFlash(req, 'success', 'Settings saved.');
  res.redirect(`${res.locals.adminBase}/profile`);
});

// ---- Generic CRUD ----------------------------------------------------------
function getResource(name) {
  return resources[name] ? { name, ...resources[name] } : null;
}

// Convert form body + files into a clean record based on the resource schema.
function parseBody(resource, body, files) {
  const record = {};
  files = files || {};
  resource.fields.forEach((f) => {
    if (f.type === 'checkbox') {
      record[f.name] = body[f.name] === 'on' || body[f.name] === 'true';
    } else if (f.type === 'number') {
      record[f.name] = body[f.name] ? Number(body[f.name]) : 0;
    } else if (f.type === 'tags') {
      record[f.name] = (body[f.name] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === 'image') {
      const fileField = f.name + 'File';
      if (files[fileField] && files[fileField][0]) {
        record[f.name] = '/uploads/' + files[fileField][0].filename;
      } else if (body[f.name + '__clear'] === 'on') {
        record[f.name] = '';
      } else {
        record[f.name] = body[f.name] || '';
      }
    } else if (f.type === 'gallery') {
      // Keep existing (minus removed) + append newly uploaded files.
      let kept = body[f.name] || [];
      if (typeof kept === 'string') kept = [kept];
      const removed = [].concat(body[f.name + '__remove'] || []);
      kept = kept.filter((url) => url && !removed.includes(url));
      const uploaded =
        (files.galleryFiles || []).map((x) => '/uploads/' + x.filename) || [];
      record[f.name] = kept.concat(uploaded);
    } else {
      record[f.name] = body[f.name] != null ? body[f.name] : '';
    }
  });
  return record;
}

// Multer fields cover every possible file input across resources.
const crudUpload = upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 },
  { name: 'logoFile', maxCount: 1 },
  { name: 'galleryFiles', maxCount: 20 },
]);

// List
router.get('/r/:resource', (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  res.render('admin/list', {
    title: resource.label,
    resource,
    items: db.list(resource.name),
  });
});

// New form
router.get('/r/:resource/new', (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  res.render('admin/form', {
    title: `New ${resource.singular}`,
    resource,
    item: {},
    isNew: true,
    serviceTitles: db.list('services').map((s) => s.title),
    projectOptions: db.list('projects').map((p) => ({ id: p.id, title: p.title })),
  });
});

// Edit form
router.get('/r/:resource/:id/edit', (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  const item = db.find(resource.name, req.params.id);
  if (!item) return next();
  res.render('admin/form', {
    title: `Edit ${resource.singular}`,
    resource,
    item,
    isNew: false,
    serviceTitles: db.list('services').map((s) => s.title),
    projectOptions: db.list('projects').map((p) => ({ id: p.id, title: p.title })),
  });
});

// Create
router.post('/r/:resource', crudUpload, (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  const record = parseBody(resource, req.body, req.files);
  db.create(resource.name, record);
  setFlash(req, 'success', `${resource.singular} created.`);
  res.redirect(`${res.locals.adminBase}/r/${resource.name}`);
});

// Update
router.post('/r/:resource/:id', crudUpload, (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  const record = parseBody(resource, req.body, req.files);
  db.update(resource.name, req.params.id, record);
  setFlash(req, 'success', `${resource.singular} updated.`);
  res.redirect(`${res.locals.adminBase}/r/${resource.name}`);
});

// Delete
router.post('/r/:resource/:id/delete', (req, res, next) => {
  const resource = getResource(req.params.resource);
  if (!resource) return next();
  db.remove(resource.name, req.params.id);
  setFlash(req, 'success', `${resource.singular} deleted.`);
  res.redirect(`${res.locals.adminBase}/r/${resource.name}`);
});

module.exports = router;
