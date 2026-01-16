$backendUrl = "https://capital-allocation-backend.onrender.com"
$userId = "game_test_$(Get-Random)"

Write-Host "CAPITAL ALLOCATION SIMULATOR - FULL GAME PLAYTEST" -ForegroundColor Cyan
Write-Host "User ID: $userId" -ForegroundColor Yellow
Write-Host ""

function Call-API {
    param([string]$endpoint, [string]$method = "GET", [object]$body = $null)
    try {
        $params = @{
            Uri = "$backendUrl/api/$endpoint"
            UseBasicParsing = $true
            Method = $method
            TimeoutSec = 10
        }
        if ($body) {
            $params.ContentType = "application/json"
            $params.Body = $body | ConvertTo-Json -Depth 10
        }
        $response = Invoke-WebRequest @params
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

Write-Host "PHASE 1: CAREER LEVEL" -ForegroundColor Magenta
Write-Host ""

Write-Host "[1/7] Starting game..." -ForegroundColor White
$gameStart = Call-API "game/start" "POST" @{userId=$userId; selectedJob="Fast Food"}
Start-Sleep -Milliseconds 500

Write-Host "Game initialized" -ForegroundColor Green
Write-Host "  Level: $($gameStart.level)"
Write-Host "  Job: $($gameStart.job)"
Write-Host "  Cash: `$$($gameStart.cash)"
Write-Host ""

Write-Host "[2/7] Advancing Career (12 months)" -ForegroundColor White
$gameState = $gameStart
for ($i = 1; $i -le 12; $i++) {
    $turn = Call-API "game/turn" "POST" @{userId=$userId; action="advanceTurn"; data=@{months=1}}
    Start-Sleep -Milliseconds 300
    $gameState = $turn
    if ($i % 3 -eq 0) {
        Write-Host "  Month $($gameState.month): Cash = `$$($gameState.cash)"
    }
}
Write-Host "Career complete" -ForegroundColor Green
Write-Host ""

Write-Host "[3/7] Check progression..." -ForegroundColor White
$state = Call-API "game/state/$userId" "GET"
Start-Sleep -Milliseconds 500

Write-Host "Checking if can start business..." -ForegroundColor Yellow
if ($state.cash -ge $state.career.savingsGoal) {
    Write-Host "Starting business..." -ForegroundColor Green
    $bizStart = Call-API "game/action" "POST" @{userId=$userId; action="START_BUSINESS"; payload=@{businessType="Retail"}}
    Start-Sleep -Milliseconds 500
    $state = $bizStart
    Write-Host "Business started!" -ForegroundColor Green
} else {
    Write-Host "Not enough capital. Need: `$$($state.career.savingsGoal), Have: `$$($state.cash)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "PHASE 2: BUSINESS LEVEL" -ForegroundColor Magenta
Write-Host ""

if ($state.level -eq "Business") {
    Write-Host "[4/7] Managing business (12 months)" -ForegroundColor White
    $biz_count = 0
    for ($i = 1; $i -le 12 -and $state.level -eq "Business"; $i++) {
        $turn = Call-API "game/turn" "POST" @{userId=$userId; action="advanceTurn"; data=@{months=1}}
        Start-Sleep -Milliseconds 300
        $state = $turn
        $biz_count++
        if ($i % 3 -eq 0) {
            Write-Host "  Month $($state.month): Cash = `$$($state.cash)"
        }
    }
    Write-Host "Business level played for $biz_count months" -ForegroundColor Green
} else {
    Write-Host "[4/7] Business level not reached" -ForegroundColor Yellow
    Write-Host "Final state shows: Level=$($state.level), Cash=`$$($state.cash)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host ""
Write-Host "========== GAME COMPLETION REPORT ==========" -ForegroundColor Green
Write-Host ""
Write-Host "User: $userId" -ForegroundColor Cyan
Write-Host "Final Level: $($state.level)" -ForegroundColor Cyan
Write-Host "Total Months: $($state.month)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Financial Results:" -ForegroundColor Yellow
Write-Host "  Final Cash: `$$($state.cash)" -ForegroundColor White
Write-Host "  Final NetWorth: `$$($state.netWorth)" -ForegroundColor White
Write-Host ""

$levels = 1
if ($state.level -eq "Business") { $levels = 2 }
if ($state.level -eq "Investor") { $levels = 3 }

Write-Host "Progression:" -ForegroundColor Yellow
Write-Host "  Career Level: COMPLETED" -ForegroundColor White
if ($levels -ge 2) { Write-Host "  Business Level: REACHED" -ForegroundColor White }
if ($levels -ge 3) { Write-Host "  Investor Level: NOT IMPLEMENTED YET" -ForegroundColor Gray }
Write-Host ""

if ($levels -eq 2) {
    Write-Host "SUCCESS: Business Level Reached!" -ForegroundColor Green
    Write-Host "Player successfully transitioned from Career to Business." -ForegroundColor Green
} elseif ($levels -eq 1) {
    Write-Host "Career level active - Did not accumulate enough capital" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
