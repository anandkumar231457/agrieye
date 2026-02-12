const axios = require('axios');

async function testQuantumStress() {
    try {
        console.log('⚡ Starting Quantum Stress Test (15 Treatments)...');
        console.log('   Goal: Verify that the "Robust" logic prevents hanging.');

        // Generate 15 dummy treatments
        const treatments = Array.from({ length: 15 }, (_, i) => ({
            id: `STRESS_TEST_${i}`,
            name: `Complex Treatment Option ${i}`,
            effectiveness: Math.random(),
            cost: Math.random(),
            type: 'chemical'
        }));

        const payload = {
            treatments: treatments,
            severity: 0.8
        };

        const startTime = Date.now();
        console.log(`   Sending request with ${treatments.length} items to /api/optimize...`);

        const response = await axios.post('http://localhost:8000/api/optimize', payload);
        const duration = (Date.now() - startTime) / 1000;

        console.log(`\n✅ Finished in ${duration.toFixed(2)} seconds.`);

        const qInfo = response.data.quantum_info || {};
        console.log('   Quantum Info:', qInfo);

        if (qInfo.qubits <= 8) {
            console.log(`   ✅ SUCCESS: Problem size correctly reduced to ${qInfo.qubits} Qubits.`);
        } else {
            console.log(`   ⚠️ WARNING: Qubit count ${qInfo.qubits} is high. Watch for performance.`);
        }

        if (duration < 5) {
            console.log('   ✅ SUCCESS: Execution speed is acceptable (No Hang).');
        } else {
            console.log('   ❌ FAILURE: Execution took too long.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testQuantumStress();
