// ==============================================================================
// GOOGLE APPS SCRIPT — HỆ THỐNG QUẢN TRỊ & CƠ SỞ DỮ LIỆU HỌC TOÁN 2 / SMARTEDU
// Quản trị viên duy nhất: hung286
// Mật khẩu Admin: Taynguyen286@
// ==============================================================================

// 1. CẤU HÌNH GOOGLE SHEET ADMIN & TÀI KHOẢN ADMIN DUY NHẤT
const SPREADSHEET_ID_ADMIN = "1xVBHyKRSf1MquW-7lb7Av8n3D2aNmcZ0i8CRj4ZDl14"; // Thay bằng ID Sheet Admin của bạn
const ssAdmin = SpreadsheetApp.openById(SPREADSHEET_ID_ADMIN);
const ss = ssAdmin;

const idadmin = "hung286";
const passAdmin = "Taynguyen286@";

/**
 * Hàm lấy Google Sheet riêng ("danhsach") của Giáo viên dựa trên sheetId2 (cột J trong sheet "idgv" của Admin)
 * Nếu không truyền sheetId2, sẽ tự động tra cứu từ sheet "idgv" của Admin dựa trên idgv.
 * Nếu không mở được sheet riêng, sẽ tự động chuyển hướng về sheet "danhsach" của ssAdmin để đảm bảo không lỗi.
 */
function getTeacherStudentSheet(idgv, sheetId22) {
  var targetSheetId2 = sheetId22;
  var altSheetId = "";
  var idmongv = "";
  var tenmongv = "";
  var expiryStr = "";
  var banquyen = "";
  var dateBQ = "";

  // ⚡ TỐI ƯU TỐC ĐỘ: Nếu ĐÃ CÓ targetSheetId2 từ Client truyền lên,
  // mở ngay lập tức, KHÔNG tốn thời gian mở và quét sheet Admin "idgv" nữa!
  if (idgv) {
    try {
      var sheetGV = ssAdmin.getSheetByName("idgv");
      if (sheetGV) {
        var dataGV = sheetGV.getDataRange().getValues();
        var normId = N9(idgv);
        for (var i = 1; i < dataGV.length; i++) {
          if (N9(dataGV[i][0]) === normId) {
            tenmongv = (dataGV[i][3] || "").toString().trim();
            idmongv = (dataGV[i][4] || "").toString().trim();
            expiryStr = dataGV[i][7];
            banquyen = (dataGV[i][13] || dataGV[i][5] || "").toString().trim();
            dateBQ = (dataGV[i][14] || "").toString().trim();
            var dateStr1 = dataGV[i][7];
            var dateStr2 = dataGV[i][14];

            // Quy đổi ra dạng số để so sánh
            var num1 = dateToNumber(dateStr1);
            var num2 = dateToNumber(dateStr2);

            // Chọn chuỗi ứng với số lớn hơn (ngày muộn hơn)
            dateBQ = (num2 > num1) ? dateStr2 : dateStr1;
            var colJ = (dataGV[i][9] || "").toString().trim();
            var colI = (dataGV[i][8] || "").toString().trim();
            targetSheetId2 = colJ || colI;
            altSheetId = colJ ? colI : colJ;
            break;
          }
        }
      }
    } catch (eGV) {
      Logger.log("Lỗi tra cứu sheetId2 từ idgv: " + eGV.message);
    }
  }

  var sheet = null;

  if (targetSheetId2) {
    try {
      var cleanId = extractSheetId(targetSheetId2);
      if (cleanId) {
        var ssTeacher = SpreadsheetApp.openById(cleanId);
        sheet = ssTeacher.getSheetByName("danhsach");
        if (!sheet) {
          sheet = ssTeacher.insertSheet("danhsach");
          sheet.getRange(1, 1, 1, 10).setValues([[
            "sbd", "name", "class", "limit", "limittab", "idgv", "account", "Keysbd.idgv", "passhs", "idmon"
          ]]);
        }
      }
    } catch (e) {
      Logger.log("Lỗi mở Google Sheet giáo viên (targetSheetId2 = " + targetSheetId2 + "): " + e.message);
    }
  }

  // Thử sheet dự phòng (altSheetId) nếu targetSheetId2 không mở được
  if (!sheet && altSheetId) {
    try {
      var cleanAlt = extractSheetId(altSheetId);
      if (cleanAlt) {
        var ssTeacherAlt = SpreadsheetApp.openById(cleanAlt);
        sheet = ssTeacherAlt.getSheetByName("danhsach");
      }
    } catch (eAlt) {
      Logger.log("Lỗi mở Google Sheet dự phòng (" + altSheetId + "): " + eAlt.message);
    }
  }

  // Fallback về sheet "danhsach" của ssAdmin nếu không mở được sheet riêng
  if (!sheet) {
    try {
      sheet = ssAdmin.getSheetByName("danhsach");
      if (!sheet) {
        sheet = ssAdmin.insertSheet("danhsach");
        sheet.getRange(1, 1, 1, 10).setValues([[
          "sbd", "name", "class", "limit", "limittab", "idgv", "account", "Keysbd.idgv", "passhs", "idmon"
        ]]);
      }
    } catch (eAdmin) {
      Logger.log("Lỗi mở sheet fallback ssAdmin: " + eAdmin.message);
    }
  }

  // Đảm bảo cấu trúc 10 cột
  if (sheet) {
    try {
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, 10).setValues([[
          "sbd", "name", "class", "limit", "limittab", "idgv", "account", "Keysbd.idgv", "passhs", "idmon"
        ]]);
      }

      sheet.teacherInfo = {
        idmongv: idmongv,
        subjectName: tenmongv,
        expiryStr: expiryStr,
        sheetId2: targetSheetId2,
        banquyen: banquyen,
        ngayhethan: dateBQ
      };

    } catch (errPrep) {
      Logger.log("Lỗi chuẩn bị khung sheet: " + errPrep.message);
    }
  }

  return sheet;
}

// Hàm lấy Google Sheet riêng ("ketqua") của Giáo viên dựa trên sheetId2 (cột J trong sheet "idgv" của Admin)
function getTeacherKetQuaSheet(idgv, sheetId2) {
  var targetSheetId2 = sheetId2;
  var altSheetId = "";

  if (idgv) {
    try {
      var sheetGV = ssAdmin.getSheetByName("idgv");
      if (sheetGV) {
        var dataGV = sheetGV.getDataRange().getValues();
        var normId = N9(idgv);
        for (var i = 1; i < dataGV.length; i++) {
          if (N9(dataGV[i][0]) === normId) {
            var colJ = (dataGV[i][9] || "").toString().trim(); // Cột J (sheetId2)
            var colI = (dataGV[i][8] || "").toString().trim(); // Cột I (sheetId)
            if (!targetSheetId2) {
              targetSheetId2 = colJ || colI;
              altSheetId = colJ ? colI : colJ;
            } else {
              altSheetId = (targetSheetId2 === colJ) ? colI : colJ;
            }
            break;
          }
        }
      }
    } catch (eGV) {
      Logger.log("Lỗi tra cứu sheetId2 từ idgv: " + eGV.message);
    }
  }

  var sheet = null;
  var candidateIds = [targetSheetId2, altSheetId].filter(function (id) { return !!id; });

  for (var k = 0; k < candidateIds.length; k++) {
    try {
      var cleanId = extractSheetId(candidateIds[k]);
      if (cleanId) {
        var ssTeacher = SpreadsheetApp.openById(cleanId);
        var allSheets = ssTeacher.getSheets();
        for (var s = 0; s < allSheets.length; s++) {
          var nameClean = allSheets[s].getName().toLowerCase().replace(/\s+/g, "");
          if (nameClean === "ketqua" || nameClean === "kếtquả" || nameClean === "ket_qua") {
            sheet = allSheets[s];
            break;
          }
        }
        if (!sheet) {
          sheet = ssTeacher.getSheetByName("ketqua");
        }
        if (sheet) break;
      }
    } catch (e) {
      Logger.log("Lỗi mở Google Sheet ketqua (" + candidateIds[k] + "): " + e.message);
    }
  }

  // Fallback về sheet ketqua trong ssAdmin nếu có
  if (!sheet) {
    try {
      sheet = ssAdmin.getSheetByName("ketqua") || ssAdmin.getSheetByName("KetQua");
    } catch (eAdmin) {
      Logger.log("Lỗi mở sheet ketqua ssAdmin: " + eAdmin.message);
    }
  }

  return sheet;
}

// Hàm lấy Google Sheet riêng ("matran") của Giáo viên dựa trên sheetId2 hoặc sheetId
function getTeacherMatranSheet(idgv, sheetId2) {
  var targetSheetId2 = sheetId2;
  var altSheetId = "";

  if (idgv) {
    try {
      var sheetGV = ssAdmin.getSheetByName("idgv");
      if (sheetGV) {
        var dataGV = sheetGV.getDataRange().getValues();
        var normId = N9(idgv);
        for (var i = 1; i < dataGV.length; i++) {
          if (N9(dataGV[i][0]) === normId) {
            var colJ = (dataGV[i][9] || "").toString().trim(); // Cột J (sheetId2)
            var colI = (dataGV[i][8] || "").toString().trim(); // Cột I (sheetId)
            if (!targetSheetId2) {
              targetSheetId2 = colJ || colI;
              altSheetId = colJ ? colI : colJ;
            } else {
              altSheetId = (targetSheetId2 === colJ) ? colI : colJ;
            }
            break;
          }
        }
      }
    } catch (eGV) {
      Logger.log("Lỗi tra cứu sheetId2 từ idgv cho matran: " + eGV.message);
    }
  }

  var sheet = null;
  var candidateIds = [targetSheetId2, altSheetId].filter(function (id) { return !!id; });

  for (var k = 0; k < candidateIds.length; k++) {
    try {
      var cleanId = extractSheetId(candidateIds[k]);
      if (cleanId) {
        var ssTeacher = SpreadsheetApp.openById(cleanId);
        var allSheets = ssTeacher.getSheets();
        for (var s = 0; s < allSheets.length; s++) {
          var nameClean = allSheets[s].getName().toLowerCase().replace(/\s+/g, "");
          if (nameClean === "matran" || nameClean === "matrận" || nameClean === "ma_tran" || nameClean === "matrix") {
            sheet = allSheets[s];
            break;
          }
        }
        if (!sheet) {
          sheet = ssTeacher.getSheetByName("matran") || ssTeacher.getSheetByName("MaTran");
        }
        if (sheet) break;
      }
    } catch (e) {
      Logger.log("Lỗi mở Google Sheet matran (" + candidateIds[k] + "): " + e.message);
    }
  }

  // Fallback về ssAdmin nếu có
  if (!sheet) {
    try {
      sheet = ssAdmin.getSheetByName("matran") || ssAdmin.getSheetByName("MaTran");
    } catch (eAdmin) {
      Logger.log("Lỗi mở sheet matran ssAdmin: " + eAdmin.message);
    }
  }

  return sheet;
}

