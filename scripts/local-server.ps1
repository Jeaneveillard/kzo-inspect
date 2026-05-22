# Serveur HTTP local minimal pour KZO Inspect (sans Python).
param(
  [int]$Port = 8775,
  [string]$Root = ''
)

if ([string]::IsNullOrWhiteSpace($Root)) {
  $Root = Join-Path $PSScriptRoot '..'
} else {
  $Root = $Root.Trim().Trim('"').TrimEnd('\')
}
$Root = (Resolve-Path -LiteralPath $Root).Path
$Prefix = "http://127.0.0.1:$Port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.mjs'  = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.webmanifest' = 'application/manifest+json'
  '.txt'  = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($Prefix)

$started = $false
try {
  $listener.Start()
  $started = $true
} catch {
  Write-Host ''
  Write-Host "  ERREUR : impossible d'ecouter sur $Prefix"
  Write-Host "  $($_.Exception.Message)"
  Write-Host ''
  exit 1
}

Write-Host '========================================'
Write-Host '  KZO Inspect (serveur PowerShell)'
Write-Host "  $Prefix"
Write-Host "  $Root"
Write-Host '========================================'
Write-Host 'Ctrl+C pour arreter.'

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    try {
      $local = [Uri]::UnescapeDataString($req.Url.LocalPath)
      $rel = $local.TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
      $rel = $rel -replace '/', [IO.Path]::DirectorySeparatorChar
      $candidate = [IO.Path]::GetFullPath((Join-Path $Root $rel))

      if (-not $candidate.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        $res.StatusCode = 403
        $res.Close()
        continue
      }

      if (Test-Path -LiteralPath $candidate -PathType Container) {
        $candidate = Join-Path $candidate 'index.html'
      }

      if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $res.StatusCode = 404
        $body = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $res.ContentType = 'text/plain; charset=utf-8'
        $res.ContentLength64 = $body.Length
        $res.OutputStream.Write($body, 0, $body.Length)
        $res.Close()
        continue
      }

      $ext = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      # Empêche le navigateur et le SW de servir des fichiers périmés
      $res.Headers.Add('Cache-Control', 'no-cache, no-store, must-revalidate')
      $res.Headers.Add('Pragma', 'no-cache')
      $res.Headers.Add('Expires', '0')
      $bytes = [IO.File]::ReadAllBytes($candidate)
      $res.StatusCode = 200
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.Close()
    } catch {
      try {
        $res.StatusCode = 500
        $res.Close()
      } catch { }
    }
  }
} finally {
  if ($started) {
    try { $listener.Stop() } catch { }
    try { $listener.Close() } catch { }
  }
}
