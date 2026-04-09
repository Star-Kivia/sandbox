// ============================================
// MENU HAMBURGUER - Controle do menu lateral responsivo
// Este script gerencia a abertura e fechamento do menu em dispositivos moveis
// ============================================

(function() {
  // Aguarda o DOM estar completamente carregado
  document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menu-overlay');
    
    // Se os elementos necessarios nao existirem, sai da funcao
    if (!menuBtn || !sidebar) return;
    
    // Funcao para alternar o estado do menu (abrir/fechar)
    function toggleMenu() {
      sidebar.classList.toggle('menu-aberto');
      sidebar.classList.toggle('menu-fechado');
      
      // Ativa/desativa o overlay (fundo escuro)
      if (overlay) overlay.classList.toggle('ativo');
      
      // Impede o scroll da pagina quando o menu esta aberto no mobile
      document.body.style.overflow = sidebar.classList.contains('menu-aberto') ? 'hidden' : '';
    }
    
    // Funcao para fechar o menu
    function fecharMenu() {
      sidebar.classList.add('menu-fechado');
      sidebar.classList.remove('menu-aberto');
      
      // Remove o overlay
      if (overlay) overlay.classList.remove('ativo');
      
      // Restaura o scroll da pagina
      document.body.style.overflow = '';
    }
    
    // Evento de clique no botao hamburguer
    menuBtn.addEventListener('click', toggleMenu);
    
    // Evento de clique no overlay (fundo escuro) para fechar o menu
    if (overlay) overlay.addEventListener('click', fecharMenu);
    
    // Fecha o menu automaticamente quando a janela e redimensionada para desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        fecharMenu();
      }
    });
    
    // Configura o estado inicial do menu baseado no tamanho da tela
    if (window.innerWidth <= 768) {
      // Mobile: menu comeca fechado
      sidebar.classList.add('menu-fechado');
      sidebar.classList.remove('menu-aberto');
    } else {
      // Desktop: menu comeca aberto
      sidebar.classList.add('menu-aberto');
      sidebar.classList.remove('menu-fechado');
    }
  });
})();