// Dashboard Internal Fixed - Sistema interno sem dependências externas
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Dashboard-Internal] Inicializando sistema interno de gráficos...");
    
    let categoryChart, termChart;
    let chartsInitialized = false;
    let correctionApplied = false;
    
    // Função de correção visual automática (baseada no script que funcionou)
    function aplicarCorrecaoVisual() {
        if (correctionApplied) return;
        
        console.log("[Dashboard-Internal] 🔧 Aplicando correção visual (sistema interno)...");
        
        // 1. Garantir que a aba dashboard está ativa
        const dashboardTab = document.querySelector('.tab[data-tab="dashboard"]');
        const dashboardContent = document.querySelector('.tab-content[data-content="dashboard"]');
        
        if (dashboardTab && dashboardContent) {
            dashboardTab.classList.add('active');
            dashboardContent.classList.add('active');
            dashboardContent.style.display = 'block';
            dashboardContent.style.visibility = 'visible';
            dashboardContent.style.opacity = '1';
        }
        
        // 2. Forçar visibilidade dos containers
        const containers = document.querySelectorAll('.chart-container');
        containers.forEach((container, index) => {
            container.style.cssText += `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 1 !important;
                background: white !important;
                border: 1px solid #e0e5ef !important;
                margin: 15px 0 !important;
                padding: 15px !important;
                width: 100% !important;
                height: 280px !important;
                min-height: 280px !important;
                border-radius: 8px !important;
            `;
            console.log(`[Dashboard-Internal] Container ${index + 1} corrigido`);
        });
        
        // 3. Forçar visibilidade e dimensões dos canvas
        const categoryCanvas = document.getElementById('category-chart');
        const termCanvas = document.getElementById('term-chart');
        
        [categoryCanvas, termCanvas].forEach((canvas, index) => {
            if (canvas) {
                canvas.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    z-index: 10 !important;
                    width: 380px !important;
                    height: 200px !important;
                    max-width: 380px !important;
                    max-height: 200px !important;
                    margin: 10px auto !important;
                    border: 1px solid #ddd !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                `;
                
                // Forçar atributos nativos do canvas
                canvas.width = 380;
                canvas.height = 200;
                
                console.log(`[Dashboard-Internal] Canvas ${index === 0 ? 'categoria' : 'termo'} corrigido: ${canvas.getBoundingClientRect().width}x${canvas.getBoundingClientRect().height}`);
            }
        });
        
        // 4. Remover elementos que podem estar cobrindo
        const possiveisObstaculos = ['.chart-loading', '.chart-error', '.chart-no-data'];
        possiveisObstaculos.forEach(seletor => {
            document.querySelectorAll(seletor).forEach(el => {
                if (el.style.display !== 'none' && !el.classList.contains('loading')) {
                    el.style.display = 'none';
                }
            });
        });
        
        correctionApplied = true;
        console.log("[Dashboard-Internal] ✅ Correção visual aplicada (sistema interno)");
    }
    
    // Função para processar dados reais
    function processarDadosReais(results) {
        const categoryData = {};
        const termData = {};
        
        results.forEach(result => {
            const count = parseInt(result.count) || 0;
            const category = result.category || 'Sem categoria';
            const alias = result.alias || result.term || 'Desconhecido';
            
            categoryData[category] = (categoryData[category] || 0) + count;
            termData[alias] = (termData[alias] || 0) + count;
        });
        
        const topTerms = Object.entries(termData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        return {
            categoria: {
                labels: Object.keys(categoryData),
                data: Object.values(categoryData)
            },
            termos: {
                labels: topTerms.map(t => t[0].length > 12 ? t[0].substring(0, 10) + '...' : t[0]),
                data: topTerms.map(t => t[1])
            }
        };
    }
    
    // Função para inicializar gráficos usando APENAS sistema interno
    function initCharts() {
        if (chartsInitialized) {
            console.log("[Dashboard-Internal] Gráficos já inicializados");
            return;
        }
        
        console.log("[Dashboard-Internal] 🚀 Iniciando gráficos (sistema interno)...");
        
        // 1. Aplicar correção visual primeiro
        aplicarCorrecaoVisual();
        
        // 2. Aguardar um pouco para garantir que as correções foram aplicadas
        setTimeout(() => {
            // 3. Obter dados e criar gráficos
            chrome.storage.local.get(['countResults'], (data) => {
                let dadosGraficos = null;
                
                if (data.countResults && data.countResults.length > 0) {
                    console.log("[Dashboard-Internal] 📊 Usando dados reais:", data.countResults.length, "itens");
                    dadosGraficos = processarDadosReais(data.countResults);
                } else {
                    console.log("[Dashboard-Internal] 🧪 Usando dados de teste");
                    dadosGraficos = {
                        categoria: {
                            labels: ['Produtividade', 'Tipo de Matéria', 'Outros'],
                            data: [25, 35, 15]
                        },
                        termos: {
                            labels: ['RNMM', 'JBR', 'CTJR', 'CERTIFICADO', 'LICENÇA'],
                            data: [12, 8, 5, 15, 10]
                        }
                    };
                }
                
                // 4. Criar gráficos usando sistema interno
                const categoryCanvas = document.getElementById('category-chart');
                const termCanvas = document.getElementById('term-chart');
                
                if (categoryCanvas && termCanvas) {
                    // Usar MiniChart (embedded-chart.js) que já está na extensão
                    if (typeof MiniChart !== 'undefined' || typeof Chart !== 'undefined') {
                        console.log("[Dashboard-Internal] ✅ Usando MiniChart/Chart interno");
                        criarGraficosInterno(dadosGraficos, categoryCanvas, termCanvas);
                    } else {
                        console.log("[Dashboard-Internal] ✅ Usando desenho manual interno");
                        criarGraficosManual(dadosGraficos, categoryCanvas, termCanvas);
                    }
                    
                    chartsInitialized = true;
                    console.log("[Dashboard-Internal] 🎉 Gráficos internos inicializados!");
                } else {
                    console.error("[Dashboard-Internal] ❌ Canvas não encontrados");
                }
            });
        }, 800);
    }
    
    // Função para criar gráficos com sistema interno (MiniChart ou Chart)
    function criarGraficosInterno(dados, categoryCanvas, termCanvas) {
        try {
            // Destruir gráficos existentes
            if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
                window.categoryChart.destroy();
            }
            if (window.termChart && typeof window.termChart.destroy === 'function') {
                window.termChart.destroy();
            }
            
            console.log("[Dashboard-Internal] Criando gráficos com sistema disponível...");
            
            // Determinar qual sistema usar
            const ChartClass = (typeof Chart !== 'undefined') ? Chart : MiniChart;
            
            if (!ChartClass) {
                console.log("[Dashboard-Internal] Nenhum sistema de gráfico disponível, usando manual");
                criarGraficosManual(dados, categoryCanvas, termCanvas);
                return;
            }
            
            // Gráfico de categoria (Pizza)
            window.categoryChart = new ChartClass(categoryCanvas, {
                type: 'pie',
                data: {
                    labels: dados.categoria.labels,
                    datasets: [{
                        data: dados.categoria.data,
                        backgroundColor: [
                            '#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', 
                            '#9c6ade', '#2ecc71', '#e67e22', '#9b59b6'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false
                }
            });
            
            // Gráfico de termos (Barras)
            window.termChart = new ChartClass(termCanvas, {
                type: 'bar',
                data: {
                    labels: dados.termos.labels,
                    datasets: [{
                        label: 'Ocorrências',
                        data: dados.termos.data,
                        backgroundColor: '#4a6fff',
                        borderColor: '#4a6fff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false
                }
            });
            
            console.log("[Dashboard-Internal] ✅ Gráficos criados com sistema interno");
            
        } catch (error) {
            console.error("[Dashboard-Internal] Erro sistema interno:", error);
            // Fallback para desenho manual
            criarGraficosManual(dados, categoryCanvas, termCanvas);
        }
    }
    
    // Função para desenho manual (último fallback)
    function criarGraficosManual(dados, categoryCanvas, termCanvas) {
        console.log("[Dashboard-Internal] 🎨 Usando desenho manual interno...");
        
        try {
            // Gráfico de pizza
            const ctxPizza = categoryCanvas.getContext('2d');
            desenharPizza(ctxPizza, dados.categoria, 380, 200);
            
            // Gráfico de barras
            const ctxBarras = termCanvas.getContext('2d');
            desenharBarras(ctxBarras, dados.termos, 380, 200);
            
            console.log("[Dashboard-Internal] ✅ Gráficos manuais criados");
        } catch (error) {
            console.error("[Dashboard-Internal] Erro desenho manual:", error);
        }
    }
    
    // Função de desenho manual de pizza otimizada
    function desenharPizza(ctx, dados, w, h) {
        ctx.clearRect(0, 0, w, h);
        
        const centerX = w / 2;
        const centerY = h / 2 - 25;
        const radius = 65;
        const total = dados.data.reduce((a, b) => a + b, 0);
        const cores = ['#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', '#9c6ade', '#2ecc71', '#e67e22'];
        
        if (total === 0) return;
        
        let startAngle = -Math.PI / 2;
        
        // Desenhar fatias
        dados.data.forEach((valor, i) => {
            if (valor > 0) {
                const sliceAngle = (valor / total) * 2 * Math.PI;
                const endAngle = startAngle + sliceAngle;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = cores[i % cores.length];
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                startAngle = endAngle;
            }
        });
        
        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Distribuição por Categoria', w / 2, 15);
        
        // Legenda compacta
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        let legendY = h - 50;
        
        dados.labels.forEach((label, i) => {
            if (dados.data[i] > 0) {
                const x = 10 + (i % 2) * 180;
                const y = legendY + Math.floor(i / 2) * 12;
                
                if (y < h - 5) {
                    // Quadrado colorido
                    ctx.fillStyle = cores[i % cores.length];
                    ctx.fillRect(x, y, 8, 8);
                    
                    // Texto
                    ctx.fillStyle = '#333';
                    const labelText = label.length > 15 ? label.substring(0, 12) + '...' : label;
                    ctx.fillText(`${labelText}: ${dados.data[i]}`, x + 12, y + 6);
                }
            }
        });
    }
    
    // Função de desenho manual de barras otimizada
    function desenharBarras(ctx, dados, w, h) {
        ctx.clearRect(0, 0, w, h);
        
        const margin = { top: 25, right: 15, bottom: 70, left: 35 };
        const chartW = w - margin.left - margin.right;
        const chartH = h - margin.top - margin.bottom;
        const maxVal = Math.max(...dados.data);
        
        if (maxVal === 0) return;
        
        const barWidth = chartW / dados.data.length * 0.75;
        const barSpacing = chartW / dados.data.length * 0.25;
        
        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Top Termos', w / 2, 15);
        
        // Eixos
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, h - margin.bottom);
        ctx.lineTo(w - margin.right, h - margin.bottom);
        ctx.stroke();
        
        // Barras
        ctx.fillStyle = '#4a6fff';
        dados.data.forEach((valor, i) => {
            if (valor > 0) {
                const barHeight = (valor / maxVal) * chartH;
                const x = margin.left + (i * (chartW / dados.data.length)) + barSpacing / 2;
                const y = h - margin.bottom - barHeight;
                
                // Barra
                ctx.fillRect(x, y, barWidth, barHeight);
                
                // Valor acima da barra
                ctx.fillStyle = '#333';
                ctx.font = '9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(valor.toString(), x + barWidth / 2, y - 3);
                
                // Label rotacionado
                ctx.save();
                ctx.translate(x + barWidth / 2, h - margin.bottom + 15);
                ctx.rotate(Math.PI / 4);
                ctx.font = '8px Arial';
                ctx.fillText(dados.labels[i], 0, 0);
                ctx.restore();
                
                ctx.fillStyle = '#4a6fff';
            }
        });
        
        // Escala Y simples
        ctx.fillStyle = '#666';
        ctx.font = '8px Arial';
        ctx.textAlign = 'right';
        
        const steps = 4;
        for (let i = 0; i <= steps; i++) {
            const valor = Math.round((maxVal / steps) * i);
            const y = h - margin.bottom - (i / steps) * chartH;
            ctx.fillText(valor.toString(), margin.left - 3, y + 2);
        }
    }
    
    // Função para atualizar gráficos (compatibilidade)
    function updateCharts() {
        console.log("[Dashboard-Internal] 🔄 Atualizando gráficos (sistema interno)...");
        
        // Aplicar correção visual novamente
        aplicarCorrecaoVisual();
        
        setTimeout(() => {
            if (!chartsInitialized) {
                initCharts();
            } else {
                // Atualizar com novos dados
                chrome.storage.local.get(['countResults'], (data) => {
                    if (data.countResults && data.countResults.length > 0) {
                        const dadosGraficos = processarDadosReais(data.countResults);
                        
                        try {
                            // Tentar atualizar gráficos existentes
                            if (window.categoryChart && window.termChart) {
                                if (typeof window.categoryChart.update === 'function') {
                                    // Atualizar Chart.js/MiniChart
                                    window.categoryChart.data.labels = dadosGraficos.categoria.labels;
                                    window.categoryChart.data.datasets[0].data = dadosGraficos.categoria.data;
                                    window.categoryChart.update();
                                    
                                    window.termChart.data.labels = dadosGraficos.termos.labels;
                                    window.termChart.data.datasets[0].data = dadosGraficos.termos.data;
                                    window.termChart.update();
                                    
                                    console.log("[Dashboard-Internal] ✅ Gráficos atualizados");
                                } else {
                                    // Redesenhar manual
                                    const categoryCanvas = document.getElementById('category-chart');
                                    const termCanvas = document.getElementById('term-chart');
                                    
                                    if (categoryCanvas && termCanvas) {
                                        criarGraficosManual(dadosGraficos, categoryCanvas, termCanvas);
                                    }
                                }
                            } else {
                                // Recriar gráficos
                                chartsInitialized = false;
                                initCharts();
                            }
                        } catch (error) {
                            console.error("[Dashboard-Internal] Erro ao atualizar:", error);
                            chartsInitialized = false;
                            initCharts();
                        }
                    }
                });
            }
        }, 300);
    }
    
    // Expor funções globalmente
    window.updateCharts = updateCharts;
    window.initCharts = initCharts;
    window.aplicarCorrecaoVisual = aplicarCorrecaoVisual;
    window.categoryChart = categoryChart;
    window.termChart = termChart;
    
    // Event listeners
    document.addEventListener('splash:finished', () => {
        console.log("[Dashboard-Internal] Splash concluído, iniciando gráficos (sistema interno)");
        setTimeout(initCharts, 500);
    });
    
    document.addEventListener('tab:changed', (event) => {
        if (event.detail && event.detail.tab === 'dashboard') {
            console.log("[Dashboard-Internal] Aba dashboard ativada");
            setTimeout(() => {
                aplicarCorrecaoVisual();
                if (!chartsInitialized) {
                    initCharts();
                }
            }, 200);
        }
    });
    
    // Inicialização automática com múltiplas tentativas
    console.log("[Dashboard-Internal] 🏁 Sistema interno agendado...");
    
    // Primeira tentativa
    setTimeout(() => {
        console.log("[Dashboard-Internal] 🚀 Primeira tentativa (sistema interno)...");
        initCharts();
    }, 1500);
    
    // Segunda tentativa
    setTimeout(() => {
        if (!chartsInitialized) {
            console.log("[Dashboard-Internal] 🔄 Segunda tentativa (sistema interno)...");
            initCharts();
        }
    }, 3000);
    
    // Terceira tentativa (força bruta)
    setTimeout(() => {
        if (!chartsInitialized) {
            console.log("[Dashboard-Internal] 💪 Terceira tentativa (força bruta - sistema interno)...");
            correctionApplied = false; // Reset para forçar correção novamente
            initCharts();
        }
    }, 5000);
    
    console.log("[Dashboard-Internal] ✨ Sistema interno de gráficos inicializado!");
});