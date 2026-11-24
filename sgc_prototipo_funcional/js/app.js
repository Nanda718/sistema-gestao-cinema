const App = (() => {
  const alertBox = document.getElementById("global-alert");
  const perfilSelect = document.getElementById("perfil-ativo");
  const navButtons = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".screen-section");

  function showAlert(message, type = "success") {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
  }

  function clearAlert() {
    alertBox.textContent = "";
    alertBox.className = "alert hidden";
  }

  function switchScreen(screenName) {
    clearAlert();
    navButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.screen === screenName)
    );
    sections.forEach((sec) =>
      sec.classList.toggle("active", sec.id === `screen-${screenName}`)
    );

    const subtitle = document.getElementById("topbar-subtitle");
    subtitle.style.display = screenName === "usuarios" ? "none" : "inline";

    if (screenName === "sessoes") {
      SessoesModule.populateSelects();
    }
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchScreen(btn.dataset.screen));
  });

  perfilSelect.addEventListener("change", () => {
    FuncionariosModule.checkPermission(perfilSelect.value);
    clearAlert();
  });

  // Inicialização
  FuncionariosModule.checkPermission(perfilSelect.value);
  FuncionariosModule.render();
  FilmesModule.render();
  SalasModule.render();
  SessoesModule.populateSelects();
  SessoesModule.render();

  return { showAlert, clearAlert, switchScreen };
})();
