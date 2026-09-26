(function () {
  var EXAMPLE = "33TWN0838825205";
  var INVALID = "Невалідний MGRS";

  var input = document.getElementById("mgrs");
  var convertButton = document.getElementById("convert");
  var exampleButton = document.getElementById("example");
  var errorEl = document.getElementById("error");
  var resultEl = document.getElementById("result");
  var latEl = document.getElementById("lat");
  var lonEl = document.getElementById("lon");
  var pairEl = document.getElementById("pair");
  var resultActionsEl = document.getElementById("result-actions");
  var copyPairButton = document.getElementById("copy-pair");

  var batchInput = document.getElementById("batch");
  var batchConvertButton = document.getElementById("batch-convert");
  var copyCsvButton = document.getElementById("copy-csv");
  var batchTableWrap = document.getElementById("batch-table-wrap");
  var batchBody = document.getElementById("batch-body");

  var lastCsv = "";

  function normalize(value) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  function convertOne(raw) {
    var code = normalize(raw);
    if (!code) {
      return { ok: false, error: "Порожній рядок" };
    }
    try {
      var point = mgrs.toPoint(code);
      var lon = point[0];
      var lat = point[1];
      if (!isFinite(lat) || !isFinite(lon)) {
        return { ok: false, error: INVALID };
      }
      return { ok: true, lat: lat, lon: lon };
    } catch (err) {
      return { ok: false, error: INVALID };
    }
  }

  function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    resultEl.hidden = true;
  }

  function convert() {
    var converted = convertOne(input.value);
    if (!converted.ok) {
      showError(converted.error === "Порожній рядок" ? "Введіть MGRS." : converted.error);
      resultActionsEl.hidden = true;
      return;
    }
    errorEl.hidden = true;
    resultEl.hidden = false;
    resultActionsEl.hidden = false;
    copyPairButton.textContent = "Копіювати";
    latEl.textContent = converted.lat.toFixed(6);
    lonEl.textContent = converted.lon.toFixed(6);
    pairEl.textContent = converted.lat.toFixed(6) + ", " + converted.lon.toFixed(6);
  }

  function csvCell(value) {
    var text = String(value);
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function convertBatch() {
    var lines = batchInput.value.split(/\r?\n/);
    var rows = [];
    var csv = ["MGRS,Latitude,Longitude"];

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i].trim();
      if (!raw) {
        continue;
      }
      var converted = convertOne(raw);
      rows.push({ raw: raw, converted: converted });
      if (converted.ok) {
        csv.push(
          csvCell(raw) + "," + converted.lat.toFixed(6) + "," + converted.lon.toFixed(6)
        );
      } else {
        csv.push(csvCell(raw) + "," + csvCell(converted.error) + ",");
      }
    }

    batchBody.textContent = "";
    if (!rows.length) {
      batchTableWrap.hidden = true;
      copyCsvButton.hidden = true;
      lastCsv = "";
      return;
    }

    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      var tr = document.createElement("tr");
      var mgrsCell = document.createElement("td");
      var latCell = document.createElement("td");
      var lonCell = document.createElement("td");
      mgrsCell.textContent = row.raw;
      if (row.converted.ok) {
        latCell.textContent = row.converted.lat.toFixed(6);
        lonCell.textContent = row.converted.lon.toFixed(6);
      } else {
        tr.className = "row-error";
        latCell.textContent = row.converted.error;
        latCell.colSpan = 2;
        lonCell = null;
      }
      tr.appendChild(mgrsCell);
      tr.appendChild(latCell);
      if (lonCell) {
        tr.appendChild(lonCell);
      }
      batchBody.appendChild(tr);
    }

    lastCsv = csv.join("\n");
    batchTableWrap.hidden = false;
    copyCsvButton.hidden = false;
    copyCsvButton.textContent = "Copy CSV";
  }

  function copyText(text, button, defaultLabel) {
    if (!text) {
      return;
    }
    function done() {
      button.textContent = "Скопійовано";
      setTimeout(function () {
        button.textContent = defaultLabel;
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text);
        done();
      });
      return;
    }
    fallbackCopy(text);
    done();
  }

  function copyCsv() {
    copyText(lastCsv, copyCsvButton, "Copy CSV");
  }

  function copyPair() {
    copyText(pairEl.textContent, copyPairButton, "Копіювати");
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }

  convertButton.addEventListener("click", convert);
  exampleButton.addEventListener("click", function () {
    input.value = EXAMPLE;
    convert();
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      convert();
    }
  });
  batchConvertButton.addEventListener("click", convertBatch);
  copyCsvButton.addEventListener("click", copyCsv);
  copyPairButton.addEventListener("click", copyPair);
})();
