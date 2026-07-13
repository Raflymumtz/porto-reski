const express = require('express');
const db = require('../lib/db');

const router = express.Router();

// Make profile available to every public view.
router.use((req, res, next) => {
  res.locals.profile = db.getProfile();
  res.locals.year = new Date().getFullYear();
  next();
});

router.get('/', (req, res) => {
  const profile = db.getProfile();
  const services = db.list('services');
  const featured = db.list('projects').filter((p) => p.featured);
  const videos = db.list('videos').map((v) => ({
    ...v,
    embedId: db.youtubeId(v.youtubeUrl),
  }));
  res.render('public/home', {
    title: `${profile.name} — ${profile.role}`,
    activeNav: 'home',
    services,
    videos,
    featured: featured.length ? featured : db.list('projects').slice(0, 4),
  });
});

router.get('/about', (req, res) => {
  const profile = db.getProfile();
  res.render('public/about', {
    title: `About — ${profile.name}`,
    activeNav: 'about',
    experiences: db.list('experiences'),
    tools: db.list('tools'),
  });
});

router.get('/projects', (req, res) => {
  const services = db.list('services');
  const all = db.list('projects');
  const category = req.query.category || '';
  const projects = category
    ? all.filter((p) => p.category === category)
    : all;
  res.render('public/projects', {
    title: 'Projects — Reski',
    activeNav: 'projects',
    services,
    projects,
    category,
  });
});

router.get('/projects/:id', (req, res, next) => {
  const project = db.find('projects', req.params.id);
  if (!project) return next();
  const related = db
    .list('projects')
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);
  res.render('public/project-detail', {
    title: `${project.title} — Reski`,
    activeNav: 'projects',
    project,
    related,
  });
});

module.exports = router;
