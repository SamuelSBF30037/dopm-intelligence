// Script de depuração aprimorado para identificar problemas na navegação entre abas
console.log("[Debug] Script de depuração de abas carregado");

// Função para executar diagnóstico das abas
function diagnosticarAbas() {
    console.log("=== DIAGNÓSTICO DE NAVEGAÇÃO ENTRE ABAS ===");
    
    // 1. Verificar se os elementos de navegação existem
    const tabButtons = document.querySelectorAll('.tab');
    console.log(`[Seletores] Botões de aba encontrados: ${tabButtons.length}`);
    
    if (tabButtons.length === 0) {
        console.error("[ERRO CRÍTICO] Nenhum botão de aba encontrado. Verifique o seletor '.tab'");
        return;
    }
    
    // Mostrar quais botões foram encontrados
    tabButtons.forEach((button, index) => {
        const tabName = button.dataset.tab;
        const isActive = button.classList.contains('active');
        console.log(`[Botão ${index}] data-tab="${tabName}", ativo: ${isActive}, texto: "${button.textContent.trim()}"`);
    });
    
    // 2. Verificar conteúdos das abas
    const tabContents = document.querySelectorAll('.tab-content');
    console.log(`[Seletores] Conteúdos de aba encontrados: ${tabContents.length}`);
    
    if (tabContents.length === 0) {
        console.error("[ERRO CRÍTICO] Nenhum conteúdo de aba encontrado. Verifique o seletor '.tab-content'");
        return;
    }
    
    // Mostrar quais conteúdos foram encontrados
    tabContents.forEach((content, index) => {
        const contentName = content.dataset.content;
        const isActive = content.classList.contains('active');
        const isVisible = window.getComputedStyle(content).display !== 'none';
        console.log(`[Conteúdo ${index}] data-content="${contentName}", ativo: ${isActive}, visível: ${isVisible}`);
    });
    
    // 3. Verificar se há correspondência entre botões e conteúdos
    const tabNames = Array.from(tabButtons).map(button => button.dataset.tab);
    const contentNames = Array.from(tabContents).map(content => content.dataset.content);
    
    console.log("[Mapeamento] Abas (botões):", tabNames);
    console.log("[Mapeamento] Abas (conteúdos):", contentNames);
    
    const missingContents = tabNames.filter(name => !contentNames.includes(name));
    const missingButtons = contentNames.filter(name => !tabNames.includes(name));
    
    if (missingContents.length > 0) {
        console.error(`[ERRO] Botões sem conteúdo correspondente: ${missingContents.join(', ')}`);
    }
    
    if (missingButtons.length > 0) {
        console.error(`[ERRO] Conteúdos sem botão correspondente: ${missingButtons.join(', ')}`);
    }
    
    // 4. Verificar estilos CSS
    console.log("[CSS] Verificando estilos aplicados...");
    
    const activeTab = document.querySelector('.tab.active');
    const activeContent = document.querySelector('.tab-content.active');
    
    if (activeTab) {
        const tabStyle = window.getComputedStyle(activeTab);
        console.log(`[CSS] Aba ativa: cor=${tabStyle.color}, bg=${tabStyle.backgroundColor}`);
    }
    
    if (activeContent) {
        const contentDisplay = window.getComputedStyle(activeContent).display;
        console.log(`[CSS] Conteúdo ativo: display=${contentDisplay}`);
    }
    
    // 5. Teste de clique
    console.log("[Evento] Simulando cliques nos botões...");
    
    // Salvar estado atual
    const activeTabBefore = document.querySelector('.tab.active')?.dataset.tab;
    
    // Tentar simular um clique em cada aba para ver se mudam corretamente
    tabButtons.forEach((button, index) => {
        const tabName = button.dataset.tab;
        if (tabName !== activeTabBefore) {
            console.log(`[Evento] Simulando clique em '${tabName}'...`);
            
            // Disparar evento de clique manualmente
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            button.dispatchEvent(clickEvent);
            
            // Verificar se a aba mudou
            const newActiveTab = document.querySelector('.tab.active')?.dataset.tab;
            const tabSwitched = newActiveTab === tabName;
            
            console.log(`[Resultado] Mudança para '${tabName}': ${tabSwitched ? 'SUCESSO' : 'FALHA'}`);
            
            // Se conseguiu mudar, voltar para a aba original
            if (tabSwitched && activeTabBefore) {
                const originalButton = document.querySelector(`.tab[data-tab="${activeTabBefore}"]`);
                if (originalButton) {
                    originalButton.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                }
            }
            
            // Se falhou, fazer algumas verificações adicionais
            if (!tabSwitched) {
                console.error(`[DEBUG] Erro ao mudar para a aba '${tabName}'. Fazendo verificações adicionais...`);
                
                // Verificar se o evento está sendo capturado
                const oldClickHandler = button.onclick;
                
                // Substituir temporariamente o handler
                button.onclick = function(e) {
                    console.log(`[DEBUG] Evento de clique capturado em '${tabName}'`);
                    
                    // Restaurar handler original
                    button.onclick = oldClickHandler;
                    
                    // Evitar comportamento padrão para não interferir
                    e.preventDefault();
                    return false;
                };
                
                // Acionar clique
                button.click();
                
                // Restaurar handler se necessário
                if (button.onclick !== oldClickHandler) {
                    button.onclick = oldClickHandler;
                }
            }
            
            break; // Testar apenas uma aba para não bagunçar o estado
        }
    });
    
    console.log("=== FIM DO DIAGNÓSTICO ===");
    
    // Retornar sugestões
    return {
        botoes: tabButtons.length,
        conteudos: tabContents.length,
        problemasPotenciais: [
            missingContents.length > 0 ? `Botões sem conteúdo: ${missingContents.join(', ')}` : null,
            missingButtons.length > 0 ? `Conteúdos sem botão: ${missingButtons.join(', ')}` : null
        ].filter(Boolean)
    };
}

