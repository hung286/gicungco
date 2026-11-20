$dotm = (Resolve-Path "ADDIN\MH2026.dotm").Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($dotm)
    if (-not (Test-Path "temp_vba")) { New-Item -ItemType Directory -Path "temp_vba" | Out-Null }
    foreach ($comp in $doc.VBProject.VBComponents) {
        $ext = switch ($comp.Type) { 1 { ".bas" } 2 { ".cls" } 3 { ".frm" } default { ".txt" } }
        $out = Join-Path (Resolve-Path "temp_vba").Path ($comp.Name + $ext)
        $comp.Export($out)
        Write-Output "Exported: $($comp.Name)$ext"
    }
    $doc.Close([ref]$false)
} finally {
    $word.Quit()
}
