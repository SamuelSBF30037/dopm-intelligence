// Script para garantir funcionamento das abas
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script: Sistema sem CDN inicializado");
    
    setTimeout(() => {
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                console.log("Clique na aba:", tabName);
                
                // Atualizar botões
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Atualizar conteúdos
                document.querySelectorAll('.tab-content').forEach(content => {
                    if (content.getAttribute('data-content') === tabName) {
                        content.classList.add('active');
                        content.style.display = 'block';
                        
                        // Se for a aba dashboard, aplicar correções
                        if (tabName === 'dashboard') {
                            setTimeout(() => {
                                if (window.aplicarCorrecaoVisual) {
                                    console.log("Aplicando correção visual (sistema interno)");
                                    window.aplicarCorrecaoVisual();
                                }
                                
                                if (window.updateCharts) {
                                    console.log("Atualizando gráficos (sistema interno)");
                                    window.updateCharts();
                                }
                            }, 200);
                        }
                    } else {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    }
                });
            });
        });
        
        console.log("Sistema interno: Navegação configurada");
    }, 500);
});