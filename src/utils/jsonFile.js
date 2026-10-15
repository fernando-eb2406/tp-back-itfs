const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');

async function readDatabase() {
  const content = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(content);
}

async function writeDatabase(database) {
  await fs.writeFile(dbPath, JSON.stringify(database, null, 2) + '\n');
}

module.exports = {
  readDatabase,
  writeDatabase
};