// Função aprimorada para configurar a navegação entre abas
function configurarNavegacaoAbas() {
    console.log("[Debug] Configurando navegação entre abas...");
    
    // Buscar elementos
    const tabButtons = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`[Debug] Encontrados: ${tabButtons.length} botões, ${tabContents.length} conteúdos`);
    
    // Verificar se encontrou elementos
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error("[ERRO] Não foi possível encontrar elementos de abas!");
        return false;
    }
    
    // Registrar eventos de clique para cada botão
    tabButtons.forEach(button => {
        console.log(`[Debug] Configurando botão: ${button.textContent.trim()} [data-tab="${button.dataset.tab}"]`);
        
        button.addEventListener('click', (event) => {
            const tabName = button.dataset.tab;
            console.log(`[Debug] Clique detectado na aba: ${tabName}`);
            
            // Ativar botão selecionado
            tabButtons.forEach(btn => {
                const wasActive = btn.classList.contains('active');
                btn.classList.remove('active');
                if (wasActive && btn !== button) {
                    console.log(`[Debug] Desativando botão: ${btn.dataset.tab}`);
                }
            });
            
            button.classList.add('active');
            console.log(`[Debug] Botão ativado: ${tabName}`);
            
            // Mostrar conteúdo da aba
            let conteudoAtivado = false;
            
            tabContents.forEach(content => {
                const contentName = content.dataset.content;
                const willBeActive = contentName === tabName;
                
                if (willBeActive) {
                    console.log(`[Debug] Ativando conteúdo: ${contentName}`);
                    content.classList.add('active');
                    conteudoAtivado = true;
                    
                    // Verificar se o conteúdo está realmente visível
                    setTimeout(() => {
                        const isVisible = window.getComputedStyle(content).display !== 'none';
                        console.log(`[Debug] Conteúdo ${contentName} visível: ${isVisible}`);
                        
                        if (!isVisible) {
                            console.error(`[ERRO] O conteúdo da aba ${contentName} não está visível mesmo após adicionar a classe 'active'`);
                            console.log(`[Debug] Classes: ${content.className}`);
                            console.log(`[Debug] Display: ${window.getComputedStyle(content).display}`);
                        }
                    }, 100);
                } else {
                    if (content.classList.contains('active')) {
                        console.log(`[Debug] Desativando conteúdo: ${contentName}`);
                    }
                    content.classList.remove('active');
                }
            });
            
            if (!conteudoAtivado) {
                console.error(`[ERRO] Nenhum conteúdo ativado para a aba: ${tabName}`);
            }
            
            // Verificar se o evento está sendo propagado
            console.log(`[Debug] Evento de clique processado para aba: ${tabName}`);
        });
    });
    
    console.log("[Debug] Navegação entre abas configurada com sucesso");
    return true;
}

// Garantir que o DOM está carregado antes de executar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("[Debug] DOM carregado, iniciando configuração...");
        configurarNavegacaoAbas();
        
        // Executar diagnóstico após um pequeno atraso
        setTimeout(diagnosticarAbas, 500);
    });
} else {
    console.log("[Debug] DOM já estava carregado, iniciando configuração imediatamente...");
    configurarNavegacaoAbas();
    
    // Executar diagnóstico após um pequeno atraso
    setTimeout(diagnosticarAbas, 500);
}

// Exportar função de diagnóstico para acesso via console
window.diagnosticarAbas = diagnosticarAbas;
console.log("[Debug] Função diagnosticarAbas() disponível no console para debug manual");
