//  QuizCaju — questions.js  v1
//  Banco de perguntas hardcoded.
//
//  Responsabilidade única: fornecer o array
//  "perguntas" para o app.js usar diretamente.
//
//  Formato de cada pergunta:
//    id         → número único e sequencial
//    categoria  → "HTML" | "CSS" | "JavaScript"
//    pergunta   → string com a pergunta
//    opcoes     → array com exatamente 4 strings
//    correta    → índice da resposta certa (0, 1, 2 ou 3)
//    explicacao → frase curta explicando o porquê

const perguntas = [

  // ── HTML ──────────────────────────────────
  {
    id: 1,
    categoria: "HTML",
    pergunta: "Qual tag define o título mais importante de uma página?",
    opcoes: ["<title>", "<h1>", "<header>", "<strong>"],
    correta: 1,
    explicacao: "<h1> é o cabeçalho de nível 1, o mais importante da hierarquia."
  },
  {
    id: 2,
    categoria: "HTML",
    pergunta: "Para criar um link em HTML, qual tag usamos?",
    opcoes: ["<link>", "<url>", "<a>", "<href>"],
    correta: 2,
    explicacao: "A tag <a> (âncora) cria links. O destino vai no atributo href."
  },
  {
    id: 3,
    categoria: "HTML",
    pergunta: "Qual atributo define o endereço de destino de um link?",
    opcoes: ["src", "href", "link", "url"],
    correta: 1,
    explicacao: "O atributo href (Hypertext Reference) define o destino do link."
  },
  {
    id: 4,
    categoria: "HTML",
    pergunta: "Qual tag cria uma lista não ordenada?",
    opcoes: ["<ol>", "<li>", "<ul>", "<list>"],
    correta: 2,
    explicacao: "<ul> = unordered list. <ol> é a lista ordenada (com números)."
  },

  // ── CSS ───────────────────────────────────
  {
    id: 5,
    categoria: "CSS",
    pergunta: "Como selecionamos um elemento pela sua classe no CSS?",
    opcoes: ["#minha-classe", ".minha-classe", "*minha-classe", "@minha-classe"],
    correta: 1,
    explicacao: "O ponto (.) seleciona por classe. O # seleciona por ID."
  },
  {
    id: 6,
    categoria: "CSS",
    pergunta: "Qual propriedade muda a cor do texto?",
    opcoes: ["background-color", "font-color", "text-color", "color"],
    correta: 3,
    explicacao: "A propriedade color define a cor do texto."
  },
  {
    id: 7,
    categoria: "CSS",
    pergunta: "Para centralizar elementos lado a lado, qual display usamos?",
    opcoes: ["block", "inline", "flex", "grid-center"],
    correta: 2,
    explicacao: "display: flex ativa o Flexbox, o sistema de layout mais usado hoje."
  },
  {
    id: 8,
    categoria: "CSS",
    pergunta: "Qual propriedade arredonda as bordas de um elemento?",
    opcoes: ["border-style", "border-curve", "border-radius", "border-round"],
    correta: 2,
    explicacao: "border-radius define o arredondamento dos cantos."
  },

  // ── JavaScript ────────────────────────────
  {
    id: 9,
    categoria: "JavaScript",
    pergunta: "Como declaramos uma variável que não vai mudar de valor?",
    opcoes: ["var", "let", "const", "fix"],
    correta: 2,
    explicacao: "const declara constantes. let declara variáveis que podem mudar."
  },
  {
    id: 10,
    categoria: "JavaScript",
    pergunta: "Qual método seleciona um elemento HTML pelo seu ID?",
    opcoes: [
      "document.getElement()",
      "document.getElementById()",
      "document.selectId()",
      "document.findById()"
    ],
    correta: 1,
    explicacao: "getElementById() busca um elemento único pelo seu atributo id."
  }

]
