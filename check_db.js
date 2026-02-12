const Database = require('better-sqlite3');
const db = new Database('agrieye.db');

const latest = db.prepare('SELECT * FROM analysis_results ORDER BY timestamp DESC LIMIT 1').get();
console.log('Latest Record:', JSON.stringify(latest, null, 2));
