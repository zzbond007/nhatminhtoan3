/**
 * Math Raccoon · Đồng bộ tiến trình qua Google Sheets (Apps Script).
 *
 * Cách dùng (chi tiết trong docs/cloud-sync/HUONG_DAN.md):
 * 1. Tạo một Google Sheets mới → Tiện ích mở rộng → Apps Script.
 * 2. Xoá mã mẫu, dán toàn bộ tệp này, bấm Lưu.
 * 3. Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web.
 *    Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai.
 * 4. Sao chép URL kết thúc bằng /exec và dán vào Góc đồng hành của Math Raccoon.
 *
 * Dữ liệu lưu trong trang tính "MathRaccoon" của chính anh/chị:
 * mỗi mã gia đình một dòng: mã gia đình | băm PIN | thời điểm cập nhật | số mảnh | mã tiến trình (chia mảnh).
 * Mã PIN không bao giờ được gửi hay lưu ở dạng gốc, chỉ lưu giá trị băm SHA-256.
 */

var SHEET_NAME = "MathRaccoon";
var CHUNK = 45000;          // mỗi ô Google Sheets chứa tối đa 50.000 ký tự
var MAX_CODE = 2000000;     // giới hạn an toàn cho một hồ sơ

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var request = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var family = String(request.familyCode || "").trim();
    var pinHash = String(request.pinHash || "");
    if (!/^[A-Za-z0-9-]{4,40}$/.test(family) || !/^[0-9a-f]{64}$/.test(pinHash)) {
      return reply({ ok: false, error: "Thiếu mã gia đình hoặc mã PIN." });
    }
    var sheet = getSheet();
    var rows = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === family) { rowIndex = i; break; }
    }
    if (rowIndex > 0 && String(rows[rowIndex][1]) !== pinHash) {
      return reply({ ok: false, error: "Sai mã PIN cho mã gia đình này." });
    }

    if (request.action === "status") {
      if (rowIndex < 1) return reply({ ok: true, updatedAt: null });
      return reply({ ok: true, updatedAt: asText(rows[rowIndex][2]) });
    }

    if (request.action === "load") {
      if (rowIndex < 1) return reply({ ok: false, error: "Chưa có dữ liệu cho mã gia đình này." });
      var count = Number(rows[rowIndex][3]) || 0;
      var code = rows[rowIndex].slice(4, 4 + count).map(asText).join("");
      return reply({ ok: true, updatedAt: asText(rows[rowIndex][2]), code: code });
    }

    if (request.action === "save") {
      var incoming = String(request.code || "");
      if (!/^MR1Z?-[0-9a-f]{8}-[A-Za-z0-9_-]+$/.test(incoming) || incoming.length > MAX_CODE) {
        return reply({ ok: false, error: "Mã tiến trình không hợp lệ." });
      }
      var now = new Date().toISOString();
      var chunks = [];
      for (var start = 0; start < incoming.length; start += CHUNK) chunks.push(incoming.slice(start, start + CHUNK));
      var values = [family, pinHash, now, String(chunks.length)].concat(chunks);
      var target = rowIndex > 0 ? rowIndex + 1 : sheet.getLastRow() + 1;
      var width = Math.max(values.length, sheet.getLastColumn());
      var range = sheet.getRange(target, 1, 1, width);
      range.clearContent();
      // Định dạng văn bản thuần để Sheets không hiểu nhầm mảnh mã bắt đầu bằng "-" hay "=" là công thức.
      range.setNumberFormat("@");
      sheet.getRange(target, 1, 1, values.length).setValues([values]);
      return reply({ ok: true, updatedAt: now });
    }

    return reply({ ok: false, error: "Yêu cầu không được hỗ trợ." });
  } catch (error) {
    return reply({ ok: false, error: "Máy chủ đồng bộ gặp lỗi: " + error });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["familyCode", "pinHash", "updatedAt", "chunks", "data"]);
  }
  return sheet;
}

function asText(value) {
  if (value instanceof Date) return value.toISOString();
  return value === null || value === undefined ? "" : String(value);
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