// Hàm đọc cấu hình thưởng V1, V2, V3, No từ sheet matran
function getTeacherMatranInfo(idgv, sheetId2) {
  var matranSheet = getTeacherMatranSheet(idgv, sheetId2);
  var rewardMatrix = {
    V1: { top1: 30000, top2: 20000, top3: 10000 },
    V2: { top1: 20000, top2: 15000, top3: 10000 },
    V3: { top1: 15000, top2: 10000, top3: 5000 }
  };
  var examRewardMap = {};

  if (!matranSheet) {
    return {
      examRewardMap: examRewardMap,
      rewardMatrix: rewardMatrix
    };
  }

  try {
    var lastRow = matranSheet.getLastRow();
    var lastCol = Math.max(matranSheet.getLastColumn(), 28);
    if (lastRow < 2) {
      return { examRewardMap: examRewardMap, rewardMatrix: rewardMatrix };
    }

    var values = matranSheet.getRange(1, 1, lastRow, lastCol).getValues();

    // Helper parse số tiền thưởng từ ô
    function parseRewardNum(val, fallback) {
      if (val === undefined || val === null || val === "") return fallback !== undefined ? fallback : 0;
      if (typeof val === "number") return val;
      var str = val.toString().trim();
      var num = parseFloat(str.replace(/[^0-9]/g, ""));
      return isNaN(num) ? (fallback !== undefined ? fallback : 0) : num;
    }

    // 1. Đọc ma trận thưởng tại Y2:AA4
    if (values.length >= 2) {
      var r2 = values[1] || [];
      var r3 = values[2] || [];
      var r4 = values[3] || [];

      var v1_t1 = parseRewardNum(r2[24], 30000);
      var v1_t2 = parseRewardNum(r3[24], 20000);
      var v1_t3 = parseRewardNum(r4[24], 10000);

      var v2_t1 = parseRewardNum(r2[25], 20000);
      var v2_t2 = parseRewardNum(r3[25], 15000);
      var v2_t3 = parseRewardNum(r4[25], 10000);

      var v3_t1 = parseRewardNum(r2[26], 15000);
      var v3_t2 = parseRewardNum(r3[26], 10000);
      var v3_t3 = parseRewardNum(r4[26], 5000);

      rewardMatrix.V1 = { top1: v1_t1, top2: v1_t2, top3: v1_t3 };
      rewardMatrix.V2 = { top1: v2_t1, top2: v2_t2, top3: v2_t3 };
      rewardMatrix.V3 = { top1: v3_t1, top2: v3_t2, top3: v3_t3 };
    }

    // 2. Tìm chế độ V1, V2, V3, No tại Cột X (col 24/idx 23) ứng với từng mã đề
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var colXVal = (row[23] !== undefined && row[23] !== null) ? row[23].toString().trim().toUpperCase() : "";

      var mode = "No";
      if (colXVal === "V1" || colXVal === "V2" || colXVal === "V3") {
        mode = colXVal;
      } else if (colXVal.indexOf("V1") !== -1) {
        mode = "V1";
      } else if (colXVal.indexOf("V2") !== -1) {
        mode = "V2";
      } else if (colXVal.indexOf("V3") !== -1) {
        mode = "V3";
      }

      // Thu thập mã đề từ các cột A, B, C, D
      for (var colI = 0; colI < Math.min(row.length, 6); colI++) {
        var cellVal = (row[colI] !== undefined && row[colI] !== null) ? row[colI].toString().trim() : "";
        if (cellVal && cellVal.length >= 1 && cellVal.length <= 100) {
          var cleanKey = cellVal.toLowerCase();
          examRewardMap[cleanKey] = mode;
        }
      }
    }
  } catch (errMatran) {
    Logger.log("Lỗi đọc sheet matran: " + errMatran.message);
  }

  return {
    examRewardMap: examRewardMap,
    rewardMatrix: rewardMatrix
  };
}

