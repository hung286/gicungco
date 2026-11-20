$csharp = @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WinSearch {
    [DllImport("user32.dll")]
    public static extern bool EnumThreadWindows(int dwThreadId, EnumThreadDelegate lpfn, IntPtr lParam);
    public delegate bool EnumThreadDelegate(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")]
    public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
'@
Add-Type -TypeDefinition $csharp
$procs = Get-Process -Name WINWORD
foreach ($p in $procs) {
    foreach ($thread in $p.Threads) {
        [WinSearch]::EnumThreadWindows($thread.Id, {
            param($hwnd, $lparam)
            $sb = New-Object System.Text.StringBuilder 256
            [WinSearch]::GetWindowText($hwnd, $sb, 256) | Out-Null
            $title = $sb.ToString()
            if ($title.Length -gt 0) {
                Write-Output "Found window: '$title' (HWND: $hwnd)"
                [WinSearch]::PostMessage($hwnd, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null
            }
            return $true
        }, [IntPtr]::Zero)
    }
}
