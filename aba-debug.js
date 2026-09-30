// Script de diagnóstico específico para o problema da navegação entre abas
console.log('%c➤ DEPURADOR DE ABAS CARREGADO', 'background:#4a6fff; color:white; padding:5px; border-radius:3px; font-weight:bold');

// Registrar evento pronto para inspeção e diagnóstico
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c➤ DOM carregado, iniciando configuração do depurador de abas', 'color:#4a6fff');
    
    // Adicionar rastreamento visual aos botões das abas
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        // Adicionar identificador visual para depuração
        button.setAttribute('data-debug-id', `tab-${button.dataset.tab}`);
        
        // Adicionar handler de clique apenas para depuração
        button.addEventListener('click', (e) => {
            console.group(`%c➤ CLIQUE DETECTADO: aba "${button.dataset.tab}"`, 'background:#4a6fff; color:white; padding:3px; border-radius:3px');
            console.log('Elemento clicado:', button);
            console.log('Texto do botão:', button.innerText.trim());
            console.log('Dataset completo:', button.dataset);
            
            // Verificar se a classe active está sendo aplicada
            console.log('Classe "active" adicionada?', button.classList.contains('active'));
            
            // Verificar o conteúdo correspondente
            const targetContent = document.querySelector(`.tab-content[data-content="${button.dataset.tab}"]`);
            console.log('Conteúdo da aba encontrado?', targetContent ? 'SIM' : 'NÃO');
            
            if (targetContent) {
                console.log('Conteúdo tem classe "active"?', targetContent.classList.contains('active'));
                console.log('Estilo "display":', window.getComputedStyle(targetContent).display);
                
                // Destacar visualmente para depuração
                targetContent.style.border = '2px solid red';
                setTimeout(() => {
                    targetContent.style.border = '';
                }, 2000);
            } else {
                console.error('PROBLEMA: Conteúdo correspondente não encontrado!');
            }
            
            console.groupEnd();
        }, true); // Use captura para garantir que este handler é chamado primeiro
    });
    
    // Adicionar botão de diagnóstico ao DOM
    const debugButton = document.createElement('button');
    debugButton.innerText = 'Diagnosticar Abas';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.style.backgroundColor = '#4a6fff';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.padding = '5px 10px';
    debugButton.style.fontSize = '12px';
    debugButton.style.cursor = 'pointer';
    
    debugButton.addEventListener('click', executarDiagnosticoCompleto);
    
    document.body.appendChild(debugButton);
});

