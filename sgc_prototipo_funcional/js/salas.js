const SalasModule = (() => {
  const form = document.getElementById("form-sala");
  const tbody = document.getElementById("tabela-salas");
  const previewContainer = document.getElementById("mapa-assentos-preview");
  const inputFileiras = document.getElementById("sala-fileiras");
  const inputAssentos = document.getElementById("sala-assentos-fileira");

  function renderSeatPreview(fileiras = 2, assentosPorFileira = 10) {
    const rows = Math.max(1, Math.min(26, Number(fileiras) || 2));
    const cols = Math.max(1, Math.min(30, Number(assentosPorFileira) || 10));
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let html = "";
    for (let r = 0; r < rows; r++) {
      html += `<div class="seat-row"><span class="seat-row-label">${letters[r]}</span>`;
      for (let c = 1; c <= cols; c++) {
        html += `<span class="seat-block" title="${letters[r]}${c}"></span>`;
      }
      html += `</div>`;
    }
    previewContainer.innerHTML = html;
  }

  function resetForm() {
    form.reset();
    document.getElementById("sala-id").value = "";
    document.getElementById("sala-tipo").value = "Convencional";
    document.getElementById("sala-situacao").value = "Ativa";
    Validators.clearErrors(form);
    renderSeatPreview(2, 10);
  }

  function render() {
    const data = StorageService.load();
    tbody.innerHTML = data.salas
      .map(
        (s) => `
      <tr>
        <td>${s.identificacao}</td>
        <td>${s.tipo}</td>
        <td>${s.capacidade} lugares</td>
        <td>${s.fileiras} × ${s.assentosPorFileira}</td>
        <td>${s.recursos.length ? s.recursos.join(", ") : "Padrão"}</td>
        <td><span class="badge ${s.situacao === "Ativa" ? "active" : "inactive"}">${s.situacao}</span></td>
        <td>
          <button type="button" class="btn-sm" onclick="SalasModule.edit(${s.id})">Editar</button>
          <button type="button" class="btn-sm danger" onclick="SalasModule.removeOrInactivate(${s.id})">Excluir / Inativar</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function edit(id) {
    const data = StorageService.load();
    const item = data.salas.find((s) => s.id === id);
    if (!item) return;
    Validators.clearErrors(form);
    document.getElementById("sala-id").value = item.id;
    document.getElementById("sala-identificacao").value = item.identificacao;
    document.getElementById("sala-tipo").value = item.tipo;
    document.getElementById("sala-capacidade").value = item.capacidade;
    document.getElementById("sala-fileiras").value = item.fileiras;
    document.getElementById("sala-assentos-fileira").value = item.assentosPorFileira;
    document.getElementById("sala-situacao").value = item.situacao;

    form.querySelectorAll('input[name="sala-recursos"]').forEach((cb) => {
      cb.checked = item.recursos.includes(cb.value);
    });
    renderSeatPreview(item.fileiras, item.assentosPorFileira);
  }

  function removeOrInactivate(id) {
    const data = StorageService.load();
    const sala = data.salas.find((s) => s.id === id);
    if (!sala) return;

    const possuiSessao = data.sessoes.some((ses) => String(ses.salaId) === String(id));
    if (possuiSessao) {
      sala.situacao = "Inativa";
      StorageService.save(data);
      render();
      SessoesModule.populateSelects();
      App.showAlert("Sala possui sessões vinculadas: exclusão impedida e situação alterada para Inativa.", "error");
      return;
    }

    data.salas = data.salas.filter((s) => s.id !== id);
    StorageService.save(data);
    render();
    SessoesModule.populateSelects();
    App.showAlert("Sala excluída com sucesso.", "success");
  }

  inputFileiras.addEventListener("input", () => {
    renderSeatPreview(inputFileiras.value, inputAssentos.value);
  });

  inputAssentos.addEventListener("input", () => {
    renderSeatPreview(inputFileiras.value, inputAssentos.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Validators.clearErrors(form);

    const id = document.getElementById("sala-id").value;
    const identificacao = document.getElementById("sala-identificacao").value.trim();
    const tipo = document.getElementById("sala-tipo").value;
    const capacidade = Number(document.getElementById("sala-capacidade").value);
    const fileiras = Number(document.getElementById("sala-fileiras").value);
    const assentosPorFileira = Number(document.getElementById("sala-assentos-fileira").value);
    const situacao = document.getElementById("sala-situacao").value;
    const recursos = Array.from(form.querySelectorAll('input[name="sala-recursos"]:checked')).map(
      (cb) => cb.value
    );

    let valid = true;
    const data = StorageService.load();

    if (!identificacao) {
      Validators.setError("sala-identificacao", "err-sala-identificacao", "Identificação da sala é obrigatória.");
      valid = false;
    } else {
      const duplicada = data.salas.some(
        (s) => s.identificacao.toLowerCase() === identificacao.toLowerCase() && String(s.id) !== String(id)
      );
      if (duplicada) {
        Validators.setError("sala-identificacao", "err-sala-identificacao", "Já existe uma sala com esta identificação.");
        valid = false;
      }
    }

    if (!fileiras || fileiras <= 0) {
      Validators.setError("sala-fileiras", "err-sala-fileiras", "Informe quantidade válida de fileiras.");
      valid = false;
    }

    if (!assentosPorFileira || assentosPorFileira <= 0) {
      Validators.setError("sala-assentos-fileira", "err-sala-assentos-fileira", "Informe assentos por fileira maior que zero.");
      valid = false;
    }

    if (!capacidade || capacidade <= 0) {
      Validators.setError("sala-capacidade", "err-sala-capacidade", "Capacidade deve ser maior que zero.");
      valid = false;
    } else if (fileiras > 0 && assentosPorFileira > 0 && capacidade !== fileiras * assentosPorFileira) {
      Validators.setError(
        "sala-capacidade",
        "err-sala-capacidade",
        `Capacidade deve corresponder ao mapa (${fileiras} × ${assentosPorFileira} = ${fileiras * assentosPorFileira}).`
      );
      valid = false;
    }

    if (!valid) {
      App.showAlert("Não foi possível salvar a sala. Verifique os dados informados.", "error");
      return;
    }

    if (id) {
      const idx = data.salas.findIndex((s) => String(s.id) === String(id));
      if (idx >= 0) {
        data.salas[idx] = {
          id: Number(id),
          identificacao,
          tipo,
          capacidade,
          fileiras,
          assentosPorFileira,
          situacao,
          recursos
        };
      }
      App.showAlert("Sala atualizada com sucesso.", "success");
    } else {
      data.salas.push({
        id: StorageService.nextId(data.salas),
        identificacao,
        tipo,
        capacidade,
        fileiras,
        assentosPorFileira,
        situacao,
        recursos
      });
      App.showAlert("Sala cadastrada com sucesso.", "success");
    }

    StorageService.save(data);
    resetForm();
    render();
    SessoesModule.populateSelects();
  });

  renderSeatPreview(2, 10);

  return { render, edit, removeOrInactivate };
})();
