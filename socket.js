// SOCKET.JS - Arquivo responsável por toda comunicação multiplayer do QuizCaju
// Este arquivo lida com: conexão com o servidor, chat em tempo real, ranking ao vivo e lista de jogadores online

// ============================================
// CONEXÃO COM O SERVIDOR
// ============================================

// Cria a conexão com o servidor Socket.IO
// O servidor é o programa backend que gerencia todos os jogadores conectados
// O socket é como um telefone que permite comunicação em tempo real entre o navegador e o servidor
const socket = io();

// Esta variável vai guardar o nome do jogador atual
// Começa como null porque ainda não sabemos quem está jogando
// Exemplo: depois que o jogador digitar "Ana", meuNome vai virar "Ana"
let meuNome = null;

// ============================================
// EVENTO DE CONEXÃO
// ============================================

// Quando o navegador consegue se conectar com o servidor, este evento é disparado
// É como se o servidor dissesse "Oi, consegui te encontrar!"
socket.on("connect", () => {
    // Exibe uma mensagem no console do navegador para debug
    // O socket.id é um identificador único que o servidor dá para cada conexão
    // Exemplo no console: "conectado xKj3mNpQ2"
    console.log("conectado", socket.id);
});

// ============================================
// EVENTO: QUANTIDADE DE JOGADORES ONLINE (VERSÃO SIMPLES)
// ============================================

// Escuta o evento "online" que o servidor envia
// O parâmetro "qtd" é a quantidade de jogadores conectados no momento
// Exemplo: se tiver 5 pessoas jogando, qtd será 5
socket.on("online", (qtd) => {
    // Procura no HTML o elemento com id "hud-online"
    // Este é o local onde vamos mostrar quantos jogadores estão online
    const el = document.getElementById("hud-online");
    
    // Verifica se o elemento existe (se não existir, não faz nada para evitar erro)
    if (el) {
        // Atualiza o texto do elemento com a quantidade recebida
        // Exemplo: "5 jogador(es) online"
        el.textContent = `${qtd} jogador(es) online`;
    }
});

// ============================================
// EVENTO: LISTA COMPLETA DE JOGADORES ONLINE
// ============================================

// Esta versão é mais completa que a anterior
// Recebe não só a quantidade, mas também os nomes de todos os jogadores
socket.on("lista-jogadores", (lista) => {
    // Procura o elemento onde vamos exibir as informações
    const el = document.getElementById("hud-online");
    
    // Se o elemento não existir, sai da função (return significa "para aqui")
    if (!el) return;

    // Se a lista estiver vazia (ninguém online), mostra mensagem específica
    if (lista.length === 0) {
        el.textContent = "0 jogadores online";
        return; // Sai da função, não precisa continuar
    }

    // A lista vem como um array de objetos, cada objeto tem nome e pontos
    // Exemplo: lista = [{ nome: "Ana", pontos: 1500 }, { nome: "João", pontos: 800 }]
    // O método .map() cria um novo array contendo apenas os nomes
    // Resultado: nomes = ["Ana", "João"]
    const nomes = lista.map(j => j.nome);

    // Atualiza o texto com a quantidade e os nomes separados por vírgula
    // Exemplo: "2 online • Ana, João"
    el.textContent = `${lista.length} online • ${nomes.join(", ")}`;
});

// ============================================
// FUNÇÃO: ENVIAR NICKNAME PARA O SERVIDOR
// ============================================

// Esta função é chamada pelo app.js quando o jogador clica em "jogar agora"
// O parâmetro "nome" é o que o jogador digitou no campo de texto
function enviarNickname(nome) {
    // Guarda o nome do jogador na variável global
    // Isso será usado depois para saber se uma mensagem no chat é dele ou de outro
    meuNome = nome;
    
    // Emite (envia) um evento chamado "entrar" para o servidor
    // O servidor recebe este evento e adiciona o jogador na sala
    socket.emit("entrar", nome);
}

// ============================================
// CONFIGURAÇÃO DOS ELEMENTOS DO CHAT
// ============================================

