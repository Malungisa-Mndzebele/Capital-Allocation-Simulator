# Test Live Deployment Script
# Tests the deployed Capital Allocation Simulator backend

$baseUrl = "https://capital-allocation-backend.onrender.com"
$testUserId = "test-user-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "=== Testing Live Deployment ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Test User ID: $testUserId" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Timestamp: $($response.timestamp)" -ForegroundColor Gray
    Write-Host "  Database: $($response.database)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Start New Game
Write-Host "Test 2: Start New Game" -ForegroundColor Green
try {
    $body = @{
        userId = $testUserId
        difficulty = "Normal"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/start" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ Game started successfully" -ForegroundColor Green
    Write-Host "  Level: $($response.level)" -ForegroundColor Gray
    Write-Host "  Cash: `$$($response.cash)" -ForegroundColor Gray
    Write-Host "  Month: $($response.month)" -ForegroundColor Gray
    Write-Host "  Age: $($response.player.age)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Game start failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Get Game State
Write-Host "Test 3: Get Game State" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/state/$testUserId" -Method Get
    Write-Host "✓ Game state retrieved" -ForegroundColor Green
    Write-Host "  Level: $($response.level)" -ForegroundColor Gray
    Write-Host "  Net Worth: `$$($response.netWorth)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get game state failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Select Job
Write-Host "Test 4: Select Job (Fast Food)" -ForegroundColor Green
try {
    $body = @{
        userId = $testUserId
        action = "SELECT_JOB"
        payload = @{
            jobTitle = "Fast Food"
        }
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/action" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ Job selected successfully" -ForegroundColor Green
    Write-Host "  Job: $($response.career.jobTitle)" -ForegroundColor Gray
    Write-Host "  Salary: `$$($response.career.salary)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Job selection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Process Turn
Write-Host "Test 5: Process Turn" -ForegroundColor Green
try {
    $body = @{
        userId = $testUserId
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/turn" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ Turn processed successfully" -ForegroundColor Green
    Write-Host "  Month: $($response.month)" -ForegroundColor Gray
    Write-Host "  Cash: `$$($response.cash)" -ForegroundColor Gray
    Write-Host "  Events: $($response.events.Count)" -ForegroundColor Gray
    if ($response.events.Count -gt 0) {
        Write-Host "  Latest Event: $($response.events[0].description)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Turn processing failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 6: Test Skill Tree
Write-Host "Test 6: Check Skill Tree" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/state/$testUserId" -Method Get
    Write-Host "✓ Skill tree data retrieved" -ForegroundColor Green
    Write-Host "  Skill Points: $($response.skills.skillPoints)" -ForegroundColor Gray
    Write-Host "  Unlocked Skills: $($response.skills.unlockedSkills.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Skill tree check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 7: Test Achievements
Write-Host "Test 7: Check Achievements" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/state/$testUserId" -Method Get
    $unlockedCount = ($response.achievements | Where-Object { $_.unlocked -eq $true }).Count
    Write-Host "✓ Achievements data retrieved" -ForegroundColor Green
    Write-Host "  Total Achievements: $($response.achievements.Count)" -ForegroundColor Gray
    Write-Host "  Unlocked: $unlockedCount" -ForegroundColor Gray
} catch {
    Write-Host "✗ Achievements check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 8: Test Loan System
Write-Host "Test 8: Take a Loan" -ForegroundColor Green
try {
    $body = @{
        userId = $testUserId
        action = "TAKE_LOAN"
        payload = @{
            loanType = "student"
            amount = 5000
        }
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/game/action" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ Loan taken successfully" -ForegroundColor Green
    Write-Host "  Loans: $($response.loans.Count)" -ForegroundColor Gray
    Write-Host "  Cash: `$$($response.cash)" -ForegroundColor Gray
    Write-Host "  Credit Score: $($response.creditScore)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Loan test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Backend is online and healthy" -ForegroundColor Green
Write-Host "  ✓ Game creation works" -ForegroundColor Green
Write-Host "  ✓ Game state persistence works" -ForegroundColor Green
Write-Host "  ✓ Career system works" -ForegroundColor Green
Write-Host "  ✓ Turn processing works" -ForegroundColor Green
Write-Host "  ✓ Skill tree system works" -ForegroundColor Green
Write-Host "  ✓ Achievement system works" -ForegroundColor Green
Write-Host "  ✓ Loan system works" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend URL: https://khasinogaming.com/world/" -ForegroundColor Yellow
Write-Host "Backend URL: $baseUrl" -ForegroundColor Yellow
