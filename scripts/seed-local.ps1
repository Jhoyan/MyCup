<#
  Seed de dados fake no banco LOCAL via API (http://localhost:5130).
  Popula 1 universo, times, jogadores e 2 campeonatos (pontos corridos + mata-mata)
  com chaveamento gerado e alguns resultados lancados, para desenvolver o frontend
  contra dados reais. Tenta login se o usuario admin ja existir.

  Uso:  powershell -File ./scripts/seed-local.ps1
  Requer: API rodando (cd backend; dotnet run --launch-profile http) e o banco migrado.
#>

$ErrorActionPreference = "Stop"
$Base = "http://localhost:5130/api"

function Invoke-Api {
    param([string]$Method, [string]$Path, $Body, [string]$Token)

    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }

    $json = $null
    if ($null -ne $Body) { $json = $Body | ConvertTo-Json -Depth 8 }

    return Invoke-RestMethod -Method $Method -Uri ($Base + $Path) -Headers $headers -Body $json
}

Write-Host "==> Autenticando (admin)..." -ForegroundColor Cyan
$token = $null
$registerBody = @{ usuario = "admin"; email = "admin@mycup.dev"; senha = "123456"; confirmaSenha = "123456" }
try {
    $auth = Invoke-Api "POST" "/auth/register" $registerBody $null
    Write-Host "    usuario 'admin' criado." -ForegroundColor Green
} catch {
    $loginBody = @{ email = "admin@mycup.dev"; password = "123456" }
    $auth = Invoke-Api "POST" "/auth/login" $loginBody $null
    Write-Host "    usuario 'admin' ja existia, logado." -ForegroundColor Yellow
}
$token = $auth.token

Write-Host "==> Criando universo..." -ForegroundColor Cyan
$universeBody = @{ name = "Pelada do Bairro"; description = "Universo de testes (seed local)" }
$universe = Invoke-Api "POST" "/universes" $universeBody $token
$universeId = $universe.id
Write-Host "    universo #$universeId" -ForegroundColor Green

$teamNames = @("Os Brabos", "Trovao Azul", "Falcoes", "Esquadrao FC", "Os Guerreiros", "Leoes", "Fenix", "Dragoes")
$playerNames = @("Carlos Silva", "Joao Pedro", "Marcos Oliveira", "Felipe Santos", "Lucas Mendes", "Rafael Costa", "Bruno Alves", "Diego Rocha")

Write-Host "==> Criando times..." -ForegroundColor Cyan
$teamIds = @()
foreach ($n in $teamNames) {
    $teamBody = @{ name = $n; universeId = $universeId }
    $t = Invoke-Api "POST" "/teams" $teamBody $token
    $teamIds += $t.id
}
Write-Host "    $($teamIds.Count) times criados" -ForegroundColor Green

Write-Host "==> Criando jogadores..." -ForegroundColor Cyan
$playerIds = @()
foreach ($n in $playerNames) {
    $playerBody = @{ name = $n; universeId = $universeId }
    $p = Invoke-Api "POST" "/players" $playerBody $token
    $playerIds += $p.id
}
Write-Host "    $($playerIds.Count) jogadores criados" -ForegroundColor Green

function New-SeedChampionship {
    param([string]$Name, [string]$FormatType, [int]$FormatId, $GenerateBody)

    Write-Host "==> Campeonato '$Name' ($FormatType)..." -ForegroundColor Cyan
    $champBody = @{ name = $Name; format = $FormatType; distribution = "sorteio"; universeId = $script:universeId; formatId = $FormatId }
    $champ = Invoke-Api "POST" "/championships" $champBody $script:token
    $champId = $champ.id
    Write-Host "    campeonato #$champId - adicionando times e jogadores..." -ForegroundColor Green

    foreach ($tid in $script:teamIds) {
        $addTeamBody = @{ teamId = $tid }
        Invoke-Api "POST" "/championships/$champId/teams" $addTeamBody $script:token | Out-Null
    }
    foreach ($playerId in $script:playerIds) {
        $enrollBody = @{ playerId = $playerId }
        Invoke-Api "POST" "/championships/$champId/players" $enrollBody $script:token | Out-Null
    }
    try { Invoke-Api "POST" "/championships/$champId/players/draw" $null $script:token | Out-Null } catch {}

    Write-Host "    gerando chaveamento..." -ForegroundColor Green
    Invoke-Api "POST" "/championships/$champId/generate" $GenerateBody $script:token | Out-Null
    return $champId
}

$rrGen = @{ doubleRound = $false }
$koGen = @{ thirdPlace = $true; elimination = "single" }
$rrId = New-SeedChampionship "Campeonato Verao 2025" "round_robin" 1 $rrGen
$koId = New-SeedChampionship "Copa Relampago" "knockout" 2 $koGen

Write-Host "==> Lancando resultados (round_robin rodada 1)..." -ForegroundColor Cyan
$detail = Invoke-Api "GET" "/championships/$rrId" $null $token
$round1 = $detail.rounds | Sort-Object number | Select-Object -First 1
foreach ($m in $round1.matches) {
    if (($null -ne $m.homeTeam) -and ($null -ne $m.awayTeam)) {
        $hg = Get-Random -Minimum 0 -Maximum 5
        $ag = Get-Random -Minimum 0 -Maximum 5
        $resultBody = @{ homeGoals = $hg; awayGoals = $ag; status = "finished" }
        Invoke-Api "PUT" "/matches/$($m.id)" $resultBody $token | Out-Null
        Write-Host "    match #$($m.id): $hg x $ag" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Seed concluido." -ForegroundColor Green
Write-Host "  Login:        admin@mycup.dev / 123456"
Write-Host "  Universo:     #$universeId (Pelada do Bairro)"
Write-Host "  Campeonatos:  #$rrId (pontos corridos), #$koId (mata-mata)"
