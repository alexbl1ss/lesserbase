const fs = require('fs');
const path = require('path');

// Create a timestamp version like "202506291945"
const version = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const versionJsonPath = path.join(__dirname, '../public/version.json');
const versionJsPath = path.join(__dirname, '../src/version.js');

// Write to version.json (served publicly)
fs.writeFileSync(
  versionJsonPath,
  JSON.stringify({ version }, null, 2)
);

// Write to version.js (importable in the app)
fs.writeFileSync(
  versionJsPath,
  `export default "${version}";\n`
);

console.log(`✔ Version ${version} written to version.json and version.js`);
