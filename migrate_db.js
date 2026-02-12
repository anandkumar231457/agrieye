const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, 'agrieye.db');
    console.log(`Opening database at: ${dbPath}`);
    const db = new Database(dbPath, { verbose: console.log });

    console.log('Checking for field_location column...');
    const tableInfo = db.pragma('table_info(users)');
    console.log('Current columns:', tableInfo.map(c => c.name).join(', '));

    const columnExists = tableInfo.some(col => col.name === 'field_location');

    if (!columnExists) {
        console.log('Adding field_location column...');
        db.exec('ALTER TABLE users ADD COLUMN field_location TEXT');
        console.log('Migration successful: field_location column added.');
    } else {
        console.log('field_location column already exists.');
    }
    db.close();
} catch (error) {
    console.error('Migration failed with error:', error);
}
