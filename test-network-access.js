const http = require('http');

console.log('🧪 Testing Backend Network Accessibility\n');

// Test 1: Localhost
console.log('Test 1: Connecting to localhost:8000...');
testConnection('localhost', 8000, 'Localhost');

// Test 2: Network IP
console.log('\nTest 2: Connecting to 192.168.147.39:8000...');
testConnection('192.168.147.39', 8000, 'Network IP');

function testConnection(host, port, label) {
    const options = {
        host: host,
        port: port,
        path: '/api/cameras',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ ${label} - Connection successful! Status: ${res.statusCode}`);
        res.on('data', () => { });
    });

    req.on('error', (error) => {
        console.log(`❌ ${label} - Connection failed: ${error.message}`);
        if (error.code === 'ETIMEDOUT') {
            console.log('   → This suggests a firewall is blocking the connection');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   → Backend is not listening on this address');
        }
    });

    req.on('timeout', () => {
        console.log(`❌ ${label} - Connection timed out (firewall blocking?)`);
        req.destroy();
    });

    req.end();
}

setTimeout(() => {
    console.log('\n📊 Summary:');
    console.log('If localhost works but network IP fails → Firewall/McAfee is blocking');
    console.log('If both fail → Backend not running properly');
    console.log('If both work → ESP32 network issue (AP isolation)');
}, 6000);
