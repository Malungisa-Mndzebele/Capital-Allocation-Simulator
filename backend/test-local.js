#!/usr/bin/env node
/**
 * Local backend test script
 * Tests all major API endpoints with sample data
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'test-user-' + Date.now();

async function runTests() {
    console.log('🎮 Capital Allocation Simulator - Backend Test Suite\n');
    console.log(`Testing URL: ${API_URL}`);
    console.log(`Test User ID: ${TEST_USER_ID}\n`);

    try {
        // Test 1: Health Check
        console.log('1️⃣  Testing Health Check...');
        const healthRes = await axios.get(`${API_URL}/health`);
        console.log(`✅ Health check passed: ${JSON.stringify(healthRes.data)}\n`);

        // Test 2: Start Game
        console.log('2️⃣  Starting a new game...');
        const startRes = await axios.post(`${API_URL}/game/start`, { userId: TEST_USER_ID });
        console.log(`✅ Game started. Initial cash: $${startRes.data.cash}`);
        console.log(`   Player age: ${startRes.data.player.age} years old\n`);

        // Test 3: Get Game State
        console.log('3️⃣  Retrieving game state...');
        const stateRes = await axios.get(`${API_URL}/game/state/${TEST_USER_ID}`);
        console.log(`✅ Game state retrieved. Current level: ${stateRes.data.level}`);
        console.log(`   Current month: ${stateRes.data.month}\n`);

        // Test 4: Select a Job (Level 1 Action)
        console.log('4️⃣  Selecting a job (SELECT_JOB action)...');
        const jobRes = await axios.post(`${API_URL}/game/action`, {
            userId: TEST_USER_ID,
            action: 'SELECT_JOB',
            payload: { jobTitle: 'Sales' }
        });
        console.log(`✅ Job selected: ${jobRes.data.career.jobTitle}`);
        console.log(`   Salary: $${jobRes.data.career.salary}/year\n`);

        // Test 5: Process a Turn
        console.log('5️⃣  Processing a game turn...');
        const turnRes = await axios.post(`${API_URL}/game/turn`, { userId: TEST_USER_ID });
        console.log(`✅ Turn processed. Now at month ${turnRes.data.month}`);
        console.log(`   Player age: ${turnRes.data.player.age} years old`);
        console.log(`   Cash: $${Math.round(turnRes.data.cash)}\n`);

        // Test 6: Update Lifestyle
        console.log('6️⃣  Updating lifestyle (UPDATE_LIFESTYLE action)...');
        const lifestyleRes = await axios.post(`${API_URL}/game/action`, {
            userId: TEST_USER_ID,
            action: 'UPDATE_LIFESTYLE',
            payload: { tier: 'Moderate' }
        });
        console.log(`✅ Lifestyle updated to: ${lifestyleRes.data.lifestyle.tier}`);
        console.log(`   Rent: $${lifestyleRes.data.lifestyle.rent}/month\n`);

        console.log('🎉 All tests passed!\n');
        console.log('Backend is working correctly. You can now:');
        console.log('  1. Test the live deployed game at: https://capital-allocation-backend.onrender.com/api/health');
        console.log('  2. Run the frontend: cd frontend && npm run dev');

    } catch (error: any) {
        console.error('\n❌ Test failed!');
        if (error.response?.data) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runTests();
