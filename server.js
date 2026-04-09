// SERVIDOR DO QUIZCAJU - ARQUIVO DO BACKEND
// Este arquivo roda no servidor (Node.js) e gerencia todos os jogadores conectados

// O express é uma biblioteca que ajuda a criar servidores web
// É como se fosse uma ferramenta que organiza as coisas do servidor
const express = require("express");

// O http é uma biblioteca padrão do Node.js para criar servidores HTTP
// HTTP é o protocolo que os navegadores usam para se comunicar com servidores
const http = require("http");

// O Server vem da biblioteca socket.io
// Socket.io é o que permite comunicação em tempo real (chat, ranking ao vivo)
const { Server } = require("socket.io");

// CRIANDO O SERVIDOR

// Cria uma aplicação express
// A variável app vai gerenciar as requisições HTTP
const app = express();

// Cria um servidor HTTP usando a aplicação express
// O servidor vai escutar requisições na porta 3000
const server = http.createServer(app);

// Cria um servidor Socket.IO e junta com o servidor HTTP
// O io vai gerenciar todas as conexões em tempo real
const io = new Server(server);

// Diz para o express servir arquivos estáticos da pasta atual
// Arquivos estáticos são: HTML, CSS, JS, imagens
// __dirname é a pasta onde este arquivo está
app.use(express.static(__dirname));

// VARIÁVEIS PARA ARMAZENAR DADOS DOS JOGADORES

// Contador simples de quantos jogadores estão online
// Começa com 0 porque ninguém conectou ainda
let jogadoresOnline = 0;

// Este objeto vai guardar todos os jogadores conectados
// A chave é o socket.id (identificador único da conexão)
// O valor é um objeto com nome e pontos do jogador
// Exemplo: jogadores = {
//   "abc123": { nome: "Ana", pontos: 1500 },
//   "def456": { nome: "João", pontos: 800 }
// }
const jogadores = {};

// Esta função é chamada sempre que alguém ganha pontos ou entra/sai
function atualizarRanking() {
    // Object.values(jogadores) pega todos os jogadores do objeto e transforma em array
    // Exemplo: [{ nome: "Ana", pontos: 1500 }, { nome: "João", pontos: 800 }]
    
    // O método .sort() ordena o array
    // (a, b) => b.pontos - a.pontos significa: ordena do maior ponto para o menor
    // Se b.pontos - a.pontos for positivo, b vem primeiro (pontos maiores primeiro)
    const ranking = Object.values(jogadores)
        .sort((a, b) => b.pontos - a.pontos);

    // io.emit envia uma mensagem para TODOS os jogadores conectados
    // "ranking" é o nome do evento
    // ranking é o array com a lista ordenada
    io.emit("ranking", ranking);
}

