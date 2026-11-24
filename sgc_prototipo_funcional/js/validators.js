const Validators = (() => {
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isValidDateBR(dateStr) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr.trim());
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function isValidTime(timeStr) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr.trim());
  }

  function parseDurationMinutes(value) {
    const cleaned = String(value).replace(/min/gi, "").trim();
    if (!/^\d+$/.test(cleaned)) return NaN;
    return Number(cleaned);
  }

  function isValidHttpsUrl(url) {
    if (!url.trim()) return true; // Opcional
    return /^https:\/\/.+/.test(url.trim());
  }

  function isValidImageFilename(name) {
    if (!name.trim()) return true; // Opcional no formulário
    return /\.(jpg|jpeg|png)$/i.test(name.trim());
  }

  function parseCurrencyBR(str) {
    const cleaned = String(str)
      .replace(/R\$/gi, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    if (cleaned === "" || isNaN(Number(cleaned))) return NaN;
    return Number(cleaned);
  }

  function formatCurrencyBR(num) {
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function setError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (input) input.classList.add("invalid");
    if (err) err.textContent = message;
  }

  function clearErrors(formElement) {
    formElement.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    formElement.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  }

  return {
    isValidEmail,
    isValidDateBR,
    isValidTime,
    parseDurationMinutes,
    isValidHttpsUrl,
    isValidImageFilename,
    parseCurrencyBR,
    formatCurrencyBR,
    setError,
    clearErrors
  };
})();
