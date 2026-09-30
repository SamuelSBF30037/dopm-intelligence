// Dashboard Auto-Fixed - Versão com Correção Visual Integrada
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Dashboard-Auto] Inicializando dashboard com auto-correção...");
    
    let categoryChart, termChart;
    let chartsInitialized = false;
    let correctionApplied = false;
    
    // Função de correção visual automática (baseada no script que funcionou)
    function aplicarCorrecaoVisual() {
        if (correctionApplied) return;
        
        console.log("[Dashboard-Auto] 🔧 Aplicando correção visual automática...");
        
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
            console.log(`[Dashboard-Auto] Container ${index + 1} corrigido`);
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
                
                console.log(`[Dashboard-Auto] Canvas ${index === 0 ? 'categoria' : 'termo'} corrigido: ${canvas.getBoundingClientRect().width}x${canvas.getBoundingClientRect().height}`);
            }
        });
        
        // 4. Remover elementos que podem estar cobrindo
        const possiveisObstaculos = ['.chart-loading', '.chart-error', '.chart-no-data'];
        possiveisObstaculos.forEach(seletor => {
            document.querySelectorAll(seletor).forEach(el => {
                if (el.style.display !== 'none') {
                    el.style.display = 'none';
                }
            });
        });
        
        correctionApplied = true;
        console.log("[Dashboard-Auto] ✅ Correção visual aplicada automaticamente");
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
    
    // Função para inicializar gráficos com correção automática
    function initCharts() {
        if (chartsInitialized) {
            console.log("[Dashboard-Auto] Gráficos já inicializados");
            return;
        }
        
        console.log("[Dashboard-Auto] 🚀 Iniciando inicialização automática dos gráficos...");
        
        // 1. Aplicar correção visual primeiro
        aplicarCorrecaoVisual();
        
        // 2. Aguardar um pouco para garantir que as correções foram aplicadas
        setTimeout(() => {
            // 3. Obter dados e criar gráficos
            chrome.storage.local.get(['countResults'], (data) => {
                let dadosGraficos = null;
                
                if (data.countResults && data.countResults.length > 0) {
                    console.log("[Dashboard-Auto] 📊 Usando dados reais:", data.countResults.length, "itens");
                    dadosGraficos = processarDadosReais(data.countResults);
                } else {
                    console.log("[Dashboard-Auto] 🧪 Usando dados de teste");
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
                
                // 4. Criar gráficos
                const categoryCanvas = document.getElementById('category-chart');
                const termCanvas = document.getElementById('term-chart');
                
                if (categoryCanvas && termCanvas) {
                    // Usar Chart.js se disponível, senão usar embedded-chart
                    if (typeof Chart !== 'undefined') {
                        console.log("[Dashboard-Auto] ✅ Usando Chart.js");
                        criarGraficosChartJS(dadosGraficos, categoryCanvas, termCanvas);
                    } else if (typeof MiniChart !== 'undefined') {
                        console.log("[Dashboard-Auto] ✅ Usando MiniChart (embedded)");
                        criarGraficosEmbedded(dadosGraficos, categoryCanvas, termCanvas);
                    } else {
                        console.log("[Dashboard-Auto] ⚠️ Usando desenho manual");
                        criarGraficosManual(dadosGraficos, categoryCanvas, termCanvas);
                    }
                    
                    chartsInitialized = true;
                    console.log("[Dashboard-Auto] 🎉 Gráficos inicializados com sucesso!");
                } else {
                    console.error("[Dashboard-Auto] ❌ Canvas não encontrados");
                }
            });
        }, 800);
    }
    
    // Função para criar gráficos com Chart.js
    function criarGraficosChartJS(dados, categoryCanvas, termCanvas) {
        try {
            // Destruir gráficos existentes
            if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
                window.categoryChart.destroy();
            }
            if (window.termChart && typeof window.termChart.destroy === 'function') {
                window.termChart.destroy();
            }
            
            // Gráfico de categoria (Pizza)
            window.categoryChart = new Chart(categoryCanvas, {
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
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { font: { size: 10 }, padding: 8 }
                        }
                    }
                }
            });
            
            // Gráfico de termos (Barras)
            window.termChart = new Chart(termCanvas, {
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
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { font: { size: 9 }, stepSize: 1 }
                        },
                        x: {
                            ticks: { maxRotation: 45, font: { size: 9 } }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
            
            console.log("[Dashboard-Auto] ✅ Gráficos Chart.js criados");
            
        } catch (error) {
            console.error("[Dashboard-Auto] Erro Chart.js:", error);
            // Fallback para embedded
            criarGraficosEmbedded(dados, categoryCanvas, termCanvas);
        }
    }
    
    // Função para criar gráficos com embedded-chart (MiniChart)
    function criarGraficosEmbedded(dados, categoryCanvas, termCanvas) {
        try {
            // Destruir gráficos existentes
            if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
                window.categoryChart.destroy();
            }
            if (window.termChart && typeof window.termChart.destroy === 'function') {
                window.termChart.destroy();
            }
            
            // Usar MiniChart (embedded-chart.js)
            window.categoryChart = new MiniChart(categoryCanvas, {
                type: 'pie',
                data: {
                    labels: dados.categoria.labels,
                    datasets: [{
                        data: dados.categoria.data,
                        backgroundColor: [
                            '#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', 
                            '#9c6ade', '#2ecc71', '#e67e22', '#9b59b6'
                        ]
                    }]
                }
            });
            
            window.termChart = new MiniChart(termCanvas, {
                type: 'bar',
                data: {
                    labels: dados.termos.labels,
                    datasets: [{
                        data: dados.termos.data,
                        backgroundColor: '#4a6fff'
                    }]
                }
            });
            
            console.log("[Dashboard-Auto] ✅ Gráficos MiniChart criados");
            
        } catch (error) {
            console.error("[Dashboard-Auto] Erro MiniChart:", error);
            // Fallback para desenho manual
            criarGraficosManual(dados, categoryCanvas, termCanvas);
        }
    }
    
    // Função para desenho manual (último fallback)
    function criarGraficosManual(dados, categoryCanvas, termCanvas) {
        console.log("[Dashboard-Auto] 🎨 Usando desenho manual...");
        
        // Gráfico de pizza
        const ctxPizza = categoryCanvas.getContext('2d');
        desenharPizza(ctxPizza, dados.categoria, 380, 200);
        
        // Gráfico de barras
        const ctxBarras = termCanvas.getContext('2d');
        desenharBarras(ctxBarras, dados.termos, 380, 200);
        
        console.log("[Dashboard-Auto] ✅ Gráficos manuais criados");
    }
    
    // Função de desenho manual de pizza
    function desenharPizza(ctx, dados, w, h) {
        ctx.clearRect(0, 0, w, h);
        
        const centerX = w / 2;
        const centerY = h / 2 - 20;
        const radius = 60;
        const total = dados.data.reduce((a, b) => a + b, 0);
        const cores = ['#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', '#9c6ade'];
        
        let startAngle = -Math.PI / 2;
        
        dados.data.forEach((valor, i) => {
            const sliceAngle = (valor / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = cores[i % cores.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            startAngle = endAngle;
        });
        
        // Legenda
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        dados.labels.forEach((label, i) => {
            const x = 10;
            const y = h - 30 + (i * 12);
            
            ctx.fillStyle = cores[i % cores.length];
            ctx.fillRect(x, y, 8, 8);
            
            ctx.fillStyle = '#333';
            ctx.fillText(`${label}: ${dados.data[i]}`, x + 12, y + 6);
        });
    }
    
    // Função de desenho manual de barras
    function desenharBarras(ctx, dados, w, h) {
        ctx.clearRect(0, 0, w, h);
        
        const margin = { top: 20, right: 20, bottom: 60, left: 40 };
        const chartW = w - margin.left - margin.right;
        const chartH = h - margin.top - margin.bottom;
        const maxVal = Math.max(...dados.data);
        const barWidth = chartW / dados.data.length * 0.7;
        
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
            const barHeight = (valor / maxVal) * chartH;
            const x = margin.left + (i * (chartW / dados.data.length)) + 5;
            const y = h - margin.bottom - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Valor
            ctx.fillStyle = '#333';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(valor.toString(), x + barWidth / 2, y - 3);
            
            // Label
            ctx.save();
            ctx.translate(x + barWidth / 2, h - margin.bottom + 15);
            ctx.rotate(Math.PI / 4);
            ctx.fillText(dados.labels[i], 0, 0);
            ctx.restore();
            
            ctx.fillStyle = '#4a6fff';
        });
    }
    
    // Função para atualizar gráficos (compatibilidade)
    function updateCharts() {
        console.log("[Dashboard-Auto] 🔄 Atualizando gráficos...");
        
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
                            if (window.categoryChart && window.termChart && typeof Chart !== 'undefined') {
                                // Atualizar Chart.js
                                window.categoryChart.data.labels = dadosGraficos.categoria.labels;
                                window.categoryChart.data.datasets[0].data = dadosGraficos.categoria.data;
                                window.categoryChart.update('none');
                                
                                window.termChart.data.labels = dadosGraficos.termos.labels;
                                window.termChart.data.datasets[0].data = dadosGraficos.termos.data;
                                window.termChart.update('none');
                                
                                console.log("[Dashboard-Auto] ✅ Gráficos atualizados");
                            } else {
                                // Recriar gráficos
                                chartsInitialized = false;
                                initCharts();
                            }
                        } catch (error) {
                            console.error("[Dashboard-Auto] Erro ao atualizar:", error);
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
        console.log("[Dashboard-Auto] Splash concluído, iniciando gráficos automaticamente");
        setTimeout(initCharts, 500);
    });
    
    document.addEventListener('tab:changed', (event) => {
        if (event.detail && event.detail.tab === 'dashboard') {
            console.log("[Dashboard-Auto] Aba dashboard ativada");
            setTimeout(() => {
                aplicarCorrecaoVisual();
                if (!chartsInitialized) {
                    initCharts();
                }
            }, 200);
        }
    });
    
    // Inicialização automática com múltiplas tentativas
    console.log("[Dashboard-Auto] 🏁 Agendando inicialização automática...");
    
    // Primeira tentativa
    setTimeout(() => {
        console.log("[Dashboard-Auto] 🚀 Primeira tentativa de inicialização...");
        initCharts();
    }, 1500);
    
    // Segunda tentativa se a primeira falhou
    setTimeout(() => {
        if (!chartsInitialized) {
            console.log("[Dashboard-Auto] 🔄 Segunda tentativa de inicialização...");
            initCharts();
        }
    }, 3000);
    
    // Terceira tentativa (força bruta)
    setTimeout(() => {
        if (!chartsInitialized) {
            console.log("[Dashboard-Auto] 💪 Terceira tentativa (força bruta)...");
            correctionApplied = false; // Reset para forçar correção novamente
            initCharts();
        }
    }, 5000);
    
    console.log("[Dashboard-Auto] ✨ Dashboard auto-corrigido inicializado!");
});