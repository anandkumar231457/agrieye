const axios = require('axios');

async function testQuantum() {
    try {
        console.log('Sending request to http://localhost:8000/api/optimize...');

        const payload = {
            treatments: [
                { id: "T1", name: "Neem Oil", effectiveness: 0.8, cost: 0.2 },
                { id: "T2", name: "Copper Fungicide", effectiveness: 0.9, cost: 0.4 },
                { id: "T3", name: "Pruning", effectiveness: 0.4, cost: 0.0 },
                { id: "T4", name: "Water Management", effectiveness: 0.5, cost: 0.0 } // 4 qubits
            ],
            severity: 0.7
        };

        const response = await axios.post('http://localhost:8000/api/optimize', payload);

        console.log('Response status:', response.status);
        console.log('Quantum Info:', response.data.quantum_info);
        console.log('Optimal Plan:', response.data.optimal_plan);

        if (response.data.quantum_info && response.data.quantum_info.is_quantum) {
            console.log('✅ SUCCESS: Verified Quantum Execution Metadata');
            console.log(`   - Qubits: ${response.data.quantum_info.qubits}`);
            console.log(`   - Backend: ${response.data.quantum_info.simulation_backend}`);
        } else {
            console.error('❌ FAILURE: Missing Quantum Metadata');
            console.log(JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testQuantum();
