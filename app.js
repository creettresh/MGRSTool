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
  var mapLinkEl = document.getElementById("map-link");

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

  function mapUrl(lat, lon) {
    return "https://www.google.com/maps?q=" + lat.toFixed(6) + "," + lon.toFixed(6);
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
    mapLinkEl.href = mapUrl(converted.lat, converted.lon);
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
      var mapCell = document.createElement("td");
      mgrsCell.textContent = row.raw;
      if (row.converted.ok) {
        latCell.textContent = row.converted.lat.toFixed(6);
        lonCell.textContent = row.converted.lon.toFixed(6);
        var mapLink = document.createElement("a");
        mapLink.href = mapUrl(row.converted.lat, row.converted.lon);
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.textContent = "Карта";
        mapCell.appendChild(mapLink);
      } else {
        tr.className = "row-error";
        latCell.textContent = row.converted.error;
        latCell.colSpan = 3;
        lonCell = null;
        mapCell = null;
      }
      tr.appendChild(mgrsCell);
      tr.appendChild(latCell);
      if (lonCell) {
        tr.appendChild(lonCell);
      }
      if (mapCell) {
        tr.appendChild(mapCell);
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