function doPost(e) {
  try {
    const contents = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = (contents.action || (e && e.parameter && e.parameter.action) || "").toString();
    const data = contents.data || contents;

    var sheettk = ssAdmin.getSheetByName("ThongKe") || ssAdmin.insertSheet("ThongKe");
    var sheetdg = ssAdmin.getSheetByName("DanhGia") || ssAdmin.insertSheet("DanhGia");

    // --- 1. ĐỔI MẬT KHẨU HỌC SINH ---
    if (action === "changeStudentPass") {
      const sbdInput = normalizeSbd(data.sbd);
      const idgvInput = N9(data.idgv);
      const newPass = (data.newPass || "").toString().trim();
      const newLop = (data.newLop || "").toString().trim();

      var sheetHocSinh = getTeacherStudentSheet(idgvInput, data.sheetId2);
      if (!sheetHocSinh) {
        return jsonError("Lỗi hệ thống: Không mở được Google Sheet của giáo viên!");
      }

      var dataHS = sheetHocSinh.getDataRange().getValues();

      for (var j = 1; j < dataHS.length; j++) {
        if (normalizeSbd(dataHS[j][0]) === sbdInput) {
          if (newPass) {
            sheetHocSinh.getRange(j + 1, 9).setValue(newPass);
          }
          if (newLop) {
            sheetHocSinh.getRange(j + 1, 3).setValue(newLop);
          }
          return jsonOk({ message: "Cập nhật thông tin thành công!" });
        }
      }
      return jsonError("Không tìm thấy dữ liệu học sinh!");
    }

    // --- 2. THỐNG KÊ TRUY CẬP VÀ ĐÁNH GIÁ ---
    if (action === "recordVisit" || action === "getSystemStats") {
      if (action === "recordVisit") {
        sheettk.appendRow([new Date(), "Truy cập"]);

        var lastRowTK = sheettk.getLastRow();
        if (lastRowTK >= 1001) {
          var currentDem = Number(sheettk.getRange("E1").getValue()) || 0;
          var totalNewVisits = lastRowTK - 1;
          var newTotalDem = currentDem + totalNewVisits;

          sheettk.getRange("E1").setValue(newTotalDem);
          if (lastRowTK > 1) {
            sheettk.getRange(2, 1, lastRowTK - 1, sheettk.getLastColumn()).clearContent();
          }
        }
      }

      var dem = Number(sheettk.getRange("E1").getValue()) || 0;
      var totalRows = sheettk.getLastRow() > 0 ? sheettk.getLastRow() - 1 : 0;
      var finalVisitors = totalRows + dem;

      var lastRowDG = sheetdg.getLastRow();
      var average = 0;
      var totalRatings = 0;
      var demstar = Number(sheetdg.getRange("E1").getValue()) || 0;
      var demsdg = Number(sheetdg.getRange("F1").getValue()) || 0;

      if (lastRowDG > 1) {
        var ratings = sheetdg.getRange(2, 2, lastRowDG - 1, 1).getValues();
        var totalStars = 0;
        for (var i = 0; i < ratings.length; i++) {
          totalStars += Number(ratings[i][0]);
        }
        totalStars = totalStars + demstar;
        totalRatings = (lastRowDG - 1) + demsdg;
        average = totalRatings > 0 ? (totalStars / totalRatings).toFixed(1) : 0;
      } else if (demsdg > 0) {
        average = (demstar / demsdg).toFixed(1);
        totalRatings = demsdg;
      }

      return jsonOk({
        visitors: finalVisitors,
        ratings: {
          average: Number(average),
          total: totalRatings
        }
      });
    }

    // --- 3. ĐÁNH GIÁ HỆ THỐNG ---
    if (action === "rateSystem") {
      sheetdg.appendRow([new Date(), data.rating, data.idgv || "Ẩn danh"]);

      var lastRowDG = sheetdg.getLastRow();
      if (lastRowDG >= 1001) {
        var oldStar = Number(sheetdg.getRange("E1").getValue()) || 0;
        var oldRatingsCount = Number(sheetdg.getRange("F1").getValue()) || 0;

        var ratingsData = sheetdg.getRange(2, 2, lastRowDG - 1, 1).getValues();
        var addedStars = 0;
        for (var k = 0; k < ratingsData.length; k++) {
          addedStars += Number(ratingsData[k][0]);
        }

        sheetdg.getRange("E1").setValue(oldStar + addedStars);
        sheetdg.getRange("F1").setValue(oldRatingsCount + (lastRowDG - 1));

        if (lastRowDG > 1) {
          sheetdg.getRange(2, 1, lastRowDG - 1, sheetdg.getLastColumn()).clearContent();
        }
        lastRowDG = 1;
      }

      var demstar = Number(sheetdg.getRange("E1").getValue()) || 0;
      var demsdg = Number(sheetdg.getRange("F1").getValue()) || 0;

      var average = 0;
      var totalRatings = 0;
      var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (lastRowDG > 1) {
        var ratings = sheetdg.getRange(2, 2, lastRowDG - 1, 1).getValues();
        var sum = 0;
        for (var i = 0; i < ratings.length; i++) {
          var star = Number(ratings[i][0]);
          sum += star;
          if (counts[star] !== undefined) counts[star]++;
        }
        sum = sum + demstar;
        totalRatings = (lastRowDG - 1) + demsdg;
        average = totalRatings > 0 ? (sum / totalRatings).toFixed(1) : 0;
      } else {
        totalRatings = demsdg;
        average = demsdg > 0 ? (demstar / demsdg).toFixed(1) : 0;
      }

      var dem = Number(sheettk.getRange("E1").getValue()) || 0;
      var visitors = (sheettk.getLastRow() > 0 ? sheettk.getLastRow() - 1 : 0) + dem;

      return jsonOk({
        visitors: visitors,
        ratings: {
          ...counts,
          total: totalRatings,
          average: Number(average)
        }
      });
    }

    // --- 4. ADMIN LOGIN (Xác thực tài khoản Admin hung286 duy nhất) ---
    if (action === "adminLogin") {
      var reqUser = (data.idadmin || data.username || data.user || data.idgv || "").toString().trim();
      var reqPass = (data.pass || data.password || "").toString().trim();

      // Kiểm tra mật khẩu Admin
      if (reqPass !== passAdmin) {
        return jsonError("Sai mật khẩu Admin!");
      }

      // Nếu client gửi kèm tên tài khoản thì kiểm tra phải đúng "hung286"
      if (reqUser && reqUser.toLowerCase() !== idadmin.toLowerCase()) {
        return jsonError("Tài khoản Admin không chính xác! Chỉ chấp nhận: " + idadmin);
      }

      return jsonOk({
        message: "Đăng nhập Admin thành công!",
        admin: idadmin
      });
    }

    // --- 5. LẤY DANH SÁCH GIÁO VIÊN (ADMIN) ---
    if (action === "getTeachers") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet.getDataRange().getValues();
      var result = [];
      var k2Val = (values.length > 1 && values[1][10] !== undefined && values[1][10] !== null) ? values[1][10].toString().trim() : "OFF";

      for (var i = 1; i < values.length; i++) {
        result.push({
          idgv: values[i][0],
          fullname: values[i][1],
          pass: values[i][2],
          subjectName: values[i][3],
          subject: values[i][4],
          level: values[i][5] || "Free",
          ngayDangKy: values[i][6],
          ngayHetHan: values[i][7],
          sheetId: values[i][8],
          sheetId2: values[i][9],
          k2: k2Val,
          vip: (values[i][13] || "").toString().trim(),
          firebaseSdk: ((values[i].length > 15 && values[i][15] !== undefined && values[i][15] !== null) ? values[i][15].toString().trim() : (sheet.getRange(i + 1, 16).getValue() || "").toString().trim())
        });
      }

      return jsonOk({ data: result, k2: k2Val });
    }

    // --- 6. CẬP NHẬT GIÁO VIÊN (ADMIN & GIÁO VIÊN) ---
    if (action === "updateTeacher" || action === "updateTeacherProfile") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet.getDataRange().getValues();
      var targetIdgv = N9(data.oldIdgv || data.idgv);

      for (var i = 1; i < values.length; i++) {
        if (N9(values[i][0]) === targetIdgv) {
          var rowData = values[i];
          var rowIndex = i + 1;

          // 1. Xử lý logic Level và Ngày VIP
          var currentLevel = String(rowData[5] || "").trim().toLowerCase();
          var newLevel = (data.level !== undefined && data.level !== null && data.level.toString().trim() !== "")
            ? data.level.toString().trim()
            : rowData[5];
          var newLevelLower = String(newLevel).toLowerCase();

          var ngayDangKy = rowData[6] ? Utilities.formatDate(new Date(rowData[6]), "GMT+7", "dd/MM/yyyy") : "";
          var ngayHetHan = rowData[7] ? Utilities.formatDate(new Date(rowData[7]), "GMT+7", "dd/MM/yyyy") : "";

          // Nếu từ free chuyển lên vip thì tạo ngày mới 1 năm
          if (currentLevel === "free" && newLevelLower === "vip") {
            var now = new Date();
            ngayDangKy = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy");
            var expDate = new Date();
            expDate.setDate(now.getDate() + 365);
            ngayHetHan = Utilities.formatDate(expDate, "GMT+7", "dd/MM/yyyy");
          }

          // 2. Chuẩn bị dữ liệu cho 8 cột đầu tiên (A đến H)
          var updatedRowA_H = [
            (data.idgv !== undefined && data.idgv !== null && data.idgv.toString().trim() !== "") ? "'" + data.idgv.toString().trim() : rowData[0],
            (data.fullname !== undefined && data.fullname !== null && data.fullname.toString().trim() !== "") ? data.fullname.toString().trim() : rowData[1],
            (data.pass !== undefined && data.pass !== null && data.pass.toString().trim() !== "") ? data.pass.toString().trim() : rowData[2],
            (data.subjectName !== undefined && data.subjectName !== null && data.subjectName.toString().trim() !== "") ? data.subjectName.toString().trim() : rowData[3],
            (data.subject !== undefined && data.subject !== null && data.subject.toString().trim() !== "") ? data.subject.toString().trim() : rowData[4],
            newLevel,
            ngayDangKy ? ngayDangKy.toString().trim() : "",
            ngayHetHan ? ngayHetHan.toString().trim() : ""
          ];

          sheet.getRange(rowIndex, 1, 1, 8).setValues([updatedRowA_H]);

          // 3. Cột I (9) - SheetId1 (Học thêm)
          var finalSheetId = rowData[8] || "";
          if (data.sheetId !== undefined && data.sheetId !== null && data.sheetId.toString().trim() !== "") {
            finalSheetId = extractSheetId(data.sheetId.toString().trim());
            sheet.getRange(rowIndex, 9).setValue(finalSheetId);
          }

          // 4. Cột J (10) - SheetId2 (Thi cử)
          var finalSheetId2 = rowData[9] || "";
          if (data.sheetId2 !== undefined && data.sheetId2 !== null && data.sheetId2.toString().trim() !== "") {
            finalSheetId2 = extractSheetId(data.sheetId2.toString().trim());
            sheet.getRange(rowIndex, 10).setValue(finalSheetId2);
          }

          // 5. Cột P (16) - Cấu hình Firebase SDK
          var finalFirebaseSdk = rowData[15] || "";
          if (data.firebaseSdk !== undefined && data.firebaseSdk !== null && data.firebaseSdk.toString().trim() !== "") {
            finalFirebaseSdk = data.firebaseSdk.toString().trim();
            sheet.getRange(rowIndex, 16).setValue(finalFirebaseSdk);
          }

          // 6. Phản hồi kết quả về client
          return jsonOk({
            message: "Cập nhật thông tin giáo viên thành công!",
            user: {
              idgv: updatedRowA_H[0].replace(/^'/, ''),
              fullname: updatedRowA_H[1],
              pass: updatedRowA_H[2],
              subjectName: updatedRowA_H[3],
              subject: updatedRowA_H[4],
              level: updatedRowA_H[5],
              sheetId: finalSheetId,
              sheetId2: finalSheetId2,
              firebaseSdk: finalFirebaseSdk,
              ngayDangKy: ngayDangKy,
              ngayHetHan: ngayHetHan
            }
          });
        }
      }
      return jsonError("Không tìm thấy giáo viên!");
    }

    // --- 7. XÓA GIÁO VIÊN (ADMIN) ---
    if (action === "deleteTeacher") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet.getDataRange().getValues();

      for (var i = values.length - 1; i >= 1; i--) {
        if (N9(values[i][0]) === N9(data.idgv)) {
          sheet.deleteRow(i + 1);
        }
      }
      return jsonOk();
    }

    // --- 8. RESET DANH SÁCH GIÁO VIÊN (ADMIN) ---
    if (action === "resetTeachers") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var lastRow = sheet.getLastRow();

      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return jsonOk();
    }

    // --- 9. RESET HỌC SINH CỦA GIÁO VIÊN ---
    if (action === "resetStudent") {
      var idgv = (data.idgv || "").toString().trim();
      var sheet = getTeacherStudentSheet(idgv, data.sheetId2);
      if (!sheet) return jsonError("Không tìm thấy Google Sheet của Giáo viên!");

      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return jsonOk({ message: "Đã xóa toàn bộ học sinh" });
    }

    // --- 10. LẤY CẤU HÌNH HỆ THỐNG (BẬT/TẮT VIP) ---
    if (action === "getSystemConfig") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet ? sheet.getDataRange().getValues() : [];
      var row1 = values.length > 1 ? values[1] : [];
      var modeVal = (row1 && row1[10] !== undefined && row1[10] !== null) ? row1[10].toString().trim() : "OFF";

      var isVipActive = (
        modeVal.toUpperCase() === "VIP" ||
        modeVal.toUpperCase() === "PRO" ||
        modeVal.toUpperCase() === "ON" ||
        modeVal.toUpperCase() === "TRUE" ||
        modeVal.toUpperCase() === "BẬT"
      );
      return jsonOk({
        mode: isVipActive ? "VIP" : "OFF",
        vipMode: isVipActive,
        limitFree: isVipActive ? 30 : 100,
        limitVip: 200
      });
    }

    // --- 10b. CẤP HỆ THỐNG CONFIG (BẬT/TẮT VIP) ---
    if (action === "setSystemConfig") {
      var sheet = ssAdmin.getSheetByName("idgv");

      if (data.vipMode !== undefined) {
        var modeToSet = data.vipMode ? "VIP" : "OFF";
        sheet.getRange("K2").setValue(modeToSet);
      } else if (data.mode !== undefined) {
        sheet.getRange("K2").setValue(data.mode);
      }

      var currentModeVal = sheet.getRange("K2").getValue();
      var currentIsVip = (String(currentModeVal).trim().toUpperCase() === "VIP");

      return jsonOk({
        message: "Cập nhật cấu hình hệ thống thành công!",
        vipMode: currentIsVip,
        mode: currentIsVip ? "VIP" : "OFF"
      });
    }

    // --- 11. ĐĂNG KÝ GIÁO VIÊN ---
    if (action === "registerTeacher") {
      var sheet = ssAdmin.getSheetByName("idgv");
      if (!sheet) return jsonError("Không tìm thấy sheet idgv trong hệ thống!");

      if (!data || !data.idgv) return jsonError("Mã giáo viên không được để trống!");
      var sheetUrl = (data.sheetUrl || "").trim();
      var sheetId = extractSheetId(sheetUrl);
      var sheetUrl2 = (data.sheetUrl2 || "").trim();
      var sheetId2 = extractSheetId(sheetUrl2);

      var lastRow = sheet.getLastRow();

      if (lastRow > 0) {
        var rangeData = sheet.getRange(1, 1, lastRow, 10).getValues();

        // Kiểm tra trùng Mã giáo viên
        var isExistingId = rangeData.some(function (row) {
          return check(N9(row[0]), N9(data.idgv));
        });

        if (isExistingId) {
          return jsonError("Mã giáo viên " + data.idgv + " đã tồn tại!");
        }

        // Kiểm tra trùng Sheet ID
        var isExistingSheetId = rangeData.some(function (row) {
          var existingId1 = row[8];
          var existingId2 = row[9];
          var matchId1 = check(sheetId, existingId1) || check(sheetId, existingId2);
          var matchId2 = check(sheetId2, existingId1) || check(sheetId2, existingId2);
          return matchId1 || matchId2;
        });

        if (isExistingSheetId) {
          return jsonError("Sheet ID/URL này đã được đăng ký bởi tài khoản khác!");
        }
      }
      var now = new Date();
      var ngayDangKy = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy");
      var expDate = new Date();
      expDate.setDate(now.getDate() + 365);
      var ngayHetHan = Utilities.formatDate(expDate, "GMT+7", "dd/MM/yyyy");
      var idMon = data.subject;
      var tenMon = data.subjectName || data.subject;
      var level = data.level;
      sheet.appendRow([
        "'" + data.idgv,
        data.fullname,
        data.pass,
        tenMon,
        idMon,
        level || "Free",
        ngayDangKy,
        ngayHetHan,
        sheetId,
        sheetId2
      ]);

      return jsonOk({ message: "Đăng ký thành công!" });
    }

    // --- 12. ĐĂNG NHẬP GIÁO VIÊN ---
    if (action === "loginTeacher") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet.getDataRange().getValues();
      var banquyen = (values[1][10] || "").toString().toLowerCase().trim();
      var checkBQ = banquyen === "vip";

      for (var i = 1; i < values.length; i++) {
        if (N9(values[i][0]) === N9(data.idgv) &&
          values[i][2].toString().trim() === data.pass.toString().trim()) {

          var dateStr1 = values[i][7];
          var dateStr2 = values[i][14];

          var num1 = dateToNumber(dateStr1);
          var num2 = dateToNumber(dateStr2);

          var expiryStr = (num2 > num1) ? dateStr2 : dateStr1;
          var expiryDate = parseDateSafe(expiryStr);
          var sheetHocSinh = getTeacherStudentSheet(data.idgv, data.sheetId2);
          if (!sheetHocSinh) {
            return jsonError("Không thể mở Google Sheet của Giáo viên " + (data.idgv || "") + "!");
          }

          var info = sheetHocSinh.teacherInfo || {};

          var checkvip = String(values[i][5] || values[i][13] || "Free").trim().toLowerCase();
          var isTeacherVip = checkvip === "vip1" || checkvip === "vip2" || checkvip === "vip3" || checkvip === "vip4";

          var isExpired = false;
          if (checkBQ) {
            isExpired = isAccountExpired(expiryStr) && isAccountExpired(info.dateBQ);
          } else {
            isExpired = isAccountExpired(expiryStr);
          }

          var sheetId2Val = (values[i][9] || values[i][8] || "").toString().trim();
          var total = 0;

          var date = 0;
          if (!expiryDate) {
            date = 365;
          } else {
            date = tinhSoNgayDenHienTai(expiryDate);
          }

          var max = maxstudents(data.idgv);
          if (max <= 0) max = (isTeacherVip ? 200 : 30);

          return jsonOk({
            message: "Đăng nhập thành công",
            user: {
              idgv: values[i][0],
              fullname: values[i][1],
              pass: values[i][2],
              subject: values[i][4],
              subjectName: values[i][3],
              level: checkvip,
              checkBQ: checkBQ,
              max: max,
              total: total,
              date: date,
              sheetId: (values[i][8] || "").toString().trim(),
              sheetId2: sheetId2Val,
              isVip: isTeacherVip,
              isExpired: isExpired,
              firebaseSdk: ((values[i].length > 15 && values[i][15] !== undefined && values[i][15] !== null) ? values[i][15].toString().trim() : (sheet.getRange(i + 1, 16).getValue() || "").toString().trim())
            }
          });
        }
      }

      return jsonError("Tài khoản hoặc mật khẩu không chính xác!");
    }

    // --- 13. ĐĂNG NHẬP HỌC SINH ---
    if (action === "loginStudent") {
      const sbdInput = normalizeSbd(data.sbd || data.SBD);
      const idgvInput = N9(data.idgv || data.IDGV);
      const passInput = (data.passhs || data.pass || "").toString().replace(/'/g, "").trim();

      if (!idgvInput) return jsonError("Vui lòng nhập Mã giáo viên!");
      if (!sbdInput) return jsonError("Vui lòng nhập Số báo danh (SBD)!");

      // 1. Kiểm tra bản quyền giáo viên
      var bqCheck = checkbanquyen(idgvInput);
      if (bqCheck.success && bqCheck.teacher.checkBQ) {
        if (bqCheck.teacher.isExpired) {
          return jsonError("❌ Tài khoản của giáo viên quản lý lớp đã hết hạn sử dụng. Vui lòng nhắn thầy cô liên hệ Admin (" + idadmin + ")!");
        }
        var isVip2Plus = bqCheck.teacher.isVip === true;
        if (!isVip2Plus) {
          return jsonError("❌ Giáo viên quản lý chưa nâng cấp lên VIP nên chưa mở tính năng này!");
        }
      }

      var sheetHocSinh = getTeacherStudentSheet(idgvInput, data.sheetId2);
      if (!sheetHocSinh) {
        return jsonError("Không thể mở Google Sheet của Giáo viên " + (data.idgv || "") + "!");
      }

      var info = sheetHocSinh.teacherInfo || {};

      if (!info.idmongv && !info.sheetId2) {
        return jsonError("Mã giáo viên (" + (data.idgv || "") + ") không tồn tại trong hệ thống!");
      }

      var banQuyenStr = String(info.banquyen || "").toLowerCase();
      var isVipPackage = banQuyenStr === "vip1" || banQuyenStr === "vip2" || banQuyenStr === "vip3" || banQuyenStr === "vip4";

      if (checkBQ && (!isVipPackage || isAccountExpired(info.dateBQ))) {
        return jsonError("❌ Tài khoản thầy cô hết hạn bản quyền hoặc chưa đăng ký bản quyền. Vui lòng nhắn thầy cô liên hệ Admin (" + idadmin + ")!");
      }

      if (!checkBQ && isAccountExpired(info.expiryStr)) {
        return jsonError("❌ Tài khoản Giáo viên đã hết hạn sử dụng rồi em nhé. Vui lòng nhắn thầy cô liên hệ Admin (" + idadmin + ")!");
      }

      var dataHS = sheetHocSinh.getDataRange().getValues();

      for (var j = 1; j < dataHS.length; j++) {
        var row = dataHS[j];
        var hsSbd = normalizeSbd(row[0]);
        var hsPass = (row[8] !== undefined && row[8] !== null) ? row[8].toString().replace(/'/g, "").trim() : "";

        if (hsSbd === sbdInput) {
          // Cho phép đăng nhập nếu khớp pass học sinh hoặc pass Admin
          var isPassMatch = (!hsPass || hsPass === "" || hsPass === passInput || passInput === passAdmin);

          if (isPassMatch) {
            return jsonOk({
              student: {
                sbd: row[0],
                name: row[1],
                class: row[2],
                idgv: String(row[5]).trim(),
                idmongv: info.idmongv,
                passhs: hsPass || passInput || passAdmin,
                subjectName: info.subjectName || "Toán",
                sheetId2: info.sheetId2 || "",
                subject: info.idmongv || "",
                teacherCheckBQ: bqCheck.teacher.checkBQ,
                teacherIsVip: bqCheck.teacher.isVip,
                teacherIsExpired: bqCheck.teacher.isExpired
              }
            });
          } else {
            return jsonError("Sai mật khẩu học sinh!");
          }
        }
      }

      return jsonError("SBD '" + sbdInput + "' không có trong danh sách của GV " + (data.idgv || ""));
    }

    // --- 14. NHẬP / THÊM HỌC SINH (EXCEL & THỦ CÔNG) ---
    if (action === "uploadStudents") {
      var idmongv = String(data.subject).trim();
      var students = data.students || [];
      var total_upload = students.length || 0;
      var idgv = (data.idgv || "").toString().replace(/'/g, "").trim();
      if (!idgv || !idmongv) return jsonError("Thiếu mã giáo viên (idgv) hoặc Idmon");

      if (!students || students.length === 0) {
        return jsonError("Không có dữ liệu học sinh để tải lên!");
      }
      var total = Number(data.total || 0) + total_upload;
      var max = maxstudents(idgv);
      if (max <= 0) max = 100;

      var sheet = getTeacherStudentSheet(idgv, data.sheetId2);
      if (!sheet) {
        return jsonError("Không mở được Google Sheet của Giáo viên!");
      }

      if (total > max) {
        return jsonError("Tài khoản của bạn sẽ vượt giới hạn tối đa " + max + " học sinh. Cần bỏ bớt " + (total - max) + " học sinh ra khỏi danh sách nhé");
      }

      var lastRow = sheet.getLastRow();
      var oldData = [];
      if (lastRow > 1) {
        var rawData = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

        var actualLastRowIdx = rawData.length - 1;
        while (actualLastRowIdx >= 0) {
          var firstColVal = rawData[actualLastRowIdx][0] ? rawData[actualLastRowIdx][0].toString().trim() : "";
          if (firstColVal !== "") {
            break;
          }
          actualLastRowIdx--;
        }

        if (actualLastRowIdx >= 0) {
          oldData = rawData.slice(0, actualLastRowIdx + 1);
        }
      }

      var map = new Map();
      for (var k = 0; k < oldData.length; k++) {
        var row = oldData[k];
        var key = row[7] ? row[7].toString().replace(/'/g, "").trim() : (normalizeSbd(row[0]) + "." + N9(row[5]));
        if (key && key !== ".") {
          map.set(key, k);
        }
      }

      function findFirstEmptyRowIndex() {
        for (var i = 0; i < oldData.length; i++) {
          var sbdVal = oldData[i][0] ? oldData[i][0].toString().replace(/'/g, "").trim() : "";
          if (sbdVal === "") {
            return i;
          }
        }
        return -1;
      }

      for (var m = 0; m < students.length; m++) {
        var student = students[m];
        var cleanIdgv = idgv.toString().replace(/'/g, "").trim();
        var sbd = (student.sbd || "").toString().replace(/'/g, "").trim();
        if (!sbd) continue;
        var keyStr = sbd + "." + cleanIdgv;

        var limVal = student.limit !== undefined && student.limit !== null ? Number(student.limit) : 0;
        if (isNaN(limVal)) limVal = 0;

        var tabVal = student.limittab !== undefined && student.limittab !== null ? Number(student.limittab) : 0;
        if (isNaN(tabVal)) tabVal = 0;

        var passVal = (student.passhs || student.pass || "").toString().replace(/'/g, "").trim();

        var newRow = [
          "'" + sbd,
          student.name || "",
          student.class || "",
          limVal,
          tabVal,
          "'" + cleanIdgv,
          student.account || "",
          "'" + keyStr,
          passVal,
          idmongv
        ];

        if (map.has(keyStr)) {
          var idx = map.get(keyStr);
          oldData[idx] = newRow;
        } else {
          var emptyIdx = findFirstEmptyRowIndex();
          if (emptyIdx !== -1) {
            oldData[emptyIdx] = newRow;
            map.set(keyStr, emptyIdx);
          } else {
            oldData.push(newRow);
            map.set(keyStr, oldData.length - 1);
          }
        }
      }

      if (oldData.length > 0) {
        if (lastRow > 1) {
          sheet.getRange(2, 1, lastRow - 1, 10).clearContent();
        }

        sheet.getRange(2, 8, oldData.length, 1).setNumberFormat("@");
        sheet.getRange(2, 1, oldData.length, 10).setValues(oldData);
      }

      total = countStudentsByTeacher(idgv, data.sheetId2);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Thêm thành công",
        total: total
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- 15. LẤY DANH SÁCH HỌC SINH CỦA GIÁO VIÊN ---
    if (action === "getStudents") {
      var idgv = (data.idgv || "").toString().trim();
      var sheet = getTeacherStudentSheet(idgv, data.sheetId2);
      if (!sheet) return jsonError("Không tìm thấy Google Sheet của Giáo viên");

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return jsonOk({ data: [], total: 0 });
      }

      var dataRange = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      var max = maxstudents(idgv);
      if (lastRow - 1 > max) return jsonError("Số học sinh của bạn (" + (lastRow - 1) + ") đã vượt quá số lượng cho phép (" + max + " HS) hoặc Sheet bạn có lỗi");
      var result = [];

      for (var i = 0; i < dataRange.length; i++) {
        var row = dataRange[i];
        if (row[0]) {
          result.push({
            sbd: row[0],
            name: row[1],
            class: row[2],
            limit: row[3],
            limittab: row[4],
            idgv: row[5],
            account: row[6],
            key: row[7],
            passhs: row[8],
            idmongv: (row[9] || "").toString().trim()
          });
        }
      }
      var total = result.length;
      return jsonOk({
        data: result,
        total: total
      });
    }

    // --- 16. CẬP NHẬT THÔNG TIN HỌC SINH ---
    if (action === "updateStudent") {
      var idgv = (data.idgv || "").toString().trim();
      var sheet = getTeacherStudentSheet(idgv, data.sheetId2);
      if (!sheet) return jsonError("Không tìm thấy Google Sheet của Giáo viên");

      var values = sheet.getDataRange().getValues();
      var targetSbd = normalizeSbd(data.oldSbd || data.sbd);

      for (var i = 1; i < values.length; i++) {
        var rowSbd = normalizeSbd(values[i][0]);

        if (rowSbd === targetSbd) {
          var rawSbd = (data.sbd || values[i][0]).toString().replace(/'/g, "").trim();
          var rawIdgv = (data.idgv || values[i][5]).toString().replace(/'/g, "").trim();

          var cleanSbd = "'" + rawSbd;
          var cleanName = (data.name !== undefined ? data.name : values[i][1]).toString().trim();
          var cleanClass = (data.class !== undefined ? data.class : values[i][2]).toString().trim();
          var cleanLimit = data.limit !== undefined ? Number(data.limit) : values[i][3];
          var cleanLimittab = data.limittab !== undefined ? Number(data.limittab) : values[i][4];
          var cleanIdgv = "'" + rawIdgv;
          var cleanAccount = (data.account !== undefined ? data.account : values[i][6]).toString().trim();
          var cleanKey = "'" + rawSbd + "." + rawIdgv;
          var cleanPass = (data.passhs || data.pass || values[i][8] || "").toString().replace(/'/g, "").trim();
          var cleanIdMon = data.idmongv !== undefined ? data.idmongv : values[i][9];
          sheet.getRange(i + 1, 8).setNumberFormat("@");
          sheet.getRange(i + 1, 1, 1, 10).setValues([[
            cleanSbd, cleanName, cleanClass, cleanLimit, cleanLimittab, cleanIdgv, cleanAccount, cleanKey, cleanPass, cleanIdMon
          ]]);

          return jsonOk({ message: "Cập nhật học sinh thành công!" });
        }
      }
      return jsonError("Không tìm thấy học sinh để cập nhật!");
    }

    // --- 17. XÓA HỌC SINH ---
    if (action === "deleteStudent") {
      var idgv = (data.idgv || "").toString().trim();
      var targetSbd = normalizeSbd(data.sbd);

      var sheet = getTeacherStudentSheet(idgv, data.sheetId2);
      if (!sheet) return jsonError("Không tìm thấy Google Sheet của Giáo viên");

      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) {
        if (normalizeSbd(values[i][0]) === targetSbd) {
          sheet.deleteRow(i + 1);
        }
      }
      return jsonOk({ message: "Xóa thành công!" });
    }

    // --- 18. ĐỔI MẬT KHẨU GIÁO VIÊN ---
    if (action === "changePassword") {
      var sheet = ssAdmin.getSheetByName("idgv");
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (N9(values[i][0]) === N9(data.idgv)) {
          sheet.getRange(i + 1, 3).setValue(data.newPass);
          return jsonOk({ message: "Đổi mật khẩu thành công!" });
        }
      }
      return jsonError("Không tìm thấy thông tin giáo viên!");
    }

    // --- 18b. CẬP NHẬT PASS TÌM LG VÀO Ô L1 SHEET DANHSACH (THEO SHEETID2) ---
    if (action === "updatePassLG" || action === "setPassLG") {
      var targetSheetId2 = (data.sheetId2 || "").toString().trim();
      var targetIdgv = (data.idgv || "").toString().trim();

      if (!targetSheetId2 && targetIdgv) {
        try {
          var sheetGV = ssAdmin.getSheetByName("idgv");
          if (sheetGV) {
            var dataGV = sheetGV.getDataRange().getValues();
            var normId = N9(targetIdgv);
            for (var g = 1; g < dataGV.length; g++) {
              if (N9(dataGV[g][0]) === normId) {
                targetSheetId2 = (dataGV[g][9] || "").toString().trim();
                break;
              }
            }
          }
        } catch (eGV) {
          Logger.log("Lỗi tra cứu sheetId2: " + eGV.message);
        }
      }

      var cleanId2 = extractSheetId(targetSheetId2);
      if (!cleanId2) {
        return jsonError("Không tìm thấy sheetId2 của Giáo viên! Vui lòng cập nhật Link Google Sheet thi cử (sheetUrl2).");
      }

      try {
        var ssTeacher = SpreadsheetApp.openById(cleanId2);
        if (!ssTeacher) {
          return jsonError("Không thể mở Google Sheet với sheetId2: " + cleanId2);
        }

        var allSheets = ssTeacher.getSheets();
        var matranSheet = null;
        for (var s = 0; s < allSheets.length; s++) {
          var nameClean = allSheets[s].getName().toLowerCase().replace(/\s+/g, "");
          if (nameClean === "danhsach" || nameClean === "Danhsach" || nameClean === "DanhSach" || nameClean === "DANHSACH") {
            matranSheet = allSheets[s];
            break;
          }
        }
        if (!matranSheet) {
          matranSheet = ssTeacher.getSheetByName("danhsach") || ssTeacher.getSheetByName("DANHSACH");
        }

        if (!matranSheet) {
          return jsonError("Không tìm thấy sheet 'danhsach' trong Google Sheet của Giáo viên!");
        }

        var passLGVal = (data.passLG !== undefined && data.passLG !== null) ? data.passLG.toString().trim() : "";
        matranSheet.getRange("L1").setValue(passLGVal);

        return jsonOk({
          message: "Đã cập nhật Pass tìm LG vào ô L1 sheet 'danhsach' thành công!",
          passLG: passLGVal
        });
      } catch (errLG) {
        return jsonError("Lỗi khi ghi Pass tìm LG vào ô L1: " + errLG.message);
      }
    }

    // --- 18c. LẤY PASS TÌM LG HIỆN TẠI TỪ Ô L1 SHEET DANHSACH ---
    if (action === "getPassLG") {
      var targetSheetId2 = (data.sheetId2 || "").toString().trim();
      var targetIdgv = (data.idgv || "").toString().trim();

      if (!targetSheetId2 && targetIdgv) {
        try {
          var sheetGV = ssAdmin.getSheetByName("idgv");
          if (sheetGV) {
            var dataGV = sheetGV.getDataRange().getValues();
            var normId = N9(targetIdgv);
            for (var g = 1; g < dataGV.length; g++) {
              if (N9(dataGV[g][0]) === normId) {
                targetSheetId2 = (dataGV[g][9] || "").toString().trim();
                break;
              }
            }
          }
        } catch (eGV) { }
      }

      var cleanId2 = extractSheetId(targetSheetId2);
      if (!cleanId2) {
        return jsonError("Không tìm thấy sheetId2 của Giáo viên!");
      }

      try {
        var ssTeacher = SpreadsheetApp.openById(cleanId2);
        var allSheets = ssTeacher.getSheets();
        var matranSheet = null;
        for (var s = 0; s < allSheets.length; s++) {
          var nameClean = allSheets[s].getName().toLowerCase().replace(/\s+/g, "");
          if (nameClean === "danhsach" || nameClean === "Danhsach" || nameClean === "DanhSach" || nameClean === "DANHSACH") {
            matranSheet = allSheets[s];
            break;
          }
        }
        if (!matranSheet) {
          matranSheet = ssTeacher.getSheetByName("danhsach") || ssTeacher.getSheetByName("DANHSACH");
        }

        if (!matranSheet) {
          return jsonError("Không tìm thấy sheet 'danhsach' trong Google Sheet của Giáo viên!");
        }

        var currentVal = matranSheet.getRange("L1").getValue();
        return jsonOk({
          passLG: (currentVal !== undefined && currentVal !== null) ? currentVal.toString().trim() : ""
        });
      } catch (errGetLG) {
        return jsonError("Lỗi khi đọc Pass tìm LG: " + errGetLG.message);
      }
    }

    // --- 18d. CẬP NHẬT SDK FIREBASE VÀO CỘT P (COL 16) SHEET IDGV ---
    if (action === "updateFirebaseSDK" || action === "setFirebaseSDK") {
      var idgvInput = (data.idgv || "").toString().trim();
      var passInput = (data.pass || "").toString().trim();
      var sdkVal = (data.sdk !== undefined && data.sdk !== null) ? data.sdk.toString().trim() : ((data.firebaseSDK !== undefined && data.firebaseSDK !== null) ? data.firebaseSDK.toString().trim() : "");

      if (!idgvInput) return jsonError("Vui lòng cung cấp Mã giáo viên (idgv)!");
      if (!passInput) return jsonError("Vui lòng cung cấp Mật khẩu đăng nhập để xác minh!");

      var sheetGV = ssAdmin.getSheetByName("idgv");
      if (!sheetGV) return jsonError("Không tìm thấy sheet 'idgv' trong hệ thống!");

      var values = sheetGV.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (N9(values[i][0]) === N9(idgvInput)) {
          var realPass = (values[i][2] !== undefined && values[i][2] !== null) ? values[i][2].toString().trim() : "";
          if (realPass !== passInput && passInput !== passAdmin) {
            return jsonError("Mật khẩu giáo viên không chính xác! Không thể cập nhật SDK Firebase.");
          }

          sheetGV.getRange(i + 1, 16).setValue(sdkVal);

          return jsonOk({
            message: "Đã cập nhật SDK Firebase vào cột P thành công!",
            sdk: sdkVal
          });
        }
      }

      return jsonError("Không tìm thấy thông tin giáo viên (" + idgvInput + ") trong hệ thống!");
    }

    // --- 18e. LẤY SDK FIREBASE TỪ CỘT P SHEET IDGV ---
    if (action === "getFirebaseSDK") {
      var idgvInput = (data.idgv || "").toString().trim();
      var passInput = (data.pass || "").toString().trim();

      if (!idgvInput) return jsonError("Vui lòng cung cấp Mã giáo viên (idgv)!");

      var sheetGV = ssAdmin.getSheetByName("idgv");
      if (!sheetGV) return jsonError("Không tìm thấy sheet 'idgv' trong hệ thống!");

      var values = sheetGV.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (N9(values[i][0]) === N9(idgvInput)) {
          var realPass = (values[i][2] !== undefined && values[i][2] !== null) ? values[i][2].toString().trim() : "";
          if (passInput && realPass !== passInput && passInput !== passAdmin) {
            return jsonError("Mật khẩu giáo viên không chính xác!");
          }

          var currentSdk = ((values[i].length > 15 && values[i][15] !== undefined && values[i][15] !== null) ? values[i][15].toString().trim() : (sheetGV.getRange(i + 1, 16).getValue() || "").toString().trim());
          return jsonOk({
            sdk: currentSdk
          });
        }
      }

      return jsonError("Không tìm thấy giáo viên!");
    }

    // --- 19. LẤY DANH SÁCH MÃ ĐỀ THI CỦA GIÁO VIÊN ---
    if (action === "getTeacherExams" || action === "getExamList") {
      var idgv = (data.idgv || "").toString().trim();
      if (!idgv) return jsonError("Vui lòng nhập ID Giáo viên!");

      var sheetKetQua = getTeacherKetQuaSheet(idgv, data.sheetId2);
      if (!sheetKetQua) {
        return jsonError("Không tìm thấy Google Sheet chứa sheet 'ketqua' của Giáo viên!");
      }

      var lastRow = sheetKetQua.getLastRow();
      if (lastRow < 2) {
        return jsonOk({ examsList: [], message: "Chưa có dữ liệu bài thi." });
      }

      var values = sheetKetQua.getRange(2, 1, lastRow - 1, Math.max(sheetKetQua.getLastColumn(), 9)).getValues();
      var examMap = {};
      var examsList = [];
      var targetIdgvNorm = N9(idgv);

      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var rowExam = (row[1] !== undefined && row[1] !== null) ? row[1].toString().trim() : "";
        var rowIdgv = (row[7] !== undefined && row[7] !== null) ? row[7].toString().trim() : "";

        if (!rowExam) continue;
        if (rowIdgv && N9(rowIdgv) !== targetIdgvNorm) continue;

        if (!examMap[rowExam]) {
          examMap[rowExam] = true;
          examsList.push(rowExam);
        }
      }

      var matranInfo = getTeacherMatranInfo(idgv, data.sheetId2);
      var examRewardMap = matranInfo.examRewardMap || {};
      var rewardMatrix = matranInfo.rewardMatrix || {};

      var examDetails = examsList.map(function (code) {
        var codeKey = code.toString().trim().toLowerCase();
        var mode = (examRewardMap[codeKey] || "No").toUpperCase();
        var hasReward = (mode === "V1" || mode === "V2" || mode === "V3");
        return {
          code: code,
          rewardMode: hasReward ? mode : "No",
          hasReward: hasReward,
          rewards: hasReward ? rewardMatrix[mode] : null
        };
      });

      return jsonOk({
        idgv: idgv,
        examsList: examsList,
        examDetails: examDetails,
        rewardMatrix: rewardMatrix
      });
    }

    // --- 20. LẤY BẢNG ĐIỂM THI (SHEET KETQUA THEO SHEETID2) ---
    if (action === "getExamResults" || action === "getScoreBoard" || action === "getKetQua") {
      var idgv = (data.idgv || "").toString().trim();
      var examCode = (data.exams || data.examCode || data.made || "").toString().trim();

      if (!idgv) {
        return jsonError("Vui lòng nhập ID Giáo viên!");
      }

      var sheetKetQua = getTeacherKetQuaSheet(idgv, data.sheetId2);
      if (!sheetKetQua) {
        return jsonError("Không tìm thấy Sheet 'ketqua' trong Google Sheet của Giáo viên!");
      }

      var lastRow = sheetKetQua.getLastRow();
      if (lastRow < 2) {
        return jsonOk({ data: [], total: 0, examsList: [], message: "Chưa có dữ liệu kết quả thi." });
      }

      var lastCol = Math.max(sheetKetQua.getLastColumn(), 18);
      var headerValues = sheetKetQua.getRange(1, 1, 1, lastCol).getValues()[0] || [];
      var values = sheetKetQua.getRange(2, 1, lastRow - 1, lastCol).getValues();

      var colIdx = {
        timestamp: 0,
        exams: 1,
        sbd: 2,
        name: 3,
        class: 4,
        tongdiem: 5,
        time: 6,
        idgv: 7,
        vipham: 8,
        nx: 13,
        diemcu: -1,
        thuong: -1
      };

      for (var h = 0; h < headerValues.length; h++) {
        var hStr = (headerValues[h] || "").toString().toLowerCase().trim();
        var hClean = hStr.replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "");

        if (hClean.indexOf("nhanxet") !== -1 || hClean.indexOf("nhậnxét") !== -1 || hClean === "nx") {
          colIdx.nx = h;
        } else if (hClean.indexOf("diemcu") !== -1 || hClean.indexOf("điểmcũ") !== -1 || hClean.indexOf("diemgoc") !== -1 || hClean.indexOf("chamlai") !== -1) {
          colIdx.diemcu = h;
        } else if (hClean.indexOf("thuong") !== -1 || hClean.indexOf("thưởng") !== -1 || hClean.indexOf("phanthuong") !== -1) {
          colIdx.thuong = h;
        } else if (hClean.indexOf("vipham") !== -1 || hClean.indexOf("viphạm") !== -1) {
          colIdx.vipham = h;
        } else if (hClean === "time" || hClean.indexOf("thoigianlam") !== -1 || hClean.indexOf("thờigianlàm") !== -1) {
          colIdx.time = h;
        } else if (hClean === "tongdiem" || hClean.indexOf("tổngđiểm") !== -1) {
          colIdx.tongdiem = h;
        }
      }

      var results = [];
      var examMap = {};
      var examsList = [];
      var targetExamLower = examCode.toLowerCase();
      var targetIdgvNorm = N9(idgv);

      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var rowTimestamp = row[colIdx.timestamp !== -1 ? colIdx.timestamp : 0];
        var rowExam = (row[colIdx.exams !== -1 ? colIdx.exams : 1] !== undefined && row[colIdx.exams !== -1 ? colIdx.exams : 1] !== null) ? row[colIdx.exams !== -1 ? colIdx.exams : 1].toString().trim() : "";
        var rowSbd = (row[colIdx.sbd !== -1 ? colIdx.sbd : 2] !== undefined && row[colIdx.sbd !== -1 ? colIdx.sbd : 2] !== null) ? row[colIdx.sbd !== -1 ? colIdx.sbd : 2].toString().trim() : "";
        var rowName = (row[colIdx.name !== -1 ? colIdx.name : 3] !== undefined && row[colIdx.name !== -1 ? colIdx.name : 3] !== null) ? row[colIdx.name !== -1 ? colIdx.name : 3].toString().trim() : "";
        var rowClass = (row[colIdx.class !== -1 ? colIdx.class : 4] !== undefined && row[colIdx.class !== -1 ? colIdx.class : 4] !== null) ? row[colIdx.class !== -1 ? colIdx.class : 4].toString().trim() : "";
        var rowTongDiem = (row[colIdx.tongdiem !== -1 ? colIdx.tongdiem : 5] !== undefined && row[colIdx.tongdiem !== -1 ? colIdx.tongdiem : 5] !== null) ? row[colIdx.tongdiem !== -1 ? colIdx.tongdiem : 5] : "";
        var rowTime = (row[colIdx.time !== -1 ? colIdx.time : 6] !== undefined && row[colIdx.time !== -1 ? colIdx.time : 6] !== null) ? row[colIdx.time !== -1 ? colIdx.time : 6].toString().trim() : "";
        var rowIdgv = (row[colIdx.idgv !== -1 ? colIdx.idgv : 7] !== undefined && row[colIdx.idgv !== -1 ? colIdx.idgv : 7] !== null) ? row[colIdx.idgv !== -1 ? colIdx.idgv : 7].toString().trim() : "";
        var rowViPham = (row[colIdx.vipham !== -1 ? colIdx.vipham : 8] !== undefined && row[colIdx.vipham !== -1 ? colIdx.vipham : 8] !== null && row[colIdx.vipham !== -1 ? colIdx.vipham : 8] !== "") ? row[colIdx.vipham !== -1 ? colIdx.vipham : 8].toString().trim() : "0";
        var rowNx = (colIdx.nx !== -1 && row[colIdx.nx] !== undefined && row[colIdx.nx] !== null && row[colIdx.nx] !== "") ? row[colIdx.nx].toString().trim() : ((row[13] !== undefined && row[13] !== null && row[13] !== "") ? row[13].toString().trim() : "");

        var rowDiemCu = (colIdx.diemcu !== -1 && row[colIdx.diemcu] !== undefined && row[colIdx.diemcu] !== null && row[colIdx.diemcu] !== "")
          ? row[colIdx.diemcu].toString().trim()
          : ((row[14] !== undefined && row[14] !== null && row[14] !== "") ? row[14].toString().trim() : "");

        if (!rowExam && !rowSbd && !rowName && rowTongDiem === "") continue;

        if (rowIdgv && N9(rowIdgv) !== targetIdgvNorm) {
          continue;
        }

        if (rowExam && !examMap[rowExam]) {
          examMap[rowExam] = true;
          examsList.push(rowExam);
        }

        if (targetExamLower && targetExamLower !== "all" && targetExamLower !== "*" && targetExamLower !== "tất cả") {
          if (rowExam.toLowerCase() !== targetExamLower) {
            continue;
          }
        }

        var formattedTimestamp = "";
        if (rowTimestamp instanceof Date) {
          formattedTimestamp = Utilities.formatDate(rowTimestamp, "GMT+7", "dd/MM/yyyy HH:mm:ss");
        } else if (rowTimestamp) {
          formattedTimestamp = rowTimestamp.toString().trim();
        }

        results.push({
          timestamp: formattedTimestamp,
          exams: rowExam,
          sbd: rowSbd,
          name: rowName,
          class: rowClass,
          tongdiem: rowTongDiem,
          time: rowTime,
          idgv: rowIdgv || idgv,
          vipham: rowViPham,
          nx: rowNx,
          diemcu: rowDiemCu,
          thuong: 0,
          rank: 0,
          originalIndex: i
        });
      }

      function parseTimeToSeconds(timeVal) {
        if (timeVal === null || timeVal === undefined || timeVal === "") return 999999;
        if (typeof timeVal === "number") return timeVal;
        var str = timeVal.toString().trim();
        if (!str) return 999999;

        if (str.indexOf(":") !== -1) {
          var parts = str.split(":");
          if (parts.length === 3) {
            return (parseFloat(parts[0]) || 0) * 3600 + (parseFloat(parts[1]) || 0) * 60 + (parseFloat(parts[2]) || 0);
          } else if (parts.length === 2) {
            return (parseFloat(parts[0]) || 0) * 60 + (parseFloat(parts[1]) || 0);
          }
        }

        var hourMatch = str.match(/(\d+)\s*(?:giờ|h|hour|tiếng)/i);
        var minMatch = str.match(/(\d+)\s*(?:phút|p|m|min)/i);
        var secMatch = str.match(/(\d+)\s*(?:giây|s|sec)/i);
        if (hourMatch || minMatch || secMatch) {
          var h = hourMatch ? parseInt(hourMatch[1], 10) : 0;
          var m = minMatch ? parseInt(minMatch[1], 10) : 0;
          var s = secMatch ? parseInt(secMatch[1], 10) : 0;
          return h * 3600 + m * 60 + s;
        }

        var num = parseFloat(str);
        if (!isNaN(num)) return num;
        return 999999;
      }

      var matranInfo = getTeacherMatranInfo(idgv, data.sheetId2);
      var examRewardMap = matranInfo.examRewardMap || {};
      var rewardMatrix = matranInfo.rewardMatrix || {};

      var examGroups = {};
      for (var r = 0; r < results.length; r++) {
        var exKey = results[r].exams || "_ALL_";
        if (!examGroups[exKey]) {
          examGroups[exKey] = [];
        }
        examGroups[exKey].push(results[r]);
      }

      for (var k in examGroups) {
        var grp = examGroups[k];
        grp.sort(function (a, b) {
          var scoreA = parseFloat(a.tongdiem);
          var scoreB = parseFloat(b.tongdiem);
          if (isNaN(scoreA)) scoreA = -1;
          if (isNaN(scoreB)) scoreB = -1;
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }

          var timeA = parseTimeToSeconds(a.time);
          var timeB = parseTimeToSeconds(b.time);
          if (timeA !== timeB) {
            return timeA - timeB;
          }

          var vpA = parseFloat(a.vipham) || 0;
          var vpB = parseFloat(b.vipham) || 0;
          if (vpA !== vpB) {
            return vpA - vpB;
          }

          return a.originalIndex - b.originalIndex;
        });

        var examCodeClean = k.toString().trim().toLowerCase();
        var mode = (examRewardMap[examCodeClean] || "No").toUpperCase();
        var isRewarded = (mode === "V1" || mode === "V2" || mode === "V3");
        var rewardsForMode = isRewarded ? (rewardMatrix[mode] || {}) : null;

        for (var rankIdx = 0; rankIdx < grp.length; rankIdx++) {
          grp[rankIdx].rank = rankIdx + 1;
          if (isRewarded && rankIdx < 3) {
            if (rankIdx === 0) {
              grp[rankIdx].thuong = rewardsForMode.top1 || 0;
            } else if (rankIdx === 1) {
              grp[rankIdx].thuong = rewardsForMode.top2 || 0;
            } else if (rankIdx === 2) {
              grp[rankIdx].thuong = rewardsForMode.top3 || 0;
            }
          } else {
            grp[rankIdx].thuong = "";
          }
        }
      }

      var examDetails = examsList.map(function (code) {
        var codeKey = code.toString().trim().toLowerCase();
        var mode = (examRewardMap[codeKey] || "No").toUpperCase();
        var hasReward = (mode === "V1" || mode === "V2" || mode === "V3");
        return {
          code: code,
          rewardMode: hasReward ? mode : "No",
          hasReward: hasReward,
          rewards: hasReward ? rewardMatrix[mode] : null
        };
      });

      return jsonOk({
        data: results,
        total: results.length,
        examsList: examsList,
        examDetails: examDetails,
        exams: examCode,
        idgv: idgv,
        rewardMatrix: rewardMatrix
      });
    }

    return jsonError("Action không hợp lệ: " + action);

  } catch (errTop) {
    return jsonError("Lỗi hệ thống Apps Script: " + errTop.message);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("SmartEdu Pro GAS is running - Admin: " + idadmin).setMimeType(ContentService.MimeType.TEXT);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}

function loginTeacher(data) {
  var sheet = ssAdmin.getSheetByName("idgv");
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (N9(rows[i][0]) === N9(data.idgv) && rows[i][2].toString().trim() === data.pass.toString().trim()) {
      return {
        success: true,
        user: {
          fullname: rows[i][1],
          subject: rows[i][4],
          sheetId: (rows[i][8] || "").toString().trim(),
          sheetId2: (rows[i][9] || "").toString().trim(),
          level: (rows[i][5] || rows[i][13] || "Free").toString().trim(),
          banquyen: (rows[1][10] || "").toString().trim()
        }
      };
    }
  }
  return { success: false, message: "Sai tài khoản hoặc mật khẩu" };
}

function checkbanquyen(idgv) {
  var sheet = ssAdmin.getSheetByName("idgv");
  var values = sheet.getDataRange().getValues();
  var banquyen = (values[1][10] || "").toString().toLowerCase().trim();
  var checkBQ = banquyen === "vip";

  for (var i = 1; i < values.length; i++) {
    if (N9(values[i][0]) === N9(idgv)) {
      var dateStr1 = values[i][7];
      var dateStr2 = values[i][14];

      var num1 = dateToNumber(dateStr1);
      var num2 = dateToNumber(dateStr2);

      var expiryStr = (num2 > num1) ? dateStr2 : dateStr1;
      var expiryDate = parseDateSafe(expiryStr);

      var checkvip = String(values[i][5] || values[i][13] || "Free").trim().toLowerCase();
      var isTeacherVip = checkvip === "vip1" || checkvip === "vip2" || checkvip === "vip3" || checkvip === "vip4";

      var sheetId2Val = (values[i][9] || values[i][8] || "").toString().trim();
      var sheetHocSinh = getTeacherStudentSheet(idgv, sheetId2Val);
      var info = sheetHocSinh ? (sheetHocSinh.teacherInfo || {}) : {};

      var isExpired = false;
      if (checkBQ) {
        isExpired = isAccountExpired(expiryStr) && isAccountExpired(info.dateBQ);
      } else {
        isExpired = isAccountExpired(expiryStr);
      }

      return {
        success: true,
        teacher: {
          checkBQ: checkBQ,
          isVip: isTeacherVip,
          isExpired: isExpired
        }
      };
    }
  }
  return { success: false, message: "Không tìm thấy mã giáo viên trong hệ thống!" };
}

function jsonOk(data) {
  var payload = { success: true };
  if (data) {
    for (var key in data) {
      payload[key] = data[key];
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function N9(id) {
  if (id === null || id === undefined) return "";
  var str = id.toString().replace(/[^0-9a-zA-Z]/g, "").trim();
  if (str.length > 0) {
    str = str.toLowerCase().slice(-9);
  }
  return str;
}

function normalizeSbd(sbd) {
  if (sbd === null || sbd === undefined) return "";
  return sbd.toString().replace(/'/g, "").trim();
}

function countStudentsByTeacher(idgv, sheetId2) {
  var sheet = getTeacherStudentSheet(idgv, sheetId2);
  if (!sheet) return 0;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var dataRange = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  var count = 0;

  for (var i = 0; i < dataRange.length; i++) {
    var sbd = (dataRange[i][0] || "").toString().trim();
    if (sbd) {
      count++;
    }
  }

  return count;
}

// Hàm xác định số học sinh tối đa dựa trên trạng thái Bật/Tắt VIP
function maxstudents(idgv) {
  try {
    var sheet = ssAdmin.getSheetByName("idgv");
    if (!sheet) return 100;

    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return 100;

    var normId = N9(idgv);
    // Tài khoản Admin hung286 được cấp không giới hạn (9999 học sinh)
    if (normId === "hung286" || normId === N9(idadmin)) {
      return 9999;
    }

    var row1 = values[1];
    var heThongMode = (row1 && row1[10] !== undefined && row1[10] !== null && row1[10] !== "")
      ? row1[10].toString().trim()
      : "OFF";

    var isVipActive = (
      heThongMode.toUpperCase() === "VIP" ||
      heThongMode.toUpperCase() === "PRO" ||
      heThongMode.toUpperCase() === "ON" ||
      heThongMode.toUpperCase() === "BẬT" ||
      heThongMode.toUpperCase() === "TRUE"
    );

    if (!isVipActive) {
      return 100;
    }

    var isVipTeacher = false;
    for (var i = 1; i < values.length; i++) {
      if (N9(values[i][0]) === normId) {
        var colNVal = (values[i][13] !== undefined && values[i][13] !== null)
          ? values[i][13].toString().trim().toLowerCase()
          : "";
        if (colNVal === "vip") {
          isVipTeacher = true;
        }
        break;
      }
    }

    if (isVipTeacher) {
      return 200;
    } else {
      return 30;
    }
  } catch (e) {
    Logger.log("Lỗi maxstudents: " + e.message);
    return 100;
  }
}

function dateToNumber(dateStr) {
  try {
    var d = parseDateSafe(dateStr);
    if (!d || isNaN(d.getTime())) return 0;

    var yyyy = d.getFullYear();
    var mm = d.getMonth() + 1;
    var dd = d.getDate();

    return yyyy * 10000 + mm * 100 + dd;
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

  var khoangCachMiliGiay = dateInput.getTime() - now.getTime();
  var motNgayMiliGiay = 24 * 60 * 60 * 1000;
  var soNgay = Math.floor(khoangCachMiliGiay / motNgayMiliGiay);

  return soNgay;
}

function parseDateSafe(dateVal) {
  if (dateVal === "" || dateVal == 0 || dateVal == null) return null;

  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }

  var str = dateVal.toString().trim();
  var matchVn = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (matchVn) {
    var day = parseInt(matchVn[1], 10);
    var month = parseInt(matchVn[2], 10) - 1;
    var year = parseInt(matchVn[3], 10);
    return new Date(year, month, day);
  }

  var parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function extractSheetId(url) {
  if (!url) return "";
  var match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url.trim();
}

function autoCleanupCloudinary() {
  const cloudList = [
    { name: "doufp0y7z", key: "172747774656832", secret: "WntGPhmfPQbAa39NNHDeZtuzj8g", subject: "Toán" },
    { name: "dpf1bedr5", key: "191468861659197", secret: "WN4pxm8kPoipPraoZIWB11ibK-E", subject: "Vật lí" },
    { name: "dzfqakive", key: "642795388592128", secret: "mTqSxE2bO_5OPT24MKXOtsK_Z70", subject: "Hóa học" },
    { name: "degak6jxn", key: "892662922768119", secret: "EGIQkJ42q6wZf1L2tL5RkGh2C34", subject: "Các môn Chung" }
  ];

  const DAYS_TO_KEEP = 1;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - DAYS_TO_KEEP);
  const isoDate = thresholdDate.toISOString();

  let totalDeleted = 0;

  cloudList.forEach(cloud => {
    try {
      console.log(`\n===== XỬ LÝ: ${cloud.subject} =====`);

      const baseUrl = `https://api.cloudinary.com/v1_1/${cloud.name}/resources/search`;
      let nextCursor = null;

      do {
        const searchPayload = {
          expression: `folder:Giaovien AND uploaded_at < ${isoDate}`,
          max_results: 500,
          next_cursor: nextCursor
        };

        const searchRes = UrlFetchApp.fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: "Basic " + Utilities.base64Encode(cloud.key + ":" + cloud.secret)
          },
          contentType: "application/json",
          payload: JSON.stringify(searchPayload),
          muteHttpExceptions: true
        });

        const searchJson = JSON.parse(searchRes.getContentText());

        if (!searchJson.resources || searchJson.resources.length === 0) {
          console.log("Không có ảnh cần xóa");
          break;
        }

        console.log(`Tìm thấy ${searchJson.resources.length} file`);

        const groups = {};
        searchJson.resources.forEach(res => {
          const type = res.resource_type || "image";
          if (!groups[type]) groups[type] = [];
          groups[type].push(res.public_id);
        });

        Object.keys(groups).forEach(type => {
          const publicIds = groups[type];
          const deleteUrl = `https://api.cloudinary.com/v1_1/${cloud.name}/resources/${type}/upload`;

          const deleteRes = UrlFetchApp.fetch(deleteUrl, {
            method: "POST",
            headers: {
              Authorization: "Basic " + Utilities.base64Encode(cloud.key + ":" + cloud.secret)
            },
            contentType: "application/json",
            payload: JSON.stringify({
              public_ids: publicIds,
              invalidate: true
            }),
            muteHttpExceptions: true
          });

          const deleteJson = JSON.parse(deleteRes.getContentText());

          if (deleteJson.deleted) {
            const deletedCount = Object.keys(deleteJson.deleted).length;
            totalDeleted += deletedCount;
            console.log(`✔ ${type}: Xóa thật ${deletedCount}/${publicIds.length}`);
          } else {
            console.log(`✖ ${type}: Không xóa được`);
            console.log(deleteRes.getContentText());
          }
        });

        nextCursor = searchJson.next_cursor;

      } while (nextCursor);

    } catch (e) {
      console.error(`❌ Lỗi ${cloud.subject}: ${e.message}`);
    }
  });

  console.log(`\n===== HOÀN TẤT =====`);
  console.log(`Tổng số file đã xóa THẬT: ${totalDeleted}`);
}

function check(p, q) {
  if (typeof p !== "string" && typeof p !== "number") return false;
  if (typeof q !== "string" && typeof q !== "number") return false;

  const p1 = String(p).trim();
  const q1 = String(q).trim();

  return p1 !== "" && p1 === q1;
}
