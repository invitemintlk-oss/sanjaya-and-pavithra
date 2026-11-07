// @ts-nocheck
/**
 * Sanjaya & Pavithra – Wedding RSVP + Wishes → Google Sheets
 * ----------------------------------------------------------------
 * Paste this whole file into Google Apps Script (Extensions → Apps Script
 * from the spreadsheet), then Deploy → New deployment → Web app:
 *   Execute as: Me      Who has access: Anyone
 * Copy the /exec URL into GOOGLE_SCRIPT_URL in src/config.ts.
 *
 * The "RSVP" and "Wishes" sheets (with styled headers) are created
 * automatically on the first submission, or run setupSheets() once manually.
 */

var SPREADSHEET_ID = '1xcZ9mZunxOYGp8xgLmEJG7_bHtxBWvVjPJghuL1DdMQ';

var SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Full Name', 'Phone', 'Attendance', 'No. of Guests', 'Notes', 'Invited As'],
    fields: ['name', 'phone', 'attendance', 'guests', 'notes', 'invitedAs'],
    widths: [170, 200, 130, 110, 110, 300, 200],
    color: '#7a1f2b',
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Guest Name', 'Message', 'Invited As'],
    fields: ['name', 'message', 'invitedAs'],
    widths: [170, 200, 450, 200],
    color: '#1f5e4a',
  },
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var data = (e && e.parameter) || {};
    if (Object.keys(data).length === 0 && e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = {}; }
    }

    var config = resolveSheet_(data.sheet);
    if (!config) return json_({ ok: false, error: 'Unknown sheet. Use "RSVP" or "Wishes".' });

    var sheet = getOrCreateSheet_(config);
    var row = [new Date()];
    for (var i = 0; i < config.fields.length; i++) {
      row.push(clean_(data[config.fields[i]]));
    }
    sheet.appendRow(row);

    return json_({ ok: true, sheet: config.name, row: sheet.getLastRow() });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

/** GET ?sheet=Wishes returns the latest wishes (handy for showing them on the site). */
function doGet(e) {
  var which = e && e.parameter && e.parameter.sheet;
  if (which && resolveSheet_(which) === SHEETS.WISHES) {
    var sheet = getOrCreateSheet_(SHEETS.WISHES);
    var last = sheet.getLastRow();
    if (last < 2) return json_({ ok: true, wishes: [] });
    var values = sheet.getRange(2, 1, last - 1, 3).getValues();
    var wishes = values.reverse().slice(0, 50).map(function (r) {
      return { createdAt: r[0], name: r[1], message: r[2] };
    });
    return json_({ ok: true, wishes: wishes });
  }
  return json_({ ok: true, message: 'Sanjaya & Pavithra wedding endpoint is running.' });
}

/** Run once from the editor to create both sheets with headers (also authorises the script). */
function setupSheets() {
  getOrCreateSheet_(SHEETS.RSVP);
  getOrCreateSheet_(SHEETS.WISHES);
}

function resolveSheet_(name) {
  var key = String(name || '').trim().toUpperCase();
  if (key === 'RSVP') return SHEETS.RSVP;
  if (key === 'WISHES' || key === 'WISH') return SHEETS.WISHES;
  return null;
}

function getOrCreateSheet_(config) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.name);
  if (!sheet) sheet = ss.insertSheet(config.name);

  if (sheet.getLastRow() === 0) {
    var header = sheet.getRange(1, 1, 1, config.headers.length);
    header.setValues([config.headers])
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground(config.color)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (var i = 0; i < config.widths.length; i++) {
      sheet.setColumnWidth(i + 1, config.widths[i]);
    }
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  return sheet;
}

/** Trims input and stops values being interpreted as spreadsheet formulas. */
function clean_(value) {
  var v = String(value == null ? '' : value).trim().slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