// io.on("connection") é disparado toda vez que um novo navegador se conecta ao servidor
// socket representa a conexão individual com aquele jogador específico
io.on("connection", (socket) => {
    
    // Aumenta o contador de jogadores online em 1
    jogadoresOnline++;
    
    // Exibe no console do servidor que alguém conectou
    // socket.id é um identificador único que o Socket.IO gera para cada conexão
    console.log("alguém conectou:", socket.id);
    
    // io.emit envia para todo mundo (incluindo o que acabou de chegar)
    // Envia a quantidade atualizada de jogadores online
    io.emit("online", jogadoresOnline);
    
    // Envia a lista com os nomes de todos os jogadores conectados
    // Object.values(jogadores) pega todos os jogadores
    // .map(j => j.nome) pega só o nome de cada um
    io.emit(
        "lista-jogadores",
        Object.values(jogadores).map(j => j.nome)
    );
    
    // EVENTO: JOGADOR ENTROU NO JOGO (DIGITOU O NICKNAME)
    // Escuta o evento "entrar" que o navegador envia
    // O parâmetro "nickname" é o nome que o jogador digitou
    socket.on("entrar", (nickname) => {
        
        // Salva o jogador no objeto jogadores
        // A chave é socket.id (identificador único da conexão)
        // O valor é um objeto com nome e pontos (começa com 0)
        jogadores[socket.id] = {
            nome: nickname,
            pontos: 0
        };
        
        // Exibe no console que um novo jogador entrou
        console.log("jogador entrou:", nickname);
        
        // Atualiza o ranking para todos os jogadores
        atualizarRanking();
        
        // Envia a lista atualizada de nomes para todos
        io.emit(
            "lista-jogadores",
            Object.values(jogadores).map(j => j.nome)
        );
        
        // Envia uma mensagem de sistema para o chat avisando que alguém entrou
        // io.emit envia para todos os jogadores
        io.emit("mensagem", {
            nome: "Sistema",      // Quem enviou a mensagem
            texto: `${nickname} entrou no jogo`  // O conteúdo da mensagem
        });
    });
    
    // EVENTO: JOGADOR GANHOU PONTOS (ACERTOU UMA PERGUNTA)
    // Escuta o evento "pontuar" que o navegador envia quando o jogador acerta
    // O parâmetro "pontos" é quantos pontos o jogador ganhou naquela resposta
    socket.on("pontuar", (pontos) => {
        
        // Verifica se o jogador existe no nosso registro
        // Se não existir, sai da função (return significa "para aqui")
        if (!jogadores[socket.id]) return;
        
        // Adiciona os pontos ganhos aos pontos que o jogador já tinha
        jogadores[socket.id].pontos += pontos;
        
        // Exibe no console quem ganhou quantos pontos
        // Exemplo: "Ana ganhou 500 pontos"
        console.log(
            `${jogadores[socket.id].nome} ganhou ${pontos} pontos`
        );
        
        // Atualiza o ranking para todos os jogadores
        atualizarRanking();
    });
    
    // EVENTO: JOGADOR ENVIOU MENSAGEM NO CHAT
    // Escuta o evento "mensagem" que o navegador envia quando alguém digita algo
    socket.on("mensagem", (texto) => {
        
        // Tenta pegar o nome do jogador que enviou a mensagem
        // O ?. é o "optional chaining" - se jogadores[socket.id] existir, pega o nome
        // Se não existir, usa "Anônimo"
        const nome = jogadores[socket.id]?.nome || "Anônimo";
        
        // Exibe no console quem enviou e o que foi enviado
        console.log(`mensagem de ${nome}: ${texto}`);
        
        // Envia a mensagem para TODOS os jogadores conectados
        io.emit("mensagem", {
            nome: nome,    // Quem enviou a mensagem
            texto: texto   // O conteúdo da mensagem
        });
    });
    
    // EVENTO: JOGADOR SE DESCONECTOU (FECHOU O NAVEGADOR OU PERDEU INTERNET)
    // Escuta o evento "disconnect" que o Socket.IO dispara automaticamente
    // reason é o motivo da desconexão (ex: "transport close", "ping timeout")
    socket.on("disconnect", (reason) => {
        
        // Diminui o contador de jogadores online em 1
        jogadoresOnline--;
        
        // Tenta pegar o nome do jogador que saiu
        // Se conseguir pegar, mostra o nome; se não, mostra o socket.id
        const nome = jogadores[socket.id]?.nome || socket.id;
        
        // Exibe no console que um jogador saiu
        console.log("jogador saiu:", nome);
        console.log("total online:", jogadoresOnline);
        console.log("motivo:", reason);
        
        // Remove o jogador do nosso objeto de jogadores
        // delete apaga a propriedade do objeto
        delete jogadores[socket.id];
        
        // Envia a nova quantidade de jogadores online para todos
        io.emit("online", jogadoresOnline);
        
        // Envia a lista atualizada de nomes (sem o que saiu) para todos
        io.emit(
            "lista-jogadores",
            Object.values(jogadores).map(j => j.nome)
        );
        
        // Atualiza o ranking (quem saiu não aparece mais)
        atualizarRanking();
        
        // Envia uma mensagem de sistema avisando que alguém saiu
        io.emit("mensagem", {
            nome: "Sistema",
            texto: `${nome} saiu do jogo`
        });
    });
});

server.listen(3000, () => {
    // Esta mensagem aparece no console quando o servidor está rodando
    console.log("rodando em http://localhost:3000");
});