// Tiny JSON "database": load once, mutate in memory, persist to disk on write.
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function read() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Generate a short unique id, e.g. "prj-lm3x9a2".
function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// Collections that behave as ordered lists of records.
const COLLECTIONS = ['services', 'projects', 'videos', 'experiences', 'tools', 'topVideos', 'igPosts'];
const ID_PREFIX = {
  services: 'svc',
  projects: 'prj',
  videos: 'vid',
  experiences: 'exp',
  tools: 'tool',
  topVideos: 'tv',
  igPosts: 'ig',
};

// Extract the 11-char YouTube video id from any common YouTube URL form.
function youtubeId(url) {
  if (!url) return '';
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/
  );
  if (m) return m[1];
  // Bare id fallback.
  const bare = String(url).match(/^[A-Za-z0-9_-]{11}$/);
  return bare ? bare[0] : '';
}

function list(collection) {
  const data = read();
  const items = data[collection] || [];
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function find(collection, id) {
  const data = read();
  return (data[collection] || []).find((x) => x.id === id) || null;
}

function create(collection, record) {
  const data = read();
  const items = data[collection] || (data[collection] = []);
  const maxOrder = items.reduce((m, x) => Math.max(m, x.order || 0), 0);
  const item = {
    id: makeId(ID_PREFIX[collection] || 'item'),
    order: maxOrder + 1,
    ...record,
  };
  items.push(item);
  write(data);
  return item;
}

function update(collection, id, patch) {
  const data = read();
  const items = data[collection] || [];
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, id };
  write(data);
  return items[idx];
}

function remove(collection, id) {
  const data = read();
  const items = data[collection] || [];
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  write(data);
  return true;
}

function getProfile() {
  return read().profile;
}

function updateProfile(patch) {
  const data = read();
  data.profile = { ...data.profile, ...patch };
  write(data);
  return data.profile;
}

module.exports = {
  COLLECTIONS,
  youtubeId,
  read,
  list,
  find,
  create,
  update,
  remove,
  getProfile,
  updateProfile,
};
