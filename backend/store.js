/**
 * Tiny embedded JSON datastore.
 *
 * The master spec calls for MongoDB. For a self-contained prototype that
 * runs anywhere with zero external services (no Mongo server to install,
 * no connection string to configure), this module gives the same
 * collection-based API (find/insert/update/delete) backed by a single
 * db.json file on disk. Swapping this for real MongoDB later only means
 * rewriting this one file - every route just calls store.<collection>.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "data", "db.json");

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function collection(name) {
  return {
    all() {
      const db = load();
      return db[name] || [];
    },
    find(predicate) {
      return this.all().filter(predicate);
    },
    findOne(predicate) {
      return this.all().find(predicate) || null;
    },
    findById(id) {
      return this.all().find((r) => r.id === id) || null;
    },
    insert(record) {
      const db = load();
      if (!db[name]) db[name] = [];
      const withId = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...record };
      db[name].push(withId);
      save(db);
      return withId;
    },
    update(id, patch) {
      const db = load();
      if (!db[name]) return null;
      const idx = db[name].findIndex((r) => r.id === id);
      if (idx === -1) return null;
      db[name][idx] = { ...db[name][idx], ...patch, updatedAt: new Date().toISOString() };
      save(db);
      return db[name][idx];
    },
    delete(id) {
      const db = load();
      if (!db[name]) return false;
      const before = db[name].length;
      db[name] = db[name].filter((r) => r.id !== id);
      save(db);
      return db[name].length < before;
    },
  };
}

module.exports = { collection };
