$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    Write-Output "Word version: $($word.Version)"
    foreach ($tpl in $word.Templates) {
        Write-Output "Template: $($tpl.Name)"
    }
    foreach ($addin in $word.AddIns) {
        Write-Output "Addin: $($addin.Name) - Installed: $($addin.Installed)"
    }
} finally {
    $word.Quit()
}
