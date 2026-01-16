# Comprehensive test script for Capital Allocation Simulator
$backendUrl = "https://capital-allocation-backend.onrender.com"
$userId = "test_player_$(Get-Random)"

Write-Host "=== Capital Allocation Simulator - Full Test ===" -ForegroundColor Cyan
Write-Host "User ID: $userId" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "[1/4] Testing health endpoint..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check PASSED" -ForegroundColor Green
        Write-Host "   Status: $($health.status)"
        Write-Host "   Database: $($health.database)"
    } else {
        Write-Host "❌ Health Check FAILED - Status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health Check FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Game State (should create new game)
Write-Host "[2/4] Testing game state endpoint..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/game/state/$userId" -UseBasicParsing -Method Get
    $gameState = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Game State PASSED" -ForegroundColor Green
        Write-Host "   Level: $($gameState.level)"
        Write-Host "   Month: $($gameState.month)"
        Write-Host "   Cash: $($gameState.cash)"
        Write-Host "   NetWorth: $($gameState.netWorth)"
    } else {
        Write-Host "❌ Game State FAILED - Status $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Game State FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Start Game
Write-Host "[3/4] Testing game start endpoint..." -ForegroundColor Magenta
try {
    $body = @{
        userId = $userId
        selectedJob = "Fast Food"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/game/start" -UseBasicParsing -Method Post `
        -ContentType "application/json" -Body $body
    $startData = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Game Start PASSED" -ForegroundColor Green
        Write-Host "   Level: $($startData.level)"
        Write-Host "   Job: $($startData.job)"
        Write-Host "   Starting Cash: $($startData.cash)"
    } else {
        Write-Host "❌ Game Start FAILED - Status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Game Start FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Perform Action (advance turn)
Write-Host "[4/4] Testing game action endpoint..." -ForegroundColor Magenta
try {
    $body = @{
        userId = $userId
        action = "advanceTurn"
        data = @{ months = 1 }
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/game/turn" -UseBasicParsing -Method Post `
        -ContentType "application/json" -Body $body
    $actionData = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Game Action PASSED" -ForegroundColor Green
        Write-Host "   New Month: $($actionData.month)"
        Write-Host "   Income Earned: `$$($actionData.lastMonthIncome)"
        Write-Host "   Cash Balance: `$$($actionData.cash)"
    } else {
        Write-Host "❌ Game Action FAILED - Status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Game Action FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== ALL TESTS PASSED ✅ ===" -ForegroundColor Green
Write-Host "The Capital Allocation Simulator backend is fully operational!"