// Função principal de diagnóstico
function executarDiagnosticoCompleto() {
    console.clear();
    console.log('%c⚠️ DIAGNÓSTICO COMPLETO DE NAVEGAÇÃO ENTRE ABAS', 'background:#ff6b6b; color:white; padding:5px; border-radius:3px; font-weight:bold; font-size:14px');
    
    // 1. Verificar estrutura HTML
    console.group('%c1. Verificando estrutura HTML', 'color:#4a6fff; font-weight:bold');
    
    const tabButtons = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`Botões de aba encontrados: ${tabButtons.length}`);
    tabButtons.forEach((btn, i) => {
        console.log(`  Botão #${i+1}: "${btn.innerText.trim()}" [data-tab="${btn.dataset.tab}"]`, 
                    btn.classList.contains('active') ? '(ATIVO)' : '');
    });
    
    console.log(`Conteúdos de aba encontrados: ${tabContents.length}`);
    tabContents.forEach((content, i) => {
        const isVisible = window.getComputedStyle(content).display !== 'none';
        console.log(`  Conteúdo #${i+1}: [data-content="${content.dataset.content}"]`, 
                    content.classList.contains('active') ? '(ATIVO)' : '',
                    isVisible ? '(VISÍVEL)' : '(OCULTO)');
    });
    
    // Verificar correspondência
    const tabNames = Array.from(tabButtons).map(btn => btn.dataset.tab);
    const contentNames = Array.from(tabContents).map(content => content.dataset.content);
    
    const missingContents = tabNames.filter(name => !contentNames.includes(name));
    const missingButtons = contentNames.filter(name => !tabNames.includes(name));
    
    if (missingContents.length > 0) {
        console.error(`⚠️ PROBLEMA: Botões sem conteúdo correspondente: ${missingContents.join(', ')}`);
    }
    
    if (missingButtons.length > 0) {
        console.error(`⚠️ PROBLEMA: Conteúdos sem botão correspondente: ${missingButtons.join(', ')}`);
    }
    
    console.groupEnd();
    
    // 2. Verificar CSS
    console.group('%c2. Verificando regras CSS', 'color:#4a6fff; font-weight:bold');
    
    // Verificar classe tab-content
    const tabContentStyle = getComputedStyleForSelector('.tab-content');
    console.log('Estilo para .tab-content:', tabContentStyle ? {
        display: tabContentStyle.display,
        visibility: tabContentStyle.visibility,
        opacity: tabContentStyle.opacity,
        height: tabContentStyle.height,
        overflow: tabContentStyle.overflow
    } : 'Não encontrado');
    
    // Verificar classe tab-content.active
    const activeTabContentStyle = getComputedStyleForSelector('.tab-content.active');
    console.log('Estilo para .tab-content.active:', activeTabContentStyle ? {
        display: activeTabContentStyle.display,
        visibility: activeTabContentStyle.visibility,
        opacity: activeTabContentStyle.opacity
    } : 'Não encontrado');
    
    // Verificar se há conflitos de CSS
    if (tabContentStyle && tabContentStyle.display === 'none') {
        if (!activeTabContentStyle || activeTabContentStyle.display !== 'block') {
            console.error('⚠️ PROBLEMA: A regra CSS para mostrar conteúdos ativos está faltando ou não está funcionando');
        }
    }
    
    console.groupEnd();
    
    // 3. Verificar JavaScript
    console.group('%c3. Verificando manipuladores de eventos', 'color:#4a6fff; font-weight:bold');
    
    // Testar um clique programático
    if (tabButtons.length >= 2) {
        const inactiveButton = Array.from(tabButtons).find(btn => !btn.classList.contains('active'));
        if (inactiveButton) {
            console.log(`Simulando clique em: "${inactiveButton.innerText.trim()}"`);
            
            // Capturar estado anterior
            const activeButtonBefore = document.querySelector('.tab.active')?.dataset.tab;
            const activeContentBefore = document.querySelector('.tab-content.active')?.dataset.content;
            
            // Simular clique
            inactiveButton.click();
            
            // Verificar mudanças
            setTimeout(() => {
                const activeButtonAfter = document.querySelector('.tab.active')?.dataset.tab;
                const activeContentAfter = document.querySelector('.tab-content.active')?.dataset.content;
                
                console.log('Botão ativo antes:', activeButtonBefore);
                console.log('Botão ativo depois:', activeButtonAfter);
                console.log('Conteúdo ativo antes:', activeContentBefore);
                console.log('Conteúdo ativo depois:', activeContentAfter);
                
                if (activeButtonAfter !== inactiveButton.dataset.tab) {
                    console.error('⚠️ PROBLEMA: A classe "active" não foi aplicada ao botão clicado');
                }
                
                if (activeContentAfter !== inactiveButton.dataset.tab) {
                    console.error('⚠️ PROBLEMA: A classe "active" não foi aplicada ao conteúdo correspondente');
                }
                
                // Voltar ao estado anterior
                const originalButton = document.querySelector(`.tab[data-tab="${activeButtonBefore}"]`);
                if (originalButton) {
                    originalButton.click();
                }
            }, 100);
        }
    }
    
    console.groupEnd();
    
    // 4. Exibir eventos registrados
    console.group('%c4. Eventos registrados nos botões', 'color:#4a6fff; font-weight:bold');
    console.log('Não é possível listar todos os eventos registrados no Chrome, mas você pode verificar manualmente.');
    console.log('Dica: use "Inspect Element" em um botão de aba e veja a aba "Event Listeners" no painel Elements.');
    console.groupEnd();
    
    // 5. Soluções de contorno
    console.group('%c5. Soluções de contorno', 'color:#4a6fff; font-weight:bold');
    
    console.log('%cTeste esta solução temporária:', 'font-weight: bold');
    console.log(`
function fixarAbas() {
  // 1. Selecionar todos os botões e conteúdos
  const botoes = document.querySelectorAll('.tab');
  const conteudos = document.querySelectorAll('.tab-content');
  
  // 2. Limpar handlers existentes (opcional)
  botoes.forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  
  // 3. Adicionar novos handlers
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      // Ativar botão
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Ativar conteúdo
      const tabName = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        if (content.getAttribute('data-content') === tabName) {
          content.classList.add('active');
          content.style.display = 'block';
        } else {
          content.classList.remove('active');
          content.style.display = 'none';
        }
      });
    });
  });
  
  console.log('✅ Manipuladores de evento para abas corrigidos');
}

// Execute isso para tentar corrigir o problema:
fixarAbas();
    `);
    
    // Adicionar o botão para executar a solução
    const fixButton = document.createElement('button');
    fixButton.innerText = 'Executar solução temporária';
    fixButton.style.backgroundColor = '#46c93a';
    fixButton.style.color = 'white';
    fixButton.style.border = 'none';
    fixButton.style.borderRadius = '4px';
    fixButton.style.padding = '8px 16px';
    fixButton.style.margin = '10px 0';
    fixButton.style.cursor = 'pointer';
    
    fixButton.addEventListener('click', function() {
        // Implementação da solução de contorno
        function fixarAbas() {
            // 1. Selecionar todos os botões e conteúdos
            const botoes = document.querySelectorAll('.tab');
            const conteudos = document.querySelectorAll('.tab-content');
            
            // 2. Limpar handlers existentes
            botoes.forEach(btn => {
                const clone = btn.cloneNode(true);
                btn.parentNode.replaceChild(clone, btn);
            });
            
            // 3. Adicionar novos handlers
            document.querySelectorAll('.tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Ativar botão
                    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Ativar conteúdo
                    const tabName = btn.getAttribute('data-tab');
                    document.querySelectorAll('.tab-content').forEach(content => {
                        if (content.getAttribute('data-content') === tabName) {
                            content.classList.add('active');
                            content.style.display = 'block';
                        } else {
                            content.classList.remove('active');
                            content.style.display = 'none';
                        }
                    });
                });
            });
            
            console.log('✅ Manipuladores de evento para abas corrigidos');
        }
        
        // Executar a solução
        fixarAbas();
        console.log('%c✅ SOLUÇÃO TEMPORÁRIA APLICADA - Tente clicar nas abas agora', 'background:#46c93a; color:white; padding:5px; border-radius:3px');
    });
    
    // Adicionar ao console usando um elemento HTML temporário
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fixButton);
    console.log(tempDiv);
    
    console.groupEnd();
    
    // Conclusão
    console.log('%c➤ DIAGNÓSTICO CONCLUÍDO', 'background:#4a6fff; color:white; padding:5px; border-radius:3px; font-weight:bold');
    console.log('Se o problema persistir, verifique conflitos entre scripts ou problemas de timing na inicialização.');
}

// Função auxiliar para obter estilo para um seletor CSS
function getComputedStyleForSelector(selector) {
    try {
        // Tentar encontrar um elemento com este seletor
        const element = document.querySelector(selector);
        if (element) {
            return window.getComputedStyle(element);
        }
        
        // Se não encontrou, criar um elemento temporário
        const temp = document.createElement('div');
        temp.style.cssText = 'position:absolute; visibility:hidden; pointer-events:none;';
        temp.className = selector.replace(/\./g, ' ').trim();
        document.body.appendChild(temp);
        
        const style = window.getComputedStyle(temp);
        const result = {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            height: style.height,
            overflow: style.overflow
        };
        
        document.body.removeChild(temp);
        return result;
    } catch (e) {
        console.error('Erro ao obter estilo:', e);
        return null;
    }
}
