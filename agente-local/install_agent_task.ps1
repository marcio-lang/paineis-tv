$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$taskName = "PainelTVSyncAgent"
$agentScript = Join-Path $scriptDir "sync_agent.py"
$pythonExe = (Get-Command python -ErrorAction Stop).Source

if (-not (Test-Path $agentScript)) {
    throw "Arquivo sync_agent.py nao encontrado."
}

$action = New-ScheduledTaskAction -Execute $pythonExe -Argument "`"$agentScript`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Force | Out-Null

Write-Host "Tarefa '$taskName' registrada com sucesso."
Write-Host "Para iniciar agora: Start-ScheduledTask -TaskName $taskName"
