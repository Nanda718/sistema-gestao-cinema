const StorageService = (() => {
  const KEY = "sgc_cinegestao_data_v1";

  const defaultData = {
    funcionarios: [
      {
        id: 1,
        nome: "Administrador Padrão",
        email: "admin@cinegestao.com",
        perfil: "Administrador",
        senha: "••••••••",
        situacao: "Ativo"
      }
    ],
    filmes: [
      {
        id: 1,
        titulo: "Horizonte Final",
        genero: "Ação",
        duracao: 128,
        classificacao: "14",
        idioma: "Português",
        estreia: "24/08/2026",
        sinopse: "Missão espacial em busca de um novo horizonte.",
        direcao: "Carlos Mendes",
        elenco: "Ana Clara, Bruno Rocha",
        trailer: "https://exemplo.com/horizonte-final",
        cartaz: "horizonte_final.png",
        situacao: "Ativo"
      }
    ],
    salas: [
      {
        id: 1,
        identificacao: "Sala 2",
        tipo: "Convencional",
        capacidade: 120,
        fileiras: 10,
        assentosPorFileira: 12,
        situacao: "Ativa",
        recursos: ["Acessibilidade"]
      }
    ],
    sessoes: []
  };

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      save(defaultData);
      return JSON.parse(JSON.stringify(defaultData));
    }
    try {
      return JSON.parse(raw);
    } catch {
      save(defaultData);
      return JSON.parse(JSON.stringify(defaultData));
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function nextId(collection) {
    if (!collection.length) return 1;
    return Math.max(...collection.map((item) => item.id)) + 1;
  }

  return { load, save, nextId };
})();
