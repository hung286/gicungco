import os

with open('ADDIN/real_clean.bas', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update defaults in ChayTronDe
old_chay_defaults = '''        g_TenSo = "S" & ChrW(7902) & " GD" & ChrW(272) & "T B" & ChrW(7854) & "C NINH"
        g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT Y" & ChrW(202) & "N D" & ChrW(360) & "NG S" & ChrW(7888) & " 2"
        g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
        g_NamHoc = "2026 - 2027"
        g_TenMon = "To" & ChrW(225) & "n"
        g_TenLop = "12"
        g_ThoiGian = "90"
        g_SoDe = 4
        ReDim g_ArrMaDe(1 To 4)
        g_ArrMaDe(1) = "101": g_ArrMaDe(2) = "102": g_ArrMaDe(3) = "103": g_ArrMaDe(4) = "104"'''

new_chay_defaults = '''        g_TenSo = "S" & ChrW(7902) & " GD" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
        g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
        g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
        g_NamHoc = "2026 - 2027"
        g_TenMon = "To" & ChrW(225) & "n"
        g_TenLop = "12"
        g_ThoiGian = "90"
        g_SoDe = 4
        ReDim g_ArrMaDe(1 To 4)
        g_ArrMaDe(1) = "1011": g_ArrMaDe(2) = "1012": g_ArrMaDe(3) = "1013": g_ArrMaDe(4) = "1014"'''

text = text.replace(old_chay_defaults, new_chay_defaults, 1)
text = text.replace('4 ma de (101, 102, 103, 104) - Mon Toan 12', '4 ma de (1011, 1012, 1013, 1014) - Mon Toan 12')

# 2. Update defaults in DocCauHinhTuBang
old_doc_defaults = '''    g_TenSo = "S" & ChrW(7902) & " GD" & ChrW(272) & "T B" & ChrW(7854) & "C NINH"
    g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT Y" & ChrW(202) & "N D" & ChrW(360) & "NG S" & ChrW(7888) & " 2"
    g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    g_NamHoc = "2026 - 2027"
    g_TenMon = "To" & ChrW(225) & "n"
    g_TenLop = "12"
    g_ThoiGian = "90"
    g_SoDe = 4'''

new_doc_defaults = '''    g_TenSo = "S" & ChrW(7902) & " GD" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
    g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
    g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    g_NamHoc = "2026 - 2027"
    g_TenMon = "To" & ChrW(225) & "n"
    g_TenLop = "12"
    g_ThoiGian = "90"
    g_SoDe = 4'''

text = text.replace(old_doc_defaults, new_doc_defaults, 1)

# 3. Update defaults in ChenBangCauHinh
old_tbl_defaults = '''    GhiDongCauHinh tbl, 2, "Ten So GD&DT:", "S" & ChrW(7902) & " GD" & ChrW(272) & "T B" & ChrW(7854) & "C NINH"
    GhiDongCauHinh tbl, 3, "Ten Truong:", "TR" & ChrW(431) & ChrW(7900) & "NG THPT Y" & ChrW(202) & "N D" & ChrW(360) & "NG S" & ChrW(7888) & " 2"
    GhiDongCauHinh tbl, 4, "Ten Ki thi / Bai kiem tra:", ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    GhiDongCauHinh tbl, 5, "Nam hoc:", "2026 - 2027"
    GhiDongCauHinh tbl, 6, "Mon hoc:", "To" & ChrW(225) & "n"
    GhiDongCauHinh tbl, 7, "Khoi lop:", "12"
    GhiDongCauHinh tbl, 8, "Thoi gian lam bai (phut):", "90"
    GhiDongCauHinh tbl, 9, "So de can tao:", "4"
    GhiDongCauHinh tbl, 10, "Danh sach Ma de (cach nhau bang dau phay):", "101, 102, 103, 104"'''

new_tbl_defaults = '''    GhiDongCauHinh tbl, 2, "Ten So GD&DT:", "S" & ChrW(7902) & " GD" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
    GhiDongCauHinh tbl, 3, "Ten Truong:", "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
    GhiDongCauHinh tbl, 4, "Ten Ki thi / Bai kiem tra:", ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    GhiDongCauHinh tbl, 5, "Nam hoc:", "2026 - 2027"
    GhiDongCauHinh tbl, 6, "Mon hoc:", "To" & ChrW(225) & "n"
    GhiDongCauHinh tbl, 7, "Khoi lop:", "12"
    GhiDongCauHinh tbl, 8, "Thoi gian lam bai (phut):", "90"
    GhiDongCauHinh tbl, 9, "So de can tao:", "4"
    GhiDongCauHinh tbl, 10, "Danh sach Ma de (cach nhau bang dau phay):", "1011, 1012, 1013, 1014"'''

text = text.replace(old_tbl_defaults, new_tbl_defaults, 1)

# 4. Helper procedures (ChonThuMucLuu, Ribbon callbacks, XuatFileExcelDapAn, ChenPageFooter)
helpers = '''
' =========================================================================================
' CAC TIEN ICH BO TRO: CHON THU MUC, FOOTER VA XUAT FILE EXCEL DAP AN
' =========================================================================================
Public Function ChonThuMucLuu(Optional ByVal defaultPath As String = "") As String
    Dim fDialog As Object
    On Error Resume Next
    Set fDialog = Application.FileDialog(4)
    If Not fDialog Is Nothing Then
        With fDialog
            .Title = "Chon thu muc luu cac file de thi va dap an sau khi tron"
            .AllowMultiSelect = False
            If Len(defaultPath) > 0 Then
                .InitialFileName = defaultPath & Application.PathSeparator
            End If
            If .Show = -1 Then
                ChonThuMucLuu = .SelectedItems(1)
                Exit Function
            End If
        End With
    End If
    Dim shApp As Object, shFolder As Object
    Set shApp = CreateObject("Shell.Application")
    If Not shApp Is Nothing Then
        Set shFolder = shApp.BrowseForFolder(0, "Chon thu muc muon luu file de thi sau khi tron:", 0, defaultPath)
        If Not shFolder Is Nothing Then
            ChonThuMucLuu = shFolder.Self.Path
            Exit Function
        End If
    End If
    ChonThuMucLuu = ""
End Function

Public Sub trondepro(ByVal control As Office.IRibbonControl)
    Call ChayTronDe
End Sub

Public Sub ChayTronDe_Ribbon(ByVal control As Office.IRibbonControl)
    Call ChayTronDe
End Sub

Public Sub ChenBangCauHinh_Ribbon(ByVal control As Office.IRibbonControl)
    Dim docGoc As Document
    Set docGoc = ActiveDocument
    If docGoc Is Nothing Then
        MsgBox "Vui long mo file Word de thi truoc!", vbExclamation, "Thong bao"
        Exit Sub
    End If
    ChenBangCauHinh docGoc
    MsgBox "Da chen 'BANG CAU HINH TRON DE' vao dau de thi!" & vbCrLf & vbCrLf & _
           "- Thay co co the sua Ten Truong, Mon hoc, So luong ma de... truc tiep trong bang o trang 1." & vbCrLf & _
           "- Sau khi sua xong, hay bam nut 'Tron de' tren thanh cong cu de bat dau tron!", vbInformation, "Thong bao"
End Sub

Private Sub ChenPageFooter(doc As Document, maDe As String)
    On Error Resume Next
    Dim sec As Section
    For Each sec In doc.Sections
        With sec.Footers(wdHeaderFooterPrimary).Range
            .text = "Trang "
            .ParagraphFormat.Alignment = wdAlignParagraphRight
            .Font.Name = "Times New Roman"
            .Font.Size = 10
            .Font.Italic = False
            Dim fldPage As Field, fldNum As Field
            Set fldPage = .Fields.Add(Range:=.Characters.Last, Type:=wdFieldPage)
            .InsertAfter "/"
            Set fldNum = .Fields.Add(Range:=.Characters.Last, Type:=wdFieldNumPages)
            .InsertAfter " - M" & ChrW(227) & " " & ChrW(273) & ChrW(7873) & " " & maDe
        End With
    Next sec
End Sub

Private Sub XuatFileExcelDapAn(sPath As String, countP1 As Long, countP2 As Long, countP3 As Long, _
                               ansP1() As String, ansP2() As String, ansP3() As String)
    On Error Resume Next
    Dim filePath As String
    filePath = sPath & Application.PathSeparator & "DapAn_TongHop.csv"
    
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2
    stream.Charset = "utf-8"
    stream.Open
    
    Dim c As Long, d As Long, line As String
    
    ' Dong 1: Nhom tieu de
    line = "," & ChrW(80) & "h" & ChrW(7847) & "n " & ChrW(8544) & ": M" & ChrW(7895) & "i c" & ChrW(226) & "u 0.25" & ChrW(273)
    For c = 2 To 40: line = line & ",": Next c
    line = line & ",""" & ChrW(80) & "h" & ChrW(7847) & "n " & ChrW(8545) & ": M" & ChrW(7895) & "i c" & ChrW(226) & "u t" & ChrW(7889) & "i " & ChrW(273) & "a 1" & ChrW(273) & ": " & ChrW(273) & ChrW(250) & "ng 1 " & ChrW(253) & " 0.1" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 2 " & ChrW(253) & ": 0.25" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 3 " & ChrW(253) & ": 0.5" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 4 " & ChrW(253) & ": 1" & ChrW(273) & "."""
    For c = 2 To 32: line = line & ",": Next c
    line = line & ",""" & ChrW(80) & "h" & ChrW(7847) & "n " & ChrW(8546) & ": To" & ChrW(225) & "n 0.5" & ChrW(273) & ", c" & ChrW(225) & "c m" & ChrW(244) & "n kh" & ChrW(225) & "c: 0.25" & ChrW(273) & """"
    For c = 2 To 6: line = line & ",": Next c
    stream.WriteText line & vbCrLf
    
    ' Dong 2: Danh sach so thu tu cau
    line = ""
    For c = 1 To 40: line = line & "," & CStr(c): Next c
    For c = 1 To 8
        line = line & "," & CStr(c) & "a," & CStr(c) & "b," & CStr(c) & "c," & CStr(c) & "d"
    Next c
    For c = 1 To 6
        line = line & "," & "C" & ChrW(226) & "u " & CStr(c)
    Next c
    stream.WriteText line & vbCrLf
    
    ' Dong 3: Diem
    line = ChrW(272) & "i" & ChrW(7875) & "m"
    For c = 1 To 40
        If c <= countP1 Then line = line & ",0.25" Else line = line & ","
    Next c
    For c = 1 To 8
        If c <= countP2 Then line = line & ",0.1,0.25,0.5,1" Else line = line & ",,,,"
    Next c
    For c = 1 To 6
        If c <= countP3 Then line = line & ",0.5" Else line = line & ","
    Next c
    stream.WriteText line & vbCrLf
    
    ' Dong 4+: Cac ma de
    For d = 1 To g_SoDe
        line = g_ArrMaDe(d)
        For c = 1 To 40
            If c <= countP1 Then
                line = line & "," & ansP1(d, c)
            Else
                line = line & ","
            End If
        Next c
        For c = 1 To 8
            If c <= countP2 Then
                Dim rawP2 As String, partsP2() As String, pIdx As Long
                rawP2 = ansP2(d, c)
                partsP2 = Split(rawP2, ",")
                If UBound(partsP2) >= 3 Then
                    line = line & "," & Trim(partsP2(0)) & "," & Trim(partsP2(1)) & "," & Trim(partsP2(2)) & "," & Trim(partsP2(3))
                Else
                    For pIdx = 1 To 4
                        If pIdx <= Len(rawP2) Then
                            line = line & "," & Mid(rawP2, pIdx, 1)
                        Else
                            line = line & ","
                        End If
                    Next pIdx
                End If
            Else
                line = line & ",,,,"
            End If
        Next c
        For c = 1 To 6
            If c <= countP3 Then
                Dim valP3 As String
                valP3 = ansP3(d, c)
                If InStr(valP3, ",") > 0 Or InStr(valP3, """") > 0 Then
                    valP3 = """" & Replace(valP3, """", """""") & """"
                End If
                line = line & "," & valP3
            Else
                line = line & ","
            End If
        Next c
        stream.WriteText line & vbCrLf
    Next d
    
    stream.SaveToFile filePath, 2
    stream.Close
    Set stream = Nothing
    
    ' Chuyen CSV thanh XLSX bang Excel Application neu may co Excel
    Dim xlApp As Object, xlWb As Object
    Set xlApp = CreateObject("Excel.Application")
    If Not xlApp Is Nothing Then
        xlApp.DisplayAlerts = False
        Set xlWb = xlApp.Workbooks.Open(filePath)
        If Not xlWb Is Nothing Then
            xlWb.SaveAs sPath & Application.PathSeparator & "DapAn_TongHop.xlsx", 51
            xlWb.Close False
        End If
        xlApp.Quit
        Set xlWb = Nothing
        Set xlApp = Nothing
    End If
End Sub
'''

text = text.replace('Public Sub ThucHienTronDe(docGoc As Document)', helpers + '\r\nPublic Sub ThucHienTronDe(docGoc As Document)', 1)

# In ThucHienTronDe:
# 1. replace sPath = docGoc.path
old_spath = '    Dim sPath As String\r\n    sPath = docGoc.path'
new_spath = '''    Dim sPath As String
    If Len(docGoc.Path) > 0 Then
        sPath = docGoc.Path
    Else
        sPath = Options.DefaultFilePath(wdDocumentsPath)
    End If'''
text = text.replace(old_spath, new_spath, 1)

# 2. Add folder picker after question check
old_check = '''        MsgBox "Khong tim thay cau hoi hop le trong tai lieu!" & vbCrLf & vbCrLf & _
               "- Tong so doan van da quet: " & docGoc.Paragraphs.count & vbCrLf & _
               "- Thay co vui long kiem tra cac cau hoi da bat dau bang 'Cau 1.', 'Cau 2:'..." & vbCrLf & _
               "- Cac phan de thi: 'Phan I.', 'Phan II.', 'Phan III.'", vbExclamation, "Chu Y Dinh Dang De Thi"
        Exit Sub
    End If'''

new_check = '''        MsgBox "Khong tim thay cau hoi hop le trong tai lieu!" & vbCrLf & vbCrLf & _
               "- Tong so doan van da quet: " & docGoc.Paragraphs.count & vbCrLf & _
               "- Thay co vui long kiem tra cac cau hoi da bat dau bang 'Cau 1.', 'Cau 2:'..." & vbCrLf & _
               "- Cac phan de thi: 'Phan I.', 'Phan II.', 'Phan III.'", vbExclamation, "Chu Y Dinh Dang De Thi"
        Exit Sub
    End If
    
    ' Hoi nguoi dung chon thu muc muon luu file sau khi tron
    Application.ScreenUpdating = True
    Dim sThuMucChon As String
    sThuMucChon = ChonThuMucLuu(sPath)
    If Len(sThuMucChon) > 0 Then
        sPath = sThuMucChon
    Else
        Dim hoiThuMuc As VbMsgBoxResult
        hoiThuMuc = MsgBox("Ban da huy chon thu muc luu file!" & vbCrLf & vbCrLf & _
                           "- Bam 'Yes': Luu vao thu muc mac dinh (" & sPath & ")" & vbCrLf & _
                           "- Bam 'No': Huy thao tac tron de (khong tao file nao)", vbYesNo + vbQuestion, "Xac Nhan Thu Muc Luu")
        If hoiThuMuc = vbYes Then
            ' Giu nguyen sPath mac dinh
        Else
            Application.DisplayAlerts = wdAlertsAll
            MsgBox "Da huy thao tac tron de.", vbInformation, "Thong bao"
            Exit Sub
        End If
    End If
    If Right(sPath, 1) = Application.PathSeparator Then sPath = Left(sPath, Len(sPath) - 1)
    Application.ScreenUpdating = False
    Application.DisplayAlerts = wdAlertsNone'''

text = text.replace(old_check, new_check, 1)

# In ThucHienTronDe: chen Page Footer cho tung ma de
text = text.replace('ChenFooterDeThi docNew', 'ChenFooterDeThi docNew\r\n        ChenPageFooter docNew, maDe', 1)

# In ThucHienTronDe: export DapAn Word & Excel, prompt to open folder
old_xuat = '    XuatFileDapAnTongHop sPath, countP1, countP2, countP3, ansP1, ansP2, ansP3'
new_xuat = '''    ' 7. Xuat File Dap An Tong Hop (Word va Excel/CSV)
    XuatFileDapAnTongHop sPath, countP1, countP2, countP3, ansP1, ansP2, ansP3
    XuatFileExcelDapAn sPath, countP1, countP2, countP3, ansP1, ansP2, ansP3'''
text = text.replace(old_xuat, new_xuat, 1)

old_msg = '''    MsgBox "DA TRON XONG " & g_SoDe & " MA DE THI VA XUAT FILE DAP AN TONG HOP!" & vbCrLf & vbCrLf & _
           "- So luong cau hoi da tron:" & vbCrLf & _
           "  + Phan I (4 phuong an): " & countP1 & " cau" & vbCrLf & _
           "  + Phan II (Dung/Sai): " & countP2 & " cau" & vbCrLf & _
           "  + Phan III (Tra loi ngan): " & countP3 & " cau" & vbCrLf & _
           IIf(g_CoTuLuan And countP4 > 0, "  + Phan Tu luan: " & countP4 & " cau" & vbCrLf, "") & _
           "- Thu muc luu: " & sPath & vbCrLf & _
           "- Cac file tao ra: Made_101.docx... va DapAn_TongHop.docx", vbInformation, "Thanh cong"'''

new_msg = '''    Dim msgHoanThanh As String
    msgHoanThanh = "DA TRON XONG " & g_SoDe & " MA DE THI VA XUAT FILE DAP AN TONG HOP!" & vbCrLf & vbCrLf & _
                   "- So luong cau hoi da tron:" & vbCrLf & _
                   "  + Phan I (4 phuong an): " & countP1 & " cau" & vbCrLf & _
                   "  + Phan II (Dung/Sai): " & countP2 & " cau" & vbCrLf & _
                   "  + Phan III (Tra loi ngan): " & countP3 & " cau" & vbCrLf & _
                   IIf(g_CoTuLuan And countP4 > 0, "  + Phan Tu luan: " & countP4 & " cau" & vbCrLf, "") & _
                   "- Thu muc da luu: " & sPath & vbCrLf & _
                   "- Cac file da tao: Made_...docx, DapAn_TongHop.docx, DapAn_TongHop.xlsx" & vbCrLf & vbCrLf & _
                   "Thay co co muon mo thu muc chua cac file vua tao khong?"
    Dim hoiMoFolder As VbMsgBoxResult
    hoiMoFolder = MsgBox(msgHoanThanh, vbYesNo + vbInformation, "Tron De Thanh Cong")
    If hoiMoFolder = vbYes Then
        On Error Resume Next
        Shell "explorer.exe """ & sPath & """", vbNormalFocus
        On Error GoTo 0
    End If'''
text = text.replace(old_msg, new_msg, 1)

# 5. Header in ChenHeaderDeThi matching de 0111.docx
old_header_sub = '''Private Sub ChenHeaderDeThi(doc As Document, maDe As String)
    Dim rng As Range
    Set rng = doc.Range(0, 0)
    
    Dim tbl As Table
    Set tbl = doc.Tables.Add(Range:=rng, NumRows:=1, NumColumns:=2)
    tbl.Borders.Enable = False
    tbl.Columns(1).Width = CentimetersToPoints(7.5)
    tbl.Columns(2).Width = CentimetersToPoints(10)
    
    With tbl.Cell(1, 1).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .text = UCase(g_TenSo) & vbCrLf & UCase(g_TenTruong) & vbCrLf & ChrW(272) & ChrW(7872) & " CH" & ChrW(205) & "NH TH" & ChrW(7912) & "C"
        .Font.Name = "Times New Roman"
        .Font.Size = 12
        .Font.Bold = True
    End With
    
    Dim sDongKyThi As String
    sDongKyThi = UCase(Trim(g_TenKyThi))
    
    Dim sDongNamHoc As String
    sDongNamHoc = ""
    If Len(Trim(g_NamHoc)) > 0 Then
        Dim sNH As String: sNH = Trim(g_NamHoc)
        If InStr(1, UCase(BoDauTiengViet(sNH)), "NAM HOC") > 0 Then
            sDongNamHoc = UCase(sNH)
        Else
            sDongNamHoc = "N" & ChrW(258) & "M H" & ChrW(7884) & "C: " & UCase(sNH)
        End If
    End If
    
    Dim sKyThiNamHoc As String
    sKyThiNamHoc = sDongKyThi
    If Len(sDongNamHoc) > 0 Then
        sKyThiNamHoc = sKyThiNamHoc & vbCrLf & sDongNamHoc
    End If
    
    With tbl.Cell(1, 2).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .text = sKyThiNamHoc & vbCrLf & _
                "M" & ChrW(244) & "n: " & g_TenMon & " - L" & ChrW(7899) & "p: " & g_TenLop & vbCrLf & _
                "Th" & ChrW(7901) & "i gian l" & ChrW(224) & "m b" & ChrW(224) & "i: " & g_ThoiGian & "ph" & ChrW(250) & "t" & vbCrLf & _
                "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873) & " thi: " & maDe
        .Font.Name = "Times New Roman"
        .Font.Size = 12
        .Font.Bold = True
    End With
    
    Set rng = doc.Range(tbl.Range.End, tbl.Range.End)
    rng.InsertParagraphAfter
    rng.Collapse wdCollapseEnd
    With rng
        .text = "H" & ChrW(7885) & " v" & ChrW(224) & " t" & ChrW(234) & "n th" & ChrW(237) & " sinh: ........................................................... S" & ChrW(7889) & " b" & ChrW(225) & "o danh: ........................." & vbCrLf
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.Italic = False
        .Font.Bold = False
        .ParagraphFormat.Alignment = wdAlignParagraphLeft
        .ParagraphFormat.SpaceBefore = 6
        .ParagraphFormat.SpaceAfter = 6
    End With
End Sub'''

new_header_sub = '''Private Sub ChenHeaderDeThi(doc As Document, maDe As String)
    Dim rng As Range
    Set rng = doc.Range(0, 0)
    
    Dim tbl As Table
    Set tbl = doc.Tables.Add(Range:=rng, NumRows:=1, NumColumns:=2)
    tbl.Borders.Enable = False
    tbl.Columns(1).Width = CentimetersToPoints(8)
    tbl.Columns(2).Width = CentimetersToPoints(9.5)
    
    ' Cot trai: So, Truong, So trang
    Dim sCot1 As String
    sCot1 = UCase(Trim(g_TenSo)) & vbCrLf & UCase(Trim(g_TenTruong)) & vbCrLf & "(" & ChrW(272) & ChrW(7873) & " thi c" & ChrW(243) & " 04 trang)"
    With tbl.Cell(1, 1).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .text = sCot1
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.Bold = True
    End With
    
    ' Cot phai: Ky thi, Nam hoc, Mon - Khoi, Thoi gian
    Dim sDongKyThi As String: sDongKyThi = UCase(Trim(g_TenKyThi))
    Dim sDongNamHoc As String: sDongNamHoc = ""
    If Len(Trim(g_NamHoc)) > 0 Then
        Dim sNH As String: sNH = Trim(g_NamHoc)
        If InStr(1, UCase(BoDauTiengViet(sNH)), "NAM HOC") > 0 Then
            sDongNamHoc = UCase(sNH)
        Else
            sDongNamHoc = "N" & ChrW(258) & "M H" & ChrW(7884) & "C " & UCase(sNH)
        End If
    End If
    
    Dim sCot2 As String
    sCot2 = sDongKyThi
    If Len(sDongNamHoc) > 0 Then sCot2 = sCot2 & vbCrLf & sDongNamHoc
    sCot2 = sCot2 & vbCrLf & "M" & ChrW(212) & "N " & g_TenMon & " " & ChrW(8211) & " Kh" & ChrW(7889) & "i " & g_TenLop & vbCrLf & _
            "Th" & ChrW(7901) & "i gian l" & ChrW(224) & "m b" & ChrW(224) & "i : " & g_ThoiGian & " ph" & ChrW(250) & "t" & vbCrLf & _
            "(kh" & ChrW(244) & "ng k" & ChrW(7875) & " th" & ChrW(7901) & "i gian ph" & ChrW(225) & "t " & ChrW(273) & ChrW(7873) & ")"
    
    With tbl.Cell(1, 2).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .text = sCot2
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.Bold = True
    End With
    
    ' Thong tin Ma de va Thi sinh
    Set rng = doc.Range(tbl.Range.End, tbl.Range.End)
    rng.InsertParagraphAfter
    rng.Collapse wdCollapseEnd
    With rng
        .text = "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873) & " " & maDe & vbCrLf & _
                "H" & ChrW(7885) & " v" & ChrW(224) & " t" & ChrW(234) & "n h" & ChrW(7885) & "c sinh :..................................................... S" & ChrW(7889) & " b" & ChrW(225) & "o danh : ..................." & vbCrLf
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.Bold = True
        .ParagraphFormat.Alignment = wdAlignParagraphLeft
        .ParagraphFormat.SpaceBefore = 4
        .ParagraphFormat.SpaceAfter = 4
    End With
End Sub'''

text = text.replace(old_header_sub, new_header_sub, 1)

# Write to ADDIN/Tronde.bas with strict CRLF binary
with open('ADDIN/Tronde.bas', 'wb') as f:
    f.write(text.encode('utf-8'))

print("Generated ADDIN/Tronde.bas successfully!")
