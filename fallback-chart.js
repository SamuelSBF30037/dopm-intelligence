// Este arquivo fornece um fallback básico caso o Chart.js não esteja disponível
// Ele verifica se Chart existe e, se não, cria uma versão mínima que não quebra o código

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se Chart já existe (caso o chart.min.js tenha sido carregado com sucesso)
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não encontrado. Usando implementação de fallback.');
        
        // Criar uma classe Chart mínima que não faz nada além de evitar erros
        window.Chart = class Chart {
            constructor(ctx, config) {
                this.ctx = ctx;
                this.config = config;
                this.data = config.data || { labels: [], datasets: [{ data: [] }] };
                
                // Mostrar mensagem visual no canvas
                if (ctx) {
                    try {
                        const context = ctx.getContext('2d');
                        if (context) {
                            context.font = '14px Arial';
                            context.fillStyle = '#ff6b6b';
                            context.textAlign = 'center';
                            context.fillText('Biblioteca Chart.js não encontrada', ctx.width / 2, ctx.height / 2);
                        }
                    } catch (e) {
                        console.error('Erro ao renderizar mensagem de fallback:', e);
                    }
                }
                
                // Exibir mensagem no console
                console.warn('Tentativa de criar gráfico sem a biblioteca Chart.js.');
                
                // Adicionar mensagem ao elemento DOM
                const chartContainer = ctx ? ctx.parentElement : null;
                if (chartContainer) {
                    const errorMsg = document.createElement('div');
                    errorMsg.style.color = '#ff6b6b';
                    errorMsg.style.padding = '10px';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.innerHTML = `
                        <strong>Chart.js não encontrado</strong><br>
                        Verifique se o arquivo chart.min.js está na pasta da extensão.
                    `;
                    chartContainer.appendChild(errorMsg);
                }
            }
            
            // Métodos mínimos necessários
            update() {}
            destroy() {}
            
            // Getters/setters para evitar erros
            get data() {
                return this._data;
            }
            
            set data(value) {
                this._data = value;
            }
        };
    }
});