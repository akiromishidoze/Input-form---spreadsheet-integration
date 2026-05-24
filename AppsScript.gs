// ============================================================
// Google Apps Script — Form Data Receiver
// Deploy as Web App (Execute as: Me, Access: Anyone)
// ============================================================

const SPREADSHEET_ID = '1s5_M-TmyHde_QJTxNKccPVb5AfOxXvm1S6R06bJGCT8';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const data = JSON.parse(e.postData.contents);
    const rows = data.rows || [data];
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get existing headers (row 1), trimmed
    const lastCol = sheet.getLastColumn();
    let headers = [];
    if (lastCol > 0 && sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
        .filter(h => h)
        .map(h => String(h).trim());
    }

    if (headers.length === 0) {
      // No headers yet — create them from first data row
      headers = Object.keys(rows[0]);
      const headerRow = sheet.getRange(1, 1, 1, headers.length);
      headerRow.setValues([headers]);
      headerRow.setFontWeight('bold');
    }

    // Build a case-insensitive lookup keyed by trimmed lowercase
    const lookup = {};
    headers.forEach(h => { lookup[h.toLowerCase()] = h; });

    // Normalize each row's keys to match headers (case-insensitive, trimmed)
    const normalizedRows = rows.map(row => {
      const out = {};
      Object.entries(row).forEach(([k, v]) => {
        const key = String(k).trim();
        const match = lookup[key.toLowerCase()];
        if (match) {
          out[match] = v;
        } else {
          out[key] = v;
        }
      });
      return out;
    });

    // Map each row's data to columns using exact header names
    const outputRows = normalizedRows.map(row => {
      return headers.map(h => {
        const val = row[h];
        return val !== undefined && val !== null ? String(val) : '';
      });
    });

    if (outputRows.length > 0) {
      const startRow = sheet.getLastRow() + 1;
      const range = sheet.getRange(startRow, 1, outputRows.length, headers.length);
      range.setValues(outputRows);
    }

    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        rows_appended: outputRows.length,
        headers: headers.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.debug === 'headers') {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ headers: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return ContentService
      .createTextOutput(JSON.stringify({ headers: headers.map(h => String(h).trim()) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Form Data Receiver is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