// Busca os elementos HTML que vamos manipular
// Estes elementos estão no arquivo index.html
const input = document.getElementById("chat-input");        // Campo onde o usuário digita a mensagem
const botao = document.getElementById("chat-enviar");       // Botão "Enviar"
const box = document.getElementById("chat-mensagens");      // Área onde as mensagens aparecem

// ============================================
// FUNÇÃO: ENVIAR MENSAGEM DO CHAT
// ============================================

// Esta função pega o texto digitado e envia para o servidor
function enviarMensagem() {
    // Verifica se o campo de input existe (se não existir, não faz nada)
    if (!input) return;

    // Pega o texto digitado e remove espaços no início e fim
    // Exemplo: "   Olá   " vira "Olá"
    const texto = input.value.trim();
    
    // Se o texto estiver vazio (usuário não digitou nada), não envia
    if (!texto) return;

    // Envia a mensagem para o servidor através do evento "mensagem"
    socket.emit("mensagem", texto);
    
    // Limpa o campo de input para a próxima mensagem
    input.value = "";
}

// ============================================
// EVENTO: CLIQUE NO BOTÃO ENVIAR
// ============================================

// Verifica se o botão existe (pode ser que a página não tenha ele ainda)
if (botao) {
    // Adiciona um "ouvinte" de evento
    // Quando o usuário clicar no botão, a função enviarMensagem será executada
    botao.addEventListener("click", enviarMensagem);
}

// ============================================
// EVENTO: TECLA ENTER NO CAMPO DE TEXTO
// ============================================

// Verifica se o campo de input existe
if (input) {
    // Adiciona um ouvinte para quando o usuário pressionar uma tecla
    input.addEventListener("keydown", (e) => {
        // e.key é a tecla que foi pressionada
        // Se for a tecla "Enter" (tecla de enviar), chama a função
        if (e.key === "Enter") enviarMensagem();
    });
}

// ============================================
// EVENTO: ATUALIZAR RANKING
// ============================================

// Escuta o evento "ranking" que o servidor envia
// O servidor envia este evento sempre que a pontuação de alguém muda
socket.on("ranking", (lista) => {
    // Procura o elemento HTML onde o ranking será exibido
    const el = document.getElementById("ranking");

    // Se o elemento não existir, sai da função
    if (!el) return;

    // Limpa todo o conteúdo atual do ranking
    // Exemplo: se tinha "1º Ana — 1500 pts", isso vai ser removido
    el.innerHTML = "";

    // Percorre a lista de jogadores (um por um)
    // O servidor já envia a lista ordenada por pontuação (maior primeiro)
    lista.forEach((jogador, index) => {
        // Cria um novo elemento <div> para cada jogador
        const div = document.createElement("div");

        // Preenche o texto do elemento
        // index + 1 porque o índice começa em 0, mas a posição do ranking começa em 1
        // Exemplo: index=0 vira "1º", index=1 vira "2º"
        // jogador.nome é o nome do jogador
        // jogador.pontos é a pontuação dele
        // Resultado final: "1º Ana — 1500 pts"
        div.textContent = `${index + 1}º ${jogador.nome} — ${jogador.pontos} pts`;

        // Adiciona este novo elemento dentro do container do ranking
        el.appendChild(div);
    });
});

// ============================================
// EVENTO: RECEBER MENSAGENS DO CHAT
// ============================================

