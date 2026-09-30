// Script simplificado para garantir que as abas funcionem corretamente
document.addEventListener('DOMContentLoaded', () => {
    console.log("Tabs Fix: Inicializando correção para navegação entre abas");
    
    // Aguardar um pouco para garantir que todos os outros scripts tenham sido carregados
    setTimeout(() => {
        // Implementar solução direta para o sistema de abas
        configurarNavegacaoAbas();
    }, 100);
});

function configurarNavegacaoAbas() {
    // Selecionar todos os botões e conteúdos
    const tabButtons = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`Tabs Fix: Encontrados ${tabButtons.length} botões e ${tabContents.length} conteúdos`);
    
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error("Tabs Fix: Elementos não encontrados!");
        return;
    }
    
    // Remover quaisquer listeners existentes (clonando e substituindo os elementos)
    tabButtons.forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
    });
    
    // Adicionar novos listeners de eventos
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            console.log(`Tabs Fix: Clique na aba "${tabName}"`);
            
            // Atualizar classes dos botões
            document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualizar classes e visibilidade dos conteúdos
            document.querySelectorAll('.tab-content').forEach(content => {
                const contentName = content.getAttribute('data-content');
                
                if (contentName === tabName) {
                    content.classList.add('active');
                    content.style.display = 'block';
                    console.log(`Tabs Fix: Ativando conteúdo "${contentName}"`);
                } else {
                    content.classList.remove('active');
                    content.style.display = 'none';
                }
            });
        });
    });
    
    console.log("Tabs Fix: Navegação entre abas configurada com sucesso");
    
    // Verificar se a aba ativa tem o conteúdo correspondente visível
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const activeTabName = activeTab.getAttribute('data-tab');
        const activeContent = document.querySelector(`.tab-content[data-content="${activeTabName}"]`);
        
        if (activeContent && !activeContent.classList.contains('active')) {
            console.log(`Tabs Fix: Corrigindo estado inicial da aba "${activeTabName}"`);
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
        }
    }
}
