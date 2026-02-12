const Database = require('better-sqlite3');
const db = new Database('agrieye.db');

try {
    // 1. Delete all existing analysis results (wipe the slate clean)
    const deleteResult = db.prepare('DELETE FROM analysis_results').run();
    console.log(`Deleted ${deleteResult.changes} stale analysis records.`);

    // 2. Insert a specific "System Ready" record
    const insert = db.prepare(`
        INSERT INTO analysis_results (
            device_id, crop, health_status, disease_name, confidence, severity, 
            symptoms, recommended_actions, medicines, natural_treatments, preventive_measures,
            image_path, humidity, temperature
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `);

    // Assuming user ID 1 is the main user/dev user
    const info = insert.run(
        1,
        'System',
        'UNKNOWN',
        'System Ready - Upload Image',
        1.0,
        'NONE',
        JSON.stringify(['Waiting for analysis']),
        JSON.stringify(['Upload a crop image to begin']),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        null,
        null,
        null
    );

    console.log(`Inserted clean slate record. ID: ${info.lastInsertRowid}`);

} catch (error) {
    console.error('Error clearing database:', error);
}

db.close();
