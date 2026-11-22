// @ts-nocheck
/**
 * GOOGLE APPS SCRIPT - MHEDU PRO (THẦY NGUYỄN MẠNH HÙNG - 0965.908.084)
 * Đã rà soát & sửa toàn bộ lỗi:
 * 1. Đổi SPREADSHEET_ID_ADMIN & SPREADSHEET_ID sang bảng MH AdminHT của thầy: 1921cAgx0FvRdL2Tc4a4z6qjZ1ETr7lV9YqXBtSfrhZg
 * 2. Gỡ bỏ dòng SpreadsheetApp.openById(SPREADSHEET_ID_P) thừa gây lỗi quyền truy cập file cũ.
 * 3. Đổi toàn bộ mật khẩu Admin (passAdmin2 & Super Admin fallback) sang "Taynguyen286@" (xóa 22222222@ và a0988948882A@).
 * 4. Đổi Super Admin IDGV từ 0988948882 sang 0965908084 và thông tin ngân hàng sang Thầy Nguyễn Mạnh Hùng.
 * 5. Tự động lấy linkAdmin bằng ScriptApp.getService().getUrl() (xóa link Apps Script cũ).
 * 6. Sửa lỗi so sánh kiểu dữ liệu mật khẩu ở addPayment và bổ sung kiểm tra passAdmin2 dự phòng.
 */
const SPREADSHEET_ID_ADMIN = "1921cAgx0FvRdL2Tc4a4z6qjZ1ETr7lV9YqXBtSfrhZg";
var SPREADSHEET_ID = "1921cAgx0FvRdL2Tc4a4z6qjZ1ETr7lV9YqXBtSfrhZg";

const ADMIN_IDGV = "0965908084";
const passAdmin2 = "Taynguyen286@";
const ssadmin = SpreadsheetApp.openById(SPREADSHEET_ID_ADMIN);
const linkAdmin = (function() {
  try { return ScriptApp.getService().getUrl() || ""; } catch (e) { return ""; }
})();
var maxrowhs = 101;

function parseHeso(val) {
  if (val === undefined || val === null || val === "") return 1;
  if (typeof val === "number") return isNaN(val) ? 1 : val;
  var str = String(val).replace(',', '.').trim();
  var num = Number(str);
  return (!isNaN(num) && num >= 0) ? num : 1;
}

function getSS(sheetId) {
  if (sheetId && String(sheetId).trim() !== "") {
    try {
      return SpreadsheetApp.openById(String(sheetId).trim());
    } catch (err) {
      console.error("Lỗi openById sheetId (" + sheetId + "): " + err.toString());
    }
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Helper kiểm tra mật khẩu Admin C2 hoặc mật khẩu chủ MHEdu (Taynguyen286@)
function isValidAdminPass(inputPassword, passC2) {
  var inp = String(inputPassword || "").trim();
  if (!inp) return false;
  if (isEqualExact(inp, passAdmin2)) return true;
  var c2 = String(passC2 || "").trim();
  if (c2 && isEqualExact(inp, c2)) return true;
  return false;
}

var APP_COL_KEYS = [
  "thionline", "taicd", "game", "qltrungtam", "gvcn", "taoQR", "khbg", "pdftoword",
  "vedothi", "vongquay", "chamtuluan",
  "tronde", "trolyAI", "dangkytk", "taocautuongtu", "tronde2s"
];

function getAppColIndex(tcSheet, appKey) {
  var lastCol = tcSheet.getLastColumn() || 30;
  var headers = tcSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var normalizedKey = String(appKey || "").toLowerCase().trim();
  if (normalizedKey === "vehinh") normalizedKey = "vedothi";

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || "").toLowerCase().trim();
    if (h === normalizedKey) {
      return c + 1;
    }
  }

  var fallbackIdx = APP_COL_KEYS.indexOf(normalizedKey);
  if (fallbackIdx !== -1) {
    return 5 + fallbackIdx;
  }
  return -1;
}

function getOrCreateTruyCapSheet(ssadmin) {
  var tcSheet = ssadmin.getSheetByName("truycap");
  if (!tcSheet) {
    tcSheet = ssadmin.insertSheet("truycap");
  }

  var lastCol = tcSheet.getLastColumn();
  if (lastCol < 4) {
    var headers = ["Thời gian", "Người truy cập", "Ghi chú", "Sao lưu cũ"].concat(APP_COL_KEYS);
    tcSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    tcSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0e7ff");
  }

  var d2Val = tcSheet.getRange("D2").getValue();
  if (d2Val === "" || d2Val === null || d2Val === undefined) {
    tcSheet.getRange("D2").setValue(0);
  }

  return tcSheet;
}

function calculateTruyCapStats(tcSheet) {
  var lastRow = tcSheet.getLastRow();

  var countB = 0;
  if (lastRow >= 2) {
    var bVals = tcSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var bIdx = 0; bIdx < bVals.length; bIdx++) {
      if (String(bVals[bIdx][0] || "").trim() !== "") countB++;
    }
  }
  var backupCount = Number(tcSheet.getRange("D2").getValue()) || 0;
  var totalVisits = countB + backupCount;

  var appVisits = {};

  for (var k = 0; k < APP_COL_KEYS.length; k++) {
    var key = APP_COL_KEYS[k];
    var colIdx = getAppColIndex(tcSheet, key);
    if (colIdx === -1) {
      appVisits[key] = 0;
      continue;
    }

    var backupVal = Number(tcSheet.getRange(2, colIdx).getValue()) || 0;
    if (isNaN(backupVal) || backupVal < 0) backupVal = 0;

    var clickCount = 0;
    if (lastRow >= 3) {
      var colData = tcSheet.getRange(3, colIdx, lastRow - 2, 1).getValues();
      for (var r = 0; r < colData.length; r++) {
        if (String(colData[r][0] || "").trim() !== "") {
          clickCount++;
        }
      }
    }
    appVisits[key] = backupVal + clickCount;
  }

  if (appVisits["vedothi"] !== undefined) {
    appVisits["vehinh"] = appVisits["vedothi"];
  }

  return {
    totalVisits: totalVisits,
    countB: countB,
    backupCount: backupCount,
    appVisits: appVisits
  };
}

function recordAppClickEntry(tcSheet, appKey) {
  var targetCol = getAppColIndex(tcSheet, appKey);
  if (targetCol === -1) return false;

  var lastR = tcSheet.getLastRow();
  var targetRow = 3;
  if (lastR >= 3) {
    var colVals = tcSheet.getRange(3, targetCol, lastR - 2, 1).getValues();
    var foundEmpty = false;
    for (var r = 0; r < colVals.length; r++) {
      if (String(colVals[r][0] || "").trim() === "") {
        targetRow = 3 + r;
        foundEmpty = true;
        break;
      }
    }
    if (!foundEmpty) {
      targetRow = lastR + 1;
    }
  }

  var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd HH:mm:ss");
  tcSheet.getRange(targetRow, targetCol).setValue(timeStr);
  return true;
}

