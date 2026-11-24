const FuncionariosModule = (() => {
  const form = document.getElementById("form-funcionario");
  const tbody = document.getElementById("tabela-funcionarios");
  const btnCancelar = document.getElementById("btn-func-cancelar");

  function resetForm() {
    form.reset();
    document.getElementById("func-id").value = "";
    document.getElementById("func-situacao").value = "Ativo";
    Validators.clearErrors(form);
  }

  function checkPermission(perfilAtivo) {
    const autorizado = perfilAtivo === "Administrador" || perfilAtivo === "Gerente";
    document.getElementById("usuarios-bloqueio").classList.toggle("hidden", autorizado);
    document.getElementById("usuarios-conteudo").classList.toggle("hidden", !autorizado);
  }

  function render() {
    const data = StorageService.load();
    tbody.innerHTML = data.funcionarios
      .map(
        (f) => `
      <tr>
        <td>${f.nome}</td>
        <td>${f.email}</td>
        <td>${f.perfil}</td>
        <td><span class="badge ${f.situacao === "Ativo" ? "active" : "inactive"}">${f.situacao}</span></td>
        <td>
          <button type="button" class="btn-sm" onclick="FuncionariosModule.edit(${f.id})">Editar</button>
          <button type="button" class="btn-sm danger" onclick="FuncionariosModule.remove(${f.id})">Excluir</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function edit(id) {
    const data = StorageService.load();
    const item = data.funcionarios.find((f) => f.id === id);
    if (!item) return;
    Validators.clearErrors(form);
    document.getElementById("func-id").value = item.id;
    document.getElementById("func-nome").value = item.nome;
    document.getElementById("func-email").value = item.email;
    document.getElementById("func-perfil").value = item.perfil;
    document.getElementById("func-senha").value = item.senha;
    document.getElementById("func-situacao").value = item.situacao;
  }

  function remove(id) {
    const data = StorageService.load();
    data.funcionarios = data.funcionarios.filter((f) => f.id !== id);
    StorageService.save(data);
    render();
    App.showAlert("Funcionário excluído com sucesso.", "success");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Validators.clearErrors(form);

    const id = document.getElementById("func-id").value;
    const nome = document.getElementById("func-nome").value.trim();
    const email = document.getElementById("func-email").value.trim();
    const perfil = document.getElementById("func-perfil").value;
    const senha = document.getElementById("func-senha").value.trim();
    const situacao = document.getElementById("func-situacao").value;

    let valid = true;
    const data = StorageService.load();

    if (!nome) {
      Validators.setError("func-nome", "err-func-nome", "Nome é obrigatório.");
      valid = false;
    }

    if (!email) {
      Validators.setError("func-email", "err-func-email", "E-mail é obrigatório.");
      valid = false;
    } else if (!Validators.isValidEmail(email)) {
      Validators.setError("func-email", "err-func-email", "Informe um e-mail válido.");
      valid = false;
    } else {
      const duplicado = data.funcionarios.some(
        (f) => f.email.toLowerCase() === email.toLowerCase() && String(f.id) !== String(id)
      );
      if (duplicado) {
        Validators.setError("func-email", "err-func-email", "Este e-mail já está cadastrado.");
        valid = false;
      }
    }

    if (!perfil) {
      Validators.setError("func-perfil", "err-func-perfil", "Todo funcionário deve possuir perfil de acesso.");
      valid = false;
    }

    if (!senha) {
      Validators.setError("func-senha", "err-func-senha", "Senha inicial é obrigatória.");
      valid = false;
    }

    if (!valid) {
      App.showAlert("Verifique os campos obrigatórios destacados.", "error");
      return;
    }

    if (id) {
      const idx = data.funcionarios.findIndex((f) => String(f.id) === String(id));
      if (idx >= 0) {
        data.funcionarios[idx] = { id: Number(id), nome, email, perfil, senha, situacao };
      }
      App.showAlert("Funcionário atualizado com sucesso.", "success");
    } else {
      data.funcionarios.push({
        id: StorageService.nextId(data.funcionarios),
        nome,
        email,
        perfil,
        senha,
        situacao
      });
      App.showAlert("Funcionário cadastrado com sucesso.", "success");
    }

    StorageService.save(data);
    resetForm();
    render();
  });

  btnCancelar.addEventListener("click", () => {
    resetForm();
    App.clearAlert();
  });

  return { render, edit, remove, checkPermission };
})();
