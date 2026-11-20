$dotmPath = (Resolve-Path "ADDIN\MH2026.dotm").Path
$basPath = (Resolve-Path "temp_vba\S_Math_new.bas").Path

# Make sure WINWORD is stopped
Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($dotmPath)
    $proj = $doc.VBProject
    
    # Set unique project name so it doesn't conflict with Word Normal.dotm
    try {
        $proj.Name = "MH2026"
        Write-Output "Set VBProject name to MH2026."
    } catch {
        Write-Output "Could not rename project: $($_.Exception.Message)"
    }

    # Find S_Math
    $smathComp = $null
    foreach ($comp in $proj.VBComponents) {
        if ($comp.Name -eq "S_Math") {
            $smathComp = $comp
            break
        }
    }
    
    if ($smathComp -ne $null) {
        $proj.VBComponents.Remove($smathComp)
        Write-Output "Removed old S_Math component."
    }
    
    $newComp = $proj.VBComponents.Import($basPath)
    Write-Output "Imported new S_Math component: $($newComp.Name)"
    
    $doc.Save()
    Write-Output "Saved MH2026.dotm successfully!"
    $doc.Close([ref]$false)
} catch {
    Write-Output "Error: $($_.Exception.Message)"
} finally {
    $word.Quit()
}
