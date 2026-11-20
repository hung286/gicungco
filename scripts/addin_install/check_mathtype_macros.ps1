$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    foreach ($tpl in $word.Templates) {
        if ($tpl.Name -like "*MathType*") {
            Write-Output "Found template: $($tpl.FullName)"
            $proj = $tpl.VBProject
            foreach ($comp in $proj.VBComponents) {
                Write-Output " Component: $($comp.Name) (Type $($comp.Type))"
            }
        }
    }
} finally {
    $word.Quit()
}
