const FilmesModule = (() => {
  const form = document.getElementById("form-filme");
  const tbody = document.getElementById("tabela-filmes");
  const btnCancelar = document.getElementById("btn-filme-cancelar");

  function resetForm() {
    form.reset();
    document.getElementById("filme-id").value = "";
    Validators.clearErrors(form);
  }

  function render() {
    const data = StorageService.load();
    tbody.innerHTML = data.filmes
      .map(
        (f) => `
      <tr>
        <td>${f.titulo}</td>
        <td>${f.genero || "-"}</td>
        <td>${f.duracao} min</td>
        <td>${f.classificacao}</td>
        <td>${f.idioma}</td>
        <td><span class="badge ${f.situacao === "Ativo" ? "active" : "inactive"}">${f.situacao}</span></td>
        <td>
          <button type="button" class="btn-sm" onclick="FilmesModule.edit(${f.id})">Editar</button>
          <button type="button" class="btn-sm danger" onclick="FilmesModule.toggleStatus(${f.id})">
            ${f.situacao === "Ativo" ? "Desativar" : "Reativar"}
          </button>
        </td>
      </tr>`
      )
      .join("");
  }

  function edit(id) {
    const data = StorageService.load();
    const item = data.filmes.find((f) => f.id === id);
    if (!item) return;
    Validators.clearErrors(form);
    document.getElementById("filme-id").value = item.id;
    document.getElementById("filme-titulo").value = item.titulo;
    document.getElementById("filme-genero").value = item.genero;
    document.getElementById("filme-duracao").value = `${item.duracao} min`;
    document.getElementById("filme-classificacao").value = item.classificacao;
    document.getElementById("filme-idioma").value = item.idioma;
    document.getElementById("filme-estreia").value = item.estreia;
    document.getElementById("filme-sinopse").value = item.sinopse;
    document.getElementById("filme-direcao").value = item.direcao;
    document.getElementById("filme-elenco").value = item.elenco;
    document.getElementById("filme-trailer").value = item.trailer;
    document.getElementById("filme-cartaz").value = item.cartaz;
  }

  function toggleStatus(id) {
    const data = StorageService.load();
    const item = data.filmes.find((f) => f.id === id);
    if (!item) return;
    item.situacao = item.situacao === "Ativo" ? "Inativo" : "Ativo";
    StorageService.save(data);
    render();
    SessoesModule.populateSelects();
    App.showAlert(
      item.situacao === "Inativo"
        ? "Filme desativado: permanece no histórico e não recebe novas sessões."
        : "Filme reativado com sucesso.",
      "success"
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Validators.clearErrors(form);

    const id = document.getElementById("filme-id").value;
    const titulo = document.getElementById("filme-titulo").value.trim();
    const genero = document.getElementById("filme-genero").value;
    const duracaoRaw = document.getElementById("filme-duracao").value.trim();
    const classificacao = document.getElementById("filme-classificacao").value;
    const idioma = document.getElementById("filme-idioma").value.trim();
    const estreia = document.getElementById("filme-estreia").value.trim();
    const sinopse = document.getElementById("filme-sinopse").value.trim();
    const direcao = document.getElementById("filme-direcao").value.trim();
    const elenco = document.getElementById("filme-elenco").value.trim();
    const trailer = document.getElementById("filme-trailer").value.trim();
    const cartaz = document.getElementById("filme-cartaz").value.trim();

    let valid = true;

    // Regra 1: Não permitir cadastro sem título, sinopse, duração, classificação e idioma
    if (!titulo) {
      Validators.setError("filme-titulo", "err-filme-titulo", "Título é obrigatório.");
      valid = false;
    }

    const duracao = Validators.parseDurationMinutes(duracaoRaw);
    if (!duracaoRaw) {
      Validators.setError("filme-duracao", "err-filme-duracao", "Duração é obrigatória.");
      valid = false;
    } else if (isNaN(duracao) || duracao <= 0) {
      Validators.setError("filme-duracao", "err-filme-duracao", "Informe duração válida maior que zero (ex.: 120 min).");
      valid = false;
    }

    if (!classificacao) {
      Validators.setError("filme-classificacao", "err-filme-classificacao", "Classificação é obrigatória.");
      valid = false;
    }

    if (!idioma) {
      Validators.setError("filme-idioma", "err-filme-idioma", "Idioma original é obrigatório.");
      valid = false;
    }

    if (!sinopse) {
      Validators.setError("filme-sinopse", "err-filme-sinopse", "Sinopse é obrigatória.");
      valid = false;
    }

    if (estreia && !Validators.isValidDateBR(estreia)) {
      Validators.setError("filme-estreia", "err-filme-estreia", "Data inválida. Use o formato dd/mm/aaaa.");
      valid = false;
    }

    if (!Validators.isValidHttpsUrl(trailer)) {
      Validators.setError("filme-trailer", "err-filme-trailer", "A URL do trailer deve iniciar com https://");
      valid = false;
    }

    if (!Validators.isValidImageFilename(cartaz)) {
      Validators.setError("filme-cartaz", "err-filme-cartaz", "O cartaz deve estar no formato JPG ou PNG.");
      valid = false;
    }

    if (!valid) {
      App.showAlert("Não foi possível salvar o filme. Corrija os campos inválidos.", "error");
      return;
    }

    const data = StorageService.load();
    if (id) {
      const idx = data.filmes.findIndex((f) => String(f.id) === String(id));
      if (idx >= 0) {
        data.filmes[idx] = {
          ...data.filmes[idx],
          titulo,
          genero,
          duracao,
          classificacao,
          idioma,
          estreia,
          sinopse,
          direcao,
          elenco,
          trailer,
          cartaz
        };
      }
      App.showAlert("Filme atualizado com sucesso.", "success");
    } else {
      data.filmes.push({
        id: StorageService.nextId(data.filmes),
        titulo,
        genero,
        duracao,
        classificacao,
        idioma,
        estreia,
        sinopse,
        direcao,
        elenco,
        trailer,
        cartaz,
        situacao: "Ativo"
      });
      App.showAlert("Filme cadastrado com sucesso.", "success");
    }

    StorageService.save(data);
    resetForm();
    render();
    SessoesModule.populateSelects();
  });

  btnCancelar.addEventListener("click", () => {
    resetForm();
    App.clearAlert();
  });

  return { render, edit, toggleStatus };
})();
