# Update Google Apps Script v2.7.1

Salin kode di bawah ini dan tempelkan ke **Google Apps Script Editor** Anda untuk menggantikan skrip yang lama. Skrip ini telah dioptimalkan untuk mendukung fitur **Auto-Sync** (Sinkronisasi Otomatis) dari Dashboard ProSpace.

```javascript
/**
 * ProSpace Cloud Sync Engine v2.7.1
 * Mendukung Sinkronisasi Otomatis (Auto-Sync) dari Frontend.
 */

function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'pull') {
    // Menarik data lengkap untuk inisialisasi aplikasi
    return ContentService.createTextOutput(JSON.stringify({
      programs: getSheetData(sheet.getSheetByName('programs')),
      proposals: getSheetData(sheet.getSheetByName('proposals')),
      registeredUsers: getSheetData(sheet.getSheetByName('registeredUsers')),
      logs: getSheetData(sheet.getSheetByName('globalLogs'))
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const params = e.parameter;
  const action = params.action;
  const collection = params.collection;
  const id = params.id;
  
  // Menangani permintaan 'push' otomatis (Auto-Sync)
  if (action === 'push' && collection && id) {
    const data = JSON.parse(e.postData.contents);
    const result = pushToSheet(collection, id, data);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', result: result }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Logika Sinkronisasi Baris (Atomic Update)
 */
function pushToSheet(collection, id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(collection);
  if (!sheet) return "Sheet '" + collection + "' tidak ditemukan!";
  
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  let rowIndex = -1;
  const idColIndex = headers.indexOf('id');
  
  if (idColIndex === -1) return "Kolom 'id' tidak ditemukan di sheet " + collection;

  // Mencari baris yang sesuai berdasarkan ID unik
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idColIndex]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  // Jika ID belum ada, tambahkan baris baru di bawah
  if (rowIndex === -1) {
    rowIndex = sheet.getLastRow() + 1;
    sheet.getRange(rowIndex, idColIndex + 1).setValue(id);
  }
  
  // Update data per kolom berdasarkan header yang cocok dengan kunci JSON
  headers.forEach((header, idx) => {
    if (data.hasOwnProperty(header)) {
      let val = data[header];
      // Konversi objek/array (seperti reviewTemplate) menjadi string JSON agar bisa masuk sel
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      sheet.getRange(rowIndex, idx + 1).setValue(val);
    }
  });
  
  return "Berhasil memperbarui baris " + rowIndex + " pada koleksi " + collection;
}

/**
 * Mengambil data dari Sheet dan mengubahnya menjadi Array of Objects
 */
function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      try {
        // Cek apakah string adalah JSON object/array
        if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch (e) {}
      obj[header] = val;
    });
    return obj;
  });
}
```

### Cara Memperbarui:
1.  Buka Spreadsheet Anda, arahkan ke **Extensions > Apps Script**.
2.  Hapus semua kode lama dan tempelkan kode di atas.
3.  Klik **Deploy > New Deployment**.
4.  Pilih **Web App**, set *Execute as* ke **Me (Anda)**, dan *Who has access* ke **Anyone**.
5.  Klik **Deploy** (dan berikan izin akses jika diminta).
6.  Salin **Web App URL** yang baru dan masukkan kembali ke Login Dashboard ProSpace di `index.html`.
