const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'agrieye.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            profile_picture TEXT,
            location TEXT,
            field_location TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // User crops table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            crop_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Treatment plans table
    db.exec(`
        CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            disease TEXT NOT NULL,
            severity TEXT NOT NULL,
            treatment_type TEXT NOT NULL,
            duration INTEGER NOT NULL,
            schedule TEXT NOT NULL,
            medicines TEXT,
            natural_treatments TEXT,
            preventive_measures TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Treatment tasks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS treatment_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            day_number INTEGER NOT NULL,
            task_index INTEGER NOT NULL,
            completed BOOLEAN DEFAULT 0,
            completed_at DATETIME,
            FOREIGN KEY (plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE,
            UNIQUE(plan_id, day_number, task_index)
        )
    `);

    // Analysis results table for ESP32 uploads
    db.exec(`
        CREATE TABLE IF NOT EXISTS analysis_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT,
            crop TEXT,
            temperature REAL,
            humidity REAL,
            health_status TEXT,
            disease_name TEXT,
            confidence REAL,
            severity TEXT,
            symptoms TEXT,
            recommended_actions TEXT,
            medicines TEXT,
            natural_treatments TEXT,
            preventive_measures TEXT,
            image_path TEXT,
            analyzed_by TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database tables initialized');
}

// Initialize on module load
initializeDatabase();

// User operations
const userOps = {
    findByGoogleId: (googleId) => {
        return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    },

    findByEmail: (email) => {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    findById: (id) => {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    },

    create: (userData) => {
        const stmt = db.prepare(`
            INSERT INTO users (google_id, email, name, profile_picture)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(
            userData.googleId,
            userData.email,
            userData.name,
            userData.profilePicture
        );
        return userOps.findById(result.lastInsertRowid);
    },

    update: (userId, updates) => {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.location !== undefined) {
            fields.push('location = ?');
            values.push(updates.location);
        }
        if (updates.field_location !== undefined) {
            fields.push('field_location = ?');
            values.push(updates.field_location);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        const stmt = db.prepare(`
            UPDATE users SET ${fields.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
        return userOps.findById(userId);
    }
};

// Crop operations
const cropOps = {
    getUserCrops: (userId) => {
        return db.prepare('SELECT * FROM user_crops WHERE user_id = ?').all(userId);
    },

    addCrop: (userId, cropType) => {
        const stmt = db.prepare('INSERT INTO user_crops (user_id, crop_type) VALUES (?, ?)');
        const result = stmt.run(userId, cropType);
        return { id: result.lastInsertRowid, user_id: userId, crop_type: cropType };
    },

    removeCrop: (cropId, userId) => {
        const stmt = db.prepare('DELETE FROM user_crops WHERE id = ? AND user_id = ?');
        return stmt.run(cropId, userId);
    },

    setCrops: (userId, crops) => {
        // Delete existing crops
        db.prepare('DELETE FROM user_crops WHERE user_id = ?').run(userId);

        // Insert new crops
        const stmt = db.prepare('INSERT INTO user_crops (user_id, crop_type) VALUES (?, ?)');
        const insertMany = db.transaction((cropsArray) => {
            for (const crop of cropsArray) {
                stmt.run(userId, crop);
            }
        });
        insertMany(crops);

        return cropOps.getUserCrops(userId);
    }
};

// Treatment plan operations
const treatmentOps = {
    getUserPlans: (userId) => {
        const plans = db.prepare('SELECT * FROM treatment_plans WHERE user_id = ? ORDER BY created_at DESC').all(userId);
        return plans.map(plan => ({
            ...plan,
            schedule: JSON.parse(plan.schedule),
            medicines: plan.medicines ? JSON.parse(plan.medicines) : null,
            natural_treatments: plan.natural_treatments ? JSON.parse(plan.natural_treatments) : null,
            preventive_measures: plan.preventive_measures ? JSON.parse(plan.preventive_measures) : null
        }));
    },

    getPlanById: (planId, userId) => {
        const plan = db.prepare('SELECT * FROM treatment_plans WHERE id = ? AND user_id = ?').get(planId, userId);
        if (!plan) return null;

        return {
            ...plan,
            schedule: JSON.parse(plan.schedule),
            medicines: plan.medicines ? JSON.parse(plan.medicines) : null,
            natural_treatments: plan.natural_treatments ? JSON.parse(plan.natural_treatments) : null,
            preventive_measures: plan.preventive_measures ? JSON.parse(plan.preventive_measures) : null
        };
    },

    create: (userId, planData) => {
        const stmt = db.prepare(`
            INSERT INTO treatment_plans 
            (user_id, disease, severity, treatment_type, duration, schedule, medicines, natural_treatments, preventive_measures)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            userId,
            planData.disease,
            planData.severity,
            planData.treatmentType,
            planData.duration,
            JSON.stringify(planData.schedule),
            planData.medicines ? JSON.stringify(planData.medicines) : null,
            planData.naturalTreatments ? JSON.stringify(planData.naturalTreatments) : null,
            planData.preventiveMeasures ? JSON.stringify(planData.preventiveMeasures) : null
        );

        return treatmentOps.getPlanById(result.lastInsertRowid, userId);
    },

    delete: (planId, userId) => {
        const stmt = db.prepare('DELETE FROM treatment_plans WHERE id = ? AND user_id = ?');
        return stmt.run(planId, userId);
    },

    getTasks: (planId) => {
        return db.prepare('SELECT * FROM treatment_tasks WHERE plan_id = ?').all(planId);
    },

    updateTask: (planId, dayNumber, taskIndex, completed) => {
        const stmt = db.prepare(`
            INSERT INTO treatment_tasks (plan_id, day_number, task_index, completed, completed_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(plan_id, day_number, task_index) 
            DO UPDATE SET completed = ?, completed_at = ?
        `);

        const completedAt = completed ? new Date().toISOString() : null;
        stmt.run(planId, dayNumber, taskIndex, completed ? 1 : 0, completedAt, completed ? 1 : 0, completedAt);
    }
};

