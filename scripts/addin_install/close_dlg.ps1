$csharp = @'
using System;
using System.Runtime.InteropServices;
public class Win {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    [DllImport("user32.dll")]
    public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
'@
Add-Type -TypeDefinition $csharp
$hwnd = [Win]::FindWindow($null, "MH2026 - MathType hoa")
if ($hwnd -ne [IntPtr]::Zero) {
    Write-Output "Found dialog: $hwnd, closing with WM_CLOSE (0x0010)"
    [Win]::PostMessage($hwnd, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null
} else {
    Write-Output "Dialog not found with exact title."
}
