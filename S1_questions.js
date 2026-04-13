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

// =============================================
//  QuizCaju — questions.js  v2
//  Busca perguntas de uma API pública,
//  normaliza para o formato do jogo
//  e entrega uma Promise para o app.js consumir.
//
//  O app.js NÃO acessa a API diretamente.
//  Ele só awaita: window.bancoDePerguntasAsync
// =============================================


// ── FONTES ────────────────────────────────────
// Array com as URLs de onde vamos buscar perguntas.
// Cada objeto tem a URL da API e o nome da categoria.
//
// Categorias:
//   9  → Conhecimentos Gerais
//  18  → Tecnologia
//  31  → Anime & Manga
//
// encode=base64 → evita problemas com caracteres especiais
// type=multiple → sempre 4 opções

const FONTES = [
  {
    url: "https://opentdb.com/api.php?amount=5&category=18&type=multiple&encode=base64",
    categoria: "Tecnologia"
  },
  {
    url: "https://opentdb.com/api.php?amount=5&category=31&type=multiple&encode=base64",
    categoria: "Anime"
  },
  {
    url: "https://opentdb.com/api.php?amount=5&category=9&type=multiple&encode=base64",
    categoria: "Conhecimentos Gerais"
  }
]


// ── UTILITÁRIOS ───────────────────────────────

// A API envia todos os textos em Base64 para evitar
// problemas com acentos e caracteres especiais.
// atob() desfaz o Base64 e devolve o texto legível.
// Exemplo: atob("V2ViIERldg==") → "Web Dev"
function decodificarBase64(str) {
  return atob(str)
}

// Embaralha um array e retorna uma cópia
// (mesmo embaralhar que já existe no app.js)
function embaralhar(array) {
  var copia = array.slice()
  for (var i = copia.length - 1; i > 0; i--) {
    var j    = Math.floor(Math.random() * (i + 1))
    var temp = copia[i]
    copia[i] = copia[j]
    copia[j] = temp
  }
  return copia
}


// ── NORMALIZAÇÃO ──────────────────────────────
// A API fala uma língua. O app.js fala outra.
// Esta função traduz uma pergunta da API
// para o formato que o app.js conhece.
//
// Entrada (formato da API):
// {
//   question:          "base64...",
//   correct_answer:    "base64...",
//   incorrect_answers: ["base64...", "base64...", "base64..."],
//   category:          "base64..."
// }
//
// Saída (formato do QuizCaju):
// {
//   id:        número
//   categoria: string
//   pergunta:  string
//   opcoes:    [string, string, string, string]
//   correta:   número (índice no array opcoes)
//   explicacao: string
// }

function normalizarPergunta(item, fonte, indice) {

}


// ── BUSCA ─────────────────────────────────────
// Busca as perguntas de uma fonte e normaliza.
// async/await: a função pausa em cada await
// até a resposta chegar, depois continua.

async function buscarDeFonte(fonte, offsetId) {

}


// ── ORQUESTRAÇÃO ──────────────────────────────
// Promise.all dispara os 3 fetches ao mesmo tempo.
// Só continua quando todos terminarem.
// Mais rápido do que fazer um por um.

async function carregarPerguntas() {

}


// ── EXPOSIÇÃO PÚBLICA ─────────────────────────
// O app.js awaita esta Promise para ter o array pronto.
// Por que Promise e não array direto?
// Porque fetch é assíncrono — quando o HTML carrega
// este arquivo, os dados ainda não chegaram.
// A Promise "segura" esse momento.
//
// No app.js:
//   var perguntas = await window.bancoDePerguntasAsync
//   → aí o array está pronto para usar

// window.bancoDePerguntasAsync = carregarPerguntas()