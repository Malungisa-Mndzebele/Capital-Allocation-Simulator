// Simple test to verify endpoints work
const http = require('http');

function testEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('Testing local backend endpoints...\n');

    try {
        console.log('1. Testing GET /');
        const root = await testEndpoint('/');
        console.log(`   Status: ${root.status}`);
        console.log(`   Response:`, root.body, '\n');

        console.log('2. Testing GET /api/health');
        const health = await testEndpoint('/api/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response:`, health.body, '\n');

        console.log('3. Testing POST /api/game/start');
        const start = await testEndpoint('/api/game/start', 'POST', { userId: 'test123' });
        console.log(`   Status: ${start.status}`);
        if (start.status === 200) {
            console.log(`   ✅ Game started! Level: ${start.body.level}, Month: ${start.body.month}\n`);
        } else {
            console.log(`   ❌ Error:`, start.body, '\n');
        }

        console.log('4. Testing GET /api/game/state/test123');
        const state = await testEndpoint('/api/game/state/test123');
        console.log(`   Status: ${state.status}`);
        if (state.status === 200) {
            console.log(`   ✅ State retrieved! Level: ${state.body.level}\n`);
        } else {
            console.log(`   ❌ Error:`, state.body, '\n');
        }

        console.log('5. Testing invalid route (should get 404)');
        const notFound = await testEndpoint('/invalid');
        console.log(`   Status: ${notFound.status}`);
        console.log(`   Response:`, notFound.body, '\n');

        console.log('✅ All local tests completed!');
    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    }
}

runTests().then(() => process.exit(0));