// Este é o coração do chat
// Escuta todas as mensagens que chegam do servidor
socket.on("mensagem", (msg) => {
    // Verifica se a área de mensagens existe
    if (!box) return;

    // ============================================
    // CASO 1: MENSAGEM DO SISTEMA
    // ============================================
    
    // Mensagens do sistema são avisos como "Ana entrou na sala" ou "João saiu"
    // O servidor envia estas mensagens com nome = "Sistema"
    if (msg.nome === "Sistema") {
        // Cria um novo elemento <div> para a mensagem
        const linha = document.createElement("div");
        
        // Define o texto da mensagem
        linha.textContent = msg.texto;
        
        // Aplica estilos CSS diretamente no elemento
        linha.style.textAlign = "center";      // Centraliza o texto na tela
        linha.style.opacity = "0.6";           // Deixa o texto um pouco transparente
        linha.style.fontSize = "0.8rem";       // Define tamanho da fonte um pouco menor
        linha.style.padding = "8px";           // Adiciona espaço interno ao redor do texto
        linha.style.margin = "4px 0";          // Adiciona espaço acima e abaixo
        
        // Adiciona a mensagem na área do chat
        box.appendChild(linha);
    } 
    
    // ============================================
    // CASO 2: MENSAGEM DE UM JOGADOR
    // ============================================
    else {
        // Verifica se a mensagem é do próprio usuário ou de outra pessoa
        // msg.nome é quem enviou a mensagem
        // meuNome é o nome que este jogador digitou no início
        // Se for igual, a mensagem é dele
        const ehMeu = msg.nome === meuNome;
        
        // Cria o container da mensagem
        // Este div vai envolver todo o balão
        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message";
        
        // Cria o balão da mensagem
        // A classe CSS define a cor e a posição:
        // - Se for mensagem própria (ehMeu = true): classe "own" -> balão laranja à direita
        // - Se for de outro (ehMeu = false): classe "other" -> balão branco à esquerda
        const bubbleDiv = document.createElement("div");
        bubbleDiv.className = `message-bubble ${ehMeu ? 'own' : 'other'}`;
        
        // ============================================
        // PARTES DO BALÃO: NOME DO REMETENTE
        // ============================================
        
        // Cria um <span> para o nome do jogador
        const nameSpan = document.createElement("span");
        nameSpan.className = "message-name";
        nameSpan.textContent = msg.nome;   // Exibe "Ana:" ou "João:"
        
        // ============================================
        // PARTES DO BALÃO: TEXTO DA MENSAGEM
        // ============================================
        
        // Cria uma <div> para o texto da mensagem
        const textSpan = document.createElement("div");
        textSpan.className = "message-text";
        textSpan.textContent = msg.texto;   // Exibe o que a pessoa escreveu
        
        // ============================================
        // PARTES DO BALÃO: HORÁRIO DA MENSAGEM
        // ============================================
        
        // Cria um <span> para mostrar a hora que a mensagem foi enviada
        const timeSpan = document.createElement("span");
        timeSpan.className = "message-time";
        
        // Pega a data e hora atual do computador do usuário
        const agora = new Date();
        
        // Pega a hora atual (0 a 23) e garante que tenha 2 dígitos
        // Exemplo: 9 vira "09", 14 vira "14"
        const horas = agora.getHours().toString().padStart(2, '0');
        
        // Pega os minutos atuais (0 a 59) e garante que tenha 2 dígitos
        // Exemplo: 5 vira "05", 30 vira "30"
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        
        // Junta hora e minutos no formato HH:MM
        // Exemplo: "14:30" ou "09:05"
        timeSpan.textContent = `${horas}:${minutos}`;
        
        // ============================================
        // MONTANDO O BALÃO FINAL
        // ============================================
        
        // Adiciona o nome dentro do balão
        bubbleDiv.appendChild(nameSpan);
        
        // Adiciona o texto dentro do balão
        bubbleDiv.appendChild(textSpan);
        
        // Adiciona o horário dentro do balão
        bubbleDiv.appendChild(timeSpan);
        
        // Adiciona o balão dentro do container da mensagem
        messageDiv.appendChild(bubbleDiv);
        
        // Adiciona a mensagem completa na área do chat
        box.appendChild(messageDiv);
    }
    
    // ============================================
    // ROLAGEM AUTOMÁTICA DO CHAT
    // ============================================
    
    // Faz o chat rolar automaticamente para a última mensagem
    // scrollHeight é a altura total do conteúdo
    // scrollTop define a posição do scroll
    // Definindo scrollTop = scrollHeight, o chat rola até o final
    // Isso garante que o usuário sempre veja as mensagens mais recentes
    box.scrollTop = box.scrollHeight;
});