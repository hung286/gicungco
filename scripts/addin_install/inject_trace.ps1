# Add logging to MH_ToggleTeXRun to see exact line executed
$bas = Get-Content 'temp_vba\S_Math_new.bas' -Raw

$testBas = $bas.Replace('Public Sub MH_ToggleTeXRun(Optional ByVal scopeMode As String = "AUTO")', @'
Public Sub MH_ToggleTeXRun(Optional ByVal scopeMode As String = "AUTO")
    On Error Resume Next
    Dim logF As Integer
    logF = FreeFile
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Output As #logF
    Print #logF, "1. Started MH_ToggleTeXRun"
    Close #logF
'@)

$testBas = $testBas.Replace('If workRng.OMaths.Count > 0 Then', @'
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Append As #logF
    Print #logF, "2. Before OMaths check, count=" & workRng.OMaths.Count
    Close #logF
    If workRng.OMaths.Count > 0 Then
'@)

$testBas = $testBas.Replace('If Not didToggle And hasMT Then', @'
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Append As #logF
    Print #logF, "3. After OMaths, didToggle=" & didToggle & ", hasMT=" & hasMT
    Close #logF
    If Not didToggle And hasMT Then
'@)

$testBas = $testBas.Replace('Application.Run macroName:="MTCommand_TeXToggle"', @'
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Append As #logF
    Print #logF, "4. Calling MTCommand_TeXToggle on paragraph " & k & ": " & Left$(selRng.Text, 30)
    Close #logF
    Application.Run macroName:="MTCommand_TeXToggle"
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Append As #logF
    Print #logF, "5. Finished MTCommand_TeXToggle on paragraph " & k
    Close #logF
'@)

$testBas = $testBas.Replace('Application.DisplayAlerts = origAlerts' + [Environment]::NewLine + 'End Sub', @'
    Open "C:\Users\Admin\Desktop\webgame\macro_trace.log" For Append As #logF
    Print #logF, "6. MH_ToggleTeXRun completed!"
    Close #logF
    Application.DisplayAlerts = origAlerts
End Sub
'@)

Set-Content -Path 'temp_vba\S_Math_new.bas' -Value $testBas -Encoding Latin1
Write-Host "Injected trace logging into S_Math_new.bas!"
