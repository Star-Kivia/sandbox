//  QuizCaju — app.js : Controla estado, timer, perguntas, pontuação e navegação entre telas
// ------------------------------------------------------------
// O estado guarda TODAS as informações do jogo.
// Fica no escopo global para que qualquer função possa acessá-lo.
const estado = {
    nickname: "",           // nome do jogador
    pontos: 0,              // pontuação total acumulada
    indiceAtual: 0,         // índice da pergunta atual (0 a 9)
    acertos: 0,             // contador de acertos
    erros: 0,               // contador de erros
    timerSegundos: 20,      // segundos restantes para a pergunta atual
    timerIntervalo: null,   // guarda o setInterval para poder cancelar
    perguntasJogo: [],      // array com as perguntas embaralhadas para esta partida
    respondeu: false        // evita que o jogador responda duas vezes a mesma pergunta
};

// Guarda as referências para não precisar chamar getElementById toda vez.
const telas = {
    home: document.getElementById("tela-home"),
    questao: document.getElementById("tela-questao"),
    feedback: document.getElementById("tela-feedback"),
    resultado: document.getElementById("tela-resultado")
};

const els = {
    // HOME 
    inputNickname: document.getElementById("input-nickname"),
    erroNickname: document.getElementById("erro-nickname"),
    btnIniciar: document.getElementById("btn-iniciar"),
    totalPerguntas: document.getElementById("total-perguntas"),
    totalCategorias: document.getElementById("total-categorias"),

    // QUESTÃO 
    questaoAtual: document.getElementById("questao-atual"),
    questaoTotal: document.getElementById("questao-total"),
    barraFill: document.getElementById("barra-fill"),
    timerArco: document.getElementById("timer-arco"),
    timerNum: document.getElementById("timer-num"),
    categoriaTag: document.getElementById("categoria-tag"),
    questaoTexto: document.getElementById("questao-texto"),
    opcoesGrid: document.getElementById("opcoes-grid"),

    // FEEDBACK 
    feedbackIcone: document.getElementById("feedback-icone"),
    feedbackTitulo: document.getElementById("feedback-titulo"),
    feedbackExplic: document.getElementById("feedback-explicacao"),
    feedbackPontos: document.getElementById("feedback-pontos"),
    placarParcial: document.getElementById("placar-parcial"),
    btnProxima: document.getElementById("btn-proxima"),

    // RESULTADO 
    resultadoMedalha: document.getElementById("resultado-medalha"),
    resultadoNome: document.getElementById("resultado-nome"),
    scoreFinal: document.getElementById("score-final"),
    statAcertos: document.getElementById("stat-acertos"),
    statErros: document.getElementById("stat-erros"),
    statPorcento: document.getElementById("stat-porcento"),
    resultadoMsg: document.getElementById("resultado-mensagem"),
    btnJogarNovamente: document.getElementById("btn-jogar-novamente")
};

// ------------------------------------------------------------
// FUNÇÕES UTILITÁRIAS
// ------------------------------------------------------------

/**
 * Mostra apenas a tela escolhida e esconde as outras.
 * @param {string} nomeTela - "home", "questao", "feedback" ou "resultado"
 */

function mostrarTela(nomeTela) {
    // Remove a classe "ativa" de todas as telas
    Object.values(telas).forEach(tela => {
        tela.classList.remove("ativa");
    });
    // Adiciona a classe "ativa" apenas na tela desejada
    telas[nomeTela].classList.add("ativa");
}

/**
 * Embaralha um array usando o algoritmo Fisher-Yates.
 * Retorna uma copia embaralhada, sem modificar o original.
 * @param {Array} array - array original
 * @returns {Array} - novo array embaralhado
 */