function doGet(e) {
  if (e && e.parameter) {
    var act = e.parameter.action;
    if (act === "getCopyrightStatus") {
      var bqSheetForStatus = ssadmin.getSheetByName("banquyen");
      var l1Val = bqSheetForStatus ? String(bqSheetForStatus.getRange("L1").getValue() || "").trim() : "";
      var isFree = (l1Val.toUpperCase() === "FREE");
      var statusStr = isFree ? "Free" : "VIP";
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: statusStr,
        enableCopyrightCheck: !isFree
      })).setMimeType(ContentService.MimeType.JSON);
    }
    if (act === "recordVisit" || act === "getVisitCount" || act === "recordAppClick" || act === "getAppVisits") {
      try {
        var tcSheet = getOrCreateTruyCapSheet(ssadmin);
        if (act === "recordVisit") {
          var timeVal = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd HH:mm:ss");
          var userVal = String(e.parameter.user || e.parameter.idgv || "Khách").trim();
          var noteVal = String(e.parameter.note || "Truy cập Web App").trim();
          tcSheet.appendRow([timeVal, userVal, noteVal]);
        } else if (act === "recordAppClick") {
          var targetAppKey = String(e.parameter.appKey || "").trim();
          if (targetAppKey) {
            recordAppClickEntry(tcSheet, targetAppKey);
          }
        }
        var stats = calculateTruyCapStats(tcSheet);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          totalVisits: stats.totalVisits,
          countB: stats.countB,
          backupCount: stats.backupCount,
          appVisits: stats.appVisits
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (tcErr) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          totalVisits: 0,
          appVisits: {}
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  if (e && e.parameter && e.parameter.action === "getAdminSheetsForFirebase") {
    var inputPass = String(e.parameter.password || "").trim();
    var currentSuperAdminPass = getSuperAdminPassword(ssadmin);
    var isPassValid = isEqualExact(inputPass, currentSuperAdminPass) ||
      isEqualExact(inputPass, passAdmin2);

    if (!inputPass || !isPassValid) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheetsParam = String(e.parameter.sheets || "").trim();
    var requestedSheets = sheetsParam ? sheetsParam.split(",") : ["banquyen", "levelvip", "transactioncn", "transactioncn2", "transactionkd"];
    var resultData = {};

    for (var sIdx = 0; sIdx < requestedSheets.length; sIdx++) {
      var sName = requestedSheets[sIdx].trim();
      var sh = ssadmin.getSheetByName(sName);
      if (!sh && (sName === "levevip" || sName === "levelvip")) {
        sh = ssadmin.getSheetByName("levelvip") || ssadmin.getSheetByName("levevip");
      }
      if (!sh || sh.getLastRow() < 1) {
        resultData[sName] = [];
        continue;
      }
      var lastR = sh.getLastRow();
      var lastC = sh.getLastColumn() || 1;
      var vals = sh.getRange(1, 1, lastR, lastC).getValues();
      var headers = vals[0].map(function(h, idx) { return String(h || "col_" + (idx + 1)).trim(); });
      var rows = [];
      for (var rIdx = 1; rIdx < vals.length; rIdx++) {
        var rowObj = {};
        for (var cIdx = 0; cIdx < headers.length; cIdx++) {
          var key = headers[cIdx] || ("col_" + (cIdx + 1));
          var cellVal = vals[rIdx][cIdx];
          if (cellVal instanceof Date) {
            cellVal = Utilities.formatDate(cellVal, Session.getScriptTimeZone() || "GMT+7", "dd/MM/yyyy HH:mm:ss");
          }
          rowObj[key] = (cellVal !== undefined && cellVal !== null) ? cellVal : "";
        }
        rows.push(rowObj);
      }
      resultData[sName] = rows;
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: resultData
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var idgvParam = (e && e.parameter && e.parameter.idgv) ? String(e.parameter.idgv).trim() : "";
  var sheetIdParam = (e && e.parameter && e.parameter.sheetId) ? String(e.parameter.sheetId).trim() : "";
  var targetSheetId = sheetIdParam;

  if (idgvParam) {
    try {
      syncLicenseWithTransactionCN();
    } catch (errSync) {
      console.error("Lỗi tự động đồng bộ khi mở web: " + errSync.toString());
    }
  }

  var licenseStatusVal = "";
  var fullnameVal = "";
  var monVal = "";
  var idmonVal = "";
  var linkScriptVal = "";
  var bqSheetIdVal = "";
  var hetHanVal = "";

  if (idgvParam) {
    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (bqSheet) {
      var bqLastRow = bqSheet.getLastRow();
      if (bqLastRow > 1) {
        var bqLastCol = Math.max(14, bqSheet.getLastColumn());
        var bqVals = bqSheet.getRange(2, 1, bqLastRow - 1, bqLastCol).getValues();
        for (var idx = 0; idx < bqVals.length; idx++) {
          if (isEqual(bqVals[idx][0], idgvParam)) {
            var valF = String(bqVals[idx][5] || "").trim();
            var valH = String(bqVals[idx][7] || "").trim();
            var expJ = bqVals[idx][9];
            var expN = bqVals[idx][13];
            var numJ = dateToNumber(expJ);
            var numN = dateToNumber(expN);
            var todayNum = dateToNumber(new Date());

            var activeExpiryStr = (numN > numJ) ? expN : expJ;
            var maxExpNum = Math.max(numJ, numN);
            var isStillValid = (maxExpNum > todayNum);

            var activeVip = "Free";
            if (isStillValid) {
              if (numJ >= numN && /^VIP/i.test(valF)) {
                activeVip = valF.toUpperCase();
              } else if (/^VIP/i.test(valH)) {
                activeVip = valH.toUpperCase();
              } else if (/^VIP/i.test(valF)) {
                activeVip = valF.toUpperCase();
              }
            } else if (/^VIP/i.test(valF)) {
              activeVip = valF.toUpperCase();
            }

            licenseStatusVal = activeVip;
            hetHanVal = String(activeExpiryStr || "").trim();
            fullnameVal = String(bqVals[idx][1] || "").trim();
            monVal = String(bqVals[idx][3] || "").trim();
            idmonVal = String(bqVals[idx][4] || "").trim();
            linkScriptVal = linkAdmin;
            bqSheetIdVal = String(bqVals[idx][10] || "").trim();
            if (!targetSheetId && bqSheetIdVal) {
              targetSheetId = bqSheetIdVal;
            }
            break;
          }
        }
      }
    }
  }

  // Super Admin MHEdu: 0965908084 (Thầy Nguyễn Mạnh Hùng) hoặc mặc định khi không truyền idgv
  var isSuperAdminUser = (!idgvParam || idgvParam === ADMIN_IDGV || idgvParam.toLowerCase() === "hung286");
  var hasPrivateSheet = Boolean(targetSheetId && targetSheetId !== SPREADSHEET_ID_ADMIN);

  var lvSheetForVip = ssadmin.getSheetByName("levelvip");
  var vipPricesObj = { "VIP1": 150000, "VIP2": 350000, "VIP3": 450000, "VIP4": 600000 };
  var vipPriceImageUrlVal = "";
  if (lvSheetForVip) {
    try {
      vipPriceImageUrlVal = String(lvSheetForVip.getRange("C2").getValue() || "").trim();
      var lvLastRow = lvSheetForVip.getLastRow();
      if (lvLastRow > 1) {
        var lvVals = lvSheetForVip.getRange(2, 1, lvLastRow - 1, 2).getValues();
        for (var l = 0; l < lvVals.length; l++) {
          var lKey = String(lvVals[l][0] || "").trim().toUpperCase();
          var lPrice = Number(lvVals[l][1]) || 0;
          if (lKey && lPrice > 0) {
            vipPricesObj[lKey] = lPrice;
          }
        }
      }
    } catch (eLv) { }
  }

  var bqSheetForCopyright = ssadmin.getSheetByName("banquyen");
  var copyrightL1Val = bqSheetForCopyright ? String(bqSheetForCopyright.getRange("L1").getValue() || "").trim() : "";
  var isCopyrightFreeMode = (copyrightL1Val.toUpperCase() === "FREE");
  var currentCopyrightStatus = isCopyrightFreeMode ? "Free" : "VIP";
  var isEnableCopyrightCheck = !isCopyrightFreeMode;

  if (!isSuperAdminUser && !hasPrivateSheet) {
    var emptyResult = {
      sheets: {},
      password: "",
      bankId: "BIDV",
      bankAccountNo: "",
      bankAccountName: "",
      bankId2: "MB",
      bankAccountNo2: "",
      bankAccountName2: "",
      licenseStatus: licenseStatusVal || "Free",
      level: licenseStatusVal || "Free",
      copyrightStatus: currentCopyrightStatus,
      enableCopyrightCheck: isEnableCopyrightCheck,
      fullname: fullnameVal,
      mon: monVal,
      idmon: idmonVal,
      hetHan: hetHanVal,
      linkScript: linkScriptVal,
      sheetId: "",
      vipPrices: vipPricesObj,
      vipPriceImageUrl: vipPriceImageUrlVal
    };
    return ContentService.createTextOutput(JSON.stringify(emptyResult))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var ss = getSS(targetSheetId);

  var feeSheet = ss.getSheetByName("hocphi");
  var passC2 = feeSheet ? String(feeSheet.getRange("C2").getValue() || "").trim() : "";
  if (passC2 === "222222@" || passC2 === "2222222@" || passC2 === "22222222@") {
    passC2 = passAdmin2;
  }
  var passAdmin = passC2 || (isSuperAdminUser ? passAdmin2 : "");
  var bankIdVal = feeSheet ? feeSheet.getRange("C3").getValue() : "";
  var bankAccountNoVal = feeSheet ? String(feeSheet.getRange("C4").getValue()).replace(/^'/, "").trim() : "";
  var bankAccountNameVal = feeSheet ? feeSheet.getRange("C5").getValue() : "";

  var bankId2Val = feeSheet ? feeSheet.getRange("C6").getValue() : "";
  var bankAccountNo2Val = feeSheet ? String(feeSheet.getRange("C7").getValue()).replace(/^'/, "").trim() : "";
  var bankAccountName2Val = feeSheet ? feeSheet.getRange("C8").getValue() : "";

  // Ngân hàng mặc định của Admin Thầy Nguyễn Mạnh Hùng (0965908084)
  var finalBankId = String(bankIdVal || "").trim() || (isSuperAdminUser ? "MB" : "");
  var rawAcct1 = String(bankAccountNoVal || "").replace(/^'/, "").trim();
  var isAdminAcct1 = (rawAcct1 === "6320495851" || rawAcct1 === "9793199999");
  var finalBankAccountNo = (isAdminAcct1 && !isSuperAdminUser) ? "" : (rawAcct1 || (isSuperAdminUser ? "9793199999" : ""));
  var rawName1 = String(bankAccountNameVal || "").trim();
  var isAdminName1 = (rawName1 === "NGUYEN MANH HUNG" || rawName1 === "HO KINH DOANH MINH DIEP");
  var finalBankAccountName = (isAdminName1 && !isSuperAdminUser) ? "" : (rawName1 || (isSuperAdminUser ? "HO KINH DOANH MINH DIEP" : ""));

  var finalBankId2 = String(bankId2Val || "").trim() || (isSuperAdminUser ? "BIDV" : finalBankId);
  var rawAcct2 = String(bankAccountNo2Val || "").replace(/^'/, "").trim();
  var isAdminAcct2 = (rawAcct2 === "0965908084" || rawAcct2 === "6320495851" || rawAcct2 === "9793199999");
  var finalBankAccountNo2 = (isAdminAcct2 && !isSuperAdminUser) ? "" : (rawAcct2 || (isSuperAdminUser ? "0965908084" : ""));
  var rawName2 = String(bankAccountName2Val || "").trim();
  var isAdminName2 = (rawName2 === "NGUYEN MANH HUNG" || rawName2 === "HO KINH DOANH MINH DIEP");
  var finalBankAccountName2 = (isAdminName2 && !isSuperAdminUser) ? "" : (rawName2 || (isSuperAdminUser ? "NGUYEN MANH HUNG" : ""));

  var allSheets = ss.getSheets();
  var resultData = {
    sheets: {},
    password: String(passAdmin || ""),
    bankId: finalBankId,
    bankAccountNo: finalBankAccountNo,
    bankAccountName: finalBankAccountName,
    bankId2: finalBankId2,
    bankAccountNo2: finalBankAccountNo2,
    bankAccountName2: finalBankAccountName2,
    licenseStatus: isSuperAdminUser ? "VIP4" : licenseStatusVal,
    level: isSuperAdminUser ? "VIP4" : licenseStatusVal,
    copyrightStatus: currentCopyrightStatus,
    enableCopyrightCheck: isEnableCopyrightCheck,
    fullname: fullnameVal || (isSuperAdminUser ? "Thầy Nguyễn Mạnh Hùng" : ""),
    mon: monVal || (isSuperAdminUser ? "Toán" : ""),
    idmon: idmonVal || (isSuperAdminUser ? "toan" : ""),
    hetHan: hetHanVal || (isSuperAdminUser ? "25/07/2050" : ""),
    linkScript: linkScriptVal || linkAdmin,
    sheetId: bqSheetIdVal || targetSheetId || SPREADSHEET_ID_ADMIN,
    vipPrices: vipPricesObj,
    vipPriceImageUrl: vipPriceImageUrlVal
  };

  allSheets.forEach(function (sh) {
    var name = sh.getName();
    if (name.indexOf("Lop") === 0) {
      var maxRows = sh.getMaxRows();
      var lastRowWithStudents = sh.getRange(maxRows, 2).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();

      if (lastRowWithStudents < 2 || sh.getRange(2, 2).getValue() === "") {
        lastRowWithStudents = 1;
      }

      var min = Math.min(lastRowWithStudents, maxrowhs);
      var vals = sh.getRange(1, 1, min, 18).getValues();
      var students = [];

      for (var i = 1; i < vals.length; i++) {
        var row = vals[i];
        if (!row[1]) continue;
        var stt = String(row[0]).trim();

        var sttNum = Number(stt) || 0;
        if (!isNaN(sttNum) && sttNum < 10) {
          stt = "0" + String(sttNum);
        }
        students.push({
          stt: stt,
          name: row[1],
          class: row[2],
          school: row[3],
          phoneNumber: String(row[4]),
          code: String(row[5]),
          heso: parseHeso(row[6]),
          attendance: row.slice(7, 17).map(function (v) {
            return (v === "" || v === null) ? null : (Number(v) === 1 ? 1 : 0);
          }),
          totalAmount: Number(row[17]) || 0
        });
      }
      var headers = [];
      if (vals.length > 0) {
        var headerDisplayVals = sh.getRange(1, 8, 1, 10).getDisplayValues()[0];
        headers = headerDisplayVals.map(function (v) {
          var str = String(v || "").trim();
          var matchDate = str.match(/^(\d{1,2})\/(\d{1,2})/);
          if (matchDate) {
            var day = matchDate[1].padStart(2, '0');
            var month = matchDate[2].padStart(2, '0');
            var matchYear = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
            if (matchYear) {
              return day + "/" + month + "/" + matchYear[3].slice(-2);
            }
            return day + "/" + month;
          }
          return str;
        });
      }

      var studentCount = students.length;

      var historyBlocks = [];
      var maxRowsSh = sh.getMaxRows();
      if (maxRowsSh > 0) {
        var histVals = sh.getRange(1, 19, maxRowsSh, 19).getValues();
        var curBlock = null;
        var blockCount = 0;
        for (var hRow = 0; hRow < histVals.length; hRow++) {
          var rText = String(histVals[hRow][0] || "").trim();
          var sText = String(histVals[hRow][1] || "").trim();

          if (rText.indexOf("LƯU TRỮ") !== -1 || rText.indexOf("LƯU") !== -1 || (rText !== "" && sText !== "") || (sText.toUpperCase() === "STT" && hRow > 0)) {
            blockCount++;
            var mDate = rText.replace("LƯU TRỮ - ", "").trim();
            curBlock = {
              lan: blockCount,
              lanNop: "L" + blockCount,
              marker: rText,
              date: mDate,
              students: []
            };
            historyBlocks.push(curBlock);
          } else if (curBlock && sText !== "" && sText !== "STT" && sText !== "0" && sText !== "stt") {
            var stName = String(histVals[hRow][2] || "").trim();
            var stClass = String(histVals[hRow][3] || "").trim();
            var stSchool = String(histVals[hRow][4] || "").trim();
            var stPhone = String(histVals[hRow][5] || "").trim();
            var stCode = String(histVals[hRow][6] || "").trim();
            var stheso = parseHeso(histVals[hRow][7]);
            var stAmount = Number(histVals[hRow][18]) || 0;
            var histAttCount = 0;
            for (var cCol = 8; cCol <= 17; cCol++) {
              var cVal = histVals[hRow][cCol];
              if (cVal === 1 || cVal === "1" || cVal === "x" || cVal === "X") {
                histAttCount++;
              }
            }
            if (stName || stCode) {
              curBlock.students.push({
                stt: sText,
                name: stName,
                class: stClass,
                school: stSchool,
                phoneNumber: stPhone,
                code: stCode,
                heso: stheso,
                totalAmount: stAmount,
                attendedCount: histAttCount
              });
            }
          }
        }
      }

      var maxLan = historyBlocks.length;

      resultData.sheets[name] = {
        className: name,
        studentCount: studentCount,
        students: students,
        headers: headers,
        historyBlocks: historyBlocks,
        historyCount: historyBlocks.length,
        maxLan: maxLan
      };
    }
    else if (name === "THHT") {
      var vals = sh.getDataRange().getValues();
      var thhtStudents = [];
      for (var i = 1; i < vals.length; i++) {
        if (!vals[i][1]) continue;
        thhtStudents.push({
          stt: vals[i][0],
          name: String(vals[i][1]).trim(),
          class: String(vals[i][2]).trim(),
          school: String(vals[i][3]).trim(),
          phoneNumber: String(vals[i][4] || "").trim(),
          code: String(vals[i][5] || "").trim()
        });
      }
      resultData.sheets[name] = { className: "THHT", students: thhtStudents, studentCount: thhtStudents.length };
    }
    else if (name === "transactioncn") {
      var vals = sh.getDataRange().getValues();
      var rows = [];
      for (var i = 1; i < vals.length; i++) {
        var r = vals[i];
        if (!r[0] && !r[3]) continue;
        var dateVal = r[5] instanceof Date ? Utilities.formatDate(r[5], Session.getScriptTimeZone(), "dd/MM/yyyy") : String(r[5] || "").trim();
        rows.push({
          id: String(r[0] || "").trim(),
          bankName: String(r[1] || "").trim(),
          accountNo: String(r[2] || "").trim(),
          amount: Number(r[3]) || 0,
          type: String(r[4] || "").trim(),
          date: dateVal,
          description: String(r[6] || "").trim()
        });
      }
      resultData.sheets[name] = { className: "transactioncn", rows: rows, headers: ["ID", "Ngân Hàng", "Số Tài Khoản", "Số Tiền", "Loại", "Ngày", "Mô Tả"] };
    }
    else if (name === "transactioncn2" || name === "transaction2") {
      var vals = sh.getDataRange().getValues();
      var rows = [];
      for (var i = 1; i < vals.length; i++) {
        var r = vals[i];
        var rawAmount = String(r[3] || "").replace(/,/g, "").trim();
        var amountVal = Number(rawAmount) || 0;
        if (!r[0] && amountVal === 0) continue;
        var descVal = String(r[6] || r[5] || "").trim();
        var dateVal = r[5] instanceof Date
          ? Utilities.formatDate(r[5], Session.getScriptTimeZone(), "dd/MM/yyyy")
          : String(r[1] || r[5] || "").trim();

        rows.push({
          id: String(r[0] || "").trim(),
          bankName: String(r[1] || "").trim(),
          accountNo: String(r[2] || "").trim(),
          amount: amountVal,
          type: String(r[4] || "").trim(),
          date: dateVal,
          description: descVal
        });
      }
      resultData.sheets[name] = { className: name, rows: rows, headers: ["ID", "Ngân Hàng", "Số Tài Khoản", "Số Tiền", "Loại", "Ngày", "Mô Tả"] };
    }
    else if (name === "transactionkd") {
      var vals = sh.getDataRange().getValues();
      var rows = [];
      for (var i = 1; i < vals.length; i++) {
        var r = vals[i];
        if (!r[0] && !r[7]) continue;
        var dateVal = r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), "dd/MM/yyyy") : String(r[1] || "").trim();
        rows.push({
          bankName: String(r[0] || "").trim(),
          date: dateVal,
          accountNo: String(r[2] || "").trim(),
          subAccount: String(r[3] || "").trim(),
          codeTT: String(r[4] || "").trim(),
          content: String(r[5] || "").trim(),
          type: String(r[6] || "").trim(),
          amount: Number(r[7]) || 0,
          refCode: String(r[8] || "").trim(),
          balance: Number(r[9]) || 0
        });
      }
      resultData.sheets[name] = {
        className: "transactionkd",
        rows: rows,
        headers: ["Ngân hàng", "Ngày giao dịch", "Số tài khoản", "Tài khoản phụ", "Code TT", "Nội dung thanh toán", "Loại", "Số tiền", "Mã tham chiếu", "Lũy kế"]
      };
    }
    else if (name === "ThuTien") {
      try {
        syncThuTienWithTransactionKD(ss);
      } catch (err) {
        console.error("Lỗi đồng bộ ThuTien:", err.toString());
      }

      var vals = sh.getDataRange().getValues();
      var logs = [];

      if (vals.length > 1) {
        for (var i = 1; i < vals.length; i++) {
          var row = vals[i];
          if (!row[2]) continue;

          var dateVal = row[0];
          if (dateVal instanceof Date) {
            dateVal = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd/MM/yyyy");
          } else {
            dateVal = String(dateVal).trim();
          }
          logs.push({
            date: dateVal,
            lanNop: String(row[4]).trim(),
            soTien: Number(row[5]) || 0,
            lop: String(row[3]).trim(),
            name: String(row[2]).trim(),
            code: String(row[6]).trim() || ""
          });
        }
      }
      resultData.sheets[name] = { students: logs };
    }
    else if (name === "GVCN") {
      try {
        syncGVCNWithTransactionCN(ss);
      } catch (err) {
        console.error("Lỗi đồng bộ GVCN:", err.toString());
      }

      var txSheet1 = ss.getSheetByName("transactioncn");
      var txData1 = (txSheet1 && txSheet1.getLastRow() > 1)
        ? txSheet1.getRange(2, 1, txSheet1.getLastRow() - 1, 7).getValues()
        : [];

      var txSheet2 = ss.getSheetByName("transactioncn2") || ss.getSheetByName("transaction2");
      var txData2 = [];
      if (txSheet2 && txSheet2.getLastRow() > 1) {
        var rawTx2 = txSheet2.getRange(2, 1, txSheet2.getLastRow() - 1, 8).getValues();
        for (var k = 0; k < rawTx2.length; k++) {
          var amt = Number(String(rawTx2[k][3] || "").replace(/,/g, "")) || 0;
          var desc = String(rawTx2[k][6] || rawTx2[k][5] || "").trim();
          if (amt > 0) {
            txData2.push([rawTx2[k][0], rawTx2[k][1], rawTx2[k][2], amt, rawTx2[k][4], rawTx2[k][5], desc]);
          }
        }
      }

      var txData = txData1.concat(txData2);

      var vals = sh.getDataRange().getValues();
      var gvcnStudents = [];
      var rounds = [];

      if (vals.length > 0) {
        var headerRow = vals[0];
        if (headerRow.length > 7) {
          for (var h = 7; h < headerRow.length; h++) {
            var colName = String(headerRow[h] || "").trim();
            if (colName !== "") {
              rounds.push(colName);
            }
          }
        }
      }

      if (vals.length > 1) {
        for (var i = 1; i < vals.length; i++) {
          var row = vals[i];
          if (!row[1]) continue;

          var studentCode = String(row[3] || "").trim().toUpperCase();
          var paymentRounds = {};
          var paidRounds = {};
          var paidRoundAmounts = {};

          for (var rIdx = 0; rIdx < rounds.length; rIdx++) {
            var rName = rounds[rIdx];
            var colIdx = 7 + rIdx;
            paymentRounds[rName] = Number(row[colIdx]) || 0;
            paidRounds[rName] = false;
            paidRoundAmounts[rName] = 0;
          }

          if (studentCode !== "" && txData.length > 0) {
            for (var tIdx = 0; tIdx < txData.length; tIdx++) {
              var desc = String(txData[tIdx][6] || "").trim().toUpperCase();
              var txAmount = Number(txData[tIdx][3]) || 0;
              if (txAmount > 0 && desc.indexOf(studentCode) !== -1) {
                var roundMatch = desc.match(/\b(L|LAN)\s*(\d+)\b/i) || desc.match(/(L|LAN)(\d+)/i);
                if (roundMatch) {
                  var rNum = parseInt(roundMatch[2], 10);
                  for (var rIdx = 0; rIdx < rounds.length; rIdx++) {
                    var rNumMatch = rounds[rIdx].match(/\d+/);
                    if (rNumMatch && parseInt(rNumMatch[0], 10) === rNum) {
                      paidRounds[rounds[rIdx]] = true;
                      paidRoundAmounts[rounds[rIdx]] = (paidRoundAmounts[rounds[rIdx]] || 0) + txAmount;
                    }
                  }
                }
              }
            }
          }

          gvcnStudents.push({
            stt: Number(row[0]) || i,
            name: String(row[1]).trim(),
            class: String(row[2]).trim(),
            code: String(row[3]).trim(),
            totalAmount: Number(row[4]) || 0,
            note: String(row[5] || "").trim(),
            totalPaid: Number(row[6]) || 0,
            paymentRounds: paymentRounds,
            paidRounds: paidRounds,
            paidRoundAmounts: paidRoundAmounts
          });
        }
      }
      resultData.sheets[name] = {
        className: "GVCN",
        students: gvcnStudents,
        studentCount: gvcnStudents.length,
        rounds: rounds
      };
    }
  });

  return ContentService.createTextOutput(JSON.stringify(resultData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Mật khẩu Super Admin từ ô Q1 sheet banquyen (mặc định: Taynguyen286@)
function getSuperAdminPassword(ssadminRef) {
  try {
    var adminSS = ssadminRef || ssadmin;
    if (!adminSS) {
      adminSS = SpreadsheetApp.openById(SPREADSHEET_ID_ADMIN);
    }
    var bqSheet = adminSS.getSheetByName("banquyen");
    if (bqSheet) {
      var q1Val = String(bqSheet.getRange("Q1").getValue() || "").trim();
      if (q1Val !== "" && q1Val !== "a0988948882A@") return q1Val;
    }
  } catch (err) {
    console.error("getSuperAdminPassword error: " + err.toString());
  }
  return passAdmin2;
}

function doPost(e) {
  var postData = null;
  var rawContents = "";

  try {
    if (e.postData && e.postData.contents) {
      rawContents = e.postData.contents;
      postData = JSON.parse(rawContents);
    } else {
      postData = e.parameter;
      rawContents = JSON.stringify(postData);
    }
  } catch (err) {
    return createResponse("Lỗi phân tích JSON: " + err.toString(), 400);
  }

  var targetSheetId = postData ? (postData.sheetId || postData.sheetIdGV || "") : "";
  var inputIdgv = postData ? (postData.idgv || "") : "";

  if (!targetSheetId && inputIdgv) {
    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (bqSheet) {
      var bqLastRow = bqSheet.getLastRow();
      if (bqLastRow > 1) {
        var bqVals = bqSheet.getRange(2, 1, bqLastRow - 1, 11).getValues();
        for (var idx = 0; idx < bqVals.length; idx++) {
          if (isEqual(bqVals[idx][0], inputIdgv)) {
            targetSheetId = String(bqVals[idx][10] || "").trim();
            break;
          }
        }
      }
    }
  }

  var ss = getSS(targetSheetId);
  var feeSheet = ss.getSheetByName("hocphi");
  var passC2 = feeSheet ? String(feeSheet.getRange("C2").getValue() || "").trim() : "";
  var passAdmin = passC2 || passAdmin2;

  var action = postData.action;

  if (action === "submitRating") {
    try {
      var dgSheet = ssadmin.getSheetByName("danhgia");
      if (!dgSheet) {
        dgSheet = ssadmin.insertSheet("danhgia");
        dgSheet.getRange(1, 1, 1, 5).setValues([["Thời gian", "Họ tên", "SĐT/IDGV", "Số sao", "Nội dung nhận xét"]]);
        dgSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#e0e7ff");
        dgSheet.getRange("F1").setValue(200);
      }

      var starsVal = Number(postData.stars) || 5;
      if (starsVal < 1) starsVal = 1;
      if (starsVal > 5) starsVal = 5;

      var nameVal = String(postData.name || "").trim();
      var phoneVal = "'" + String(postData.phone || "").trim();
      var commentVal = String(postData.comment || "").trim();
      var timeVal = postData.timestamp || new Date().toLocaleString("vi-VN");

      dgSheet.appendRow([timeVal, nameVal, phoneVal, starsVal, commentVal]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Cảm ơn thầy/cô đã gửi đánh giá cho MHEdu Pro!"
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (dgErr) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Lỗi lưu đánh giá: " + dgErr.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "getRatingSummary") {
    try {
      var dgSheet = ssadmin.getSheetByName("danhgia");
      if (!dgSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          average: 4.9,
          totalCount: 128,
          ratings: []
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var valF1 = Number(dgSheet.getRange("F1").getValue());
      var baseCount = (!isNaN(valF1) && valF1 >= 0) ? valF1 : 128;

      var lastRow = dgSheet.getLastRow();
      var realCount = 0;
      var realTotalStars = 0;
      var ratingsList = [];

      if (lastRow >= 2) {
        var dataVals = dgSheet.getRange(2, 1, lastRow - 1, 5).getValues();

        for (var r = 0; r < dataVals.length; r++) {
          var s = Number(dataVals[r][3]);
          if (!isNaN(s) && s >= 1 && s <= 5) {
            realTotalStars += s;
            realCount++;
            ratingsList.push({
              timestamp: String(dataVals[r][0]),
              name: String(dataVals[r][1]),
              phone: String(dataVals[r][2]),
              stars: s,
              comment: String(dataVals[r][4])
            });
          }
        }
      }

      var baseSumStars = baseCount * 4.9;
      var combinedCount = baseCount + realCount;
      var combinedAvg = combinedCount > 0 ? (baseSumStars + realTotalStars) / combinedCount : 4.9;

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        average: Math.round(combinedAvg * 10) / 10,
        totalCount: combinedCount,
        ratings: ratingsList
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (dgSumErr) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        average: 4.9,
        totalCount: 128,
        ratings: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "recordVisit" || action === "getVisitCount" || action === "recordAppClick" || action === "getAppVisits") {
    try {
      var tcSheet = getOrCreateTruyCapSheet(ssadmin);

      if (action === "recordVisit") {
        var timeVal = postData.timestamp || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd HH:mm:ss");
        var userVal = String(postData.user || postData.idgv || postData.name || "Khách").trim();
        var noteVal = String(postData.note || "Truy cập Web App").trim();
        tcSheet.appendRow([timeVal, userVal, noteVal]);
      }

      if (action === "recordAppClick") {
        var appKey = String(postData.appKey || "").trim();
        if (appKey) {
          recordAppClickEntry(tcSheet, appKey);
        }
      }

      var stats = calculateTruyCapStats(tcSheet);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        totalVisits: stats.totalVisits,
        countB: stats.countB,
        backupCount: stats.backupCount,
        appVisits: stats.appVisits
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (tcErr) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Lỗi sheet truycap: " + tcErr.toString(),
        totalVisits: 0,
        appVisits: {}
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "importGVCN") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) {
      sheet = ss.insertSheet("GVCN");
    } else {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
      }
    }

    sheet.getRange(1, 1, 1, 7).setValues([["STT", "Họ và tên", "Lớp", "Mã HS", "Số tiền nộp", "Ghi chú", "Tổng nộp"]]);
    sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");

    var students = postData.data || [];
    var rowsToAdd = [];
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      rowsToAdd.push([
        i + 1,
        String(s.name || "").trim(),
        String(s.class || "").trim(),
        String(s.code || "").trim(),
        Number(s.totalAmount) || 0,
        String(s.note || "").trim(),
        Number(s.totalPaid || s.totalAmount) || 0
      ]);
    }

    if (rowsToAdd.length > 0) {
      sheet.getRange(2, 1, rowsToAdd.length, 7).setValues(rowsToAdd);
    }

    sheet.autoResizeColumns(1, 7);
    var lastRow = sheet.getLastRow();
    if (lastRow > 0) {
      sheet.setRowHeights(1, lastRow, 26);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã nhập và thay thế hoàn toàn " + rowsToAdd.length + " học sinh vào sheet GVCN thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "uploadLanNopGVCN") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Chưa có danh sách GVCN! Vui lòng nhập danh sách học sinh trước."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var vals = sheet.getDataRange().getValues();
    if (vals.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Danh sách GVCN đang trống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    function parseRoundName(rawName) {
      if (!rawName) return "";
      var clean = String(rawName).trim();
      var match = clean.match(/^lan\s*(\d+)$/i) || clean.match(/^lần\s*(\d+)$/i) || clean.match(/^(\d+)$/);
      if (match) {
        return "Lan" + match[1];
      }
      return clean;
    }

    var headerRow = vals[0];
    var roundColMap = {};
    var maxRoundColIdx = 6;

    for (var cIdx = 7; cIdx < headerRow.length; cIdx++) {
      var hVal = String(headerRow[cIdx] || "").trim();
      if (hVal !== "") {
        roundColMap[hVal.toLowerCase()] = cIdx;
        if (cIdx > maxRoundColIdx) maxRoundColIdx = cIdx;
      }
    }

    var studentList = postData.data || [];
    var commonRoundName = "";

    for (var i = 0; i < studentList.length; i++) {
      var rName = parseRoundName(studentList[i].lanNopName || studentList[i].lanNop || studentList[i].round || "");
      if (rName) {
        commonRoundName = rName;
        break;
      }
    }

    if (!commonRoundName) {
      var nextNum = (maxRoundColIdx - 7) + 2;
      if (nextNum < 1) nextNum = 1;
      commonRoundName = "Lan" + nextNum;
    }

    var targetColIdx = roundColMap[commonRoundName.toLowerCase()];

    if (targetColIdx === undefined) {
      targetColIdx = maxRoundColIdx + 1;
      var numMatch = commonRoundName.match(/\d+/);
      if (numMatch) {
        var rNum = parseInt(numMatch[0], 10);
        if (rNum > 0) {
          var suggestedIdx = 7 + (rNum - 1);
          if (suggestedIdx > targetColIdx) targetColIdx = suggestedIdx;
        }
      }
      sheet.getRange(1, targetColIdx + 1).setValue(commonRoundName).setFontWeight("bold").setBackground("#e0f2fe");
    }

    var studentRowMap = {};
    for (var r = 1; r < vals.length; r++) {
      var code = String(vals[r][3] || "").trim().toLowerCase();
      if (code !== "") studentRowMap[code] = r + 1;
    }

    var updatedCount = 0;
    for (var sIdx = 0; sIdx < studentList.length; sIdx++) {
      var item = studentList[sIdx];
      var sCode = String(item.code || "").trim().toLowerCase();
      var lanNopAmount = Number(item.lanNopAmount || item.totalAmount) || 0;

      if (sCode !== "" && studentRowMap[sCode]) {
        var rowNum = studentRowMap[sCode];
        sheet.getRange(rowNum, targetColIdx + 1).setValue(lanNopAmount);
        updatedCount++;
      }
    }

    var lastRow = sheet.getLastRow();
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    if (lastRow > 0) {
      sheet.setRowHeights(1, lastRow, 26);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã nạp thành công đợt " + commonRoundName + " vào 1 cột duy nhất cho " + updatedCount + " học sinh!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addGVCNStudent") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) {
      sheet = ss.insertSheet("GVCN");
      sheet.appendRow(["STT", "Họ và tên", "Lớp", "Mã HS", "Số tiền nộp", "Ghi chú", "Tổng nộp"]);
      sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");
    }

    var s = postData.student;
    var vals = sheet.getDataRange().getValues();

    var inputCode = String(s.code || "").trim().toLowerCase();
    if (inputCode !== "") {
      for (var i = 1; i < vals.length; i++) {
        var existingCode = String(vals[i][3] || "").trim().toLowerCase();
        if (isEqual(existingCode, inputCode)) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: "Mã học sinh " + s.code + " đã tồn tại trong danh sách GVCN!"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    var nextSTT = vals.length;
    var newRow = [
      nextSTT,
      String(s.name || "").trim(),
      String(s.class || "").trim(),
      String(s.code || "").trim(),
      Number(s.totalAmount) || 0,
      String(s.note || "").trim(),
      Number(s.totalPaid || s.totalAmount) || 0
    ];

    sheet.appendRow(newRow);
    sheet.autoResizeColumns(1, 7);
    var lastRow = sheet.getLastRow();
    sheet.setRowHeights(1, lastRow, 26);

    var amount = Number(s.totalAmount) || 0;
    var studentCode = String(s.code || "").trim();
    if (amount > 0 && studentCode !== "") {
      var txSheet = ss.getSheetByName("transactioncn");
      if (!txSheet) {
        txSheet = ss.insertSheet("transactioncn");
        txSheet.appendRow(["ID", "Ngân Hàng", "Số Tài Khoản", "Số Tiền", "Loại", "Ngày", "Mô Tả", "Hình thức"]);
        txSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#f3f3f3");
      }

      var bankId2 = String(postData.bankId2 || (adminSheet ? adminSheet.getRange("C6").getValue() : "") || "MB").trim();
      var bankAccountNo2 = String(postData.bankAccountNo2 || (adminSheet ? adminSheet.getRange("C7").getValue() : "") || "").replace(/^'/, "").trim();
      var bankAccountName2 = String(postData.bankAccountName2 || (adminSheet ? adminSheet.getRange("C8").getValue() : "") || "").trim();
      var paymentMethod = String(postData.paymentMethod || s.paymentMethod || "Tiền mặt").trim();

      var roundName = String(postData.roundName || postData.lanNop || "").trim();
      if (!roundName) {
        var gvcnHeader = sheet.getDataRange().getValues()[0] || [];
        if (gvcnHeader.length > 7) {
          roundName = String(gvcnHeader[gvcnHeader.length - 1] || "L1").trim();
        } else {
          roundName = "L1";
        }
      }

      var txDesc = (studentCode + " " + roundName + " nộp tiền").trim();
      var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

      var txVals = txSheet.getDataRange().getValues();
      var txFoundIndex = -1;

      for (var t = 1; t < txVals.length; t++) {
        var rowDesc = String(txVals[t][6] || "").trim().toUpperCase();
        var matchCode = rowDesc.indexOf(studentCode.toUpperCase()) !== -1;
        var matchLan = rowDesc.indexOf(roundName.toUpperCase()) !== -1 ||
          rowDesc.indexOf(roundName.replace(/LAN/i, "L").toUpperCase()) !== -1 ||
          rowDesc.indexOf(roundName.replace(/^L/i, "Lan").toUpperCase()) !== -1;
        if (matchCode && matchLan) {
          txFoundIndex = t + 1;
          break;
        }
      }

      if (txFoundIndex !== -1) {
        txSheet.getRange(txFoundIndex, 1).setValue(bankId2);
        txSheet.getRange(txFoundIndex, 2).setValue(bankAccountName2);
        txSheet.getRange(txFoundIndex, 3).setValue("'" + bankAccountNo2);
        txSheet.getRange(txFoundIndex, 4).setValue(amount);
        txSheet.getRange(txFoundIndex, 5).setValue("Tiền vào");
        txSheet.getRange(txFoundIndex, 6).setValue(currentDate);
        txSheet.getRange(txFoundIndex, 7).setValue(txDesc);
        txSheet.getRange(txFoundIndex, 8).setValue(paymentMethod);
      } else {
        txSheet.appendRow([
          bankId2,
          bankAccountName2,
          "'" + bankAccountNo2,
          amount,
          "Tiền vào",
          currentDate,
          txDesc,
          paymentMethod
        ]);
        var txLastRow = txSheet.getLastRow();
        txSheet.setRowHeights(1, txLastRow, 26);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã thêm thành công học sinh " + s.name + " vào danh sách GVCN!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateGVCNStudent") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) return createResponse("Lỗi: Không tìm thấy sheet GVCN", 404);

    var s = postData.student;
    var vals = sheet.getDataRange().getValues();
    var foundIndex = -1;

    var oldCode = postData.oldCode || s.code || "";
    for (var i = 1; i < vals.length; i++) {
      if (isEqual(vals[i][3], oldCode)) {
        foundIndex = i + 1;
        break;
      }
    }

    if (foundIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Không tìm thấy học sinh để sửa!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var inputCode = String(s.code || "").trim().toLowerCase();
    if (!isEqual(inputCode, oldCode)) {
      for (var i = 1; i < vals.length; i++) {
        if (i + 1 !== foundIndex) {
          var existingCode = vals[i][3] || "";
          if (isEqual(existingCode, inputCode)) {
            return ContentService.createTextOutput(JSON.stringify({
              success: false,
              message: "Mã học sinh mới " + s.code + " đã trùng với học sinh khác!"
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    sheet.getRange(foundIndex, 2).setValue(String(s.name || "").trim());
    sheet.getRange(foundIndex, 3).setValue(String(s.class || "").trim());
    sheet.getRange(foundIndex, 4).setValue(String(s.code || "").trim());
    sheet.getRange(foundIndex, 5).setValue(Number(s.totalAmount) || 0);
    sheet.getRange(foundIndex, 6).setValue(String(s.note || "").trim());
    sheet.getRange(foundIndex, 7).setValue(Number(s.totalPaid) || 0);

    var amount = Number(s.totalAmount) || 0;
    var studentCode = String(s.code || "").trim();
    if (amount > 0 && studentCode !== "") {
      var txSheet = ss.getSheetByName("transactioncn");
      if (!txSheet) {
        txSheet = ss.insertSheet("transactioncn");
        txSheet.appendRow(["ID", "Ngân Hàng", "Số Tài Khoản", "Số Tiền", "Loại", "Ngày", "Mô Tả", "Hình thức"]);
        txSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#f3f3f3");
      }

      var bankId2 = String(postData.bankId2 || (adminSheet ? adminSheet.getRange("C6").getValue() : "") || "MB").trim();
      var bankAccountNo2 = String(postData.bankAccountNo2 || (adminSheet ? adminSheet.getRange("C7").getValue() : "") || "").replace(/^'/, "").trim();
      var bankAccountName2 = String(postData.bankAccountName2 || (adminSheet ? adminSheet.getRange("C8").getValue() : "") || "").trim();
      var paymentMethod = String(postData.paymentMethod || s.paymentMethod || "Tiền mặt").trim();

      var roundName = String(postData.roundName || postData.lanNop || "").trim();
      if (!roundName) {
        var gvcnHeader = vals[0] || [];
        if (gvcnHeader.length > 7) {
          roundName = String(gvcnHeader[gvcnHeader.length - 1] || "L1").trim();
        } else {
          roundName = "L1";
        }
      }

      var txDesc = (studentCode + " " + roundName + " nộp tiền").trim();
      var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

      var txVals = txSheet.getDataRange().getValues();
      var txFoundIndex = -1;

      for (var t = 1; t < txVals.length; t++) {
        var rowDesc = String(txVals[t][6] || "").trim().toUpperCase();
        var matchCode = rowDesc.indexOf(studentCode.toUpperCase()) !== -1;
        var matchLan = rowDesc.indexOf(roundName.toUpperCase()) !== -1 ||
          rowDesc.indexOf(roundName.replace(/LAN/i, "L").toUpperCase()) !== -1 ||
          rowDesc.indexOf(roundName.replace(/^L/i, "Lan").toUpperCase()) !== -1;
        if (matchCode && matchLan) {
          txFoundIndex = t + 1;
          break;
        }
      }

      if (txFoundIndex !== -1) {
        txSheet.getRange(txFoundIndex, 1).setValue(bankId2);
        txSheet.getRange(txFoundIndex, 2).setValue(bankAccountName2);
        txSheet.getRange(txFoundIndex, 3).setValue("'" + bankAccountNo2);
        txSheet.getRange(txFoundIndex, 4).setValue(amount);
        txSheet.getRange(txFoundIndex, 5).setValue("Tiền vào");
        txSheet.getRange(txFoundIndex, 6).setValue(currentDate);
        txSheet.getRange(txFoundIndex, 7).setValue(txDesc);
        txSheet.getRange(txFoundIndex, 8).setValue(paymentMethod);
      } else {
        txSheet.appendRow([
          bankId2,
          bankAccountName2,
          "'" + bankAccountNo2,
          amount,
          "Tiền vào",
          currentDate,
          txDesc,
          paymentMethod
        ]);
        var txLastRow = txSheet.getLastRow();
        txSheet.setRowHeights(1, txLastRow, 26);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã cập nhật thông tin học sinh " + s.name + " thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteGVCNStudent") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) return createResponse("Lỗi: Không tìm thấy sheet GVCN", 404);

    var code = postData.code || "";
    var vals = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < vals.length; i++) {
      if (isEqual(vals[i][3], code)) {
        foundIndex = i + 1;
        break;
      }
    }

    if (foundIndex !== -1) {
      sheet.deleteRow(foundIndex);

      var newValues = sheet.getDataRange().getValues();
      var count = 1;
      for (var j = 1; j < newValues.length; j++) {
        if (newValues[j][1]) {
          sheet.getRange(j + 1, 1).setValue(count);
          count++;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Đã xóa học sinh thành công!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Không tìm thấy học sinh cần xóa!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "resetGVCN") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      var txSheet = ss.getSheetByName("transactioncn");
      if (txSheet) {
        var txLastRow = txSheet.getLastRow();
        if (txLastRow > 1) {
          var luuSheet = ss.getSheetByName("luutransaction");
          if (!luuSheet) {
            luuSheet = ss.insertSheet("luutransaction");
            luuSheet.appendRow(["ID", "Ngân Hàng", "Số Tài Khoản", "Số Tiền", "Loại", "Ngày", "Mô Tả"]);
            luuSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");
          }

          var txData = txSheet.getRange(2, 1, txLastRow - 1, 7).getValues();
          var luuLastRow = luuSheet.getLastRow();
          luuSheet.getRange(luuLastRow + 1, 1, txData.length, 7).setValues(txData);
          txSheet.getRange(2, 1, txLastRow - 1, 7).clearContent();
        }
      }
    } catch (err) {
      console.error("Lỗi GVCN reset lưu trữ giao dịch:", err.toString());
    }

    var sheet = ss.getSheetByName("GVCN");
    if (!sheet) return createResponse("Lỗi: Không tìm thấy sheet GVCN", 404);

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 5, lastRow - 1, 1).setValue(0);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã resetgvcn: Lưu trữ và làm sạch sheet transactioncn thành công, đặt số tiền nộp lớp GVCN về 0!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "resetTransactionKD") {
    var inputPassword = postData.password;
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      var txSheet = ss.getSheetByName("transactionkd");
      if (!txSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Lỗi: Không tìm thấy sheet transactionkd"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var txLastRow = txSheet.getLastRow();
      if (txLastRow > 1) {
        var luuSheet = ss.getSheetByName("luutransaction");
        if (!luuSheet) {
          luuSheet = ss.insertSheet("luutransaction");
          luuSheet.appendRow(["Mã tham chiếu", "Ngân hàng", "Số tài khoản", "Số tiền", "Loại", "Ngày giao dịch", "Nội dung thanh toán"]);
          luuSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");
        }

        var txData = txSheet.getRange(2, 1, txLastRow - 1, 10).getValues();
        var rowsToSave = [];

        for (var i = 0; i < txData.length; i++) {
          var row = txData[i];
          var maThamChieu = String(row[8] || "").trim();
          var nganHang = String(row[0] || "").trim();
          var soTaiKhoan = String(row[2] || "").trim();
          var soTien = Number(row[7]) || 0;
          var loai = String(row[6] || "").trim();
          var ngayGiaoDich = row[1];
          if (ngayGiaoDich instanceof Date) {
            ngayGiaoDich = Utilities.formatDate(ngayGiaoDich, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
          } else {
            ngayGiaoDich = String(ngayGiaoDich || "").trim();
          }
          var noiDung = String(row[5] || "").trim();

          rowsToSave.push([
            maThamChieu,
            nganHang,
            "'" + soTaiKhoan,
            soTien,
            loai,
            ngayGiaoDich,
            noiDung
          ]);
        }

        var luuLastRow = luuSheet.getLastRow();
        if (luuLastRow === 0) {
          luuSheet.appendRow(["Mã tham chiếu", "Ngân hàng", "Số tài khoản", "Số tiền", "Loại", "Ngày giao dịch", "Nội dung thanh toán"]);
          luuSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");
          luuLastRow = 1;
        }

        luuSheet.getRange(luuLastRow + 1, 1, rowsToSave.length, 7).setValues(rowsToSave);
        txSheet.getRange(2, 1, txLastRow - 1, 10).clearContent();

        luuSheet.autoResizeColumns(1, 7);
        luuSheet.setRowHeights(1, luuSheet.getLastRow(), 26);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Đã resetTransactionKD: Chuyển xong các giao dịch sang sheet luutransaction và làm sạch sheet transactionkd thành công!"
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Lỗi resetTransactionKD: " + err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "addPayment") {
    var inputPassword = postData.password;
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return createResponse("Mật khẩu Admin không chính xác!", 403);
    }

    var targetLan = String(postData.lanNop || "").trim();
    var targetCode = String(postData.code || "").trim();
    var targetAmount = Number(postData.soTien) || 0;
    var paymentMethod = String(postData.paymentMethod || "Tiền mặt").trim();
    var bankId = String(postData.bankId || "BIDV").trim();
    var bankAccountNo = String(postData.bankAccountNo || "").trim();
    var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

    var txSheet = ss.getSheetByName("transactionkd");
    if (!txSheet) {
      txSheet = ss.insertSheet("transactionkd");
      txSheet.appendRow(["Ngân hàng", "Ngày giao dịch", "Số tài khoản", "Tài khoản phụ", "Code TT", "Nội dung thanh toán", "Loại", "Số tiền", "Mã tham chiếu", "Lũy kế"]);
      txSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#f3f3f3");
    }

    var txVals = txSheet.getDataRange().getValues();
    var txContent = (targetCode + " " + targetLan + " Nop tien").trim();
    var txFoundIndex = -1;

    for (var t = 1; t < txVals.length; t++) {
      var rowDesc = String(txVals[t][5] || "").trim().toUpperCase();
      var matchCode = targetCode !== "" && rowDesc.indexOf(targetCode.toUpperCase()) !== -1;
      var matchLan = targetLan !== "" && (rowDesc.indexOf(targetLan.toUpperCase()) !== -1 || rowDesc.indexOf(targetLan.replace("L", "L0").toUpperCase()) !== -1);
      if (matchCode && matchLan) {
        txFoundIndex = t + 1;
        break;
      }
    }

    if (txFoundIndex !== -1) {
      txSheet.getRange(txFoundIndex, 1).setValue(bankId);
      txSheet.getRange(txFoundIndex, 2).setValue(currentDate);
      txSheet.getRange(txFoundIndex, 3).setValue("'" + bankAccountNo);
      txSheet.getRange(txFoundIndex, 4).setValue("");
      txSheet.getRange(txFoundIndex, 5).setValue("");
      txSheet.getRange(txFoundIndex, 6).setValue(txContent);
      txSheet.getRange(txFoundIndex, 7).setValue("Tiền vào");
      txSheet.getRange(txFoundIndex, 8).setValue(targetAmount);
      txSheet.getRange(txFoundIndex, 9).setValue(paymentMethod);
      return createResponse("Đã ghi đè giao dịch " + paymentMethod + " vào sheet transactionkd thành công!", 200);
    } else {
      txSheet.appendRow([
        bankId,
        currentDate,
        "'" + bankAccountNo,
        "",
        "",
        txContent,
        "Tiền vào",
        targetAmount,
        paymentMethod,
        ""
      ]);
      var txLastRow = txSheet.getLastRow();
      txSheet.setRowHeights(1, txLastRow, 26);
      return createResponse("Đã ghi nhận giao dịch " + paymentMethod + " vào sheet transactionkd thành công!", 200);
    }
  }

  if (action === "deleteStudent") {
    var targetSheetName = postData.className;
    var studentName = postData.studentName;
    var code = postData.studentCode || "";
    var inputPassword = postData.password;

    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;
    if (!isValidAdminPass(inputPassword, c2Val)) {
      return createResponse("Mật khẩu Admin không chính xác! Không thể xóa học sinh.", 403);
    }

    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) return createResponse("Lỗi: Không tìm thấy lớp", 404);

    var values = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < values.length; i++) {
      if (i >= maxrowhs) break;
      if (isEqual(values[i][5], code)) {
        foundIndex = i + 1;
        break;
      }
    }

    if (foundIndex !== -1) {
      var rangeToDelete = sheet.getRange(foundIndex, 1, 1, 18);
      rangeToDelete.deleteCells(SpreadsheetApp.Dimension.ROWS);

      var newValues = sheet.getDataRange().getValues();
      var count = 1;
      for (var j = 1; j < newValues.length; j++) {
        if (j >= maxrowhs) break;
        if (newValues[j][1]) {
          sheet.getRange(j + 1, 1).setValue(count);
          count++;
        }
      }

      return createResponse("Đã xóa học sinh " + studentName + " thành công!", 200);
    }
    return createResponse("Không tìm thấy học sinh cần xóa trên hệ thống.", 444);
  }

  if (action === "updateStudent") {
    var targetSheetName = postData.className || postData.targetSheet;
    var oldCode = postData.oldCode || postData.studentCode || (postData.student ? postData.student.code : "") || "";
    var studentName = postData.studentName || (postData.student ? postData.student.name : "") || "";
    var inputPassword = postData.password;

    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;
    if (!isValidAdminPass(inputPassword, c2Val)) {
      return createResponse("Mật khẩu Admin không chính xác! Không thể sửa thông tin học sinh.", 403);
    }

    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) return createResponse("Lỗi: Không tìm thấy lớp " + targetSheetName, 404);

    var values = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < values.length; i++) {
      if (i >= maxrowhs) break;
      var cellCode = String(values[i][5] || "").trim();
      var cellName = String(values[i][1] || "").trim();
      if ((oldCode !== "" && isEqual(cellCode, oldCode)) || (studentName !== "" && isEqual(cellName, studentName))) {
        foundIndex = i + 1;
        break;
      }
    }

    if (foundIndex !== -1) {
      var sData = postData.student || postData.data || postData;
      var newName = sData.name !== undefined ? sData.name : values[foundIndex - 1][1];
      var newClass = sData.class !== undefined ? sData.class : values[foundIndex - 1][2];
      var newSchool = sData.school !== undefined ? sData.school : values[foundIndex - 1][3];
      var newPhone = sData.phoneNumber !== undefined ? sData.phoneNumber : values[foundIndex - 1][4];
      var newCode = sData.code !== undefined ? sData.code : values[foundIndex - 1][5];
      var newHeso = sData.heso !== undefined ? parseHeso(sData.heso) : parseHeso(values[foundIndex - 1][6]);

      sheet.getRange(foundIndex, 2).setValue(newName);
      sheet.getRange(foundIndex, 3).setValue(newClass);
      sheet.getRange(foundIndex, 4).setValue(newSchool);
      sheet.getRange(foundIndex, 5).setValue("'" + String(newPhone || "").replace(/^'/, ""));
      sheet.getRange(foundIndex, 6).setValue(newCode);
      sheet.getRange(foundIndex, 7).setValue(newHeso);

      SpreadsheetApp.flush();
      return createResponse("Đã cập nhật thông tin học sinh " + newName + " thành công!", 200);
    }
    return createResponse("Không tìm thấy học sinh cần sửa trên hệ thống.", 444);
  }

  if (action === "updateSettings") {
    var feeSheet = ss.getSheetByName("hocphi");
    if (feeSheet) {
      var currentIdgv = String(postData.idgv || "").trim();
      var passnew = postData.password || feeSheet.getRange("C2").getValue() || passAdmin2;
      if (currentIdgv === "demo2626226") {
        passnew = "2626226";
      }

      var acc1 = String(postData.bankAccountNo || "").replace(/^'/, "").trim();
      var acc2 = String(postData.bankAccountNo2 || "").replace(/^'/, "").trim();

      var settingsData = [
        [passnew !== undefined && passnew !== null ? String(passnew).trim() : passAdmin2],
        [postData.bankId || ""],
        [acc1 ? "'" + acc1 : ""],
        [postData.bankAccountName || ""],
        [postData.bankId2 || ""],
        [acc2 ? "'" + acc2 : ""],
        [postData.bankAccountName2 || ""]
      ];

      feeSheet.getRange("C2:C8").setValues(settingsData);

      if (postData.fees && postData.fees.length > 0) {
        var rangeA = feeSheet.getRange("A:A").getValues();

        postData.fees.forEach(function (item) {
          if (!item || item.className === undefined) return;
          var rawName = String(item.className).trim();
          var searchClassName = rawName.toLowerCase();
          var searchClean = searchClassName.replace(/[^a-zA-Z0-9]/g, '');
          var found = false;

          for (var i = 0; i < rangeA.length; i++) {
            var rowClassName = String(rangeA[i][0] || "").trim();
            var rowClean = rowClassName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            if (isEqual(rowClassName, searchClassName) || (searchClean !== "" && rowClean === searchClean)) {
              var newFee = Number(item.fee);
              if (!isNaN(newFee)) {
                feeSheet.getRange(i + 1, 2).setValue(newFee);
              }
              found = true;
              var sheet = ss.getSheetByName(item.className) || ss.getSheetByName(rowClassName);
              if (sheet && sheet.getLastRow() > 1) {
                try {
                  capNhatHocPhiSauDiemDanh(sheet.getName(), ss);
                } catch (err) {
                  console.error("Lỗi capNhatHocPhiSauDiemDanh:", err.toString());
                }
              }
              break;
            }
          }

          if (!found && rawName !== "") {
            var feeVal = Number(item.fee);
            if (!isNaN(feeVal)) {
              feeSheet.appendRow([rawName, feeVal]);
              rangeA = feeSheet.getRange("A:A").getValues();
            }
          }
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Cập nhật Mật khẩu Admin C2 và Mức học phí thành công!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return createResponse("Không tìm thấy sheet hocphi", 404);
  }

  if (action === "addManualStudent") {
    var s = postData.data;
    var sheetName = s.targetSheet;
    var sheet = ss.getSheetByName(sheetName);
    var code = s.code;

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["STT", "name", "class", "school", "phoneNumber", "code", "heso", "Ngày 1", "Ngày 2", "Ngày 3", "Ngày 4", "Ngày 5", "Ngày 6", "Ngày 7", "Ngày 8", "Ngày 9", "Ngày 10", "tongtien"]);
      sheet.getRange("A1:R1").setFontWeight("bold").setBackground("#f3f3f3");
    }
    var vals = sheet.getRange(1, 1, maxrowhs, 18).getValues();
    var hsRow = vals.filter(function (row) {
      return row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== "";
    }).length;
    if (hsRow >= maxrowhs) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Số học sinh của " + sheetName + " đã đạt giới hạn tối đa " + (maxrowhs - 1) + ". Đề nghị tạo lớp mới " + sheetName + ".1!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    var inputCode = s.code || "";
    if (inputCode !== "") {
      for (var i = 1; i < vals.length; i++) {
        if (vals[i][1] !== "" && vals[i][1] !== null) {
          var existingCode = vals[i][5] || "";
          if (isEqual(existingCode, inputCode)) {
            return ContentService.createTextOutput(JSON.stringify({
              success: false,
              message: "Mã học sinh " + s.code + " đã tồn tại trong danh sách lớp " + sheetName
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }
    var nextSTT = hsRow;
    var newRow = [
      nextSTT,
      s.name,
      s.class,
      s.school,
      "'" + String(s.phoneNumber || ""),
      code,
      parseHeso(s.heso),
      "", "", "", "", "", "", "", "", "", "",
      0
    ];

    sheet.getRange(nextSTT + 1, 1, 1, 18).setValues([newRow]);
    sheet.setRowHeights(1, maxrowhs, 26);
    syncToTHHT(ss);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã thêm học sinh " + s.name + " mã " + code + " thành công vào danh sách lớp " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "importStudents") {
    var students = postData.data;
    var grouped = {};

    students.forEach(function (s) {
      var targetSheet;
      if (s.note && s.note.trim() !== "") {
        targetSheet = "Lop" + s.note.trim();
      } else {
        var grade = String(s.class || "").match(/\d+/);
        targetSheet = grade ? "Lop" + grade[0] : "LopKhac";
      }

      if (!grouped[targetSheet]) grouped[targetSheet] = [];
      grouped[targetSheet].push(s);
    });

    var countAdded = 0;
    var processedSheets = [];

    for (var sheetName in grouped) {
      var sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["STT", "name", "class", "school", "phoneNumber", "code", "heso", "Ngày 1", "Ngày 2", "Ngày 3", "Ngày 4", "Ngày 5", "Ngày 6", "Ngày 7", "Ngày 8", "Ngày 9", "Ngày 10", "tongtien"]);
        sheet.getRange("A1:R1").setFontWeight("bold").setBackground("#f3f3f3");
      }

      var vals = sheet.getRange(2, 1, maxrowhs, 18).getValues();

      var actualStudents = vals.filter(function (row) {
        return row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== "";
      });

      var currentStudentCount = actualStudents.length;

      if (currentStudentCount >= maxrowhs - 1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Lớp " + sheetName + " đã đạt giới hạn tối đa " + (maxrowhs - 1) + " học sinh!"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var startRow = 2 + currentStudentCount;
      var nextSTT = currentStudentCount + 1;

      var existingKeys = {};
      if (currentStudentCount > 0) {
        actualStudents.forEach(function (row) {
          var key = String(row[5] || "").trim().toLowerCase();
          if (key !== "") existingKeys[key] = true;
        });
      }

      var rowsToAdd = [];
      var currentGroup = grouped[sheetName];

      for (var i = 0; i < currentGroup.length; i++) {
        var s = currentGroup[i];
        var newKey = String(s.code || "").trim().toLowerCase();

        if (currentStudentCount === 0 || (newKey !== "" && !existingKeys[newKey])) {
          if (nextSTT > maxrowhs - 1) {
            break;
          }

          rowsToAdd.push([
            nextSTT,
            String(s.name || "").trim(),
            String(s.class || "").trim(),
            String(s.school || "").trim(),
            "'" + String(s.phoneNumber || ""),
            String(s.code || "").trim(),
            parseHeso(s.heso),
            "", "", "", "", "", "", "", "", "", "",
            0
          ]);

          nextSTT++;
          countAdded++;
        }
      }

      if (rowsToAdd.length > 0) {
        sheet.getRange(startRow, 1, rowsToAdd.length, 18).setValues(rowsToAdd);
      }
      sheet.setRowHeights(1, maxrowhs, 26);
      processedSheets.push(sheetName);
    }
    syncToTHHT(ss);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Thành công: Đã bổ sung thêm " + countAdded + " học sinh mới vào các lớp [" + processedSheets.join(", ") + "]!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateAttendance") {
    var targetSheetName = postData.className;
    var sheet = ss.getSheetByName(targetSheetName);

    var rawDate = "";
    if (postData.students && postData.students.length > 0 && postData.students[0].date) {
      rawDate = postData.students[0].date;
    } else if (postData.date) {
      rawDate = postData.date;
    } else {
      rawDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yy");
    }

    if (!sheet) return createResponse("Lỗi: Không thấy sheet", 404);

    function formatDDMMYY(v) {
      if (v === null || v === undefined || v === "") return "";
      if (v instanceof Date) {
        return Utilities.formatDate(v, Session.getScriptTimeZone(), "dd/MM/yy");
      }
      var str = String(v).trim();
      if (!str) return "";
      var m = str.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
      if (m) {
        var day = m[1].padStart(2, '0');
        var mon = m[2].padStart(2, '0');
        var yr = m[3] ? m[3].slice(-2) : "";
        if (yr) return day + "/" + mon + "/" + yr;
        return day + "/" + mon;
      }
      return str;
    }

    var targetDateStr = formatDDMMYY(rawDate);
    if (!targetDateStr) {
      targetDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yy");
    }

    var values = sheet.getRange(1, 1, maxrowhs, 18).getValues();
    var headerDisplayRow = sheet.getRange(1, 8, 1, 10).getDisplayValues()[0];
    var students = postData.students || [];

    var duplicateFound = false;
    var matchedHeaderStr = "";
    var targetCol = -1;

    for (var col = 7; col <= 16; col++) {
      var headerVal = headerDisplayRow[col - 7];
      var headerDateStr = formatDDMMYY(headerVal);

      if (headerDateStr !== "" && targetDateStr !== "") {
        if (headerDateStr === targetDateStr ||
          (headerDateStr.length >= 5 && targetDateStr.length >= 5 && headerDateStr.substring(0, 5) === targetDateStr.substring(0, 5))) {
          duplicateFound = true;
          matchedHeaderStr = headerDateStr;
          break;
        }
      }

      if (targetCol === -1) {
        if (headerVal === "" || headerVal === null || headerVal === undefined || String(headerVal).indexOf("Ngày") === 0) {
          targetCol = col + 1;
        }
      }
    }

    if (duplicateFound) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 400,
        success: false,
        message: "Ngày " + (matchedHeaderStr || targetDateStr) + " đã điểm danh, đề nghị Reset 1 ngày để điểm danh lại!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (targetCol === -1) {
      targetCol = 17;
    }

    var isFull10 = (targetCol === 17);

    sheet.getRange(1, targetCol).setNumberFormat("@").setValue(targetDateStr);

    students.forEach(function (s) {
      for (var i = 1; i < values.length; i++) {
        if (i > maxrowhs) break;
        if (isEqual(values[i][5], s.code)) {
          sheet.getRange(i + 1, targetCol).setValue(s.isPresent ? 1 : 0);
          break;
        }
      }
    });

    sheet.setRowHeights(1, maxrowhs, 26);
    capNhatHocPhiSauDiemDanh(targetSheetName, ss);

    if (isFull10) {
      var maxRows = sheet.getMaxRows();
      var lastRowWithStudents = sheet.getRange(maxRows, 2).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();

      if (lastRowWithStudents < 1 || sheet.getRange(2, 2).getValue() === "") {
        lastRowWithStudents = 1;
      }

      var sourceRangeCol = 18;
      var historyTargetCol = 20;
      var historyTargetRow = 1;

      var lastRowInS = sheet.getRange(maxRows, historyTargetCol).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();

      if (lastRowInS > 1 || sheet.getRange(1, historyTargetCol).getValue() !== "") {
        historyTargetRow = lastRowInS + 2;
      }

      var sourceRange = sheet.getRange(1, 1, lastRowWithStudents, sourceRangeCol);
      var newHistoryRange = sheet.getRange(historyTargetRow, historyTargetCol, lastRowWithStudents, sourceRangeCol);

      sourceRange.copyTo(newHistoryRange);

      var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
      sheet.getRange(historyTargetRow, 19).setValue("LƯU TRỮ - " + nowStr);

      for (var colReset = 8; colReset <= 17; colReset++) {
        sheet.getRange(1, colReset).setValue("Ngày " + (colReset - 7));
        if (lastRowWithStudents > 1) {
          sheet.getRange(2, colReset, lastRowWithStudents - 1, 1).clearContent();
        }
      }
      if (lastRowWithStudents > 1) {
        sheet.getRange(2, 18, lastRowWithStudents - 1, 1).clearContent();
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 200,
        success: true,
        message: "Đã điểm danh thành công buổi thứ 10! Hệ thống đã tự động lưu trữ dữ liệu sang cột S-AK và reset bảng điểm danh."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 200,
      success: true,
      message: "OK"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "verifyC2Password") {
    var inputPassword = String(postData.password || "").trim();
    var verifyResult = verifyC2Password(inputPassword, postData.idgv, postData.sheetId);
    return ContentService.createTextOutput(JSON.stringify(verifyResult)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "verifyStudentCode") {
    var studentCode = String(postData.code || postData.studentCode || "").trim();
    var targetSheet = String(postData.sheetName || postData.sheet || "").trim();
    var targetCol = postData.column || postData.col || "F";
    var verifyResult = verifyStudentCode(postData.idgv, targetSheet, targetCol, studentCode, postData.sheetId);
    return ContentService.createTextOutput(JSON.stringify(verifyResult)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getCopyrightStatus") {
    var bqSheet = ssadmin.getSheetByName("banquyen");
    var l1Val = bqSheet ? String(bqSheet.getRange("L1").getValue() || "").trim() : "";
    var isFree = (l1Val.toUpperCase() === "FREE");
    var statusStr = isFree ? "Free" : "VIP";
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: statusStr,
      enableCopyrightCheck: !isFree
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateCopyrightStatus" || action === "toggleCopyrightCheck") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    var currentSuperAdminPass = getSuperAdminPassword(ssadmin);
    var isPassValid = isEqualExact(inputPassword, currentSuperAdminPass) ||
      isValidAdminPass(inputPassword, c2Val);

    if (!inputPassword || !isPassValid) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Quản trị Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (!bqSheet) {
      bqSheet = ssadmin.insertSheet("banquyen");
    }

    var newStatus = "VIP";
    if (postData.status) {
      var s = String(postData.status).trim();
      newStatus = (s.toUpperCase() === "FREE") ? "Free" : "VIP";
    } else if (postData.enableCopyrightCheck !== undefined) {
      newStatus = (postData.enableCopyrightCheck === false || postData.enableCopyrightCheck === "false") ? "Free" : "VIP";
    }

    bqSheet.getRange("L1").setValue(newStatus);
    bqSheet.getRange("L1").setFontWeight("bold");
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã cập nhật trạng thái bản quyền vào ô L1 sheet banquyen: " + newStatus,
      status: newStatus,
      enableCopyrightCheck: (newStatus !== "Free")
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "checkAdmin") {
    var inputPassword = String(postData.password || "").trim();
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? String(adminSheet.getRange("C2").getValue() || "").trim() : passC2;

    var currentSuperAdminPass = getSuperAdminPassword(ssadmin);
    var isSuperAdmin = isEqualExact(inputPassword, currentSuperAdminPass) || isEqualExact(inputPassword, passAdmin2);

    if (inputPassword && (isSuperAdmin || isValidAdminPass(inputPassword, c2Val))) {
      var linksheet = adminSheet ? String(adminSheet.getRange("D2").getValue()).trim() : "";
      var sheetId = targetSheetId || extractSheetId(linksheet) || SPREADSHEET_ID_ADMIN;
      var bqSheetAdmin = ssadmin.getSheetByName("banquyen");
      var l1ValAdmin = bqSheetAdmin ? String(bqSheetAdmin.getRange("L1").getValue() || "").trim() : "";
      var isCopyrightFreeAdmin = (l1ValAdmin.toUpperCase() === "FREE");
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        isSuperAdmin: isSuperAdmin,
        sheetIdGV: sheetId,
        sheetId: sheetId,
        copyrightStatus: isCopyrightFreeAdmin ? "Free" : "VIP",
        enableCopyrightCheck: !isCopyrightFreeAdmin,
        message: "Xác thực thành công!"
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "changeAdminPassword") {
    var oldPass = String(postData.oldPassword || "").trim();
    var newPass = String(postData.newPassword || "").trim();
    var currentSuperPass = getSuperAdminPassword(ssadmin);

    if (!newPass) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu mới không được để trống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (oldPass && !isEqualExact(oldPass, currentSuperPass) && !isValidAdminPass(oldPass, passC2)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu cũ không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bq = ssadmin.getSheetByName("banquyen");
    if (!bq) bq = ssadmin.insertSheet("banquyen");
    bq.getRange("Q1").setValue(newPass);
    bq.getRange("Q1").setFontWeight("bold");
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã cập nhật mật khẩu Admin mới thành công vào ô Q1 sheet banquyen!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateVipPriceImage") {
    var inputPassword = String(postData.password || "").trim();
    var currentSuperPass = getSuperAdminPassword(ssadmin);
    if (inputPassword && !isEqualExact(inputPassword, currentSuperPass) && !isValidAdminPass(inputPassword, passC2)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var imageUrl = String(postData.imageUrl || postData.url || "").trim();
    var lvSheet = ssadmin.getSheetByName("levelvip");
    if (!lvSheet) {
      lvSheet = ssadmin.insertSheet("levelvip");
      lvSheet.getRange(1, 1, 1, 3).setValues([["Cấp độ VIP", "Giá (VNĐ)", "Link Ảnh Bảng Giá VIP"]]);
      lvSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#e0f2fe");
    }

    lvSheet.getRange("C1").setValue("Link Ảnh Bảng Giá VIP");
    lvSheet.getRange("C1").setFontWeight("bold");
    lvSheet.getRange("C2").setValue(imageUrl);
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      imageUrl: imageUrl,
      message: "Đã cập nhật link ảnh bảng giá VIP vào ô C2 sheet levelvip thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateLevelVip") {
    var inputPassword = String(postData.password || "").trim();
    var currentSuperPass = getSuperAdminPassword(ssadmin);
    if (inputPassword && !isEqualExact(inputPassword, currentSuperPass) && !isValidAdminPass(inputPassword, passC2)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var targetLevel = String(postData.level || "").trim().toUpperCase();
    var targetPrice = Number(postData.price) || 0;

    if (!targetLevel) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Chưa chọn cấp độ VIP!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var lvSheet = ssadmin.getSheetByName("levelvip");
    if (!lvSheet) {
      lvSheet = ssadmin.insertSheet("levelvip");
      lvSheet.getRange(1, 1, 1, 3).setValues([["Cấp độ VIP", "Giá (VNĐ)", "Link Ảnh Bảng Giá VIP"]]);
      lvSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#e0f2fe");
      lvSheet.getRange(2, 1, 4, 2).setValues([
        ["VIP1", 150000],
        ["VIP2", 250000],
        ["VIP3", 350000],
        ["VIP4", 500000]
      ]);
    }

    var lastRow = lvSheet.getLastRow();
    var foundRow = -1;
    if (lastRow > 1) {
      var colA = lvSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var r = 0; r < colA.length; r++) {
        if (String(colA[r][0] || "").trim().toUpperCase() === targetLevel) {
          foundRow = r + 2;
          break;
        }
      }
    }

    if (foundRow !== -1) {
      lvSheet.getRange(foundRow, 2).setValue(targetPrice);
    } else {
      var nextRow = Math.max(lastRow + 1, 2);
      lvSheet.getRange(nextRow, 1).setValue(targetLevel);
      lvSheet.getRange(nextRow, 2).setValue(targetPrice);
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      level: targetLevel,
      price: targetPrice,
      message: "Đã cập nhật giá " + targetLevel + " (" + targetPrice + "đ) vào sheet levelvip thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getAdminVipConfig") {
    var lvSheet = ssadmin.getSheetByName("levelvip");
    var imageUrl = "";
    var levels = [
      { level: "VIP1", price: 150000 },
      { level: "VIP2", price: 250000 },
      { level: "VIP3", price: 350000 },
      { level: "VIP4", price: 500000 }
    ];

    if (lvSheet) {
      try {
        imageUrl = String(lvSheet.getRange("C2").getValue() || "").trim();
        var lastRow = lvSheet.getLastRow();
        if (lastRow > 1) {
          var vals = lvSheet.getRange(2, 1, lastRow - 1, 2).getValues();
          var loadedLevels = [];
          for (var r = 0; r < vals.length; r++) {
            var lvl = String(vals[r][0] || "").trim().toUpperCase();
            var prc = Number(vals[r][1]) || 0;
            if (lvl) {
              loadedLevels.push({ level: lvl, price: prc });
            }
          }
          if (loadedLevels.length > 0) {
            levels = loadedLevels;
          }
        }
      } catch (errLv) {
        console.error("getAdminVipConfig error: " + errLv.toString());
      }
    }

    var vipPricesObj = {};
    for (var lIdx = 0; lIdx < levels.length; lIdx++) {
      vipPricesObj[levels[lIdx].level] = levels[lIdx].price;
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      imageUrl: imageUrl,
      vipPriceImageUrl: imageUrl,
      levels: levels,
      vipPrices: vipPricesObj
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateTeacherVip") {
    var idgv = String(postData.idgv || "").trim();
    var vipLevel = String(postData.vipLevel || postData.level || "VIP1").trim().toUpperCase();
    if (!idgv) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Thiếu IDGV giáo viên!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (!bqSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Không tìm thấy sheet banquyen!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = bqSheet.getLastRow();
    var foundIndex = -1;
    if (lastRow > 1) {
      var bqData = bqSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var b = 0; b < bqData.length; b++) {
        if (isEqual(bqData[b][0], idgv)) {
          foundIndex = b + 2;
          break;
        }
      }
    }

    if (foundIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Không tìm thấy giáo viên với IDGV " + idgv + " trong sheet banquyen!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var now = new Date();
    var timeZone = Session.getScriptTimeZone() || "GMT+7";
    var regDateStr = Utilities.formatDate(now, timeZone, "dd/MM/yyyy");
    var expDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    var expDateStr = Utilities.formatDate(expDate, timeZone, "dd/MM/yyyy");

    bqSheet.getRange(foundIndex, 6).setValue(vipLevel);
    bqSheet.getRange(foundIndex, 9).setValue(regDateStr);
    bqSheet.getRange(foundIndex, 10).setValue(expDateStr);
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      idgv: idgv,
      vipLevel: vipLevel,
      regDate: regDateStr,
      expDate: expDateStr,
      message: "Đã cập nhật cấp độ " + vipLevel + " cho giáo viên " + idgv + " thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "resetTienhoc") {
    var inputPassword = postData.password;
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;

    if (!isValidAdminPass(inputPassword, c2Val)) {
      return createResponse("Mật khẩu Admin không chính xác! Không thể reset lớp.", 403);
    }

    var sheet = ss.getSheetByName("ThuTien");
    if (!sheet) {
      return createResponse("Lỗi: Không tìm thấy hoặc không tồn tại sheet ThuTien", 404);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return createResponse("Danh sách nộp tiền hiện tại đang trống rỗng!", 200);
    }

    var targetClass = postData.className || postData.class || "";

    var digitMatch = targetClass.match(/\d+/);
    if (!digitMatch) {
      return createResponse("Lỗi: Không xác định được khối lớp để reset!", 400);
    }

    var matchPrefix = String(digitMatch[0]).padStart(2, '0');

    var dataRange = sheet.getRange(1, 1, lastRow, 4);
    var values = dataRange.getValues();
    var deletedCount = 0;

    for (var i = lastRow - 1; i >= 1; i--) {
      var cellClassValue = values[i][3] || "";

      var cellDigitMatch = cellClassValue.match(/\d+/);
      if (cellDigitMatch) {
        var cellPrefix = String(cellDigitMatch[0]).padStart(2, '0');

        if (isEqual(cellPrefix, matchPrefix)) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
    }

    return createResponse("Đã xóa sạch thành công " + deletedCount + " lượt nộp tiền học của khối " + matchPrefix + " trên Google Sheets!", 200);
  }

  if (action === "resetAttendance") {
    var targetSheetName = postData.className;
    var sheet = ss.getSheetByName(targetSheetName);
    var daysToReset = Number(postData.daysToReset) || 1;

    if (!sheet) return createResponse("Lỗi: Không thấy sheet", 404);

    var values = sheet.getDataRange().getValues();

    var activeCols = [];
    for (var col = 7; col <= 16; col++) {
      var cellVal = String(values[0][col]);
      if (cellVal !== "" && cellVal !== null && cellVal.indexOf("Ngày") === -1) {
        activeCols.push(col + 1);
      }
    }

    if (activeCols.length === 0) {
      return createResponse("Lớp này chưa có dữ liệu điểm danh nào ở chu kỳ hiện tại.", 200);
    }

    var colsToDelete = activeCols.slice(-daysToReset);
    var lastRow = sheet.getLastRow() > maxrowhs ? maxrowhs : sheet.getLastRow();

    colsToDelete.forEach(function (colIndex) {
      sheet.getRange(2, colIndex, lastRow - 1, 1).clearContent();
      sheet.getRange(1, colIndex).setValue("Ngày " + (colIndex - 7));
    });

    sheet.setRowHeights(1, maxrowhs, 26);
    capNhatHocPhiSauDiemDanh(targetSheetName, ss);
    return createResponse("Đã tiến hành reset thành công " + colsToDelete.length + " ngày điểm danh gần nhất trên Cloud!", 200);
  }

  if (action === "resetClass") {
    var targetSheetName = postData.className;
    var inputPassword = postData.password;
    var adminSheet = ss.getSheetByName("hocphi");
    var c2Val = adminSheet ? adminSheet.getRange("C2").getValue() : passC2;
    if (!isValidAdminPass(inputPassword, c2Val)) {
      return createResponse("Mật khẩu Admin không chính xác! Không thể reset lớp.", 403);
    }
    var sheet = ss.getSheetByName(targetSheetName);

    if (!sheet) return createResponse("Lỗi: Không tìm thấy lớp", 404);

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
      for (var col = 7; col <= 16; col++) {
        sheet.getRange(1, col + 1).setValue("Ngày " + (col - 6));
      }
      return createResponse("Đã xóa toàn bộ học sinh và làm sạch lớp " + targetSheetName.replace("Lop", "") + " thành công!", 200);
    }

    return createResponse("Lớp học này vốn đã trống sẵn.", 200);
  }

  if (action === "registerTeacher") {
    try {
      var d = postData.data || postData;
      var regIdgv = String(d.idgv || d.phone || "").trim();
      var regName = String(d.fullname || d.name || "").trim();
      var regPass = String(d.pass || d.password || "").trim();
      var regMon = String(d.subject || d.mon || "Toán").trim();
      var regIdMon = String(d.idmon || regMon.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "")).trim() || "toan";
      var regSheet1 = extractSheetId(d.sheetUrl || d.sheet1 || d.sheetId || "");
      var regSheet2 = extractSheetId(d.sheetUrl2 || d.sheet2 || d.sheetId2 || "") || regSheet1;

      if (!regIdgv || !regPass) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Thiếu số điện thoại IDGV hoặc mật khẩu!"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var bqSheet = ssadmin.getSheetByName("banquyen");
      if (!bqSheet) {
        bqSheet = ssadmin.insertSheet("banquyen");
        bqSheet.appendRow(["IDGV", "Họ và tên", "Mật khẩu", "Môn", "IDMôn", "Bản quyền", "Link Script", "Bản quyền 2", "Ngày ĐK", "Ngày hết hạn", "SheetID Học Thêm", "Trạng thái L1", "Ngày ĐK 2", "Hết hạn 2", "SheetID Thi Cử"]);
      }

      var now = new Date();
      var tz = Session.getScriptTimeZone() || "GMT+7";
      var regDate = Utilities.formatDate(now, tz, "dd/MM/yyyy");
      var expDate = Utilities.formatDate(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), tz, "dd/MM/yyyy");
      var scriptLinkAuto = linkAdmin || "https://script.google.com/macros/s/AKfycbzLmLvpFGsMvUdeOb0eWiBiHUYQ1ZjFpsZyvj68AHa9Uta5CyHY6PAfg-icQs6w7N4t/exec";

      var lastRow = bqSheet.getLastRow();
      var existingRow = -1;
      if (lastRow > 1) {
        var ids = bqSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (isEqual(ids[i][0], regIdgv)) {
            existingRow = i + 2;
            break;
          }
        }
      }

      if (existingRow !== -1) {
        if (regName) bqSheet.getRange(existingRow, 2).setValue(regName);
        bqSheet.getRange(existingRow, 3).setValue("'" + regPass);
        if (regMon) bqSheet.getRange(existingRow, 4).setValue(regMon);
        if (regIdMon) bqSheet.getRange(existingRow, 5).setValue(regIdMon);
        bqSheet.getRange(existingRow, 7).setValue(scriptLinkAuto);
        if (regSheet1) bqSheet.getRange(existingRow, 11).setValue(regSheet1);
        if (regSheet2) bqSheet.getRange(existingRow, 15).setValue(regSheet2);
      } else {
        var nextRow = Math.max(lastRow + 1, 2);
        bqSheet.getRange(nextRow, 1, 1, 15).setValues([[
          "'" + regIdgv,
          regName,
          "'" + regPass,
          regMon,
          regIdMon,
          "VIP4",
          scriptLinkAuto,
          "",
          regDate,
          expDate,
          regSheet1,
          "",
          "",
          "",
          regSheet2
        ]]);
      }

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        idgv: regIdgv,
        linkScript: scriptLinkAuto,
        sheetId: regSheet1,
        sheetId2: regSheet2,
        message: "Đã tự động đồng bộ tài khoản & Google Sheet riêng vào hệ thống MH AdminHT!"
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (regErr) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Lỗi đăng ký tự động: " + regErr.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "lookupTeacher") {
    var inputIdgv = String(postData.idgv || "").trim();

    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (!bqSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Không tìm thấy sheet banquyen trên hệ thống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = bqSheet.getLastRow();
    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Danh sách bản quyền trống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bqVals = bqSheet.getRange(2, 1, lastRow - 1, 11).getValues();
    for (var i = 0; i < bqVals.length; i++) {
      var row = bqVals[i];
      var idgv = String(row[0] || "").trim();
      var fullname = String(row[1] || "").trim();
      var mon = String(row[3] || "").trim();
      var idmon = String(row[4] || "").trim();
      var license = String(row[5] || row[7] || "Free").trim();
      var linkScript = linkAdmin;
      var sheetId = String(row[10] || "").trim();

      if (isEqual(idgv, inputIdgv)) {
        var l1ValLookup = bqSheet ? String(bqSheet.getRange("L1").getValue() || "").trim() : "";
        var isFreeLookup = (l1ValLookup.toUpperCase() === "FREE");
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Tìm thấy thông tin Giáo viên!",
          idgv: idgv,
          fullname: fullname,
          mon: mon,
          idmon: idmon,
          licenseStatus: license,
          copyrightStatus: isFreeLookup ? "Free" : "VIP",
          enableCopyrightCheck: !isFreeLookup,
          linkScript: linkScript,
          linkScriptGV: linkScript,
          sheetId: sheetId
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Không tìm thấy dữ liệu Giáo viên với IDGV này!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "checkBanquyen") {
    try {
      syncLicenseWithTransactionCN();
    } catch (err) {
      console.error("Lỗi đồng bộ bản quyền checkBanquyen:", err.toString());
    }

    var inputIdgv = String(postData.idgv || "").trim();
    var inputPass = String(postData.password || "").trim();

    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (!bqSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Không tìm thấy sheet banquyen trên hệ thống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = bqSheet.getLastRow();
    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Danh sách bản quyền trống!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var bqLastColCheck = Math.max(14, bqSheet.getLastColumn());
    var bqVals = bqSheet.getRange(2, 1, lastRow - 1, bqLastColCheck).getValues();
    for (var i = 0; i < bqVals.length; i++) {
      var row = bqVals[i];
      var idgv = String(row[0] || "").trim();
      var fullname = String(row[1] || "").trim();
      var pass = String(row[2] || "").trim();
      var mon = String(row[3] || "").trim();
      var idmon = String(row[4] || "").trim();
      var valF = String(row[5] || "").trim();
      var linkScript = linkAdmin;
      var valH = String(row[7] || "").trim();
      var sheetId = String(row[10] || "").trim();
      var dateStr1 = row[9];
      var dateStr2 = row[13];

      var num1 = dateToNumber(dateStr1);
      var num2 = dateToNumber(dateStr2);
      var todayNum = dateToNumber(new Date());

      var hetHanTR = (num1 === 0 && num2 === 0) ? "" : (num2 > num1 ? dateStr2 : dateStr1);
      var hetHan = String(hetHanTR).trim();
      var maxExpNum = Math.max(num1, num2);
      var isStillValid = (maxExpNum > todayNum);

      var activeVip = "Free";
      if (isStillValid) {
        if (num1 >= num2 && /^VIP/i.test(valF)) {
          activeVip = valF.toUpperCase();
        } else if (/^VIP/i.test(valH)) {
          activeVip = valH.toUpperCase();
        } else if (/^VIP/i.test(valF)) {
          activeVip = valF.toUpperCase();
        }
      } else if (/^VIP/i.test(valF)) {
        activeVip = valF.toUpperCase();
      }

      var passClean = pass.replace(/^'/, "").trim();
      var isPassMatch = isEqualExact(pass, inputPass) || isEqualExact(passClean, inputPass) || (idgv === ADMIN_IDGV && isEqualExact(inputPass, passAdmin2));
      if (isEqual(idgv, inputIdgv) && isPassMatch) {
        var l1ValCheck = bqSheet ? String(bqSheet.getRange("L1").getValue() || "").trim() : "";
        var isFreeCheck = (l1ValCheck.toUpperCase() === "FREE");
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Xác thực bản quyền thành công!",
          idgv: idgv,
          fullname: fullname,
          mon: mon,
          idmon: idmon,
          licenseStatus: activeVip,
          copyrightStatus: isFreeCheck ? "Free" : "VIP",
          enableCopyrightCheck: !isFreeCheck,
          linkScript: linkScript,
          linkScriptGV: linkScript,
          level: activeVip,
          hetHan: hetHan,
          sheetId: sheetId
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Số điện thoại IDGV hoặc mật khẩu không chính xác!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getAdminSheetsForFirebase") {
    var inputPassword = String(postData.password || "").trim();
    var currentSuperAdminPass = getSuperAdminPassword(ssadmin);
    var isPassValid = isEqualExact(inputPassword, currentSuperAdminPass) ||
      isEqualExact(inputPassword, passAdmin2);

    if (!inputPassword || !isPassValid) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Mật khẩu Admin không chính xác!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var requestedSheets = postData.sheets || ["banquyen", "levelvip", "transactioncn", "transactioncn2", "transactionkd"];
    var resultData = {};

    for (var sIdx = 0; sIdx < requestedSheets.length; sIdx++) {
      var sName = requestedSheets[sIdx];
      var sh = ssadmin.getSheetByName(sName);
      if (!sh || sh.getLastRow() < 1) {
        resultData[sName] = [];
        continue;
      }
      var lastR = sh.getLastRow();
      var lastC = sh.getLastColumn() || 1;
      var vals = sh.getRange(1, 1, lastR, lastC).getValues();
      var headers = vals[0].map(function(h, idx) { return String(h || "col_" + (idx + 1)).trim(); });
      var rows = [];
      for (var rIdx = 1; rIdx < vals.length; rIdx++) {
        var rowObj = {};
        for (var cIdx = 0; cIdx < headers.length; cIdx++) {
          var key = headers[cIdx] || ("col_" + (cIdx + 1));
          var cellVal = vals[rIdx][cIdx];
          if (cellVal instanceof Date) {
            cellVal = Utilities.formatDate(cellVal, Session.getScriptTimeZone() || "GMT+7", "dd/MM/yyyy HH:mm:ss");
          }
          rowObj[key] = (cellVal !== undefined && cellVal !== null) ? cellVal : "";
        }
        rows.push(rowObj);
      }
      resultData[sName] = rows;
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: resultData
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return createResponse("Action không hợp lệ: " + action, 400);
}

function syncLicenseWithTransactionCN() {
  var bqSheet = ssadmin.getSheetByName("banquyen");
  if (!bqSheet) return;

  var bqLastRow = bqSheet.getLastRow();
  if (bqLastRow < 2) return;

  var bqLastCol = Math.max(14, bqSheet.getLastColumn());
  var bqRange = bqSheet.getRange(2, 1, bqLastRow - 1, bqLastCol);
  var bqData = bqRange.getValues();

  var timeZone = Session.getScriptTimeZone() || "GMT+7";
  var todayNum = dateToNumber(new Date());

  var txSheet1 = ssadmin.getSheetByName("transactioncn");
  var txSheet2 = ssadmin.getSheetByName("transactioncn2") || ssadmin.getSheetByName("transaction2");

  function findLatestTxForTeacher(idgv, latestRegNum) {
    var sheetsToScan = [txSheet1, txSheet2];
    var bestTx = null;

    for (var s = 0; s < sheetsToScan.length; s++) {
      var sh = sheetsToScan[s];
      if (!sh || sh.getLastRow() < 2) continue;

      var lastR = sh.getLastRow();
      var vals = sh.getRange(2, 1, lastR - 1, Math.max(7, sh.getLastColumn())).getValues();

      for (var r = vals.length - 1; r >= 0; r--) {
        var desc = String(vals[r][6] || "").trim();
        var rawDate = vals[r][5];

        if (!desc || !rawDate) continue;

        var descUpper = desc.toUpperCase();
        var matchPattern = new RegExp("\\bSEVQR\\s+BQ\\s+(VIP[1-4])\\s+" + idgv + "\\b", "i");
        var match = desc.match(matchPattern);

        if (!match) {
          if (descUpper.indexOf("SEVQR") !== -1 && descUpper.indexOf("BQ") !== -1 && descUpper.indexOf(idgv) !== -1) {
            var vipM = descUpper.match(/VIP[1-4]/);
            if (vipM) {
              match = [desc, vipM[0]];
            }
          }
        }

        if (match) {
          var matchedLevel = match[1].toUpperCase();
          var dObj = parseDateSafe(rawDate);
          var dateStr = dObj ? Utilities.formatDate(dObj, timeZone, "dd/MM/yyyy") : "";
          var txDateNum = dateToNumber(dateStr);

          if (txDateNum > latestRegNum) {
            var expDate = dObj ? new Date(dObj.getFullYear() + 1, dObj.getMonth(), dObj.getDate()) : null;
            var expDateStr = expDate ? Utilities.formatDate(expDate, timeZone, "dd/MM/yyyy") : "";
            bestTx = {
              level: matchedLevel,
              transferDateStr: dateStr,
              expDateStr: expDateStr,
              txDateNum: txDateNum
            };
            return bestTx;
          }
        }
      }
    }
    return bestTx;
  }

  var updated = false;

  for (var i = 0; i < bqData.length; i++) {
    var idgv = String(bqData[i][0] || "").trim();
    if (!idgv) continue;

    var levelF = String(bqData[i][5] || "").trim();
    var expDateF = bqData[i][9];
    var expDateH = bqData[i][13];
    var numExpF = dateToNumber(expDateF);
    var numExpH = dateToNumber(expDateH);

    var regDateI = bqData[i][8];
    var regDateM = bqData[i][12];
    var numRegI = dateToNumber(regDateI);
    var numRegM = dateToNumber(regDateM);
    var latestRegNum = Math.max(numRegI, numRegM);

    var newTx = findLatestTxForTeacher(idgv, latestRegNum);

    if (newTx) {
      bqSheet.getRange(i + 2, 6).setValue(newTx.level);
      bqSheet.getRange(i + 2, 9).setValue(newTx.transferDateStr);
      bqSheet.getRange(i + 2, 10).setValue(newTx.expDateStr);
      bqData[i][5] = newTx.level;
      bqData[i][8] = newTx.transferDateStr;
      bqData[i][9] = newTx.expDateStr;
      updated = true;
    } else {
      var maxExpNum = Math.max(numExpF, numExpH);
      var isVipActive = (maxExpNum > todayNum);

      var isCurrentVipF = /^VIP[1-4]$/i.test(levelF) || levelF.toUpperCase() === "VIP";
      if (isCurrentVipF && !isVipActive) {
        bqSheet.getRange(i + 2, 6).setValue("Free");
        bqData[i][5] = "Free";
        updated = true;
      }
    }
  }

  if (updated) {
    SpreadsheetApp.flush();
  }
}

function getHocPhiTheoLop(ss, className) {
  try {
    var hcSheet = ss.getSheetByName("hocphi");
    if (!hcSheet) return 60000;

    var lastRow = hcSheet.getLastRow();
    if (lastRow < 2) return 60000;

    var data = hcSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    var searchName = String(className).trim().toLowerCase();

    for (var i = 0; i < data.length; i++) {
      var currentClassName = data[i][0] || "";
      if (isEqual(currentClassName, searchName)) {
        var price = Number(data[i][1] || 0);
        return !isNaN(price) && price > 0 ? price : 60000;
      }
    }
  } catch (e) {
    console.error("Lỗi khi tra cứu học phí:", e.toString());
  }
  return 60000;
}

function capNhatHocPhiSauDiemDanh(className, ssParam) {
  var ss = ssParam || getSS();
  if (!ss) return;
  var sheetLop = ss.getSheetByName(className);
  if (!sheetLop) return;
  var dsdiemdanh = sheetLop.getRange(1, 1, maxrowhs, 18).getValues();

  var startColIdx = 7;
  var endColIdx = 16;
  var donGiaHocPhi = getHocPhiTheoLop(ss, className);
  var tongTienOutput = [];
  var countHS = 0;

  for (var r = 1; r < maxrowhs; r++) {
    if ((dsdiemdanh[r][1] === "" || dsdiemdanh[r][1] === null) && (dsdiemdanh[r][5] === "" || dsdiemdanh[r][5] === null)) {
      break;
    }

    var soBuoiDiHoc = 0;
    countHS++;
    for (var c = startColIdx; c <= endColIdx; c++) {
      if (Number(dsdiemdanh[r][c] || 0) === 1) {
        soBuoiDiHoc++;
      }
    }
    var heso = parseHeso(dsdiemdanh[r][6]);
    var thanhTien = soBuoiDiHoc * donGiaHocPhi * heso;
    tongTienOutput.push([thanhTien]);
  }

  if (countHS > 0) {
    sheetLop.getRange(2, 18, countHS, 1).setValues(tongTienOutput);
  }
}

function getPayOSConfig() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return {
    clientId: scriptProperties.getProperty('CLIENT_ID'),
    apiKey: scriptProperties.getProperty('API_KEY'),
    checksumKey: scriptProperties.getProperty('CHECKSUM_KEY')
  };
}

function testConfig() {
  var config = getPayOSConfig();
  Logger.log("Client ID: " + config.clientId);
}

function getFormattedDate() {
  var d = new Date();
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yy");
}

function logWebhook(ss, payload, status) {
  try {
    var sheet = ss.getSheetByName("WebhookLogs");
    if (!sheet) {
      sheet = ss.insertSheet("WebhookLogs");
      sheet.appendRow(["Thời gian", "Nội dung JSON nhận được", "Kết quả xử lý"]);
      sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#f3f3f3");
    }

    var lastRow = sheet.getLastRow();
    if (lastRow > 200) {
      sheet.deleteRows(2, 50);
    }

    var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    sheet.appendRow([timeStr, payloadStr, status]);
    sheet.setRowHeight(sheet.getLastRow(), 26);
  } catch (e) {
    console.error("Lỗi ghi log webhook:", e.toString());
  }
}

function syncToTHHT(ss) {
  var targetSheet = ss.getSheetByName("THHT");
  if (!targetSheet) {
    targetSheet = ss.insertSheet("THHT");
  } else {
    targetSheet.clear();
  }

  var headers = ["STT", "name", "class", "school", "phoneNumber", "code", "heso"];
  targetSheet.appendRow(headers);
  targetSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");

  var allSheets = ss.getSheets();
  var allStudents = [];

  for (var i = 0; i < allSheets.length; i++) {
    var sheet = allSheets[i];
    var sheetName = sheet.getName();

    if (sheetName.indexOf("Lop") === 0) {
      var vals = sheet.getRange(2, 1, maxrowhs, 7).getValues();
      for (var j = 0; j < vals.length; j++) {
        var name = String(vals[j][1] || "").trim();
        if (name !== "") {
          allStudents.push([
            0,
            name,
            String(vals[j][2] || "").trim(),
            String(vals[j][3] || "").trim(),
            "'" + String(vals[j][4] || "").trim().replace(/^'/, ""),
            String(vals[j][5] || "").trim(),
            parseHeso(vals[j][6])
          ]);
        }
      }
    }
  }

  if (allStudents.length > 0) {
    for (var k = 0; k < allStudents.length; k++) {
      allStudents[k][0] = k + 1;
    }
    targetSheet.getRange(2, 1, allStudents.length, 7).setValues(allStudents);
  }

  targetSheet.autoResizeColumns(1, 7);
  var lastRow = targetSheet.getLastRow();
  if (lastRow > 0) {
    targetSheet.setRowHeights(1, lastRow, 26);
  }
}

function saveToTransactionSheet(ss, postData, rawContents) {
  if (!postData) return false;

  var sheet = ss.getSheetByName("transaction");
  if (!sheet) {
    sheet = ss.insertSheet("transaction");
    sheet.appendRow([
      "Thời gian giao dịch",
      "Mã giao dịch (Ref/ID)",
      "Số tiền (Amount)",
      "Nội dung chuyển khoản",
      "Người gửi (Sender)",
      "Tài khoản nhận",
      "Ngân hàng / Cổng",
      "Thời gian nhận webhook",
      "Dữ liệu gốc (JSON)"
    ]);
    sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#e0f2fe");
  }

  var transactions = [];

  if (postData.data && Array.isArray(postData.data)) {
    for (var i = 0; i < postData.data.length; i++) {
      transactions.push(parseSingleTransaction(postData.data[i]));
    }
  }
  else if (Array.isArray(postData)) {
    for (var i = 0; i < postData.length; i++) {
      transactions.push(parseSingleTransaction(postData[i]));
    }
  }
  else if (postData.data && typeof postData.data === "object") {
    transactions.push(parseSingleTransaction(postData.data));
  }
  else if (typeof postData === "object") {
    if (postData.amount !== undefined || postData.transferDesc !== undefined || postData.description !== undefined || postData.content !== undefined) {
      transactions.push(parseSingleTransaction(postData));
    }
  }

  if (transactions.length === 0) {
    if (postData.webhookUrl) return false;
    var desc = postData.description || postData.desc || postData.content || "";
    var amount = postData.amount || 0;
    if (desc || amount) {
      transactions.push({
        time: postData.transactionDate || postData.date || "",
        id: postData.id || postData.reference || "",
        amount: amount,
        desc: desc,
        sender: postData.sender || "",
        receiver: postData.accountNumber || "",
        gateway: postData.gateway || postData.bank || ""
      });
    }
  }

  if (transactions.length === 0) return false;

  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var lastRow = sheet.getLastRow();

  for (var j = 0; j < transactions.length; j++) {
    var tx = transactions[j];
    var isDuplicate = false;
    if (lastRow > 1 && tx.id) {
      var existingIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var r = 0; r < existingIds.length; r++) {
        var key = existingIds[r][0] || "";
        if (isEqual(key, tx.id)) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (!isDuplicate) {
      sheet.appendRow([
        tx.time || nowStr,
        tx.id || "",
        tx.amount || 0,
        tx.desc || "",
        tx.sender || "",
        "'" + (tx.receiver || ""),
        tx.gateway || "",
        nowStr,
        rawContents
      ]);
    }
  }

  var lastRowAfter = sheet.getLastRow();
  if (lastRowAfter > 0) {
    sheet.autoResizeColumns(1, 8);
    sheet.setRowHeights(1, lastRowAfter, 26);
  }

  return true;
}

function parseSingleTransaction(item) {
  if (!item || typeof item !== "object") return {};
  return {
    time: item.when || item.transactionDate || item.transactionDateTime || item.transactionTime || item.date || item.time || "",
    id: item.tid || item.referenceCode || item.reference || item.id || item.orderCode || item.transactionId || "",
    amount: Number(item.amount || item.money || item.sotien || 0),
    desc: item.description || item.transferDesc || item.content || item.noidung || item.nd || "",
    sender: item.cusName || item.senderName || item.sender || "",
    receiver: item.subAccount || item.accountNumber || item.receiver || "",
    gateway: item.bankName || item.gateway || item.bank || ""
  };
}

function createResponse(msg, code) {
  return ContentService.createTextOutput(JSON.stringify({ message: msg, status: code }))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncGVCNWithTransactionCN(ss) {
  var gvcnSheet = ss.getSheetByName("GVCN");
  if (!gvcnSheet) return;

  var gvcnLastRow = gvcnSheet.getLastRow();
  if (gvcnLastRow < 2) return;

  var gvcnValues = gvcnSheet.getDataRange().getValues();
  if (gvcnValues.length < 2) return;

  var headerRow = gvcnValues[0];
  var maxRoundColIdx = 6;

  if (headerRow.length > 7) {
    for (var h = 7; h < headerRow.length; h++) {
      var colName = String(headerRow[h] || "").trim();
      if (colName !== "" && h > maxRoundColIdx) maxRoundColIdx = h;
    }
  }

  var latestRoundNum = 0;
  if (maxRoundColIdx >= 7 && headerRow[maxRoundColIdx]) {
    var lMatch = String(headerRow[maxRoundColIdx]).match(/\d+/);
    if (lMatch) latestRoundNum = parseInt(lMatch[0], 10);
  }

  var txSheet1 = ss.getSheetByName("transactioncn");
  var txData1 = (txSheet1 && txSheet1.getLastRow() > 1)
    ? txSheet1.getRange(2, 1, txSheet1.getLastRow() - 1, 7).getValues()
    : [];
  var txSheet2 = ss.getSheetByName("transactioncn2") || ss.getSheetByName("transaction2");
  var txData2 = [];
  if (txSheet2 && txSheet2.getLastRow() > 1) {
    var rawTx2 = txSheet2.getRange(2, 1, txSheet2.getLastRow() - 1, 8).getValues();
    for (var k = 0; k < rawTx2.length; k++) {
      var amt = Number(String(rawTx2[k][3] || "").replace(/,/g, "")) || 0;
      var desc = String(rawTx2[k][6] || rawTx2[k][5] || "").trim();
      if (amt > 0) {
        txData2.push([rawTx2[k][0], rawTx2[k][1], rawTx2[k][2], amt, rawTx2[k][4], rawTx2[k][5], desc]);
      }
    }
  }

  var txData = txData1.concat(txData2);
  var hasChanges = false;

  for (var i = 1; i < gvcnValues.length; i++) {
    var rowNum = i + 1;
    var studentCode = String(gvcnValues[i][3] || "").trim().toUpperCase();

    var currentEVal = Number(gvcnSheet.getRange(rowNum, 5).getValue()) || 0;
    var latestRoundTxAmount = 0;
    var totalPaidSumForStudent = 0;

    if (studentCode !== "" && txData.length > 0) {
      for (var j = 0; j < txData.length; j++) {
        var desc = String(txData[j][6] || "").trim().toUpperCase();
        var txAmount = Number(txData[j][3]) || 0;

        if (txAmount > 0 && desc.indexOf(studentCode) !== -1) {
          var roundMatch = desc.match(/\b(L|LAN)\s*(\d+)\b/i) || desc.match(/(L|LAN)(\d+)/i);
          if (roundMatch) {
            var roundNum = parseInt(roundMatch[2], 10);
            totalPaidSumForStudent += txAmount;
            if (latestRoundNum === 0 || roundNum === latestRoundNum) {
              latestRoundTxAmount += txAmount;
            }
          }
        }
      }
    }

    if (latestRoundTxAmount > 0) {
      if (currentEVal !== latestRoundTxAmount) {
        gvcnSheet.getRange(rowNum, 5).setValue(latestRoundTxAmount);
        hasChanges = true;
      }
    } else {
      if (currentEVal !== 0 || String(gvcnSheet.getRange(rowNum, 5).getValue()) !== "") {
        gvcnSheet.getRange(rowNum, 5).setValue("");
        hasChanges = true;
      }
    }

    var currentTotalPaid = Number(gvcnSheet.getRange(rowNum, 7).getValue()) || 0;
    if (currentTotalPaid !== totalPaidSumForStudent) {
      gvcnSheet.getRange(rowNum, 7).setValue(totalPaidSumForStudent);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    SpreadsheetApp.flush();
  }
}

function syncThuTienWithTransactionKD(ss) {
  var thhtSheet = ss.getSheetByName("THHT");
  if (!thhtSheet) {
    syncToTHHT(ss);
    thhtSheet = ss.getSheetByName("THHT");
  }
  if (!thhtSheet) return;

  var thhtLastRow = thhtSheet.getLastRow();
  if (thhtLastRow < 2) return;

  var thhtData = thhtSheet.getRange(2, 1, thhtLastRow - 1, 6).getValues();
  var studentMap = {};
  for (var i = 0; i < thhtData.length; i++) {
    var sCode = String(thhtData[i][5]).trim().toUpperCase();
    if (sCode !== "") {
      studentMap[sCode] = {
        stt: String(thhtData[i][0]).trim(),
        name: String(thhtData[i][1]).trim(),
        class: String(thhtData[i][2]).trim()
      };
    }
  }

  var txSheet = ss.getSheetByName("transactionkd");
  if (!txSheet) return;

  var txLastRow = txSheet.getLastRow();
  if (txLastRow < 2) return;

  var txData = txSheet.getRange(2, 1, txLastRow - 1, 10).getValues();
  var txSummaryMap = {};

  for (var j = 0; j < txData.length; j++) {
    var row = txData[j];
    var desc = String(row[5] || "").trim();
    var amount = Number(row[7]) || 0;
    var dateVal = row[1];

    if (amount <= 0) continue;

    var codeMatch = desc.match(/HT\d+/i);
    if (codeMatch) {
      var codeHS = codeMatch[0].toUpperCase();

      if (studentMap[codeHS]) {
        var lanMatch = desc.match(/\bL\d+\b/i);
        var lanNop = lanMatch ? lanMatch[0].toUpperCase() : "L1";
        var uniqueKey = codeHS + "_" + lanNop;

        var dateStr = "";
        if (dateVal instanceof Date) {
          dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          dateStr = String(dateVal || "").trim() || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
        }

        if (!txSummaryMap[uniqueKey]) {
          txSummaryMap[uniqueKey] = {
            codeHS: codeHS,
            lanNop: lanNop,
            totalAmount: 0,
            latestDate: dateStr
          };
        }

        txSummaryMap[uniqueKey].totalAmount += amount;
        txSummaryMap[uniqueKey].latestDate = dateStr;
      }
    }
  }

  var thuTienSheet = ss.getSheetByName("ThuTien");
  if (!thuTienSheet) {
    thuTienSheet = ss.insertSheet("ThuTien");
    thuTienSheet.appendRow(["Date", "STT", "Họ và tên", "Lớp", "Lần nộp", "Số tiền", "Mã HS"]);
    thuTienSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f3f3");
  }

  var thuTienLastRow = thuTienSheet.getLastRow();
  var thuTienData = thuTienLastRow > 1 ? thuTienSheet.getRange(2, 1, thuTienLastRow - 1, 7).getValues() : [];

  var existingRowIndexMap = {};
  for (var k = 0; k < thuTienData.length; k++) {
    var mhs = String(thuTienData[k][6]).trim().toUpperCase();
    var ln = String(thuTienData[k][4]).trim().toUpperCase();
    if (mhs !== "") {
      existingRowIndexMap[mhs + "_" + ln] = k + 2;
    }
  }

  var rowsToAdd = [];

  for (var key in txSummaryMap) {
    var item = txSummaryMap[key];
    var student = studentMap[item.codeHS];

    if (existingRowIndexMap[key]) {
      var targetRow = existingRowIndexMap[key];
      thuTienSheet.getRange(targetRow, 6).setValue(item.totalAmount);
      thuTienSheet.getRange(targetRow, 1).setValue(item.latestDate);
    } else {
      rowsToAdd.push([
        item.latestDate,
        "'" + student.stt,
        student.name,
        student.class,
        item.lanNop,
        item.totalAmount,
        item.codeHS
      ]);
    }
  }

  if (rowsToAdd.length > 0) {
    for (var m = 0; m < rowsToAdd.length; m++) {
      thuTienSheet.appendRow(rowsToAdd[m]);
    }
  }

  if (rowsToAdd.length > 0 || Object.keys(txSummaryMap).length > 0) {
    thuTienSheet.setRowHeights(1, thuTienSheet.getLastRow(), 26);
  }
}

function cleanStr(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim().replace(/\s+/g, ' ');
}

function isEqual(val1, val2) {
  return cleanStr(val1).toLowerCase() === cleanStr(val2).toLowerCase();
}

function isEqualExact(val1, val2) {
  if (val1 === null || val1 === undefined || val2 === null || val2 === undefined) return false;
  return String(val1).trim() === String(val2).trim();
}

function Vipteacher(st) {
  var sheetLv = ssadmin.getSheetByName("levelvip");
  var lastRow = sheetLv.getLastRow();
  var dataVals = sheetLv.getRange(2, 1, lastRow - 1, 3).getValues();
  var tienvip = String(st).trim();
  var level = "Free";
  for (var r = 0; r < dataVals.length; r++) {
    var tiensheet = String(dataVals[r][1] || "Freee").trim();
    if (tienvip === tiensheet) {
      level = String(dataVals[r][0] || "Free").trim();
    }
  }
  return level;
}

function safeNumber(val, defaultVal) {
  var num = Number(val);
  return isNaN(num) ? (defaultVal || 0) : num;
}

function extractSheetId(url) {
  if (!url) return "";
  var match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url.trim();
}

function verifyC2Password(password, idgv, sheetId) {
  var targetSheetId = sheetId || "";
  if (idgv && !targetSheetId) {
    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (bqSheet) {
      var bqLastRow = bqSheet.getLastRow();
      if (bqLastRow > 1) {
        var bqVals = bqSheet.getRange(2, 1, bqLastRow - 1, 11).getValues();
        for (var idx = 0; idx < bqVals.length; idx++) {
          if (isEqual(bqVals[idx][0], idgv)) {
            targetSheetId = String(bqVals[idx][10] || "").trim();
            break;
          }
        }
      }
    }
  }
  var ss = getSS(targetSheetId);
  var feeSheet = ss.getSheetByName("hocphi");
  var passC2 = feeSheet ? String(feeSheet.getRange("C2").getValue() || "").trim() : "";

  if (isValidAdminPass(password, passC2)) {
    return {
      success: true,
      role: "teacher",
      message: "Xác thực mật khẩu GV/C2 thành công!"
    };
  }
  return {
    success: false,
    message: "Mật khẩu ô C2 của Giáo viên không chính xác!"
  };
}

function verifyStudentCode(idgv, sheetName, column, code, sheetId) {
  var targetSheetId = sheetId || "";
  if (idgv && !targetSheetId) {
    var bqSheet = ssadmin.getSheetByName("banquyen");
    if (bqSheet) {
      var bqLastRow = bqSheet.getLastRow();
      if (bqLastRow > 1) {
        var bqVals = bqSheet.getRange(2, 1, bqLastRow - 1, 11).getValues();
        for (var idx = 0; idx < bqVals.length; idx++) {
          if (isEqual(bqVals[idx][0], idgv)) {
            targetSheetId = String(bqVals[idx][10] || "").trim();
            break;
          }
        }
      }
    }
  }
  var ss = getSS(targetSheetId);
  var targetSheetName = sheetName || "THHT";
  var sh = ss.getSheetByName(targetSheetName);
  if (!sh) {
    return {
      success: false,
      message: "Không tìm thấy sheet " + targetSheetName + " trên Google Sheets!"
    };
  }

  var colIndex = 6;
  if (typeof column === "number") {
    colIndex = column;
  } else if (typeof column === "string") {
    var colUpper = column.trim().toUpperCase();
    if (colUpper === "A") colIndex = 1;
    else if (colUpper === "B") colIndex = 2;
    else if (colUpper === "C") colIndex = 3;
    else if (colUpper === "D") colIndex = 4;
    else if (colUpper === "E") colIndex = 5;
    else if (colUpper === "F") colIndex = 6;
    else if (colUpper === "G") colIndex = 7;
  }

  var searchCode = cleanStr(code).toUpperCase();
  if (!searchCode) {
    return {
      success: false,
      message: "Mã học sinh không được để trống!"
    };
  }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) {
    return {
      success: false,
      message: "Danh sách học sinh trên sheet " + targetSheetName + " hiện đang trống!"
    };
  }

  var numCols = Math.max(colIndex, 6);
  var dataVals = sh.getRange(2, 1, lastRow - 1, numCols).getValues();

  for (var r = 0; r < dataVals.length; r++) {
    var row = dataVals[r];
    var cellCode = String(row[colIndex - 1] || "").trim().toUpperCase();
    if (cellCode === searchCode) {
      var studentName = String(row[1] || "").trim();
      var rawClass = String(row[2] || "").trim();
      var digitMatch = rawClass.match(/\d+/);
      var normalizedClass = digitMatch ? ("Lop" + digitMatch[0]) : rawClass;

      return {
        success: true,
        exists: true,
        role: "student",
        student: {
          name: studentName,
          class: rawClass,
          normalizedClass: normalizedClass,
          code: cellCode
        },
        message: "Xác thực mã học sinh [ " + cellCode + " - " + studentName + " ] thành công!"
      };
    }
  }

  return {
    success: false,
    exists: false,
    message: "Mã học sinh [ " + searchCode + " ] không tồn tại trong cột " + (column || "F") + " của sheet " + targetSheetName + "!"
  };
}

function sapxep_1(cot, sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    dataRange.sort({ column: cot, ascending: true });
  }
}

function sapxep_2(cot1, x, cot2, y, sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    dataRange.sort([
      { column: cot1, ascending: x === 1 },
      { column: cot2, ascending: y === 1 }
    ]);
  }
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  var cleanVal = String(val).replace(',', '.');
  var num = parseFloat(cleanVal);
  return isNaN(num) ? 0 : num;
}

function dateToNumber(dateStr) {
  try {
    var d = parseDateSafe(dateStr);
    if (!d || isNaN(d.getTime())) return 0;
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  } catch (e) {
    return 0;
  }
}

function isAccountExpired(expiryStr) {
  if (!expiryStr) return false;
  var expiryNum = dateToNumber(expiryStr);
  if (expiryNum === 0) return false;
  var now = new Date();
  var todayNum = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return todayNum > expiryNum;
}

function tinhSoNgayDenHienTai(dateParam) {
  var dateInput = new Date(dateParam);
  var now = new Date();
  dateInput.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((dateInput.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

function parseDateSafe(dateVal) {
  if (dateVal === "" || dateVal == 0 || dateVal == null) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  var str = dateVal.toString().trim();
  var matchVn = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (matchVn) {
    return new Date(parseInt(matchVn[3], 10), parseInt(matchVn[2], 10) - 1, parseInt(matchVn[1], 10));
  }
  var parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateSafe_2(dateVal) {
  if (dateVal === "" || dateVal == 0 || dateVal == null) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  var str = dateVal.toString().trim().replace(/^'/, "");
  var matchVn = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (matchVn) {
    return new Date(parseInt(matchVn[3], 10), parseInt(matchVn[2], 10) - 1, parseInt(matchVn[1], 10));
  }
  var matchIso = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (matchIso) {
    return new Date(parseInt(matchIso[1], 10), parseInt(matchIso[2], 10) - 1, parseInt(matchIso[3], 10));
  }
  var parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}
