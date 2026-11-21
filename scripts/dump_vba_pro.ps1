$w = New-Object -ComObject Word.Application
$w.Visible = $false
try {
    $doc = $w.Documents.Open((Resolve-Path "ADDIN\VBA_Pro_Backup.dotm").Path)
    $exportDir = "ADDIN\vba_pro_dump"
    if (-not (Test-Path $exportDir)) { New-Item -ItemType Directory -Path $exportDir | Out-Null }
    foreach ($c in $doc.VBProject.VBComponents) {
        $ext = switch ($c.Type) { 1 { ".bas" } 2 { ".cls" } 3 { ".frm" } default { ".cls" } }
        $c.Export((Join-Path (Resolve-Path $exportDir).Path ($c.Name + $ext)))
        Write-Output ("Exported " + $c.Name)
    }
    $doc.Close([ref]$false)
} finally {
    $w.Quit()
}