function embaralhar(array) {
    const copia = array.slice();  // cria uma cópia superficial
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

/**
 * Calcula os pontos ganhos em uma resposta.
 * @param {number} segundosRestantes - tempo que sobrou no timer (0 a 20)
 * @returns {number} - pontos ganhos
 */
function calcularPontos(segundosRestantes) {
    return 500 + (segundosRestantes * 25);
}

/**
 * Inicia uma nova partida.
 * - Valida o nickname 
 * - Reseta o estado do jogo
 * - Embaralha as perguntas
 * - Mostra a primeira pergunta
 */
function iniciarJogo() {
    const nome = els.inputNickname.value.trim();

    // Validação: nickname deve ter pelo menos 2 caracteres
    if (nome.length < 2) {
        els.erroNickname.textContent = "Digite pelo menos 2 caracteres.";
        return;
    }

    // Limpa mensagem de erro e salva o nickname
    els.erroNickname.textContent = "";
    estado.nickname = nome;

    // Reseta o estado para uma nova partida
    estado.pontos = 0;
    estado.indiceAtual = 0;
    estado.acertos = 0;
    estado.erros = 0;
    estado.respondeu = false;
    
    // Embaralha as perguntas (importa do arquivo questions.js)
    estado.perguntasJogo = embaralhar(perguntas);

    // Cancela qualquer timer que possa estar rodando
    if (estado.timerIntervalo) {
        clearInterval(estado.timerIntervalo);
        estado.timerIntervalo = null;
    }

    // Mostra a tela de questão e carrega a primeira pergunta
    mostrarTela("questao");
    mostrarPergunta();
}

/**
 * Exibe a pergunta atual na tela.
 * - Atualiza número da questão, barra de progresso, categoria e texto
 * - Cria os botões das opções dinamicamente
 * - Inicia o timer
 */
function mostrarPergunta() {
    const pergunta = estado.perguntasJogo[estado.indiceAtual];
    const total = estado.perguntasJogo.length;
    const numeroAtual = estado.indiceAtual + 1;
    const progresso = (numeroAtual / total) * 100;

    // Reseta o estado de resposta para esta nova pergunta
    estado.respondeu = false;

    // Atualiza textos e barra de progresso
    els.questaoAtual.textContent = numeroAtual;
    els.questaoTotal.textContent = total;
    els.barraFill.style.width = `${progresso}%`;
    els.categoriaTag.textContent = pergunta.categoria;
    els.questaoTexto.textContent = pergunta.pergunta;

    // Limpa as opções antigas
    els.opcoesGrid.innerHTML = "";

    // Cria os botões de opção (A, B, C, D)
    const letras = ["A", "B", "C", "D"];
    pergunta.opcoes.forEach((opcao, idx) => {
        const botao = document.createElement("button");
        botao.className = "opcao-btn";

        // Span com a letra (A, B, C, D)
        const spanLetra = document.createElement("span");
        spanLetra.className = `opcao-letra letra-${letras[idx].toLowerCase()}`;
        spanLetra.textContent = letras[idx];

        // Span com o texto da opção
        const spanTexto = document.createElement("span");
        spanTexto.className = "opcao-texto";
        spanTexto.textContent = opcao;

        botao.appendChild(spanLetra);
        botao.appendChild(spanTexto);
        
        // Cada botão chama responder com seu índice específico
        // Usei uma closure com let para capturar o valor correto
        botao.addEventListener("click", () => responder(idx));
        
        els.opcoesGrid.appendChild(botao);
    });

    // Inicia o timer para esta pergunta
    iniciarTimer();
}

/**
 * Inicia a contagem regressiva de 20 segundos.
 * Atualiza o número e o arco SVG visualmente.
 * Quando chega a zero, chama responder(-1) indicando tempo esgotado.
 */
function iniciarTimer() {
    const CIRCUNFERENCIA = 107;  // comprimento da circunferência do círculo SVG (2 * pi * raio ≈ 107)
    
    // Cancela timer anterior se existir
    if (estado.timerIntervalo) {
        clearInterval(estado.timerIntervalo);
    }
    
    // Reseta o timer para 20 segundos
    estado.timerSegundos = 20;
    els.timerNum.textContent = estado.timerSegundos;
    els.timerArco.style.strokeDashoffset = 0;
    
    // Inicia novo timer
    estado.timerIntervalo = setInterval(() => {
        if (estado.respondeu) return;  // se já respondeu, não faz nada
        
        estado.timerSegundos--;
        els.timerNum.textContent = estado.timerSegundos;
        
        // Calcula o offset do arco: quando tempo = 0, offset = CIRCUNFERENCIA (arco vazio)
        const offset = CIRCUNFERENCIA * (1 - estado.timerSegundos / 20);
        els.timerArco.style.strokeDashoffset = offset;
        
        // Tempo esgotado!
        if (estado.timerSegundos <= 0) {
            clearInterval(estado.timerIntervalo);
            estado.timerIntervalo = null;
            responder(-1);  // -1 indica que o tempo acabou (nenhuma opção foi clicada)
        }
    }, 1000);
}

/**
 * Processa a resposta do jogador (ou tempo esgotado).
 * - Impede respostas duplas
 * - Para o timer
 * - Marca visualmente as opções (verde para certa, vermelho para errada)
 * - Após 1 segundo, mostra o feedback
 * @param {number} indiceEscolhido - índice da opção clicada (0-3) ou -1 se tempo esgotado
 */
function responder(indiceEscolhido) {
    // Evita processar a mesma pergunta duas vezes
    if (estado.respondeu) return;
    estado.respondeu = true;
    
    // Para o timer
    if (estado.timerIntervalo) {
        clearInterval(estado.timerIntervalo);
        estado.timerIntervalo = null;
    }
    
    const pergunta = estado.perguntasJogo[estado.indiceAtual];
    const acertou = (indiceEscolhido === pergunta.correta);
    
    // Marca visualmente as opções
    const botoes = els.opcoesGrid.querySelectorAll(".opcao-btn");
    botoes.forEach((botao, idx) => {
        botao.disabled = true;  // desabilita todos os botões
        if (idx === pergunta.correta) {
            botao.classList.add("correta");  // marca a opção correta em verde
        }
        if (idx === indiceEscolhido && !acertou) {
            botao.classList.add("errada");   // marca a opção errada escolhida em vermelho
        }
    });
    
    let pontosGanhos = 0;
    
    if (acertou) {
        // Calcula pontos baseado no tempo restante
        pontosGanhos = calcularPontos(estado.timerSegundos);
        estado.pontos += pontosGanhos;
        estado.acertos++;
    } else {
        estado.erros++;
    }
    
    // Aguarda 1 segundo para mostrar o feedback (dá tempo de ver as cores)
    setTimeout(() => {
        mostrarFeedback(acertou, pontosGanhos, pergunta.explicacao);
    }, 1000);
}

/**
 * Exibe a tela de feedback com o resultado da resposta.
 * @param {boolean} acertou - true se acertou, false se errou
 * @param {number} pontosGanhos - pontos ganhos nesta resposta
 * @param {string} explicacao - explicação da resposta correta
 */
function mostrarFeedback(acertou, pontosGanhos, explicacao) {
    if (acertou) {
        els.feedbackIcone.textContent = "✅";
        els.feedbackTitulo.textContent = "Correto!";
        els.feedbackTitulo.className = "feedback-titulo acerto";
        els.feedbackPontos.textContent = `+${pontosGanhos}`;
    } else {
        els.feedbackIcone.textContent = "❌";
        els.feedbackTitulo.textContent = "Errou!";
        els.feedbackTitulo.className = "feedback-titulo erro";
        els.feedbackPontos.textContent = "+0";
    }
    
    els.feedbackExplic.textContent = explicacao;
    els.placarParcial.textContent = estado.pontos;
    
    mostrarTela("feedback");
}

/**
 * Avança para a próxima pergunta ou finaliza o jogo.
 */
function proximaPergunta() {
    estado.indiceAtual++;
    
    if (estado.indiceAtual < estado.perguntasJogo.length) {
        // Ainda há perguntas: mostra a próxima
        mostrarTela("questao");
        mostrarPergunta();
    } else {
        // Fim do jogo: mostra o resultado final
        mostrarResultado();
    }
}

/**
 * Calcula e exibe o resultado final do jogo.
 * - Define a medalha baseada no percentual de acertos
 * - Exibe score, acertos, erros e aproveitamento
 */
function mostrarResultado() {
    const total = estado.perguntasJogo.length;
    const aproveitamento = Math.round((estado.acertos / total) * 100);
    
    // Define medalha baseada no aproveitamento
    let medalha = "";
    if (aproveitamento >= 90) medalha = "🏆";
    else if (aproveitamento >= 70) medalha = "🥈";
    else if (aproveitamento >= 50) medalha = "🥉";
    else medalha = "😅";
    
    // Mensagem motivacional baseada no desempenho
    let mensagem = "";
    if (aproveitamento >= 90) mensagem = "Excelente! Você é um mestre do conhecimento! 🎉";
    else if (aproveitamento >= 70) mensagem = "Muito bom! Quase perfeito! 👏";
    else if (aproveitamento >= 50) mensagem = "Bom trabalho! Pode melhorar ainda mais! 💪";
    else mensagem = "Que tal revisar os conteúdos e tentar novamente? 📚";
    
    // Atualiza o DOM da tela de resultado
    els.resultadoMedalha.textContent = medalha;
    els.resultadoNome.textContent = estado.nickname;
    els.scoreFinal.textContent = estado.pontos;
    els.statAcertos.textContent = estado.acertos;
    els.statErros.textContent = estado.erros;
    els.statPorcento.textContent = `${aproveitamento}%`;
    els.resultadoMsg.textContent = mensagem;
    
    mostrarTela("resultado");
}

/**
 * Reinicia o jogo (volta para a home e limpa os campos).
 */
function reiniciarJogo() {
    // Limpa o campo de nickname
    els.inputNickname.value = "";
    els.erroNickname.textContent = "";
    
    // Mostra a tela inicial
    mostrarTela("home");
}

// Botão "jogar agora"
els.btnIniciar.addEventListener("click", iniciarJogo);

// Tecla Enter no campo de nickname
els.inputNickname.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        iniciarJogo();
    }
});

// Botão "próxima" na tela de feedback
els.btnProxima.addEventListener("click", proximaPergunta);

// Botão "jogar novamente" na tela de resultado
els.btnJogarNovamente.addEventListener("click", reiniciarJogo);

/**
 * Configura a tela inicial com os dados do banco de perguntas.
 * - Mostra o total de perguntas
 * - Mostra o total de categorias únicas
 */
function init() {
    // Total de perguntas
    const totalPerguntas = perguntas.length;
    els.totalPerguntas.textContent = totalPerguntas;
    
    // Total de categorias únicas
    const categoriasUnicas = [];
    perguntas.forEach(pergunta => {
        if (!categoriasUnicas.includes(pergunta.categoria)) {
            categoriasUnicas.push(pergunta.categoria);
        }
    });
    els.totalCategorias.textContent = categoriasUnicas.length;
}

// Chama a inicialização quando a página carrega
init();