// Analysis results operations
const analysisOps = {
    getLatest: () => {
        return db.prepare('SELECT * FROM analysis_results ORDER BY timestamp DESC LIMIT 1').get();
    },

    getAll: (limit = 10) => {
        return db.prepare('SELECT * FROM analysis_results ORDER BY timestamp DESC LIMIT ?').all(limit);
    },

    getByDeviceId: (deviceId, limit = 10) => {
        return db.prepare('SELECT * FROM analysis_results WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?').all(deviceId, limit);
    },

    create: (analysisData) => {
        const stmt = db.prepare(`
            INSERT INTO analysis_results 
            (device_id, crop, temperature, humidity, health_status, disease_name, confidence, severity, 
             symptoms, recommended_actions, medicines, natural_treatments, preventive_measures, image_path, analyzed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            analysisData.device_id || null,
            analysisData.crop || null,
            analysisData.temperature || null,
            analysisData.humidity || null,
            analysisData.health_status || null,
            analysisData.disease_name || null,
            analysisData.confidence || null,
            analysisData.severity || null,
            analysisData.symptoms ? JSON.stringify(analysisData.symptoms) : null,
            analysisData.recommended_actions ? JSON.stringify(analysisData.recommended_actions) : null,
            analysisData.medicines ? JSON.stringify(analysisData.medicines) : null,
            analysisData.natural_treatments ? JSON.stringify(analysisData.natural_treatments) : null,
            analysisData.preventive_measures ? JSON.stringify(analysisData.preventive_measures) : null,
            analysisData.image_path || null,
            analysisData.analyzed_by || null
        );

        return analysisOps.getById(result.lastInsertRowid);
    },

    getById: (id) => {
        const result = db.prepare('SELECT * FROM analysis_results WHERE id = ?').get(id);
        if (!result) return null;

        return {
            ...result,
            symptoms: result.symptoms ? JSON.parse(result.symptoms) : [],
            recommended_actions: result.recommended_actions ? JSON.parse(result.recommended_actions) : [],
            medicines: result.medicines ? JSON.parse(result.medicines) : [],
            natural_treatments: result.natural_treatments ? JSON.parse(result.natural_treatments) : [],
            preventive_measures: result.preventive_measures ? JSON.parse(result.preventive_measures) : []
        };
    }
};

module.exports = {
    db,
    userOps,
    cropOps,
    treatmentOps,
    analysisOps
};
