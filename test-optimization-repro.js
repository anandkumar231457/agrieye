const { optimizeTreatments } = require('./optimization');

console.log("=== Testing Optimization Fix (Frontend Data Repro) ===");

// 1. Recreate Frontend Data Generation
const treatments = [];

// 5 Medicines
for (let i = 0; i < 5; i++) {
    treatments.push({
        id: `CHEM_${i}`,
        name: `Medicine ${String.fromCharCode(65 + i)}`,
        type: 'chemical',
        effectiveness: 0.9 - (i * 0.1),
        cost: 0.5 + (i * 0.1),
        side_effects: 0.3 + (i * 0.1)
    });
}

// 5 Natural
for (let i = 0; i < 5; i++) {
    treatments.push({
        id: `NAT_${i}`,
        name: `Natural ${i + 1}`,
        type: 'natural',
        effectiveness: 0.6,
        cost: 0.2,
        side_effects: 0.0,
        prevention_value: 0.5
    });
}

// 5 Prevention
for (let i = 0; i < 5; i++) {
    treatments.push({
        id: `PREV_${i}`,
        name: `Prevention ${i + 1}`,
        type: 'prevention',
        effectiveness: 0.4,
        cost: 0.1,
        side_effects: 0.0,
        prevention_value: 0.8
    });
}

// Test High Severity
const severity = 0.8;
console.log(`Severity: ${severity} (HIGH)`);

const result = optimizeTreatments(treatments, severity);

['balanced', 'high_effectiveness', 'low_cost'].forEach(strategy => {
    const stratResult = result.strategies[strategy];
    const details = stratResult.details;

    console.log(`\nStrategy: ${strategy.toUpperCase()}`);
    console.log("Selected Treatments:");
    details.forEach(t => {
        console.log(` - [${t.type.toUpperCase()}] ${t.name} (Eff: ${t.effectiveness.toFixed(1)}, Cost: ${t.cost.toFixed(1)})`);
    });
    console.log("Metrics:", stratResult.metrics);

    // Validation Check
    const hasChemical = details.some(t => t.type === 'chemical');
    if (strategy !== 'low_cost' && !hasChemical) {
        console.error("FAIL: High/Balanced strategy missing chemical treatment!");
    } else {
        console.log("PASS: Selection looks valid.");
    }
});
