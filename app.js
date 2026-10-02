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
  var copyPairLabel = document.getElementById("copy-pair-label");
  var copyPairIconCopy = copyPairButton.querySelector(".icon-copy");
  var copyPairIconCheck = copyPairButton.querySelector(".icon-check");
  var mapLinkEl = document.getElementById("map-link");
  var resultPlaceholderEl = document.getElementById("result-placeholder");

  var batchInput = document.getElementById("batch");
  var batchConvertButton = document.getElementById("batch-convert");
  var copyCsvButton = document.getElementById("copy-csv");
  var copyCsvLabel = document.getElementById("copy-csv-label");
  var batchTableWrap = document.getElementById("batch-table-wrap");
  var batchBody = document.getElementById("batch-body");

  var lastCsv = "";

  function setHidden(el, isHidden) {
    if (isHidden) {
      el.setAttribute("hidden", "");
    } else {
      el.removeAttribute("hidden");
    }
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
    return el;
  }

  function copyIconSvg(className) {
    var svg = svgEl("svg", {
      class: className,
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
      focusable: "false"
    });
    svg.appendChild(
      svgEl("rect", {
        x: "5.5",
        y: "5.5",
        width: "8",
        height: "8",
        rx: "1.3",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.3"
      })
    );
    svg.appendChild(
      svgEl("path", {
        d: "M3.3 10.2V3.8a1 1 0 0 1 1-1h6.4",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.3",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      })
    );
    return svg;
  }

  function checkIconSvg(className) {
    var svg = svgEl("svg", {
      class: className,
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
      focusable: "false"
    });
    svg.appendChild(
      svgEl("path", {
        d: "M3.5 8.5l3 3 6-6",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      })
    );
    return svg;
  }

  function createCopyIconButton(text) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "link-accent link-icon icon-button";
    button.title = "Копіювати";

    var iconCopy = copyIconSvg("icon icon-copy");
    var iconCheck = checkIconSvg("icon icon-check");
    setHidden(iconCheck, true);

    var label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = "Копіювати";

    button.appendChild(iconCopy);
    button.appendChild(iconCheck);
    button.appendChild(label);

    button.addEventListener("click", function () {
      copyText(
        text,
        function () {
          label.textContent = "Скопійовано";
          button.title = "Скопійовано";
          setHidden(iconCopy, true);
          setHidden(iconCheck, false);
        },
        function () {
          label.textContent = "Копіювати";
          button.title = "Копіювати";
          setHidden(iconCopy, false);
          setHidden(iconCheck, true);
        }
      );
    });

    return button;
  }

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
      resultPlaceholderEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    resultEl.hidden = false;
    resultActionsEl.hidden = false;
    resultPlaceholderEl.hidden = true;
    copyPairLabel.textContent = "Копіювати";
    copyPairButton.title = "Копіювати";
    setHidden(copyPairIconCopy, false);
    setHidden(copyPairIconCheck, true);
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
      var actionsCell = document.createElement("td");
      mgrsCell.textContent = row.raw;
      if (row.converted.ok) {
        latCell.textContent = row.converted.lat.toFixed(6);
        lonCell.textContent = row.converted.lon.toFixed(6);

        var rowActions = document.createElement("span");
        rowActions.className = "row-actions";

        var rowCopyButton = createCopyIconButton(
          row.converted.lat.toFixed(6) + ", " + row.converted.lon.toFixed(6)
        );
        rowActions.appendChild(rowCopyButton);

        var mapLink = document.createElement("a");
        mapLink.href = mapUrl(row.converted.lat, row.converted.lon);
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.textContent = "Карта";
        rowActions.appendChild(mapLink);

        actionsCell.appendChild(rowActions);
      } else {
        tr.className = "row-error";
        latCell.textContent = row.converted.error;
        latCell.colSpan = 3;
        lonCell = null;
        actionsCell = null;
      }
      tr.appendChild(mgrsCell);
      tr.appendChild(latCell);
      if (lonCell) {
        tr.appendChild(lonCell);
      }
      if (actionsCell) {
        tr.appendChild(actionsCell);
      }
      batchBody.appendChild(tr);
    }

    lastCsv = csv.join("\n");
    batchTableWrap.hidden = false;
    copyCsvButton.hidden = false;
    copyCsvLabel.textContent = "Копіювати CSV";
  }

  function copyText(text, onCopied, onReset) {
    if (!text) {
      return;
    }
    function done() {
      onCopied();
      setTimeout(onReset, 2000);
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
    copyText(
      lastCsv,
      function () {
        copyCsvLabel.textContent = "Скопійовано";
      },
      function () {
        copyCsvLabel.textContent = "Копіювати CSV";
      }
    );
  }

  function copyPair() {
    copyText(
      pairEl.textContent,
      function () {
        copyPairLabel.textContent = "Скопійовано";
        copyPairButton.title = "Скопійовано";
        setHidden(copyPairIconCopy, true);
        setHidden(copyPairIconCheck, false);
      },
      function () {
        copyPairLabel.textContent = "Копіювати";
        copyPairButton.title = "Копіювати";
        setHidden(copyPairIconCopy, false);
        setHidden(copyPairIconCheck, true);
      }
    );
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
