$csCode = @'
using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;

namespace MH2026Installer {
    static class Program {
        [STAThread]
        static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            try {
                // Stop WINWORD if running
                Process[] procs = Process.GetProcessesByName("WINWORD");
                if (procs.Length > 0) {
                    DialogResult dr = MessageBox.Show(
                        "Microsoft Word đang mở. Bạn có muốn đóng Word để tiến hành cài đặt Add-in MH2026 không?",
                        "Thông báo cài đặt Add-in Word MH2026",
                        MessageBoxButtons.YesNo,
                        MessageBoxIcon.Question
                    );
                    if (dr == DialogResult.Yes) {
                        foreach (Process p in procs) {
                            try { p.Kill(); p.WaitForExit(3000); } catch { }
                        }
                    } else {
                        return;
                    }
                }

                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string startupDir = Path.Combine(appData, @"Microsoft\Word\STARTUP");
                if (!Directory.Exists(startupDir)) {
                    Directory.CreateDirectory(startupDir);
                }

                string targetFile = Path.Combine(startupDir, "MH2026.dotm");

                Assembly asm = Assembly.GetExecutingAssembly();
                string resourceName = null;
                foreach (string name in asm.GetManifestResourceNames()) {
                    if (name.EndsWith("MH2026.dotm", StringComparison.OrdinalIgnoreCase)) {
                        resourceName = name;
                        break;
                    }
                }

                if (resourceName == null) {
                    MessageBox.Show("Không tìm thấy tệp mẫu MH2026.dotm bên trong bộ cài!", "Lỗi", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                using (Stream src = asm.GetManifestResourceStream(resourceName))
                using (FileStream dst = new FileStream(targetFile, FileMode.Create, FileAccess.Write)) {
                    src.CopyTo(dst);
                }

                MessageBox.Show(
                    "Chúc mừng! Đã cài đặt thành công Add-in Word MH2026 vào Microsoft Word!\n\nVị trí cài đặt:\n" + targetFile + "\n\nBây giờ bạn chỉ cần mở Word lên là thanh công cụ MH2026 sẽ tự động xuất hiện.",
                    "Cài Đặt Thành Công - MH2026",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            } catch (Exception ex) {
                MessageBox.Show("Đã xảy ra lỗi khi cài đặt:\n" + ex.Message, "Lỗi cài đặt", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
'@

$csPath = "c:\Users\Admin\Desktop\webgame\Installer.cs"
[System.IO.File]::WriteAllText($csPath, $csCode, [System.Text.Encoding]::UTF8)

$csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
$dotm = (Resolve-Path "ADDIN\MH2026.dotm").Path
$outExe = "c:\Users\Admin\Desktop\webgame\ADDIN\Cai_Dat_Addin_Word_MH2026.exe"

& $csc /target:winexe /out:$outExe /resource:$dotm,MH2026.dotm /r:System.Windows.Forms.dll /r:System.Drawing.dll $csPath

if (Test-Path $outExe) {
    Write-Output "Successfully compiled: $outExe (Size: $((Get-Item $outExe).Length))"
    # Copy to public and dist
    Copy-Item $outExe "public\Cai_Dat_Addin_Word_MH2026.exe" -Force
    if (Test-Path "dist") {
        Copy-Item $outExe "dist\Cai_Dat_Addin_Word_MH2026.exe" -Force
    }
    Write-Output "Synced installer to public and dist folders."
}
