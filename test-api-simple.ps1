# Simple API Test
$baseUrl = "https://capital-allocation-backend.onrender.com"

Write-Host "Testing Health Endpoint..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "$baseUrl/api/health"
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host "Database: $($health.database)" -ForegroundColor Green
Write-Host ""

Write-Host "Starting New Game..." -ForegroundColor Cyan
$startBody = '{"userId":"test123","difficulty":"Normal"}'
$game = Invoke-RestMethod -Uri "$baseUrl/api/game/start" -Method Post -Body $startBody -ContentType "application/json"
Write-Host "Level: $($game.level)" -ForegroundColor Green
Write-Host "Cash: $($game.cash)" -ForegroundColor Green
Write-Host "Month: $($game.month)" -ForegroundColor Green
Write-Host ""

Write-Host "Selecting Job..." -ForegroundColor Cyan
$jobBody = '{"userId":"test123","action":"SELECT_JOB","payload":{"jobTitle":"Fast Food"}}'
$jobResult = Invoke-RestMethod -Uri "$baseUrl/api/game/action" -Method Post -Body $jobBody -ContentType "application/json"
Write-Host "Job: $($jobResult.career.jobTitle)" -ForegroundColor Green
Write-Host "Salary: $($jobResult.career.salary)" -ForegroundColor Green
Write-Host ""

Write-Host "Processing Turn..." -ForegroundColor Cyan
$turnBody = '{"userId":"test123"}'
$turnResult = Invoke-RestMethod -Uri "$baseUrl/api/game/turn" -Method Post -Body $turnBody -ContentType "application/json"
Write-Host "Month: $($turnResult.month)" -ForegroundColor Green
Write-Host "Cash: $($turnResult.cash)" -ForegroundColor Green
Write-Host "Events: $($turnResult.events.Count)" -ForegroundColor Green
Write-Host ""

Write-Host "All tests passed!" -ForegroundColor Green
