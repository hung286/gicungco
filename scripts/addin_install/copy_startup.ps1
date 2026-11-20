Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$src = (Resolve-Path "ADDIN\MH2026.dotm").Path
$startup = [System.IO.Path]::Combine($env:APPDATA, "Microsoft\Word\STARTUP")
if (-not (Test-Path $startup)) { New-Item -ItemType Directory -Force -Path $startup | Out-Null }
$dst = [System.IO.Path]::Combine($startup, "MH2026.dotm")
Copy-Item $src $dst -Force
Write-Output "Copied to STARTUP successfully! Size: $((Get-Item $dst).Length)"
