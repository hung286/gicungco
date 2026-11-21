import os
import re

code = r'''Attribute VB_Name = "Tronde"
' =========================================================================================
' HE THONG TRON DE TRAC NGHIEM THPT QUOC GIA & KHAO SAT CHUAN BO GD&DT
' Form de thi Word chuan de 0111.docx | Form dap an Excel chuan DapAn_TOAN_THPT 2025.xlsx
' =========================================================================================
Option Explicit

Private Sub GhiLog(msg As String)
    On Error Resume Next
    Dim fNum As Integer, logPath As String
    fNum = FreeFile
    logPath = Environ("TEMP") & "\tronde_debug.log"
    Open logPath For Append As #fNum
    Print #fNum, Format(Now, "hh:nn:ss") & " - " & msg
    Close #fNum
    On Error GoTo 0
End Sub


' Cau truc luu phuong an
Public Type TypeOption
    Label As String           ' A, B, C, D hoac a, b, c, d
    rngContent As Range       ' Range noi dung phuong an
    isCorrect As Boolean      ' True neu phuong an co gach chan
    RawText As String
End Type

' Cau truc luu cau hoi
Public Type TypeQuestion
    qNumber As Long
    PartType As Long          ' 1: P1 (ABCD), 2: P2 (Dung/Sai), 3: P3 (Tra loi ngan), 4: Tu luan
    rngHeader As Range        ' Range loi dan cua cau hoi
    Options() As TypeOption   ' Cac phuong an
    numOptions As Long
    KeyText As String         ' Dap an ngan cua P3
    layoutType As Long        ' 4: 4 phuong an 1 hang, 2: 2 phuong an 1 hang, 1: 1 phuong an 1 hang
End Type

' Bien cau hinh toan cuc
Public g_TenSo As String
Public g_TenTruong As String
Public g_TenKyThi As String
Public g_NamHoc As String
Public g_TenMon As String
Public g_TenLop As String
Public g_ThoiGian As String
Public g_SoDe As Long
Public g_ArrMaDe() As String
Public g_CoTuLuan As Boolean
Public g_TronP1 As Boolean
Public g_TronP2 As Boolean
Public g_TronP3 As Boolean
Public g_TronTuLuan As Boolean

' Tieu de goc cac phan
Private g_rngTitleP1 As Range
Private g_rngTitleP2 As Range
Private g_rngTitleP3 As Range
Private g_rngTitleP4 As Range

' =========================================================================================
' 1. CAC THU TUC GOI CHINH & RIBBON CALLBACKS
' =========================================================================================
Public Sub trondepro(Optional ByVal control As Object = Nothing)
    Call ChayTronDe
End Sub

Public Sub ChayTronDe_Ribbon(Optional ByVal control As Object = Nothing)
    Call ChayTronDe
End Sub

Public Sub ChenBangCauHinhMacDinh()
    Dim docGoc As Document
    Set docGoc = ActiveDocument
    If docGoc Is Nothing Then
        MsgBox "Vui long mo file Word de thi truoc!", vbExclamation, "Thong bao"
        Exit Sub
    End If
    ChenBangCauHinh docGoc
    MsgBox "Da chen 'BANG CAU HINH TRON DE' vao dau de thi!" & vbCrLf & vbCrLf & _
           "- Thay co sua thong tin truc tiep o cot phai trang 1." & vbCrLf & _
           "- Sau do bam nut 'Tron de' tren thanh cong cu de tron!", vbInformation, "Thong bao"
End Sub

Public Sub ChenBangCauHinh_Ribbon(Optional ByVal control As Object = Nothing)
    Call ChenBangCauHinhMacDinh
End Sub

' =========================================================================================
' 2. HOP THOAI CHON THU MUC LUU FILE
' =========================================================================================
Public Function ChonThuMucLuu(Optional ByVal defaultPath As String = "") As String
    Dim fDialog As Object
    On Error Resume Next
    Set fDialog = Application.FileDialog(4) ' msoFileDialogFolderPicker = 4
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
    On Error GoTo 0

    Dim shApp As Object, shFolder As Object
    On Error Resume Next
    Set shApp = CreateObject("Shell.Application")
    If Not shApp Is Nothing Then
        Set shFolder = shApp.BrowseForFolder(0, "Chon thu muc muon luu cac file de thi sau khi tron:", 0, defaultPath)
        If Not shFolder Is Nothing Then
            ChonThuMucLuu = shFolder.Self.Path
            Exit Function
        End If
    End If
    ChonThuMucLuu = ""
End Function

' =========================================================================================
' 3. THU TUC TRON DE CHINH
' =========================================================================================
Public Sub ChayTronDe(Optional ByVal duongDanLuu As String = "")
    Dim docGoc As Document
    Set docGoc = ActiveDocument
    If docGoc Is Nothing Then
        MsgBox "Vui long mo file Word de thi goc can tron!", vbExclamation, "Thong bao"
        Exit Sub
    End If

    ' 1. Kiem tra bang cau hinh, neu chua co thi tu dong chen va huong dan
    If Not DaCoBangCauHinh(docGoc) Then
        ChenBangCauHinh docGoc
        MsgBox "Add-in da chen 'BANG CAU HINH TRON DE' vao trang 1 cua de thi!" & vbCrLf & vbCrLf & _
               "- Thay co vui long kiem tra va sua Ten Truong, Mon hoc, Thoi gian, Ma de... o cot ben phai." & vbCrLf & _
               "- Sau khi sua xong, hay bam lai nut 'Tron de' de bat dau tao cac ma de!", vbInformation, "Khoi Tao Cau Hinh"
        Exit Sub
    End If

    ' 2. Doc cau hinh tu bang
    DocThongTinCauHinh docGoc
    GhiLog "DocThongTinCauHinh xong: SoDe=" & g_SoDe & ", Mon=" & g_TenMon

    Dim sPath As String
    If Len(duongDanLuu) > 0 Then
        sPath = duongDanLuu
    Else
        sPath = docGoc.Path
        If Len(sPath) = 0 Then sPath = Environ("USERPROFILE") & "\Desktop"
    End If

    ' 3. Doc cac cau hoi trong de goc
    Dim questionsP1() As TypeQuestion, countP1 As Long
    Dim questionsP2() As TypeQuestion, countP2 As Long
    Dim questionsP3() As TypeQuestion, countP3 As Long
    Dim questionsP4() As TypeQuestion, countP4 As Long

    GhiLog "Bat dau DocDeGoc..."
    DocDeGoc docGoc, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4
    GhiLog "DocDeGoc xong: P1=" & countP1 & ", P2=" & countP2 & ", P3=" & countP3 & ", P4=" & countP4

    Dim tongSoCau As Long
    tongSoCau = countP1 + countP2 + countP3 + countP4
    If tongSoCau = 0 Then
        MsgBox "Khong tim thay cau hoi hop le nao trong de thi!" & vbCrLf & vbCrLf & _
               "- Tong so doan van da quet: " & docGoc.Paragraphs.count & vbCrLf & _
               "- Thay co kiem tra cac cau hoi bat dau bang 'Cau 1.', 'Cau 2:'..." & vbCrLf & _
               "- Cac phan de thi: 'Phan I.', 'Phan II.', 'Phan III.'", vbExclamation, "Chu Y Dinh Dang De Thi"
        Exit Sub
    End If

    ' 4. Hoi nguoi dung chon thu muc muon luu file sau khi tron
    If Len(duongDanLuu) = 0 Then
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
                ' Giu nguyen sPath
            Else
                MsgBox "Da huy thao tac tron de.", vbInformation, "Thong bao"
                Exit Sub
            End If
        End If
    End If
    If Right(sPath, 1) = Application.PathSeparator Then sPath = Left(sPath, Len(sPath) - 1)

    Application.ScreenUpdating = False
    Application.DisplayAlerts = wdAlertsNone

    ' Khoi tao mang luu dap an cho tat ca cac ma de
    Dim ansP1() As String, ansP2() As String, ansP3() As String
    If countP1 > 0 Then ReDim ansP1(1 To g_SoDe, 1 To countP1)
    If countP2 > 0 Then ReDim ansP2(1 To g_SoDe, 1 To countP2)
    If countP3 > 0 Then ReDim ansP3(1 To g_SoDe, 1 To countP3)

    Dim d As Long, maDe As String
    Randomize

    ' 5. Vong lap tao tung ma de thi Word
    For d = 1 To g_SoDe
        maDe = g_ArrMaDe(d)

        Dim docNew As Document
        Set docNew = Documents.Add

        ' Can le trang A4 chuan van ban
        With docNew.PageSetup
            .PaperSize = wdPaperA4
            .TopMargin = CentimetersToPoints(1.5)
            .BottomMargin = CentimetersToPoints(1.5)
            .LeftMargin = CentimetersToPoints(1.8)
            .RightMargin = CentimetersToPoints(1.5)
            .HeaderDistance = CentimetersToPoints(1.0)
            .FooterDistance = CentimetersToPoints(1.0)
        End With

        ' Chen tieu de de thi chuan dep theo anh va de 0111.docx
        GhiLog "Bat dau tao ma de: " & maDe
        ChenHeaderDeThi docNew, maDe
        GhiLog "ChenHeaderDeThi xong cho " & maDe

        ' Xuat lan luot cac phan cau hoi da duoc xao tron
        If countP1 > 0 Then XuatPhanI docNew, questionsP1, countP1, d, ansP1, g_TronP1
        If countP2 > 0 Then XuatPhanII docNew, questionsP2, countP2, d, ansP2, g_TronP2
        If countP3 > 0 Then XuatPhanIII docNew, questionsP3, countP3, d, ansP3, g_TronP3
        If g_CoTuLuan And countP4 > 0 Then XuatPhanIV docNew, questionsP4, countP4, d, g_TronTuLuan

        ' Chen chu '------ HET ------' cuoi de
        ChenFooterDeThi docNew

        ' Chen footer danh so trang: Trang X/Y - Ma de ...
        ChenPageFooter docNew, maDe

        ' Luu file Word ma de
        Dim outDocPath As String
        outDocPath = sPath & Application.PathSeparator & "Made_" & maDe & ".docx"
        GhiLog "Luu file ma de: " & outDocPath
        docNew.SaveAs2 outDocPath, wdFormatXMLDocument
        GhiLog "Da luu xong ma de: " & maDe
        docNew.Close False
    Next d

    ' 6. Xuat file Dap an tong hop Word (.docx)
    GhiLog "Bat dau xuat DapAn_TongHop.docx..."
    XuatFileDapAnTongHop sPath, countP1, countP2, countP3, ansP1, ansP2, ansP3
    GhiLog "Xuat DapAn_TongHop.docx xong!"

    ' 7. Xuat file Dap an tong hop Excel (.xlsx) chuan form DapAn_TOAN_THPT 2025.xlsx
    GhiLog "Bat dau xuat DapAn_TongHop.xlsx..."
    XuatFileExcelDapAn sPath, countP1, countP2, countP3, ansP1, ansP2, ansP3
    GhiLog "Xuat DapAn_TongHop.xlsx xong!"

    Application.ScreenUpdating = True
    Application.DisplayAlerts = wdAlertsAll

    Dim msgHoanThanh As String
    msgHoanThanh = "DA TRON XONG " & g_SoDe & " MA DE THI VA XUAT FILE DAP AN TONG HOP!" & vbCrLf & vbCrLf & _
                   "- So luong cau hoi da tron:" & vbCrLf & _
                   "  + Phan I (Trac nghiem ABCD): " & countP1 & " cau" & vbCrLf & _
                   "  + Phan II (Dung/Sai): " & countP2 & " cau" & vbCrLf & _
                   "  + Phan III (Tra loi ngan): " & countP3 & " cau" & vbCrLf & _
                   IIf(g_CoTuLuan And countP4 > 0, "  + Phan Tu luan: " & countP4 & " cau" & vbCrLf, "") & _
                   "- Thu muc da luu: " & sPath & vbCrLf & _
                   "- Cac file da tao: Made_...docx, DapAn_TongHop.docx, DapAn_TongHop.xlsx" & vbCrLf & vbCrLf & _
                   "Thay co co muon mo thu muc chua cac file vua tao khong?"

    If Len(duongDanLuu) = 0 Then
        Dim hoiMoFolder As VbMsgBoxResult
        hoiMoFolder = MsgBox(msgHoanThanh, vbYesNo + vbInformation, "Tron De Thanh Cong")
        If hoiMoFolder = vbYes Then
            On Error Resume Next
            Shell "explorer.exe """ & sPath & """", vbNormalFocus
            On Error GoTo 0
        End If
    End If
End Sub

' =========================================================================================
' 4. BANG CAU HINH THONG MINH CHEN TRUC TIEP VAO FILE WORD
' =========================================================================================
Public Sub ChenBangCauHinh(Optional ByVal doc As Document = Nothing)
    If doc Is Nothing Then Set doc = ActiveDocument
    Dim rng As Range
    Set rng = doc.Range(0, 0)

    Dim tbl As Table
    Set tbl = doc.Tables.Add(Range:=rng, NumRows:=12, NumColumns:=2)
    tbl.Borders.Enable = True
    tbl.Columns(1).Width = CentimetersToPoints(6.5)
    tbl.Columns(2).Width = CentimetersToPoints(10.5)

    tbl.Cell(1, 1).Merge tbl.Cell(1, 2)
    With tbl.Cell(1, 1).Range
        .text = "=== BANG CAU HINH TRON DE THI (THAY CO SUA TRUC TIEP COT PHAI) ==="
        .Font.Name = "Times New Roman"
        .Font.Bold = True
        .Font.Size = 12
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .Shading.BackgroundPatternColor = wdColorGray15
    End With

    ' Khoi tao mac dinh dung theo yeu cau cua nguoi dung
    GhiDongCauHinh tbl, 2, "Ten So GD&DT:", "S" & ChrW(7902) & " GD&" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
    GhiDongCauHinh tbl, 3, "Ten Truong:", "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
    GhiDongCauHinh tbl, 4, "Ten Ki thi / Bai kiem tra:", ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    GhiDongCauHinh tbl, 5, "Nam hoc:", "2026 - 2027"
    GhiDongCauHinh tbl, 6, "Mon hoc:", "To" & ChrW(225) & "n"
    GhiDongCauHinh tbl, 7, "Khoi lop:", "12"
    GhiDongCauHinh tbl, 8, "Thoi gian lam bai (phut):", "90"
    GhiDongCauHinh tbl, 9, "So de can tao:", "4"
    GhiDongCauHinh tbl, 10, "Danh sach Ma de (cach nhau bang dau phay):", "1011, 1012, 1013, 1014"
    GhiDongCauHinh tbl, 11, "Co phan Tu luan hay khong? (Dien 'Co' hoac 'Khong'):", "Khong"
    GhiDongCauHinh tbl, 12, "Tuy chon dao dap an (Dien 'Co' hoac 'Khong'):", "Tron P1: Co | Tron P2: Khong | Tron P3: Co"

    Set rng = doc.Range(tbl.Range.End, tbl.Range.End)
    rng.InsertParagraphAfter
End Sub

Private Sub GhiDongCauHinh(tbl As Table, r As Long, tieuDe As String, giaTriMacDinh As String)
    With tbl.Cell(r, 1).Range
        .text = tieuDe
        .Font.Name = "Times New Roman"
        .Font.Bold = True
        .Font.Size = 11
    End With
    With tbl.Cell(r, 2).Range
        .text = giaTriMacDinh
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.ColorIndex = wdBlue
    End With
End Sub

Public Function DaCoBangCauHinh(Optional ByVal doc As Document = Nothing) As Boolean
    If doc Is Nothing Then Set doc = ActiveDocument
    DaCoBangCauHinh = False
    If doc.Tables.count > 0 Then
        Dim t As String
        On Error Resume Next
        t = doc.Tables(1).Cell(1, 1).Range.text
        If InStr(1, t, "BANG CAU HINH TRON DE") > 0 Then
            DaCoBangCauHinh = True
        End If
        On Error GoTo 0
    End If
End Function

Public Sub DocThongTinCauHinh(Optional ByVal doc As Document = Nothing)
    If doc Is Nothing Then Set doc = ActiveDocument
    Dim tbl As Table
    Set tbl = doc.Tables(1)

    ' Gia tri mac dinh chuan theo yeu cau cua nguoi dung
    g_TenSo = "S" & ChrW(7902) & " GD&" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
    g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
    g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    g_NamHoc = "2026 - 2027"
    g_TenMon = "To" & ChrW(225) & "n"
    g_TenLop = "12"
    g_ThoiGian = "90"
    g_SoDe = 4
    g_CoTuLuan = False
    g_TronP1 = True
    g_TronP2 = False
    g_TronP3 = True
    g_TronTuLuan = False

    Dim r As Long, lbl As String, val As String
    For r = 2 To tbl.Rows.count
        lbl = UCase(BoDauTiengViet(LayGiaTriCell(tbl.Cell(r, 1))))
        val = LayGiaTriCell(tbl.Cell(r, 2))

        If InStr(1, lbl, "SO GD") > 0 Then
            If Len(val) > 0 Then g_TenSo = val
        ElseIf InStr(1, lbl, "TRUONG") > 0 Then
            If Len(val) > 0 Then g_TenTruong = val
        ElseIf InStr(1, lbl, "KI THI") > 0 Or InStr(1, lbl, "KY THI") > 0 Then
            If Len(val) > 0 Then g_TenKyThi = val
        ElseIf InStr(1, lbl, "NAM HOC") > 0 Then
            If Len(val) > 0 Then g_NamHoc = val
        ElseIf InStr(1, lbl, "MON") > 0 Then
            If Len(val) > 0 Then g_TenMon = val
        ElseIf InStr(1, lbl, "LOP") > 0 Then
            If Len(val) > 0 Then g_TenLop = val
        ElseIf InStr(1, lbl, "THOI GIAN") > 0 Then
            If Len(val) > 0 Then g_ThoiGian = val
        ElseIf InStr(1, lbl, "SO DE") > 0 Then
            If IsNumeric(val) Then g_SoDe = CLng(val) Else g_SoDe = 4
            If g_SoDe < 1 Then g_SoDe = 4
        ElseIf InStr(1, lbl, "MA DE") > 0 Then
            Dim arrRaw() As String, k As Long
            arrRaw = Split(val, ",")
            ReDim g_ArrMaDe(1 To g_SoDe)
            For k = 1 To g_SoDe
                If k - 1 <= UBound(arrRaw) Then
                    g_ArrMaDe(k) = Trim(arrRaw(k - 1))
                Else
                    g_ArrMaDe(k) = CStr(1010 + k)
                End If
                If Len(g_ArrMaDe(k)) = 0 Then g_ArrMaDe(k) = CStr(1010 + k)
            Next k
        ElseIf InStr(1, lbl, "TU LUAN") > 0 Then
            If InStr(1, UCase(BoDauTiengViet(val)), "CO") > 0 Then g_CoTuLuan = True Else g_CoTuLuan = False
        ElseIf InStr(1, lbl, "DAO DAP AN") > 0 Or InStr(1, lbl, "TRON") > 0 Then
            Dim valUpper As String
            valUpper = UCase(BoDauTiengViet(val))
            g_TronP1 = (InStr(1, valUpper, "TRON P1: CO") > 0 Or InStr(1, valUpper, "P1: CO") > 0)
            g_TronP2 = (InStr(1, valUpper, "TRON P2: CO") > 0 Or InStr(1, valUpper, "P2: CO") > 0)
            g_TronP3 = (InStr(1, valUpper, "TRON P3: CO") > 0 Or InStr(1, valUpper, "P3: CO") > 0)
        End If
    Next r

    If g_SoDe < 1 Then g_SoDe = 4
    If (Not Not g_ArrMaDe) = 0 Then
        ReDim g_ArrMaDe(1 To g_SoDe)
        For k = 1 To g_SoDe: g_ArrMaDe(k) = CStr(1010 + k): Next k
    End If
End Sub

Private Function LayGiaTriCell(c As Cell) As String
    Dim t As String
    t = c.Range.text
    t = Replace(t, vbCr, "")
    t = Replace(t, vbLf, "")
    t = Replace(t, Chr(7), "")
    LayGiaTriCell = Trim(t)
End Function

' =========================================================================================
' 5. CHEN HEADER DE THI CHUAN DE 0111.DOCX & ANH NGUOI DUNG
' =========================================================================================
Public Sub ChenHeaderDeThi(doc As Document, maDe As String)
    Dim rng As Range
    Set rng = doc.Range(0, 0)

    ' Fallback gia tri mac dinh neu chua khoi tao
    If Len(Trim(g_TenSo)) = 0 Then g_TenSo = "S" & ChrW(7902) & " GD&" & ChrW(272) & "T " & ChrW(272) & ChrW(7854) & "K L" & ChrW(7854) & "K"
    If Len(Trim(g_TenTruong)) = 0 Then g_TenTruong = "TR" & ChrW(431) & ChrW(7900) & "NG THPT S" & ChrW(7888) & " 1 L" & ChrW(202) & " H" & ChrW(7890) & "NG PHONG"
    If Len(Trim(g_TenKyThi)) = 0 Then g_TenKyThi = ChrW(272) & ChrW(7872) & " KI" & ChrW(7874) & "M TRA GI" & ChrW(7918) & "A H" & ChrW(7884) & "C K" & ChrW(204) & " I"
    If Len(Trim(g_NamHoc)) = 0 Then g_NamHoc = "2026 - 2027"
    If Len(Trim(g_TenMon)) = 0 Then g_TenMon = "To" & ChrW(225) & "n"
    If Len(Trim(g_TenLop)) = 0 Then g_TenLop = "12"
    If Len(Trim(g_ThoiGian)) = 0 Then g_ThoiGian = "90"

    ' BẢNG 1: THÔNG TIN TRƯỜNG & KỲ THI (1 hàng, 2 cột, không viền)
    Dim tbl1 As Table
    Set tbl1 = doc.Tables.Add(Range:=rng, NumRows:=1, NumColumns:=2)
    tbl1.Borders.Enable = False
    tbl1.Columns(1).Width = CentimetersToPoints(7.5)
    tbl1.Columns(2).Width = CentimetersToPoints(10.0)

    ' Cột trái: Tên Sở, Tên Trường, gạch ngang, (Đề thi có 04 trang)
    With tbl1.Cell(1, 1).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .ParagraphFormat.SpaceBefore = 0
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .text = g_TenSo & vbCr & _
                UCase(g_TenTruong) & vbCr & _
                "____________________" & vbCr & _
                "(" & ChrW(272) & ChrW(7873) & " thi c" & ChrW(243) & " 04 trang)"
        .Paragraphs(1).Range.Font.Bold = False
        .Paragraphs(2).Range.Font.Bold = True
        .Paragraphs(3).Range.Font.Bold = False
        .Paragraphs(4).Range.Font.Bold = False
        .Paragraphs(4).Range.Font.Italic = True
    End With

    ' Cột phải: Kỳ thi, Năm học, Môn - Khối, Thời gian
    Dim sDongNamHoc As String: sDongNamHoc = ""
    If Len(Trim(g_NamHoc)) > 0 Then
        Dim sNH As String: sNH = Trim(g_NamHoc)
        If InStr(1, UCase(BoDauTiengViet(sNH)), "NAM HOC") > 0 Then
            sDongNamHoc = UCase(sNH)
        Else
            sDongNamHoc = "N" & ChrW(258) & "M H" & ChrW(7884) & "C " & UCase(sNH)
        End If
    End If

    With tbl1.Cell(1, 2).Range
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.LineSpacingRule = wdLineSpaceSingle
        .ParagraphFormat.SpaceAfter = 0
        .ParagraphFormat.SpaceBefore = 0
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .text = UCase(Trim(g_TenKyThi)) & vbCr & _
                sDongNamHoc & vbCr & _
                "M" & ChrW(212) & "N " & g_TenMon & " " & ChrW(8211) & " Kh" & ChrW(7889) & "i " & g_TenLop & vbCr & _
                "Th" & ChrW(7901) & "i gian l" & ChrW(224) & "m b" & ChrW(224) & "i : " & g_ThoiGian & " ph" & ChrW(250) & "t" & vbCr & _
                "(kh" & ChrW(244) & "ng k" & ChrW(7875) & " th" & ChrW(7901) & "i gian ph" & ChrW(225) & "t " & ChrW(273) & ChrW(7873) & ")"
        .Paragraphs(1).Range.Font.Bold = True
        .Paragraphs(2).Range.Font.Bold = True
        .Paragraphs(3).Range.Font.Bold = True
        .Paragraphs(4).Range.Font.Bold = False: .Paragraphs(4).Range.Font.Italic = True
        .Paragraphs(5).Range.Font.Bold = False: .Paragraphs(5).Range.Font.Italic = True
    End With

    ' BẢNG 2: HỌ VÀ TÊN HỌC SINH + HỘP ĐÓNG KHUNG MÃ ĐỀ (Khớp 100% ảnh người dùng gửi)
    Set rng = doc.Range(tbl1.Range.End, tbl1.Range.End)
    rng.InsertParagraphAfter
    rng.Collapse wdCollapseEnd

    Dim tbl2 As Table
    Set tbl2 = doc.Tables.Add(Range:=rng, NumRows:=1, NumColumns:=2)
    tbl2.Borders.Enable = False
    tbl2.Columns(1).Width = CentimetersToPoints(14.0)
    tbl2.Columns(2).Width = CentimetersToPoints(3.5)

    ' Ô trái: Họ và tên học sinh... Số báo danh...
    With tbl2.Cell(1, 1).Range
        .ParagraphFormat.Alignment = wdAlignParagraphLeft
        .ParagraphFormat.SpaceBefore = 4
        .ParagraphFormat.SpaceAfter = 4
        .Font.Name = "Times New Roman"
        .Font.Size = 11
        .Font.Bold = False
        .Font.Italic = False
        .text = "H" & ChrW(7885) & " v" & ChrW(224) & " t" & ChrW(234) & "n h" & ChrW(7885) & "c sinh :..................................................... S" & ChrW(7889) & " b" & ChrW(225) & "o danh : ..................."
    End With

    ' Ô phải: Hộp đóng khung hình chữ nhật cho Mã đề
    With tbl2.Cell(1, 2)
        .Borders(wdBorderTop).LineStyle = wdLineStyleSingle
        .Borders(wdBorderBottom).LineStyle = wdLineStyleSingle
        .Borders(wdBorderLeft).LineStyle = wdLineStyleSingle
        .Borders(wdBorderRight).LineStyle = wdLineStyleSingle
        .VerticalAlignment = wdCellAlignVerticalCenter
        With .Range
            .ParagraphFormat.Alignment = wdAlignParagraphCenter
            .ParagraphFormat.SpaceBefore = 2
            .ParagraphFormat.SpaceAfter = 2
            .Font.Name = "Times New Roman"
            .Font.Size = 12
            .Font.Bold = True
            .text = "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873) & " " & maDe
        End With
    End With

    ' ĐƯỜNG KẺ NGANG PHÂN CÁCH SUỐT TRANG (DƯỚI BẢNG 2)
    Set rng = doc.Range(tbl2.Range.End, tbl2.Range.End)
    rng.InsertParagraphAfter
    rng.Collapse wdCollapseEnd
    With rng
        .text = ""
        .ParagraphFormat.SpaceBefore = 0
        .ParagraphFormat.SpaceAfter = 6
        .Borders(wdBorderBottom).LineStyle = wdLineStyleSingle
        .Borders(wdBorderBottom).LineWidth = wdLineWidth075pt
    End With
End Sub

Private Sub ChenFooterDeThi(doc As Document)
    Dim rng As Range
    Set rng = doc.Range
    rng.Collapse wdCollapseEnd
    rng.InsertParagraphAfter
    rng.Collapse wdCollapseEnd

    With rng
        .text = "------ H" & ChrW(7870) & "T ------" & vbCrLf
        .Font.Name = "Times New Roman"
        .Font.Size = 12
        .Font.Bold = True
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
        .ParagraphFormat.SpaceBefore = 12
        .ParagraphFormat.SpaceAfter = 6
    End With
End Sub

Private Sub ChenPageFooter(doc As Document, maDe As String)
    Dim sec As Section
    For Each sec In doc.Sections
        With sec.Footers(wdHeaderFooterPrimary).Range
            .text = "Trang "
            .ParagraphFormat.Alignment = wdAlignParagraphRight
            .Font.Name = "Times New Roman"
            .Font.Size = 10
            .Font.Italic = True

            Dim rFld As Range
            Set rFld = .Duplicate: rFld.Collapse wdCollapseEnd
            sec.Footers(wdHeaderFooterPrimary).Range.Fields.Add Range:=rFld, Type:=wdFieldPage

            Set rFld = sec.Footers(wdHeaderFooterPrimary).Range: rFld.Collapse wdCollapseEnd
            rFld.InsertAfter "/"

            Set rFld = sec.Footers(wdHeaderFooterPrimary).Range: rFld.Collapse wdCollapseEnd
            sec.Footers(wdHeaderFooterPrimary).Range.Fields.Add Range:=rFld, Type:=wdFieldNumPages

            Set rFld = sec.Footers(wdHeaderFooterPrimary).Range: rFld.Collapse wdCollapseEnd
            rFld.InsertAfter " - M" & ChrW(227) & " " & ChrW(273) & ChrW(7873) & " " & maDe
        End With
    Next sec
End Sub

' Helper cat bo khoang trang, tab, xuong dong o cuoi Range
Private Sub TrimTrailingRange(ByRef r As Range)
    Do While r.End > r.Start
        Dim lastChar As String
        lastChar = Right(r.text, 1)
        If lastChar = vbCr Or lastChar = vbLf Or lastChar = vbTab Or lastChar = Chr(7) Then
            r.End = r.End - 1
        Else
            Exit Do
        End If
    Loop
End Sub

' =========================================================================================
' 6. TRICH XUAT & PHAN TICH DE THI GOC
' =========================================================================================
Private Sub DocDeGoc(docGoc As Document, questionsP1() As TypeQuestion, countP1 As Long, questionsP2() As TypeQuestion, countP2 As Long, questionsP3() As TypeQuestion, countP3 As Long, questionsP4() As TypeQuestion, countP4 As Long)

    countP1 = 0: countP2 = 0: countP3 = 0: countP4 = 0
    ReDim questionsP1(1 To 100)
    ReDim questionsP2(1 To 100)
    ReDim questionsP3(1 To 100)
    ReDim questionsP4(1 To 100)

    Set g_rngTitleP1 = Nothing
    Set g_rngTitleP2 = Nothing
    Set g_rngTitleP3 = Nothing
    Set g_rngTitleP4 = Nothing

    Dim curPart As Long: curPart = 1
    Dim inQuestion As Boolean: inQuestion = False
    Dim curQ As TypeQuestion

    Dim i As Long, p As Paragraph, pText As String, sNorm As String, sListStr As String
    For i = 1 To docGoc.Paragraphs.count
        Set p = docGoc.Paragraphs(i)

        ' Bo qua bang cau hinh va bang tieu de dau file
        Dim bInConfigOrHeaderTbl As Boolean: bInConfigOrHeaderTbl = False
        If p.Range.Tables.count > 0 Then
            Dim tblText As String
            On Error Resume Next
            tblText = p.Range.Tables(1).Cell(1, 1).Range.text
            On Error GoTo 0
            If InStr(1, tblText, "BANG CAU HINH TRON DE") > 0 Or _
               InStr(1, tblText, "SO GD") > 0 Or InStr(1, tblText, "S" & ChrW(7902)) > 0 Or _
               InStr(1, tblText, "THPT") > 0 Or InStr(1, tblText, "TR" & ChrW(431) & ChrW(7900) & "NG") > 0 Then
                bInConfigOrHeaderTbl = True
            End If
        End If

        If Not bInConfigOrHeaderTbl Then
            pText = p.Range.text
            sNorm = ChuanHoaChuoi(pText)
            sListStr = ""
            On Error Resume Next
            sListStr = p.Range.ListFormat.ListString
            On Error GoTo 0

            ' Kiem tra chuyen phan
            If InStr(1, sNorm, "PHAN I") > 0 Or InStr(1, sNorm, "PHAN 1") > 0 Then
                LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
                curPart = 1: inQuestion = False
                Set g_rngTitleP1 = p.Range.Duplicate
            ElseIf InStr(1, sNorm, "PHAN II") > 0 Or InStr(1, sNorm, "PHAN 2") > 0 Then
                LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
                curPart = 2: inQuestion = False
                Set g_rngTitleP2 = p.Range.Duplicate
            ElseIf InStr(1, sNorm, "PHAN III") > 0 Or InStr(1, sNorm, "PHAN 3") > 0 Then
                LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
                curPart = 3: inQuestion = False
                Set g_rngTitleP3 = p.Range.Duplicate
            ElseIf InStr(1, sNorm, "PHAN IV") > 0 Or InStr(1, sNorm, "TU LUAN") > 0 Then
                LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
                curPart = 4: inQuestion = False
                Set g_rngTitleP4 = p.Range.Duplicate

            ' Kiem tra bat dau cau hoi moi
            ElseIf IsCauMoi(sNorm, sListStr) Then
                LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
                inQuestion = True
                curQ.PartType = curPart
                curQ.numOptions = 0
                curQ.layoutType = 4
                curQ.KeyText = ""
                ReDim curQ.Options(1 To 4)
                Set curQ.rngHeader = p.Range.Duplicate

            ' Kiem tra cac phuong an trong cau hoi
            ElseIf inQuestion Then
                If curPart = 1 Then
                    ' Truoc het kiem tra xem doan co chua nhieu phuong an (A, B, C, D) hay khong
                    If Not XuLyPhuongAnTrenDoan(p, curQ) Then
                        Dim optLabelP1 As String
                        optLabelP1 = LayNhanP1(sNorm, sListStr)
                        If optLabelP1 <> "" Then
                            curQ.numOptions = curQ.numOptions + 1
                            If curQ.numOptions > UBound(curQ.Options) Then ReDim Preserve curQ.Options(1 To curQ.numOptions)
                            curQ.Options(curQ.numOptions).Label = optLabelP1
                            Set curQ.Options(curQ.numOptions).rngContent = p.Range.Duplicate
                            TrimTrailingRange curQ.Options(curQ.numOptions).rngContent
                            curQ.Options(curQ.numOptions).isCorrect = KiemTraGachChan(p.Range)
                            curQ.layoutType = 1 ' Moi phuong an 1 dong
                        Else
                            If curQ.numOptions = 0 Then curQ.rngHeader.End = p.Range.End
                        End If
                    End If

                ElseIf curPart = 2 Then
                    Dim optLabelP2 As String
                    optLabelP2 = LayNhanP2(sNorm, sListStr)
                    If optLabelP2 <> "" Then
                        curQ.numOptions = curQ.numOptions + 1
                        If curQ.numOptions > UBound(curQ.Options) Then ReDim Preserve curQ.Options(1 To curQ.numOptions)
                        curQ.Options(curQ.numOptions).Label = optLabelP2
                        Set curQ.Options(curQ.numOptions).rngContent = p.Range.Duplicate
                        TrimTrailingRange curQ.Options(curQ.numOptions).rngContent
                        curQ.Options(curQ.numOptions).isCorrect = KiemTraGachChan(p.Range)
                    Else
                        If curQ.numOptions = 0 Then curQ.rngHeader.End = p.Range.End
                    End If

                ElseIf curPart = 3 Then
                    Dim ansLine As String
                    ansLine = TrichXuatDapAnPhan3(p.Range.text)
                    If ansLine <> "" And ansLine <> "," Then curQ.KeyText = ansLine
                    Dim sCleanLine As String
                    sCleanLine = Trim(Replace(Replace(Replace(p.Range.text, vbCr, ""), vbLf, ""), Chr(7), ""))
                    If (Left(sCleanLine, 1) = "<" And Right(sCleanLine, 1) = ">") Or _
                       (Left(sCleanLine, 1) = "[" And Right(sCleanLine, 1) = "]") Then
                        ' Bo qua the dap an rieng
                    Else
                        curQ.rngHeader.End = p.Range.End
                    End If

                ElseIf curPart = 4 Then
                    curQ.rngHeader.End = p.Range.End
                End If
            End If
        End If
    Next i

    LuuCauHienTai curQ, curPart, questionsP1, countP1, questionsP2, countP2, questionsP3, countP3, questionsP4, countP4, inQuestion
End Sub

' Xu ly truong hop 4 phuong an (hoac 2 phuong an) nam chung tren 1 doan van
Private Function XuLyPhuongAnTrenDoan(p As Paragraph, ByRef curQ As TypeQuestion) As Boolean
    XuLyPhuongAnTrenDoan = False
    Dim t As String: t = p.Range.text

    ' Tim vi tri cac nhan A., B., C., D.
    Dim posA As Long, posB As Long, posC As Long, posD As Long
    posA = TimViTriNhan(t, "A")
    posB = TimViTriNhan(t, "B")
    posC = TimViTriNhan(t, "C")
    posD = TimViTriNhan(t, "D")

    ' Truong hop 1: Co du ca 4 phuong an tren 1 doan (thuong gap nhat, giong de 0111.docx)
    If posA > 0 And posB > posA And posC > posB And posD > posC Then
        curQ.numOptions = 4
        ReDim curQ.Options(1 To 4)
        curQ.layoutType = 4 ' 4 phuong an / dong

        Dim doc As Document: Set doc = p.Range.Document
        Dim pStart As Long: pStart = p.Range.Start
        Dim pEnd As Long: pEnd = p.Range.End

        ' Trich xuat Range tung phuong an va loai bo tab, cach, xuong dong o cuoi
        Set curQ.Options(1).rngContent = doc.Range(pStart + posA - 1, pStart + posB - 1)
        TrimTrailingRange curQ.Options(1).rngContent

        Set curQ.Options(2).rngContent = doc.Range(pStart + posB - 1, pStart + posC - 1)
        TrimTrailingRange curQ.Options(2).rngContent

        Set curQ.Options(3).rngContent = doc.Range(pStart + posC - 1, pStart + posD - 1)
        TrimTrailingRange curQ.Options(3).rngContent

        Set curQ.Options(4).rngContent = doc.Range(pStart + posD - 1, pEnd)
        TrimTrailingRange curQ.Options(4).rngContent

        curQ.Options(1).Label = "A"
        curQ.Options(2).Label = "B"
        curQ.Options(3).Label = "C"
        curQ.Options(4).Label = "D"

        curQ.Options(1).isCorrect = KiemTraGachChan(curQ.Options(1).rngContent)
        curQ.Options(2).isCorrect = KiemTraGachChan(curQ.Options(2).rngContent)
        curQ.Options(3).isCorrect = KiemTraGachChan(curQ.Options(3).rngContent)
        curQ.Options(4).isCorrect = KiemTraGachChan(curQ.Options(4).rngContent)

        XuLyPhuongAnTrenDoan = True
        Exit Function
    End If

    ' Truong hop 2: Doan chua 2 phuong an (A, B hoac C, D)
    If posA > 0 And posB > posA And posC = 0 And posD = 0 Then
        curQ.layoutType = 2
        Dim doc2 As Document: Set doc2 = p.Range.Document
        Dim pSt2 As Long: pSt2 = p.Range.Start
        Dim pEn2 As Long: pEn2 = p.Range.End

        curQ.numOptions = 2
        ReDim curQ.Options(1 To 4)
        Set curQ.Options(1).rngContent = doc2.Range(pSt2 + posA - 1, pSt2 + posB - 1)
        TrimTrailingRange curQ.Options(1).rngContent

        Set curQ.Options(2).rngContent = doc2.Range(pSt2 + posB - 1, pEn2)
        TrimTrailingRange curQ.Options(2).rngContent

        curQ.Options(1).Label = "A": curQ.Options(2).Label = "B"
        curQ.Options(1).isCorrect = KiemTraGachChan(curQ.Options(1).rngContent)
        curQ.Options(2).isCorrect = KiemTraGachChan(curQ.Options(2).rngContent)
        XuLyPhuongAnTrenDoan = True
        Exit Function
    ElseIf posC > 0 And posD > posC And posA = 0 And posB = 0 Then
        If curQ.numOptions = 2 Then
            Dim doc3 As Document: Set doc3 = p.Range.Document
            Dim pSt3 As Long: pSt3 = p.Range.Start
            Dim pEn3 As Long: pEn3 = p.Range.End
            curQ.numOptions = 4
            Set curQ.Options(3).rngContent = doc3.Range(pSt3 + posC - 1, pSt3 + posD - 1)
            TrimTrailingRange curQ.Options(3).rngContent

            Set curQ.Options(4).rngContent = doc3.Range(pSt3 + posD - 1, pEn3)
            TrimTrailingRange curQ.Options(4).rngContent

            curQ.Options(3).Label = "C": curQ.Options(4).Label = "D"
            curQ.Options(3).isCorrect = KiemTraGachChan(curQ.Options(3).rngContent)
            curQ.Options(4).isCorrect = KiemTraGachChan(curQ.Options(4).rngContent)
            XuLyPhuongAnTrenDoan = True
            Exit Function
        End If
    End If
End Function

Private Function TimViTriNhan(s As String, nhan As String) As Long
    TimViTriNhan = 0
    Dim pats(1 To 6) As String, pIdx As Long, pos As Long
    pats(1) = vbTab & nhan & "."
    pats(2) = vbTab & nhan & ":"
    pats(3) = " " & nhan & "."
    pats(4) = " " & nhan & ":"
    pats(5) = vbCr & nhan & "."
    pats(6) = nhan & "."

    ' Uu tien pattern co Tab hoac space truoc
    For pIdx = 1 To 6
        pos = InStr(1, s, pats(pIdx), vbTextCompare)
        If pos > 0 Then
            If pIdx = 1 Or pIdx = 2 Or pIdx = 3 Or pIdx = 4 Or pIdx = 5 Then
                TimViTriNhan = pos + 1
            Else
                If pos = 1 Or Mid(s, pos - 1, 1) = vbTab Or Mid(s, pos - 1, 1) = " " Then
                    TimViTriNhan = pos
                End If
            End If
            If TimViTriNhan > 0 Then Exit Function
        End If
    Next pIdx
End Function

Private Sub LuuCauHienTai(ByRef curQ As TypeQuestion, curPart As Long, _
                          ByRef questionsP1() As TypeQuestion, ByRef countP1 As Long, _
                          ByRef questionsP2() As TypeQuestion, ByRef countP2 As Long, _
                          ByRef questionsP3() As TypeQuestion, ByRef countP3 As Long, _
                          ByRef questionsP4() As TypeQuestion, ByRef countP4 As Long, _
                          ByRef inQuestion As Boolean)
    If Not inQuestion Then Exit Sub

    If curPart = 1 And curQ.numOptions > 0 Then
        countP1 = countP1 + 1
        If countP1 > UBound(questionsP1) Then ReDim Preserve questionsP1(1 To countP1 + 50)
        questionsP1(countP1) = curQ
    ElseIf curPart = 2 And curQ.numOptions > 0 Then
        countP2 = countP2 + 1
        If countP2 > UBound(questionsP2) Then ReDim Preserve questionsP2(1 To countP2 + 50)
        questionsP2(countP2) = curQ
    ElseIf curPart = 3 Then
        countP3 = countP3 + 1
        If countP3 > UBound(questionsP3) Then ReDim Preserve questionsP3(1 To countP3 + 50)
        questionsP3(countP3) = curQ
    ElseIf curPart = 4 Then
        countP4 = countP4 + 1
        If countP4 > UBound(questionsP4) Then ReDim Preserve questionsP4(1 To countP4 + 50)
        questionsP4(countP4) = curQ
    End If

    inQuestion = False
End Sub

' =========================================================================================
' 7. XUAT CAC PHAN CAU HOI DA TRON VAO DE THI MOI
' =========================================================================================
Private Sub XuatPhanI(docNew As Document, questions() As TypeQuestion, countQ As Long, _
                      deIdx As Long, ansP1() As String, tronCau As Boolean)
    Dim rng As Range
    Set rng = docNew.Range: rng.Collapse wdCollapseEnd

    If Not g_rngTitleP1 Is Nothing Then
        rng.FormattedText = g_rngTitleP1.FormattedText
    Else
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N I. C" & ChrW(226) & "u tr" & ChrW(7855) & "c nghi" & ChrW(7878) & "m nhi" & ChrW(7872) & "u ph" & ChrW(431) & ChrW(416) & "ng " & ChrW(225) & "n l" & ChrW(7921) & "a ch" & ChrW(7884) & "n. Th" & ChrW(237) & " sinh tr" & ChrW(7843) & " l" & ChrW(7901) & "i t" & ChrW(7913) & " c" & ChrW(226) & "u 1 " & ChrW(273) & ChrW(7871) & "n c" & ChrW(226) & "u " & countQ & "." & vbCrLf & _
                         "M" & ChrW(7895) & "i c" & ChrW(226) & "u h" & ChrW(7887) & "i th" & ChrW(237) & " sinh ch" & ChrW(7881) & " ch" & ChrW(7885) & "n m" & ChrW(7895) & "t ph" & ChrW(431) & ChrW(416) & "ng " & ChrW(225) & "n." & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
            .ParagraphFormat.Alignment = wdAlignParagraphLeft
            .ParagraphFormat.SpaceBefore = 8: .ParagraphFormat.SpaceAfter = 4
        End With
    End If

    Dim arrOrder() As Long
    If tronCau Then arrOrder = TaoMangTron(countQ) Else arrOrder = TaoMangNguyen(countQ)

    Dim i As Long, qIdx As Long, optOrder() As Long
    Dim j As Long, optIdx As Long
    Dim labels(1 To 4) As String
    labels(1) = "A": labels(2) = "B": labels(3) = "C": labels(4) = "D"

    For i = 1 To countQ
        qIdx = arrOrder(i)

        ' Xuat loi dan cua cau hoi
        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.FormattedText = questions(qIdx).rngHeader.FormattedText
        ChuanHoaDauCau rng, "C" & ChrW(226) & "u " & i & "."
        XoaKeyTag rng
        XoaGachChan rng

        ' Trộn thứ tự các phương án A, B, C, D
        optOrder = TaoMangTron(questions(qIdx).numOptions)

        ' Ghi nhan dap an dung sau khi tron
        ansP1(deIdx, i) = ""
        For j = 1 To questions(qIdx).numOptions
            optIdx = optOrder(j)
            If questions(qIdx).Options(optIdx).isCorrect Then
                ansP1(deIdx, i) = labels(j)
            End If
        Next j

        ' CANH CHINH PHUONG AN DEP THEO DUNG MAU de 0111.docx:
        Dim nOpt As Long: nOpt = questions(qIdx).numOptions
        Dim layout As Long: layout = questions(qIdx).layoutType
        If layout = 0 Then layout = 4

        ' TRUONG HOP 1: 4 phuong an tren 1 dong (co 4 TabStop chuan)
        If layout = 4 And nOpt = 4 Then
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            With rng.ParagraphFormat
                .TabStops.ClearAll
                .TabStops.Add Position:=CentimetersToPoints(0.5), Alignment:=wdAlignTabLeft
                .TabStops.Add Position:=CentimetersToPoints(4.55), Alignment:=wdAlignTabLeft
                .TabStops.Add Position:=CentimetersToPoints(9.24), Alignment:=wdAlignTabLeft
                .TabStops.Add Position:=CentimetersToPoints(13.51), Alignment:=wdAlignTabLeft
                .SpaceBefore = 2: .SpaceAfter = 4
            End With

            For j = 1 To 4
                optIdx = optOrder(j)
                Set rng = docNew.Range: rng.Collapse wdCollapseEnd
                Dim stPos As Long: stPos = rng.End
                rng.text = vbTab
                rng.Collapse wdCollapseEnd
                rng.FormattedText = questions(qIdx).Options(optIdx).rngContent.FormattedText
                Dim enPos As Long: enPos = docNew.Range.End - 1

                Dim rOptRange As Range
                Set rOptRange = docNew.Range(stPos, enPos)
                ChuanHoaNhanPhuongAn rOptRange, labels(j) & "."
                XoaGachChan rOptRange
            Next j
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            rng.InsertParagraphAfter

        ' TRUONG HOP 2: 2 phuong an tren 1 dong (2 dong x 2 phuong an)
        ElseIf layout = 2 And nOpt = 4 Then
            ' Dong 1: A va B
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            With rng.ParagraphFormat
                .TabStops.ClearAll
                .TabStops.Add Position:=CentimetersToPoints(0.5), Alignment:=wdAlignTabLeft
                .TabStops.Add Position:=CentimetersToPoints(9.0), Alignment:=wdAlignTabLeft
                .SpaceBefore = 2: .SpaceAfter = 2
            End With
            For j = 1 To 2
                optIdx = optOrder(j)
                Set rng = docNew.Range: rng.Collapse wdCollapseEnd
                Dim stPos2 As Long: stPos2 = rng.End
                rng.text = vbTab: rng.Collapse wdCollapseEnd
                rng.FormattedText = questions(qIdx).Options(optIdx).rngContent.FormattedText
                Dim enPos2 As Long: enPos2 = docNew.Range.End - 1

                Dim rOptRange2 As Range
                Set rOptRange2 = docNew.Range(stPos2, enPos2)
                ChuanHoaNhanPhuongAn rOptRange2, labels(j) & "."
                XoaGachChan rOptRange2
            Next j
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            rng.InsertParagraphAfter

            ' Dong 2: C va D
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            With rng.ParagraphFormat
                .TabStops.ClearAll
                .TabStops.Add Position:=CentimetersToPoints(0.5), Alignment:=wdAlignTabLeft
                .TabStops.Add Position:=CentimetersToPoints(9.0), Alignment:=wdAlignTabLeft
                .SpaceBefore = 0: .SpaceAfter = 4
            End With
            For j = 3 To 4
                optIdx = optOrder(j)
                Set rng = docNew.Range: rng.Collapse wdCollapseEnd
                Dim stPos3 As Long: stPos3 = rng.End
                rng.text = vbTab: rng.Collapse wdCollapseEnd
                rng.FormattedText = questions(qIdx).Options(optIdx).rngContent.FormattedText
                Dim enPos3 As Long: enPos3 = docNew.Range.End - 1

                Dim rOptRange3 As Range
                Set rOptRange3 = docNew.Range(stPos3, enPos3)
                ChuanHoaNhanPhuongAn rOptRange3, labels(j) & "."
                XoaGachChan rOptRange3
            Next j
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            rng.InsertParagraphAfter

        ' TRUONG HOP 3: Moi phuong an 1 dong
        Else
            For j = 1 To nOpt
                optIdx = optOrder(j)
                Set rng = docNew.Range: rng.Collapse wdCollapseEnd
                With rng.ParagraphFormat
                    .TabStops.ClearAll
                    .TabStops.Add Position:=CentimetersToPoints(0.5), Alignment:=wdAlignTabLeft
                    .SpaceBefore = 1: .SpaceAfter = 2
                End With
                Dim stPos4 As Long: stPos4 = rng.End
                rng.text = vbTab: rng.Collapse wdCollapseEnd
                rng.FormattedText = questions(qIdx).Options(optIdx).rngContent.FormattedText
                Dim enPos4 As Long: enPos4 = docNew.Range.End - 1

                Dim rOptRange4 As Range
                Set rOptRange4 = docNew.Range(stPos4, enPos4)
                ChuanHoaNhanPhuongAn rOptRange4, labels(j) & "."
                XoaGachChan rOptRange4
                Set rng = docNew.Range: rng.Collapse wdCollapseEnd
                rng.InsertParagraphAfter
            Next j
        End If
    Next i
End Sub

Private Sub XuatPhanII(docNew As Document, questions() As TypeQuestion, countQ As Long, _
                       deIdx As Long, ansP2() As String, tronMenhDe As Boolean)
    Dim rng As Range
    Set rng = docNew.Range: rng.Collapse wdCollapseEnd

    If Not g_rngTitleP2 Is Nothing Then
        rng.FormattedText = g_rngTitleP2.FormattedText
    Else
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N II. C" & ChrW(226) & "u tr" & ChrW(7855) & "c nghi" & ChrW(7878) & "m " & ChrW(273) & ChrW(250) & "ng sai. Th" & ChrW(237) & " sinh tr" & ChrW(7843) & " l" & ChrW(7901) & "i t" & ChrW(7913) & " c" & ChrW(226) & "u 1 " & ChrW(273) & ChrW(7871) & "n c" & ChrW(226) & "u " & countQ & "." & vbCrLf & _
                         "Trong m" & ChrW(7895) & "i " & ChrW(253) & " a), b), c), d) " & ChrW(7830) & " m" & ChrW(7895) & "i c" & ChrW(226) & "u, th" & ChrW(237) & " sinh ch" & ChrW(7885) & "n " & ChrW(273) & ChrW(250) & "ng ho" & ChrW(7863) & "c sai." & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
            .ParagraphFormat.Alignment = wdAlignParagraphLeft
            .ParagraphFormat.SpaceBefore = 8: .ParagraphFormat.SpaceAfter = 4
        End With
    End If

    Dim arrOrder() As Long: arrOrder = TaoMangTron(countQ)
    Dim i As Long, qIdx As Long, optOrder() As Long
    Dim j As Long, optIdx As Long
    Dim labels(1 To 4) As String
    labels(1) = "a": labels(2) = "b": labels(3) = "c": labels(4) = "d"

    For i = 1 To countQ
        qIdx = arrOrder(i)

        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.FormattedText = questions(qIdx).rngHeader.FormattedText
        ChuanHoaDauCau rng, "C" & ChrW(226) & "u " & i & "."

        If tronMenhDe Then
            optOrder = TaoMangTron(questions(qIdx).numOptions)
        Else
            optOrder = TaoMangNguyen(questions(qIdx).numOptions)
        End If

        Dim sAnsItem As String: sAnsItem = ""
        For j = 1 To questions(qIdx).numOptions
            optIdx = optOrder(j)
            If questions(qIdx).Options(optIdx).isCorrect Then
                sAnsItem = sAnsItem & ChrW(272) & ","
            Else
                sAnsItem = sAnsItem & "S,"
            End If

            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            With rng.ParagraphFormat
                .TabStops.ClearAll
                .TabStops.Add Position:=CentimetersToPoints(0.5), Alignment:=wdAlignTabLeft
                .SpaceBefore = 1: .SpaceAfter = 2
            End With
            Dim stPos As Long: stPos = rng.End
            rng.text = vbTab: rng.Collapse wdCollapseEnd
            rng.FormattedText = questions(qIdx).Options(optIdx).rngContent.FormattedText
            Dim enPos As Long: enPos = docNew.Range.End - 1

            Dim rOptRange As Range
            Set rOptRange = docNew.Range(stPos, enPos)
            ChuanHoaNhanPhuongAn rOptRange, labels(j) & ")"
            XoaGachChan rOptRange
            Set rng = docNew.Range: rng.Collapse wdCollapseEnd
            rng.InsertParagraphAfter
        Next j

        If Len(sAnsItem) > 0 Then sAnsItem = Left(sAnsItem, Len(sAnsItem) - 1)
        ansP2(deIdx, i) = sAnsItem
    Next i
End Sub

Private Sub XuatPhanIII(docNew As Document, questions() As TypeQuestion, countQ As Long, _
                        deIdx As Long, ansP3() As String, tronCau As Boolean)
    Dim rng As Range
    Set rng = docNew.Range: rng.Collapse wdCollapseEnd

    If Not g_rngTitleP3 Is Nothing Then
        rng.FormattedText = g_rngTitleP3.FormattedText
    Else
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N III. C" & ChrW(226) & "u tr" & ChrW(7855) & "c nghi" & ChrW(7878) & "m tr" & ChrW(7842) & " l" & ChrW(7901) & "i ng" & ChrW(7854) & "n. Th" & ChrW(237) & " sinh tr" & ChrW(7843) & " l" & ChrW(7901) & "i t" & ChrW(7913) & " c" & ChrW(226) & "u 1 " & ChrW(273) & ChrW(7871) & "n c" & ChrW(226) & "u " & countQ & "." & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
            .ParagraphFormat.Alignment = wdAlignParagraphLeft
            .ParagraphFormat.SpaceBefore = 8: .ParagraphFormat.SpaceAfter = 4
        End With
    End If

    Dim arrOrder() As Long
    If tronCau Then arrOrder = TaoMangTron(countQ) Else arrOrder = TaoMangNguyen(countQ)

    Dim i As Long, qIdx As Long
    For i = 1 To countQ
        qIdx = arrOrder(i)
        ansP3(deIdx, i) = questions(qIdx).KeyText

        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.FormattedText = questions(qIdx).rngHeader.FormattedText
        ChuanHoaDauCau rng, "C" & ChrW(226) & "u " & i & "."
        XoaKeyTag rng
        XoaGachChan rng
        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.InsertParagraphAfter
    Next i
End Sub

Private Sub XuatPhanIV(docNew As Document, questions() As TypeQuestion, countQ As Long, _
                       deIdx As Long, tronCau As Boolean)
    Dim rng As Range
    Set rng = docNew.Range: rng.Collapse wdCollapseEnd

    If Not g_rngTitleP4 Is Nothing Then
        rng.FormattedText = g_rngTitleP4.FormattedText
    Else
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N IV. T" & ChrW(7921) & " LU" & ChrW(7854) & "N" & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
            .ParagraphFormat.Alignment = wdAlignParagraphLeft
            .ParagraphFormat.SpaceBefore = 8: .ParagraphFormat.SpaceAfter = 4
        End With
    End If

    Dim arrOrder() As Long
    If tronCau Then arrOrder = TaoMangTron(countQ) Else arrOrder = TaoMangNguyen(countQ)

    Dim i As Long, qIdx As Long
    For i = 1 To countQ
        qIdx = arrOrder(i)
        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.FormattedText = questions(qIdx).rngHeader.FormattedText
        ChuanHoaDauCau rng, "C" & ChrW(226) & "u " & i & "."
        XoaKeyTag rng
        XoaGachChan rng
        Set rng = docNew.Range: rng.Collapse wdCollapseEnd
        rng.InsertParagraphAfter
    Next i
End Sub

' =========================================================================================
' 8. XUAT FILE DAP AN TONG HOP WORD (DapAn_TongHop.docx)
' =========================================================================================
Public Sub XuatFileDapAnTongHop(sPath As String, countP1 As Long, countP2 As Long, countP3 As Long, _
                                ansP1() As String, ansP2() As String, ansP3() As String)
    Dim docAns As Document
    Set docAns = Documents.Add

    With docAns.PageSetup
        .PaperSize = wdPaperA4
        .TopMargin = CentimetersToPoints(2)
        .BottomMargin = CentimetersToPoints(2)
        .LeftMargin = CentimetersToPoints(2)
        .RightMargin = CentimetersToPoints(1.5)
    End With

    Dim sTieuDePhu As String
    sTieuDePhu = "M" & ChrW(244) & "n: " & g_TenMon & " - L" & ChrW(7899) & "p: " & g_TenLop & " - K" & ChrW(236) & " thi: " & g_TenKyThi
    If Len(Trim(g_NamHoc)) > 0 Then sTieuDePhu = sTieuDePhu & vbCrLf & "N" & ChrW(259) & "m h" & ChrW(7885) & "c: " & Trim(g_NamHoc)

    Dim rng As Range
    Set rng = docAns.Range(0, 0)
    With rng
        .text = "B" & ChrW(7842) & "NG " & ChrW(272) & ChrW(193) & "P " & ChrW(193) & "N C" & ChrW(193) & "C M" & ChrW(195) & " " & ChrW(272) & ChrW(7872) & vbCrLf & _
                sTieuDePhu & vbCrLf & vbCrLf
        .Font.Name = "Times New Roman": .Font.Size = 13: .Font.Bold = True
        .ParagraphFormat.Alignment = wdAlignParagraphCenter
    End With

    Dim tbl As Table, c As Long, d As Long

    ' 1. Bang Dap an Phan I
    If countP1 > 0 Then
        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N I: TR" & ChrW(7854) & "C NGHI" & ChrW(7878) & "M NHI" & ChrW(7872) & "U PH" & ChrW(431) & ChrW(416) & "NG " & ChrW(193) & "N L" & ChrW(7920) & "A CH" & ChrW(7884) & "N" & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
        End With

        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        Set tbl = docAns.Tables.Add(Range:=rng, NumRows:=g_SoDe + 1, NumColumns:=countP1 + 1)
        tbl.Borders.Enable = True
        tbl.Rows.Alignment = wdAlignRowCenter

        tbl.Cell(1, 1).Range.text = "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873)
        tbl.Cell(1, 1).Range.Font.Bold = True
        tbl.Cell(1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
        tbl.Cell(1, 1).Shading.BackgroundPatternColor = wdColorGray15

        For c = 1 To countP1
            tbl.Cell(1, c + 1).Range.text = CStr(c)
            tbl.Cell(1, c + 1).Range.Font.Bold = True
            tbl.Cell(1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            tbl.Cell(1, c + 1).Shading.BackgroundPatternColor = wdColorGray15
        Next c

        For d = 1 To g_SoDe
            tbl.Cell(d + 1, 1).Range.text = g_ArrMaDe(d)
            tbl.Cell(d + 1, 1).Range.Font.Bold = True
            tbl.Cell(d + 1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            For c = 1 To countP1
                tbl.Cell(d + 1, c + 1).Range.text = ansP1(d, c)
                tbl.Cell(d + 1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            Next c
        Next d
    End If

    ' 2. Bang Dap an Phan II
    If countP2 > 0 Then
        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        rng.InsertParagraphAfter
        rng.Collapse wdCollapseEnd
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N II: TR" & ChrW(7854) & "C NGHI" & ChrW(7878) & "M " & ChrW(272) & ChrW(250) & "NG SAI (a, b, c, d)" & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
        End With

        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        Set tbl = docAns.Tables.Add(Range:=rng, NumRows:=g_SoDe + 1, NumColumns:=countP2 + 1)
        tbl.Borders.Enable = True
        tbl.Rows.Alignment = wdAlignRowCenter

        tbl.Cell(1, 1).Range.text = "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873)
        tbl.Cell(1, 1).Range.Font.Bold = True
        tbl.Cell(1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
        tbl.Cell(1, 1).Shading.BackgroundPatternColor = wdColorGray15

        For c = 1 To countP2
            tbl.Cell(1, c + 1).Range.text = "C" & ChrW(226) & "u " & c
            tbl.Cell(1, c + 1).Range.Font.Bold = True
            tbl.Cell(1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            tbl.Cell(1, c + 1).Shading.BackgroundPatternColor = wdColorGray15
        Next c

        For d = 1 To g_SoDe
            tbl.Cell(d + 1, 1).Range.text = g_ArrMaDe(d)
            tbl.Cell(d + 1, 1).Range.Font.Bold = True
            tbl.Cell(d + 1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            For c = 1 To countP2
                tbl.Cell(d + 1, c + 1).Range.text = ansP2(d, c)
                tbl.Cell(d + 1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            Next c
        Next d
    End If

    ' 3. Bang Dap an Phan III
    If countP3 > 0 Then
        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        rng.InsertParagraphAfter
        rng.Collapse wdCollapseEnd
        With rng
            .InsertAfter "PH" & ChrW(7846) & "N III: TR" & ChrW(7854) & "C NGHI" & ChrW(7878) & "M TR" & ChrW(7842) & " L" & ChrW(7901) & "I NG" & ChrW(7854) & "N" & vbCrLf
            .Font.Name = "Times New Roman": .Font.Size = 11: .Font.Bold = True
        End With

        Set rng = docAns.Range: rng.Collapse wdCollapseEnd
        Set tbl = docAns.Tables.Add(Range:=rng, NumRows:=g_SoDe + 1, NumColumns:=countP3 + 1)
        tbl.Borders.Enable = True
        tbl.Rows.Alignment = wdAlignRowCenter

        tbl.Cell(1, 1).Range.text = "M" & ChrW(227) & " " & ChrW(273) & ChrW(7873)
        tbl.Cell(1, 1).Range.Font.Bold = True
        tbl.Cell(1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
        tbl.Cell(1, 1).Shading.BackgroundPatternColor = wdColorGray15

        For c = 1 To countP3
            tbl.Cell(1, c + 1).Range.text = "C" & ChrW(226) & "u " & c
            tbl.Cell(1, c + 1).Range.Font.Bold = True
            tbl.Cell(1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            tbl.Cell(1, c + 1).Shading.BackgroundPatternColor = wdColorGray15
        Next c

        For d = 1 To g_SoDe
            tbl.Cell(d + 1, 1).Range.text = g_ArrMaDe(d)
            tbl.Cell(d + 1, 1).Range.Font.Bold = True
            tbl.Cell(d + 1, 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            For c = 1 To countP3
                tbl.Cell(d + 1, c + 1).Range.text = ansP3(d, c)
                tbl.Cell(d + 1, c + 1).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
            Next c
        Next d
    End If

    Dim outAnsPath As String
    outAnsPath = sPath & Application.PathSeparator & "DapAn_TongHop.docx"
    docAns.SaveAs2 outAnsPath, wdFormatXMLDocument
    docAns.Close False
End Sub

' =========================================================================================
' 9. XUAT FILE DAP AN TONG HOP EXCEL (.xlsx) CHUAN FORM DapAn_TOAN_THPT 2025.xlsx
' =========================================================================================
Public Sub XuatFileExcelDapAn(sPath As String, countP1 As Long, countP2 As Long, countP3 As Long, _
                                ansP1() As String, ansP2() As String, ansP3() As String)
    On Error Resume Next
    Dim xlApp As Object, xlWb As Object, xlWs As Object
    Set xlApp = CreateObject("Excel.Application")

    If Not xlApp Is Nothing Then
        xlApp.DisplayAlerts = False
        Set xlWb = xlApp.Workbooks.Add
        Set xlWs = xlWb.Sheets(1)

        ' 1. Dat ten sheet theo ten Mon hoc
        If Len(Trim(g_TenMon)) > 0 Then xlWs.Name = Trim(g_TenMon) Else xlWs.Name = "To" & ChrW(225) & "n"

        ' 2. Hang 1 & 2: Nhom tieu de 3 phan (Merged cells giong DapAn_TOAN_THPT 2025.xlsx)
        ' O A1:A2 Merge
        xlWs.Range("A1:A2").Merge

        ' Phan I: B1:AO1 (40 cot)
        xlWs.Range("B1:AO1").Merge
        xlWs.Range("B1").Value = "Ph" & ChrW(7847) & "n " & ChrW(8544) & ": M" & ChrW(7895) & "i c" & ChrW(226) & "u 0.25" & ChrW(273)
        xlWs.Range("B1").Font.Name = "Times New Roman"
        xlWs.Range("B1").Font.Size = 11
        xlWs.Range("B1").Font.Bold = True

        ' Phan II: AP1:BU1 (32 cot: 8 cau x 4 y)
        xlWs.Range("AP1:BU1").Merge
        xlWs.Range("AP1").Value = "Ph" & ChrW(7847) & "n " & ChrW(8545) & ": M" & ChrW(7895) & "i c" & ChrW(226) & "u t" & ChrW(7889) & "i " & ChrW(273) & "a 1" & ChrW(273) & ": " & ChrW(273) & ChrW(250) & "ng 1 " & ChrW(253) & " 0.1" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 2 " & ChrW(253) & ": 0.25" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 3 " & ChrW(253) & ": 0.5" & ChrW(273) & ", " & ChrW(273) & ChrW(250) & "ng 4 " & ChrW(253) & ": 1" & ChrW(273) & "."
        xlWs.Range("AP1").Font.Name = "Times New Roman"
        xlWs.Range("AP1").Font.Size = 11
        xlWs.Range("AP1").Font.Bold = True

        ' Phan III: BV1:CA1 (6 cot: 6 cau tra loi ngan)
        xlWs.Range("BV1:CA1").Merge
        xlWs.Range("BV1").Value = "Ph" & ChrW(7847) & "n " & ChrW(8546) & ": To" & ChrW(225) & "n 0.5" & ChrW(273) & ", c" & ChrW(225) & "c m" & ChrW(244) & "n kh" & ChrW(225) & "c: 0.25" & ChrW(273)
        xlWs.Range("BV1").Font.Name = "Times New Roman"
        xlWs.Range("BV1").Font.Size = 11
        xlWs.Range("BV1").Font.Bold = True

        ' 3. Hang 2: Danh sach nhan cot
        Dim c As Long, q As Long, sIdx As Long
        For c = 1 To 40
            xlWs.Cells(2, c + 1).Value = c
            xlWs.Cells(2, c + 1).Font.Bold = True
        Next c

        For q = 1 To 8
            xlWs.Cells(2, 42 + (q - 1) * 4 + 0).Value = CStr(q) & "a"
            xlWs.Cells(2, 42 + (q - 1) * 4 + 1).Value = CStr(q) & "b"
            xlWs.Cells(2, 42 + (q - 1) * 4 + 2).Value = CStr(q) & "c"
            xlWs.Cells(2, 42 + (q - 1) * 4 + 3).Value = CStr(q) & "d"
            For sIdx = 0 To 3
                xlWs.Cells(2, 42 + (q - 1) * 4 + sIdx).Font.Bold = True
            Next sIdx
        Next q

        For c = 1 To 6
            xlWs.Cells(2, 73 + c).Value = "C" & ChrW(226) & "u " & CStr(c)
            xlWs.Cells(2, 73 + c).Font.Bold = True
        Next c

        ' 4. Hang 3: Thang diem
        xlWs.Cells(3, 1).Value = ChrW(272) & "i" & ChrW(7875) & "m"
        xlWs.Cells(3, 1).Font.Bold = True

        For c = 1 To 40
            If c <= countP1 Then xlWs.Cells(3, c + 1).Value = "0.25"
        Next c
        For q = 1 To 8
            If q <= countP2 Then
                xlWs.Cells(3, 42 + (q - 1) * 4 + 0).Value = "0.1"
                xlWs.Cells(3, 42 + (q - 1) * 4 + 1).Value = "0.25"
                xlWs.Cells(3, 42 + (q - 1) * 4 + 2).Value = "0.5"
                xlWs.Cells(3, 42 + (q - 1) * 4 + 3).Value = "1"
            End If
        Next q
        For c = 1 To 6
            If c <= countP3 Then xlWs.Cells(3, 73 + c).Value = "0.5"
        Next c

        ' 5. Hang 4 tro di: Cac Ma de va Dap an chi tiet
        Dim d As Long, rRow As Long
        For d = 1 To g_SoDe
            rRow = 3 + d
            xlWs.Cells(rRow, 1).NumberFormat = "@"
            xlWs.Cells(rRow, 1).Value = g_ArrMaDe(d)
            xlWs.Cells(rRow, 1).Font.Bold = True

            ' Phan I: Dap an A, B, C, D
            For c = 1 To countP1
                If c <= 40 Then xlWs.Cells(rRow, c + 1).Value = ansP1(d, c)
            Next c

            ' Phan II: Dap an D, S
            For q = 1 To countP2
                If q <= 8 Then
                    Dim rawP2 As String, partsP2() As String
                    rawP2 = ansP2(d, q)
                    partsP2 = Split(rawP2, ",")
                    For sIdx = 0 To 3
                        If sIdx <= UBound(partsP2) Then
                            xlWs.Cells(rRow, 42 + (q - 1) * 4 + sIdx).Value = Trim(partsP2(sIdx))
                        End If
                    Next sIdx
                End If
            Next q

            ' Phan III: Dap an ngan
            For c = 1 To countP3
                If c <= 6 Then
                    xlWs.Cells(rRow, 73 + c).NumberFormat = "@"
                    xlWs.Cells(rRow, 73 + c).Value = ansP3(d, c)
                End If
            Next c
        Next d

        ' 6. Canh chinh, phong chu va ke vien toan bo vung bang tinh
        Dim maxRow As Long: maxRow = 3 + g_SoDe
        Dim rngAll As Object
        Set rngAll = xlWs.Range(xlWs.Cells(1, 1), xlWs.Cells(maxRow, 79))

        rngAll.HorizontalAlignment = -4108 ' xlCenter
        rngAll.VerticalAlignment = -4108   ' xlCenter
        rngAll.Borders.LineStyle = 1       ' xlContinuous
        rngAll.Borders.Weight = 2          ' xlThin

        ' Do rong cot chuan dep theo DapAn_TOAN_THPT 2025.xlsx
        xlWs.Columns(1).ColumnWidth = 8
        For c = 2 To 73
            xlWs.Columns(c).ColumnWidth = 5.7
        Next c
        For c = 74 To 79
            xlWs.Columns(c).ColumnWidth = 10
        Next c

        ' Chieu cao hang
        xlWs.Rows(1).RowHeight = 24
        xlWs.Rows(2).RowHeight = 18
        xlWs.Rows(3).RowHeight = 18
        For d = 1 To g_SoDe
            xlWs.Rows(3 + d).RowHeight = 18
        Next d

        ' Luu file XLSX
        Dim outPathXlsx As String
        outPathXlsx = sPath & Application.PathSeparator & "DapAn_TongHop.xlsx"
        xlWb.SaveAs outPathXlsx, 51 ' 51 = xlOpenXMLWorkbook (.xlsx)
        xlWb.Close False
        xlApp.Quit
    End If
    On Error GoTo 0
End Sub

' =========================================================================================
' 10. CAC HAM TIEN ICH HO TRO TRON VA CHUAN HOA
' =========================================================================================
Private Function TaoMangTron(n As Long) As Long()
    Dim arr() As Long, i As Long, j As Long, temp As Long
    If n < 1 Then Exit Function
    ReDim arr(1 To n)
    For i = 1 To n: arr(i) = i: Next i
    For i = n To 2 Step -1
        j = Int(Rnd * i) + 1
        temp = arr(i): arr(i) = arr(j): arr(j) = temp
    Next i
    TaoMangTron = arr
End Function

Private Function TaoMangNguyen(n As Long) As Long()
    Dim arr() As Long, i As Long
    If n < 1 Then Exit Function
    ReDim arr(1 To n)
    For i = 1 To n: arr(i) = i: Next i
    TaoMangNguyen = arr
End Function

Private Sub ChuanHoaDauCau(rng As Range, prefixMoi As String)
    On Error Resume Next
    Dim rFind As Range
    Dim sNew As String: sNew = Trim(prefixMoi)
    If Right(sNew, 1) <> "." Then sNew = sNew & "."

    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "C?u [0-9]@[.:)]"
        If .Execute Then
            rFind.text = sNew & " "
            rFind.Font.Bold = True
            rFind.Font.Underline = wdUnderlineNone
            Exit Sub
        End If
    End With

    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "C?u[0-9]@[.:)]"
        If .Execute Then
            rFind.text = sNew & " "
            rFind.Font.Bold = True
            rFind.Font.Underline = wdUnderlineNone
            Exit Sub
        End If
    End With
End Sub

Private Sub ChuanHoaNhanPhuongAn(rng As Range, nhanMoi As String)
    On Error Resume Next
    Dim rFind As Range
    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "[A-Da-d][.:)/-]"
        If .Execute Then
            rFind.text = nhanMoi
            rFind.Font.Bold = True
            rFind.Font.Underline = wdUnderlineNone
            Exit Sub
        End If
    End With
End Sub

Private Sub XoaGachChan(rng As Range)
    On Error Resume Next
    rng.Font.Underline = wdUnderlineNone
End Sub

Private Sub XoaKeyTag(rng As Range)
    On Error Resume Next
    Dim rFind As Range
    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "\<[kK][eE][yY]=*\>"
        .Replacement.text = ""
        .Execute Replace:=wdReplaceAll
    End With
    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "\[[kK][eE][yY]=*\]"
        .Replacement.text = ""
        .Execute Replace:=wdReplaceAll
    End With
    Set rFind = rng.Duplicate
    With rFind.Find
        .ClearFormatting
        .MatchWildcards = True
        .text = "\<*,*\>"
        .Replacement.text = ""
        .Execute Replace:=wdReplaceAll
    End With
End Sub

Private Function IsCauMoi(sNorm As String, Optional sList As String = "") As Boolean
    IsCauMoi = False
    If Len(sList) > 0 Then
        Dim tL As String: tL = UCase(ChuanHoaChuoi(sList))
        If InStr(1, tL, "CAU") > 0 Or InStr(1, tL, "BAI") > 0 Then
            IsCauMoi = True: Exit Function
        End If
    End If

    Dim t As String: t = Trim(sNorm)
    If Len(t) < 4 Then Exit Function

    Dim tPrefix As String: tPrefix = UCase(Left(t, 4))
    If tPrefix = "CAU " Or tPrefix = "BAI " Or tPrefix = "CAU." Or tPrefix = "BAI." Then
        Dim i As Long, ch As String, hasDigit As Boolean: hasDigit = False
        For i = 5 To Len(t)
            ch = Mid(t, i, 1)
            If ch >= "0" And ch <= "9" Then
                hasDigit = True
            ElseIf ch = "." Or ch = ":" Or ch = ")" Or ch = " " Then
                If hasDigit Then IsCauMoi = True: Exit Function
            Else
                Exit For
            End If
        Next i
        If hasDigit Then IsCauMoi = True: Exit Function
    End If
End Function

Private Function LayNhanP1(sNorm As String, Optional sList As String = "") As String
    LayNhanP1 = ""
    If Len(sList) > 0 Then
        Dim tL As String: tL = UCase(Trim(sList))
        If InStr(1, "A.B.C.D.", Left(tL, 1)) > 0 Then LayNhanP1 = Left(tL, 1): Exit Function
    End If

    Dim t As String: t = Trim(sNorm)
    If Len(t) < 2 Then Exit Function

    Dim ch1 As String, ch2 As String
    ch1 = UCase(Left(t, 1))
    ch2 = Mid(t, 2, 1)

    If (ch1 = "A" Or ch1 = "B" Or ch1 = "C" Or ch1 = "D") And (ch2 = "." Or ch2 = ":" Or ch2 = ")" Or ch2 = "/" Or ch2 = "-") Then
        LayNhanP1 = ch1
    End If
End Function

Private Function LayNhanP2(sNorm As String, Optional sList As String = "") As String
    LayNhanP2 = ""
    If Len(sList) > 0 Then
        Dim tL As String: tL = LCase(Trim(sList))
        If InStr(1, "a.b.c.d.", Left(tL, 1)) > 0 Then LayNhanP2 = Left(tL, 1): Exit Function
    End If

    Dim t As String: t = Trim(sNorm)
    If Len(t) < 2 Then Exit Function

    Dim ch1 As String, ch2 As String
    ch1 = LCase(Left(t, 1))
    ch2 = Mid(t, 2, 1)

    If (ch1 = "a" Or ch1 = "b" Or ch1 = "c" Or ch1 = "d") And (ch2 = "." Or ch2 = ":" Or ch2 = ")" Or ch2 = "/" Or ch2 = "-") Then
        LayNhanP2 = ch1
    End If
End Function

Private Function KiemTraGachChan(rng As Range) As Boolean
    KiemTraGachChan = False
    If rng Is Nothing Then Exit Function
    If rng.Font.Underline <> wdUnderlineNone Then
        KiemTraGachChan = True: Exit Function
    End If
    Dim w As Range
    For Each w In rng.Words
        If w.Font.Underline <> wdUnderlineNone Then
            KiemTraGachChan = True: Exit Function
        End If
    Next w
End Function

Private Function TrichXuatDapAnPhan3(sRaw As String) As String
    TrichXuatDapAnPhan3 = ""
    Dim pos1 As Long, pos2 As Long
    pos1 = InStr(1, sRaw, "<key=", vbTextCompare)
    If pos1 = 0 Then pos1 = InStr(1, sRaw, "[key=", vbTextCompare)

    If pos1 > 0 Then
        pos2 = InStr(pos1, sRaw, ">")
        If pos2 = 0 Then pos2 = InStr(pos1, sRaw, "]")
        If pos2 > pos1 Then
            TrichXuatDapAnPhan3 = Trim(Mid(sRaw, pos1 + 5, pos2 - pos1 - 5))
            Exit Function
        End If
    End If

    pos1 = InStr(1, sRaw, "<")
    If pos1 > 0 Then
        pos2 = InStr(pos1, sRaw, ">")
        If pos2 > pos1 Then
            Dim sTag As String
            sTag = Trim(Mid(sRaw, pos1 + 1, pos2 - pos1 - 1))
            If InStr(1, sTag, ",") > 0 Or InStr(1, sTag, ".") > 0 Or IsNumeric(sTag) Then
                TrichXuatDapAnPhan3 = sTag
                Exit Function
            End If
        End If
    End If
End Function

Private Function ChuanHoaChuoi(s As String) As String
    Dim res As String: res = s
    res = Replace(res, vbCr, " ")
    res = Replace(res, vbLf, " ")
    res = Replace(res, vbTab, " ")
    res = Replace(res, ChrW(160), " ")
    res = BoDauTiengViet(res)
    Do While InStr(res, "  ") > 0: res = Replace(res, "  ", " "): Loop
    ChuanHoaChuoi = Trim(res)
End Function

Private Function BoDauTiengViet(ByVal s As String) As String
    Dim aChars As String, eChars As String, oChars As String, uChars As String, iChars As String, yChars As String, dChars As String
    aChars = "áàảãạăắằẳẵặâấầẩẫậÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ"
    eChars = "éèẻẽẹêếềểễệÉÈẺẼẸÊẾỀỂỄỆ"
    oChars = "óòỏõọôốồổỗộơớờởỡợÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ"
    uChars = "úùủũụưứừửữựÚÙỦŨỤƯỨỪỬỮỰ"
    iChars = "íìỉĩịÍÌỈĨỊ"
    yChars = "ýỳỷỹỵÝỲỶỸỴ"
    dChars = "đĐ"

    Dim i As Long, ch As String, res As String: res = s
    For i = 1 To Len(aChars): res = Replace(res, Mid(aChars, i, 1), IIf(i <= 17, "a", "A")): Next i
    For i = 1 To Len(eChars): res = Replace(res, Mid(eChars, i, 1), IIf(i <= 11, "e", "E")): Next i
    For i = 1 To Len(oChars): res = Replace(res, Mid(oChars, i, 1), IIf(i <= 17, "o", "O")): Next i
    For i = 1 To Len(uChars): res = Replace(res, Mid(uChars, i, 1), IIf(i <= 11, "u", "U")): Next i
    For i = 1 To Len(iChars): res = Replace(res, Mid(iChars, i, 1), IIf(i <= 5, "i", "I")): Next i
    For i = 1 To Len(yChars): res = Replace(res, Mid(yChars, i, 1), IIf(i <= 5, "y", "Y")): Next i
    For i = 1 To Len(dChars): res = Replace(res, Mid(dChars, i, 1), IIf(i <= 1, "d", "D")): Next i
    BoDauTiengViet = res
End Function
'''

out_path = os.path.abspath(r"C:\Users\Admin\Desktop\webgame\ADDIN\Tronde.bas")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(code)

print(f"Successfully generated {out_path} ({len(code)} bytes)")
