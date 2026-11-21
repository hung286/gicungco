$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
try {
    $wb = $xl.Workbooks.Open((Resolve-Path "DapAn_TOAN_THPT 2025.xlsx").Path)
    $sh = $wb.Sheets.Item(1)
    for ($r = 1; $r -le 8; $r++) {
        $p1 = ""
        for ($c = 1; $c -le 14; $c++) { $p1 += "[" + $sh.Cells.Item($r, $c).Text + "] " }
        $p2 = ""
        for ($c = 42; $c -le 58; $c++) { $p2 += "[" + $sh.Cells.Item($r, $c).Text + "] " }
        $p3 = ""
        for ($c = 74; $c -le 80; $c++) { $p3 += "[" + $sh.Cells.Item($r, $c).Text + "] " }
        Write-Output ("Row $r | A..N: $p1")
        Write-Output ("Row $r | AP..BF: $p2")
        Write-Output ("Row $r | BV..CA: $p3")
        Write-Output ("--------------------------------------------------")
    }
    $wb.Close($false)
} finally {
    $xl.Quit()
}
