const SessoesModule = (() => {
  const form = document.getElementById("form-sessao");
  const tbody = document.getElementById("tabela-sessoes");
  const selectFilme = document.getElementById("sessao-filme");
  const selectSala = document.getElementById("sessao-sala");
  const inputData = document.getElementById("sessao-data");
  const inputHorario = document.getElementById("sessao-horario");
  const selectIdioma = document.getElementById("sessao-idioma");
  const selectFormato = document.getElementById("sessao-formato");
  const inputPreco = document.getElementById("sessao-preco");

  function timeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function hasScheduleConflict(data, salaId, dataSessao, horarioInicio, duracaoMinutos, ignoreId = "") {
    if (!salaId || !Validators.isValidDateBR(dataSessao) || !Validators.isValidTime(horarioInicio)) {
      return false;
    }
    const inicioNovo = timeToMinutes(horarioInicio);
    const fimNovo = inicioNovo + (duracaoMinutos || 120) + 30; // Duração + 30 min intervalo

    return data.sessoes.some((s) => {
      if (String(s.id) === String(ignoreId)) return false;
      if (String(s.salaId) !== String(salaId) || s.data !== dataSessao) return false;
      const filmeExistente = data.filmes.find((f) => String(f.id) === String(s.filmeId));
      const duracaoExistente = filmeExistente ? filmeExistente.duracao : 120;
      const inicioExistente = timeToMinutes(s.horario);
      const fimExistente = inicioExistente + duracaoExistente + 30;
      return inicioNovo < fimExistente && fimNovo > inicioExistente;
    });
  }

  function populateSelects() {
    const data = StorageService.load();
    const prevFilme = selectFilme.value;
    const prevSala = selectSala.value;

    const filmesAtivos = data.filmes.filter((f) => f.situacao === "Ativo");
    selectFilme.innerHTML =
      '<option value="">Selecione o filme ▾</option>' +
      filmesAtivos.map((f) => `<option value="${f.id}">${f.titulo}</option>`).join("");

    const salasAtivas = data.salas.filter((s) => s.situacao === "Ativa");
    selectSala.innerHTML = salasAtivas
      .map((s) => `<option value="${s.id}">${s.identificacao} ▾</option>`)
      .join("");

    if (filmesAtivos.some((f) => String(f.id) === String(prevFilme))) {
      selectFilme.value = prevFilme;
    }
    if (salasAtivas.some((s) => String(s.id) === String(prevSala))) {
      selectSala.value = prevSala;
    }

    updateSummary();
  }

  function updateSummary() {
    const data = StorageService.load();
    const id = document.getElementById("sessao-id").value;
    const filme = data.filmes.find((f) => String(f.id) === String(selectFilme.value));
    const sala = data.salas.find((s) => String(s.id) === String(selectSala.value));

    const tituloFilme = filme ? filme.titulo : "Selecione o filme";
    const nomeSala = sala ? sala.identificacao : "Sala não selecionada";
    const capacidade = sala ? sala.capacidade : 0;
    const dataTxt = inputData.value.trim() || "--/--/----";
    const horaTxt = inputHorario.value.trim() || "--:--";

    document.getElementById("resumo-linha-1").textContent = `${tituloFilme} • ${nomeSala} • ${dataTxt} às ${horaTxt}`;
    document.getElementById("resumo-linha-2").textContent = `${selectIdioma.value} • ${selectFormato.value} • Capacidade: ${capacidade} lugares`;

    const statusEl = document.getElementById("resumo-status");
    const conflito = hasScheduleConflict(
      data,
      selectSala.value,
      dataTxt,
      horaTxt,
      filme ? filme.duracao : 120,
      id
    );

    if (conflito) {
      statusEl.textContent = "Conflito de horário identificado nesta sala (considerando duração e 30 min de intervalo).";
      statusEl.className = "summary-status conflict";
    } else {
      statusEl.textContent = "Nenhum conflito de horário identificado.";
      statusEl.className = "summary-status ok";
    }
  }

  function render() {
    const data = StorageService.load();
    tbody.innerHTML = data.sessoes
      .map((s) => {
        const filme = data.filmes.find((f) => String(f.id) === String(s.filmeId));
        const sala = data.salas.find((sl) => String(sl.id) === String(s.salaId));
        return `
        <tr>
          <td>${filme ? filme.titulo : "Filme removido"}</td>
          <td>${sala ? sala.identificacao : "Sala removida"}</td>
          <td>${s.data}</td>
          <td>${s.horario}</td>
          <td>${s.idioma} • ${s.formato}</td>
          <td>${Validators.formatCurrencyBR(s.preco)}</td>
          <td>
            <button type="button" class="btn-sm" onclick="SessoesModule.edit(${s.id})">Editar</button>
            <button type="button" class="btn-sm danger" onclick="SessoesModule.remove(${s.id})">Excluir</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function edit(id) {
    const data = StorageService.load();
    const item = data.sessoes.find((s) => s.id === id);
    if (!item) return;
    Validators.clearErrors(form);
    document.getElementById("sessao-id").value = item.id;
    selectFilme.value = item.filmeId;
    selectSala.value = item.salaId;
    inputData.value = item.data;
    inputHorario.value = item.horario;
    selectIdioma.value = item.idioma;
    selectFormato.value = item.formato;
    inputPreco.value = Validators.formatCurrencyBR(item.preco);
    document.getElementById("btn-sessao-salvar").textContent = "Salvar alterações";
    updateSummary();
  }

  function remove(id) {
    const data = StorageService.load();
    data.sessoes = data.sessoes.filter((s) => s.id !== id);
    StorageService.save(data);
    render();
    updateSummary();
    App.showAlert("Sessão excluída com sucesso.", "success");
  }

  [selectFilme, selectSala, inputData, inputHorario, selectIdioma, selectFormato].forEach((el) => {
    el.addEventListener("change", updateSummary);
    el.addEventListener("input", updateSummary);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Validators.clearErrors(form);

    const id = document.getElementById("sessao-id").value;
    const filmeId = selectFilme.value;
    const salaId = selectSala.value;
    const dataSessao = inputData.value.trim();
    const horario = inputHorario.value.trim();
    const idioma = selectIdioma.value;
    const formato = selectFormato.value;
    const preco = Validators.parseCurrencyBR(inputPreco.value);

    const data = StorageService.load();
    const filme = data.filmes.find((f) => String(f.id) === String(filmeId));
    const sala = data.salas.find((s) => String(s.id) === String(salaId));

    let valid = true;

    if (!filmeId || !filme) {
      Validators.setError("sessao-filme", "err-sessao-filme", "Selecione um filme ativo.");
      valid = false;
    }

    if (!salaId || !sala) {
      Validators.setError("sessao-sala", "err-sessao-sala", "Selecione uma sala ativa.");
      valid = false;
    }

    if (!Validators.isValidDateBR(dataSessao)) {
      Validators.setError("sessao-data", "err-sessao-data", "Data obrigatória no formato dd/mm/aaaa.");
      valid = false;
    }

    if (!Validators.isValidTime(horario)) {
      Validators.setError("sessao-horario", "err-sessao-horario", "Horário obrigatório no formato HH:mm.");
      valid = false;
    }

    if (isNaN(preco) || preco < 0) {
      Validators.setError("sessao-preco", "err-sessao-preco", "Preço-base deve ser maior ou igual a zero.");
      valid = false;
    }

    if (sala && (formato === "3D" || formato === "IMAX") && !sala.recursos.includes(formato)) {
      Validators.setError(
        "sessao-formato",
        "err-sessao-formato",
        `A ${sala.identificacao} não possui o recurso ${formato} habilitado.`
      );
      valid = false;
    }

    if (
      valid &&
      hasScheduleConflict(data, salaId, dataSessao, horario, filme.duracao, id)
    ) {
      Validators.setError(
        "sessao-horario",
        "err-sessao-horario",
        "Conflito de horário na sala selecionada."
      );
      valid = false;
    }

    if (!valid) {
      updateSummary();
      App.showAlert("Não foi possível criar a sessão. Verifique os alertas.", "error");
      return;
    }

    if (id) {
      const idx = data.sessoes.findIndex((s) => String(s.id) === String(id));
      if (idx >= 0) {
        data.sessoes[idx] = {
          id: Number(id),
          filmeId: Number(filmeId),
          salaId: Number(salaId),
          data: dataSessao,
          horario,
          idioma,
          formato,
          preco
        };
      }
      App.showAlert("Sessão atualizada com sucesso.", "success");
    } else {
      data.sessoes.push({
        id: StorageService.nextId(data.sessoes),
        filmeId: Number(filmeId),
        salaId: Number(salaId),
        data: dataSessao,
        horario,
        idioma,
        formato,
        preco
      });
      App.showAlert("Sessão criada com sucesso.", "success");
    }

    StorageService.save(data);
    document.getElementById("sessao-id").value = "";
    document.getElementById("btn-sessao-salvar").textContent = "Criar sessão";
    render();
    updateSummary();
  });

  return { populateSelects, render, edit, remove };
})();
