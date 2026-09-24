(function () {
  var EXAMPLE = "33TWN0838825205";

  var input = document.getElementById("mgrs");
  var convertButton = document.getElementById("convert");
  var exampleButton = document.getElementById("example");
  var errorEl = document.getElementById("error");
  var resultEl = document.getElementById("result");
  var latEl = document.getElementById("lat");
  var lonEl = document.getElementById("lon");
  var pairEl = document.getElementById("pair");

  function normalize(value) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    resultEl.hidden = true;
  }

  function convert() {
    var code = normalize(input.value);
    if (!code) {
      showError("Введіть MGRS.");
      return;
    }

    try {
      var point = mgrs.toPoint(code);
      var lon = point[0];
      var lat = point[1];
      errorEl.hidden = true;
      resultEl.hidden = false;
      latEl.textContent = lat.toFixed(6);
      lonEl.textContent = lon.toFixed(6);
      pairEl.textContent = lat.toFixed(6) + ", " + lon.toFixed(6);
    } catch (err) {
      showError("Невалідний MGRS. Перевірте зону, квадрат і цифри.");
    }
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
})();
