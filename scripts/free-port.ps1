# Libere le port local (instance precedente du serveur KZO).
param([int]$Port = 8775)

$url = "http://127.0.0.1:$Port/"
$pids = @()

try {
  $pids = @(
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
  )
} catch {
  $pids = @(
    netstat -ano |
      Select-String ":$Port\s" |
      Select-String 'LISTENING' |
      ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') { [int]$Matches[1] }
      }
  )
}

foreach ($procId in ($pids | Where-Object { $_ -gt 0 } | Select-Object -Unique)) {
  $name = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
  Write-Host "  Arret de $name (PID $procId) sur le port $Port..."
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

if ($pids.Count -gt 0) {
  Start-Sleep -Milliseconds 500
}

# Reservation http.sys laissee par un HttpListener PowerShell interrompu
& netsh.exe http delete urlacl url=$url 2>$null | Out-Null

exit 0
