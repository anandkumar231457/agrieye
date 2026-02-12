const { optimizeTreatments } = require('./optimization');

// Mock data simulating what TreatmentPlan.jsx sends
const mockTreatments = [
    {
        id: 'CHEM_0',
        name: 'Azoxystrobin (Quadris)',
        type: 'chemical',
        effectiveness: 0.9,
        cost: 0.5,
        side_effects: 0.3
    },
    {
        id: 'CHEM_1',
        name: 'Propiconazole (Tilt)',
        type: 'chemical',
        effectiveness: 0.8,
        cost: 0.6,
        side_effects: 0.4
    },
    {
        id: 'NAT_0',
        name: 'Neem Oil',
        type: 'natural',
        effectiveness: 0.6,
        cost: 0.2,
        side_effects: 0,
        prevention_value: 0.5
    },
    {
        id: 'PREV_0',
        name: 'Crop Rotation',
        type: 'prevention',
        effectiveness: 0.4,
        cost: 0.1,
        side_effects: 0,
        prevention_value: 0.8
    }
];

console.log("=== Testing Optimization Output Structure ===");

const result = optimizeTreatments(mockTreatments, 0.5); // Severity 0.5

console.log("\n--- Balanced Strategy Details ---");
const balancedDetails = result.strategies.balanced.details;
balancedDetails.forEach(t => {
    console.log(`[${t.type}] ${t.name}`);
});

console.log("\n--- Checking for Missing Types ---");
const hasChemical = balancedDetails.some(t => t.type === 'chemical');
const hasNatural = balancedDetails.some(t => t.type === 'natural');
const hasPrevention = balancedDetails.some(t => t.type === 'prevention');

console.log(`Has Chemical: ${hasChemical}`);
console.log(`Has Natural: ${hasNatural}`);
console.log(`Has Prevention: ${hasPrevention}`);

if (!hasNatural || !hasPrevention) {
    console.error("FAIL: Natural or Prevention treatments missing from output!");
} else {
    console.log("SUCCESS: All types present.");
}
