const { optimizeTreatments } = require('./optimization');

console.log("=== Testing Classical Multi-Objective Optimization ===");

const treatments = [
    { name: "Expensive Chem", type: "chemical", effectiveness: 0.9, cost: 0.9, side_effects: 0.8 },
    { name: "Cheap Natural", type: "natural", effectiveness: 0.5, cost: 0.1, side_effects: 0.0 },
    { name: "Balanced Prev", type: "prevention", effectiveness: 0.4, cost: 0.3, side_effects: 0.0 },
    { name: "Strong Chem", type: "chemical", effectiveness: 0.85, cost: 0.6, side_effects: 0.5 },
];

const severity = 0.8;

console.log("\nTreatments:", treatments.map(t => t.name).join(", "));
console.log("Severity:", severity);

const result = optimizeTreatments(treatments, severity);

console.log("\n--- Results ---");
console.log("Status:", result.status);

['balanced', 'high_effectiveness', 'low_cost'].forEach(strategy => {
    const stratResult = result.strategies[strategy];
    const names = stratResult.details.map(t => t.name).join(", ");

    console.log(`\nStrategy: ${strategy.toUpperCase()}`);
    console.log(`Plan: [${names}]`);
    console.log(`Metrics:`, stratResult.metrics);
});
