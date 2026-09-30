// Script para análise de numeração de boletins
document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando módulo de análise de numeração");
    
    // Elementos DOM
    const analisarBtn = document.getElementById('analisar-numeracao-btn');
    const assinaturaInput = document.getElementById('assinatura-input');
    const resultadosContainer = document.getElementById('resultados-numeracao');
    const estatisticasContainer = document.getElementById('estatisticas-numeracao');
    const graficosContainer = document.getElementById('graficos-numeracao');
    
    // Carregar assinatura salva
    chrome.storage.local.get(['assinaturaNumeracao'], (data) => {
        if (data.assinaturaNumeracao) {
            assinaturaInput.value = data.assinaturaNumeracao;
        } else {
            // Valor padrão
            assinaturaInput.value = "RNMM.";
        }
    });
    
    // Salvar assinatura quando alterada
    assinaturaInput.addEventListener('change', () => {
        chrome.storage.local.set({
            assinaturaNumeracao: assinaturaInput.value
        });
    });
    
    // Botão de análise
    if (analisarBtn) {
        analisarBtn.addEventListener('click', () => {
            const assinatura = assinaturaInput.value.trim();
            
            // Validar assinatura
            if (!assinatura) {
                mostrarMensagem("Por favor, insira uma assinatura válida.", "erro");
                return;
            }
            
            // Salvar assinatura
            chrome.storage.local.set({
                assinaturaNumeracao: assinatura
            });
            
            // Mostrar mensagem de carregamento
            mostrarMensagem("Analisando numeração do boletim...", "info");
            
            // Executar análise
            executarAnaliseNumeracao(assinatura);
        });
    }
    
    // Função para executar a análise
    function executarAnaliseNumeracao(assinatura) {
        // Injetar script na página ativa
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0]) {
                mostrarMensagem("Nenhuma aba ativa encontrada.", "erro");
                return;
            }
            
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: analisarNumeracaoBoletimCompleto,
                args: [assinatura]
            }).then((results) => {
                if (chrome.runtime.lastError) {
                    mostrarMensagem(`Erro: ${chrome.runtime.lastError.message}`, "erro");
                    return;
                }
                
                const resultado = results[0].result;
                if (resultado) {
                    exibirResultados(resultado);
                } else {
                    mostrarMensagem("Não foi possível analisar a numeração. Verifique se a página contém um boletim.", "erro");
                }
            }).catch(error => {
                mostrarMensagem(`Erro ao executar análise: ${error.message}`, "erro");
            });
        });
    }
    
    // Função completa que será injetada na página
    // Importante: Inclui tanto a função principal quanto as funções auxiliares
    function analisarNumeracaoBoletimCompleto(assinatura) {
        // Obter texto da página
        const textoAnalise = document.body.innerText || document.body.textContent;
        
        if (!textoAnalise || textoAnalise.length < 100) {
            return null;
        }
        
        // FUNÇÃO AUXILIAR PARA AGRUPAR NÚMEROS EM SEQUÊNCIAS (incluída aqui dentro do escopo)
        function agruparEmSequencias(numeros) {
            if (numeros.length === 0) return [];
            
            const sequencias = [];
            let inicio = numeros[0];
            let fim = numeros[0];
            
            for (let i = 1; i < numeros.length; i++) {
                if (numeros[i] === fim + 1) {
                    fim = numeros[i];
                } else {
                    if (inicio === fim) {
                        sequencias.push(inicio.toString());
                    } else {
                        sequencias.push(`${inicio}-${fim}`);
                    }
                    inicio = numeros[i];
                    fim = numeros[i];
                }
            }
            
            // Adicionar a última sequência
            if (inicio === fim) {
                sequencias.push(inicio.toString());
            } else {
                sequencias.push(`${inicio}-${fim}`);
            }
            
            return sequencias;
        }
        
        // Buscar padrão: número - O(A) ... ASSINATURA
        const padrao = new RegExp(`(\\d+) - O\\(A\\)[\\s\\S]*?${assinatura.replace('.', '\\.')}`, 'g');
        const numerosEncontrados = [];
        let match;
        
        while ((match = padrao.exec(textoAnalise)) !== null) {
            numerosEncontrados.push(parseInt(match[1]));
        }
        
        // Ordenar números
        numerosEncontrados.sort((a, b) => a - b);
        
        // Remover duplicatas
        const numerosUnicos = [...new Set(numerosEncontrados)];
        
        if (numerosUnicos.length === 0) {
            return {
                status: 'empty',
                message: 'Nenhum número encontrado com o padrão especificado.'
            };
        }
        
        const menor = Math.min(...numerosUnicos);
        const maior = Math.max(...numerosUnicos);
        
        // Encontrar números faltantes
        const numerosFaltantes = [];
        for (let i = menor; i <= maior; i++) {
            if (!numerosUnicos.includes(i)) {
                numerosFaltantes.push(i);
            }
        }
        
        // Agrupar números em sequências
        const sequenciasEncontradas = agruparEmSequencias(numerosUnicos);
        const sequenciasFaltantes = agruparEmSequencias(numerosFaltantes);
        
        // Retornar resultados
        return {
            status: 'success',
            numerosEncontrados: numerosUnicos,
            numerosFaltantes: numerosFaltantes,
            sequenciasEncontradas: sequenciasEncontradas,
            sequenciasFaltantes: sequenciasFaltantes,
            menor: menor,
            maior: maior,
            total: numerosUnicos.length,
            faltantes: numerosFaltantes.length,
            totalEsperado: maior - menor + 1,
            completude: ((numerosUnicos.length / (maior - menor + 1)) * 100).toFixed(1),
            duplicatas: numerosEncontrados.length !== numerosUnicos.length,
            todosNumeros: numerosEncontrados
        };
    }
    
    // Função melhorada para exibir os resultados com layout aprimorado
    function exibirResultados(resultado) {
        if (!resultadosContainer || !estatisticasContainer || !graficosContainer) {
            console.error("Containers de resultado não encontrados");
            return;
        }
        
        // Limpar contêineres
        resultadosContainer.innerHTML = '';
        estatisticasContainer.innerHTML = '';
        graficosContainer.innerHTML = '';
        
        if (resultado.status === 'empty') {
            resultadosContainer.innerHTML = `
                <div class="resultado-vazio">
                    <i class="fas fa-search-minus"></i>
                    <p>${resultado.message}</p>
                    <p>Verifique se a assinatura está correta e tente novamente.</p>
                </div>
            `;
            return;
        }
        
        // Exibir estatísticas com formatação melhorada
        estatisticasContainer.innerHTML = `
            <div class="estatisticas-grid">
                <div class="estatistica-card">
                    <div class="estatistica-valor">${resultado.total}</div>
                    <div class="estatistica-label">Números Encontrados</div>
                </div>
                <div class="estatistica-card ${resultado.faltantes > 0 ? 'alerta' : 'sucesso'}">
                    <div class="estatistica-valor">${resultado.faltantes}</div>
                    <div class="estatistica-label">Números Faltantes</div>
                </div>
                <div class="estatistica-card">
                    <div class="estatistica-valor">${resultado.menor}&ndash;${resultado.maior}</div>
                    <div class="estatistica-label">Intervalo</div>
                </div>
                <div class="estatistica-card ${parseFloat(resultado.completude) < 90 ? 'alerta' : 'sucesso'}">
                    <div class="estatistica-valor">${resultado.completude}%</div>
                    <div class="estatistica-label">Completude</div>
                </div>
            </div>
        `;
        
        // Exibir resultados detalhados com layout aprimorado
        if (resultado.numerosFaltantes.length > 0) {
            // Caso existam números faltantes
            resultadosContainer.innerHTML = `
                <div class="resultado-secao">
                    <h3><i class="fas fa-check-circle"></i> Números Encontrados</h3>
                    <div class="resultado-conteudo">
                        <p class="sequencias-texto">${resultado.sequenciasEncontradas.join(", ")}</p>
                    </div>
                </div>
                <div class="resultado-secao">
                    <h3><i class="fas fa-times-circle"></i> Números Faltantes</h3>
                    <div class="resultado-conteudo">
                        <p class="sequencias-texto">${resultado.sequenciasFaltantes.join(", ")}</p>
                    </div>
                </div>
                <div class="resultado-secao">
                    <h3><i class="fas fa-search"></i> Detalhamento das Lacunas</h3>
                    <div class="resultado-conteudo lacunas-lista">
                        ${resultado.sequenciasFaltantes.map(seq => {
                            if (seq.includes("-")) {
                                const [inicio, fim] = seq.split("-").map(Number);
                                const quantidade = fim - inicio + 1;
                                return `<div class="lacuna-item">
                                    <span class="lacuna-sequencia">${seq}</span>
                                    <span class="lacuna-quantidade">${quantidade} número${quantidade > 1 ? 's' : ''}</span>
                                </div>`;
                            } else {
                                return `<div class="lacuna-item">
                                    <span class="lacuna-sequencia">${seq}</span>
                                    <span class="lacuna-quantidade">número isolado</span>
                                </div>`;
                            }
                        }).join("")}
                    </div>
                </div>
            `;
        } else {
            // Caso a sequência esteja completa
            resultadosContainer.innerHTML = `
                <div class="resultado-secao">
                    <h3><i class="fas fa-check-circle"></i> Números Encontrados</h3>
                    <div class="resultado-conteudo">
                        <p class="sequencias-texto">${resultado.sequenciasEncontradas.join(", ")}</p>
                    </div>
                </div>
                <div class="resultado-secao sucesso-sequencia">
                    <h3><i class="fas fa-award"></i> Sequência Completa!</h3>
                    <div class="resultado-conteudo">
                        <p>Parabéns! Não há números faltantes na sequência. Todos os números de ${resultado.menor} a ${resultado.maior} foram encontrados.</p>
                    </div>
                </div>
            `;
        }
        
        // Adicionar aviso de duplicatas se necessário
        if (resultado.duplicatas) {
            resultadosContainer.innerHTML += `
                <div class="resultado-secao alerta-duplicatas">
                    <h3><i class="fas fa-exclamation-triangle"></i> Duplicatas Detectadas</h3>
                    <div class="resultado-conteudo">
                        <p>Foram encontradas ocorrências duplicadas de alguns números. Isso pode indicar repetições no documento.</p>
                        <div class="duplicatas-info">
                            <div class="duplicata-stat">
                                <span class="duplicata-label">Total de ocorrências:</span>
                                <span class="duplicata-value">${resultado.todosNumeros.length}</span>
                            </div>
                            <div class="duplicata-stat">
                                <span class="duplicata-label">Números únicos:</span>
                                <span class="duplicata-value">${resultado.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Criar gráfico de completude aprimorado
        criarGraficoCompletude(resultado, graficosContainer);
    }
    
    // Função melhorada para criar o gráfico de completude
    function criarGraficoCompletude(resultado, container) {
        // Criar container para o gráfico
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.width = '100%';
        chartContainer.style.height = '100%';
        container.appendChild(chartContainer);
        
        // Criar canvas para o gráfico
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'completude-chart';
        canvasElement.style.maxHeight = '180px';
        chartContainer.appendChild(canvasElement);
        
        // Verificar se Chart está disponível
        if (typeof Chart === 'undefined') {
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'chart-fallback';
            fallbackMsg.innerHTML = `
                <div class="barra-progresso">
                    <div class="barra-progresso-valor" style="width: ${resultado.completude}%"></div>
                </div>
                <div class="barra-progresso-label">
                    Completude: ${resultado.completude}% (${resultado.total} de ${resultado.totalEsperado} números)
                </div>
            `;
            chartContainer.innerHTML = '';
            chartContainer.appendChild(fallbackMsg);
            return;
        }
        
        // Criar gráfico usando Chart.js com configurações aprimoradas
        try {
            new Chart(canvasElement, {
                type: 'pie',
                data: {
                    labels: ['Números Encontrados', 'Números Faltantes'],
                    datasets: [{
                        data: [resultado.total, resultado.faltantes],
                        backgroundColor: [
                            resultado.faltantes === 0 ? '#46c93a' : '#4a6fff',
                            '#ff6b6b'
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutoutPercentage: 70,
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            boxWidth: 12,
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            fontSize: 12
                        }
                    },
                    title: {
                        display: true,
                        text: `Completude: ${resultado.completude}%`,
                        fontSize: 16,
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontStyle: 'normal',
                        padding: 15
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000,
                        easing: 'easeOutCubic'
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const value = dataset.data[tooltipItem.index];
                                const label = data.labels[tooltipItem.index];
                                const percentage = Math.round((value / resultado.totalEsperado) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Erro ao criar gráfico:", error);
            
            // Fallback aprimorado se o gráfico falhar
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'chart-fallback';
            fallbackMsg.innerHTML = `
                <div class="barra-progresso">
                    <div class="barra-progresso-valor" style="width: ${resultado.completude}%"></div>
                </div>
                <div class="barra-progresso-label">
                    Completude: ${resultado.completude}% (${resultado.total} de ${resultado.totalEsperado} números)
                </div>
                <div class="fallback-stats">
                    <div>Encontrados: <strong>${resultado.total}</strong></div>
                    <div>Faltantes: <strong>${resultado.faltantes}</strong></div>
                </div>
            `;
            chartContainer.innerHTML = '';
            chartContainer.appendChild(fallbackMsg);
        }
    }
    
    // Função melhorada para mostrar mensagens com estilo consistente
    function mostrarMensagem(mensagem, tipo = 'info') {
        if (!resultadosContainer) return;
        
        // Limpar outros containers
        if (estatisticasContainer) estatisticasContainer.innerHTML = '';
        if (graficosContainer) graficosContainer.innerHTML = '';
        
        // Ícone apropriado com base no tipo
        let icon = 'info-circle';
        if (tipo === 'erro') icon = 'exclamation-circle';
        else if (tipo === 'sucesso') icon = 'check-circle';
        else if (tipo === 'aviso') icon = 'exclamation-triangle';
        
        resultadosContainer.innerHTML = `
            <div class="mensagem-${tipo}">
                <i class="fas fa-${icon}"></i>
                <div class="mensagem-conteudo">
                    <p>${mensagem}</p>
                </div>
            </div>
        `;
    }
});