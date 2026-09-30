// Dashboard Charts
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Charts
    let categoryChart, termChart;
    
    function initCharts() {
        try {
            console.log("Inicializando gráficos");
            
            // Category Chart - Distribuição por Categoria
            const categoryCanvas = document.getElementById('category-chart');
            
            if (!categoryCanvas) {
                console.error('Elemento category-chart não encontrado');
                return;
            }
            
            // Configuração para o gráfico de categorias
            categoryChart = new Chart(categoryCanvas, {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#4a6fff',
                            '#ff6b6b',
                            '#46c93a',
                            '#ffb347',
                            '#9c6ade'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
            // Term Chart - Detalhamento por Termo
            const termCanvas = document.getElementById('term-chart');
            
            if (!termCanvas) {
                console.error('Elemento term-chart não encontrado');
                return;
            }
            
            termChart = new Chart(termCanvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Ocorrências',
                        data: [],
                        backgroundColor: '#4a6fff',
                        borderColor: '#4a6fff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
            console.log("Gráficos inicializados com sucesso");
        } catch (error) {
            console.error('Erro ao inicializar os gráficos:', error);
            showChartError(`Erro ao inicializar gráficos: ${error.message}`);
        }
    }
    
    function showChartError(message) {
        // Exibir mensagem de erro no local dos gráficos
        const chartContainers = document.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'none';
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'chart-error';
                errorDiv.style.color = '#ff6b6b';
                errorDiv.style.padding = '15px';
                errorDiv.style.textAlign = 'center';
                
                errorDiv.textContent = message;
                
                container.appendChild(errorDiv);
            }
        });
    }
    
    // Update Charts with data
    function updateCharts() {
        // Get results from storage
        chrome.storage.local.get(['countResults'], (data) => {
            if (data.countResults && data.countResults.length > 0) {
                updateChartsWithData(data.countResults);
            } else {
                console.log("Nenhum dado encontrado para os gráficos");
                // No data yet, initialize empty charts
                if (!categoryChart || !termChart) {
                    initCharts();
                }
            }
        });
    }
    
    function updateChartsWithData(results) {
        try {
            if (!categoryChart || !termChart) {
                initCharts();
                // Se ainda não tivermos gráficos após a inicialização, sair
                if (!categoryChart || !termChart) {
                    console.error("Não foi possível inicializar os gráficos");
                    return;
                }
            }
            
            console.log("Atualizando gráficos com dados:", results);
            
            // Prepare data for category chart
            const categoryData = {};
            const termData = {};
            
            // Group results by category and term
            results.forEach(result => {
                // Validar dados
                if (typeof result !== 'object' || result === null) {
                    console.warn("Resultado inválido encontrado:", result);
                    return;
                }
                
                const count = parseInt(result.count) || 0;
                const category = result.category || 'Sem categoria';
                const alias = result.alias || 'Desconhecido';
                
                // Add to category total
                if (categoryData[category]) {
                    categoryData[category] += count;
                } else {
                    categoryData[category] = count;
                }
                
                // Add to term data
                if (termData[alias]) {
                    termData[alias] += count;
                } else {
                    termData[alias] = count;
                }
            });
            
            console.log("Dados processados:", { categoryData, termData });
            
            // Update category chart
            categoryChart.data.labels = Object.keys(categoryData);
            categoryChart.data.datasets[0].data = Object.values(categoryData);
            categoryChart.update();
            
            // Sort term data by count (descending)
            const sortedTerms = Object.entries(termData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10); // Show top 10 terms
            
            // Update term chart
            termChart.data.labels = sortedTerms.map(item => item[0]);
            termChart.data.datasets[0].data = sortedTerms.map(item => item[1]);
            termChart.update();
            
            console.log("Gráficos atualizados com sucesso");
        } catch (error) {
            console.error('Erro ao atualizar os gráficos:', error);
        }
    }
    
    // Listen for splash finished event to update charts
    document.addEventListener('splash:finished', () => {
        console.log("Splash screen concluído, atualizando gráficos");
        updateCharts();
    });
    
    // Initialize the dashboard with try/catch para segurança
    try {
        // Inicializar gráficos na carga inicial
        initCharts();
        
        // Carregar dados dos gráficos
        updateCharts();
    } catch (error) {
        console.error('Erro ao iniciar o dashboard:', error);
    }
});