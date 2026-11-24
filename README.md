# CINEGESTÃO — Protótipo Funcional (SGC)

Protótipo web front-end desenvolvido para a **Atividade Estruturada 3** da disciplina de **Engenharia de Software** (6º semestre de Ciência da Computação — UNIJORGE, Prof. David Viscarra)[cite: 1, 2, 16].

Contém **exclusivamente as quatro telas** exigidas no escopo da atividade, baseadas nos protótipos da etapa de Histórias de Usuário[cite: 4, 10, 15]:
1. **Cadastro de funcionário** (`Usuários`)[cite: 4, 16]
2. **Cadastro de filme** (`Filmes`)[cite: 4, 16]
3. **Cadastro de sala** (`Salas`)[cite: 4, 16]
4. **Cadastro de sessão** (`Sessões`)[cite: 4, 16]

---

## Estrutura de pastas

```text
sgc_prototipo_funcional/
├── index.html          # Estrutura das 4 telas e navegação lateral
├── css/
│   └── styles.css      # Estilo visual do painel administrativo
└── js/
    ├── storage.js      # Leitura e gravação de dados no localStorage
    ├── validators.js   # Validações de campos, formatos e valores
    ├── funcionarios.js # Cadastro, edição, exclusão e permissão de funcionários
    ├── filmes.js       # Cadastro, edição e desativação de filmes
    ├── salas.js        # Cadastro, prévia do mapa de assentos e inativação de salas
    ├── sessoes.js      # Cadastro, resumo dinâmico e validação de conflitos de horário
    └── app.js          # Troca de telas, alertas e inicialização dos módulos
