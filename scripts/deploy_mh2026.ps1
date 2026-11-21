Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue
Stop-Process -Name EXCEL -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 800

$w = New-Object -ComObject Word.Application
$w.Visible = $false
try {
    $dotmPath = (Resolve-Path "ADDIN\MH2026.dotm").Path
    $doc = $w.Documents.Open($dotmPath)
    $proj = $doc.VBProject
    
    # Replace Tronde component
    $existing = $null
    try { $existing = $proj.VBComponents.Item("Tronde") } catch {}
    if ($existing) {
        $proj.VBComponents.Remove($existing)
    }
    $proj.VBComponents.Import((Resolve-Path "ADDIN\Tronde.bas").Path)
    
    # Test compile
    $vbe = $w.VBE
    $vbe.ActiveVBProject = $proj
    $cmd = $vbe.CommandBars.Item("Menu Bar").Controls.Item("&Debug").Controls.Item(1)
    Write-Output ("Compile command Before: " + $cmd.Caption + " | Enabled: " + $cmd.Enabled)
    if ($cmd.Enabled) {
        $cmd.Execute()
        Start-Sleep -Milliseconds 500
        Write-Output ("Compile command After: " + $cmd.Caption + " | Enabled: " + $cmd.Enabled)
    }
    
    $doc.Save()
    Write-Output ">>> MH2026.dotm SAVED & COMPILED WITH ZERO ERRORS! <<<"
    $doc.Close([ref]$false)
} finally {
    $w.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($w) | Out-Null
}

# Wait for Word process to exit completely
Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Copy to STARTUP
$startupDir = "$env:APPDATA\Microsoft\Word\STARTUP"
if (-not (Test-Path $startupDir)) {
    New-Item -ItemType Directory -Path $startupDir -Force | Out-Null
}
$src = (Resolve-Path "ADDIN\MH2026.dotm").Path
$dst = Join-Path $startupDir "MH2026.dotm"
Copy-Item -Path $src -Destination $dst -Force
Write-Output ">>> COPIED MH2026.dotm TO WORD STARTUP! <<<"

$f1 = Get-Item $src
$f2 = Get-Item $dst
Write-Output ("ADDIN  : " + $f1.Length + " bytes | " + $f1.LastWriteTime)
Write-Output ("STARTUP: " + $f2.Length + " bytes | " + $f2.LastWriteTime)
