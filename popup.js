// Popup Script com Solução para PDF Nativo - DOPM Intelligence v2.2
document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup script com solução para PDF nativo iniciado");

    // Elementos DOM
    const pageInfoElement = document.getElementById('page-info');
    const categorySummary = document.getElementById('category-summary');
    const detailedResultsContainer = document.getElementById('detailed-results');
    const splashSubtitle = document.getElementById('splash-subtitle');

    // Estado da aplicação
    let categories = [];
    let caseSensitive = false;
    let wholeWords = true;
    let currentPageType = 'HTML';
    let isPDFContent = false;
    let isNativePDF = false;

    // Categorias padrão (fallback)
    const defaultCategories = [
        {
            "name": "Produtividade",
            "terms": [
                { "term": "FOS", "alias": "FOS" },
                { "term": "RNMM", "alias": "Niedson" },
                { "term": "JBR", "alias": "JBR" },
                { "term": "CTJR", "alias": "CTJR" }
            ]
        },
        {
            "name": "Tipo de Matéria",
            "terms": [
                { "term": "certificado", "alias": "certificado" },
                { "term": "certificado de conclusão", "alias": "certificado" },
                { "term": "certificado de estagio", "alias": "certificado" },
                { "term": "curso", "alias": "curso" },
                { "term": "LICENCIAMENTO A PEDIDO", "alias": "licenciamento" }
            ]
        }
    ];

    // Detectar tipo de conteúdo da página (MELHORADO)
    async function detectPageType() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || !tabs[0]) {
                    resolve({ type: 'HTML', isPDF: false, isNative: false });
                    return;
                }

                const tab = tabs[0];
                const url = tab.url || '';
                
                console.log("Detectando tipo para URL:", url);
                
                // Verificação para extensão nativa do Chrome (CASO PRINCIPAL)
                if (url.includes('chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/')) {
                    console.log("PDF detectado via extensão nativa do Chrome");
                    resolve({ 
                        type: 'PDF', 
                        isPDF: true, 
                        isNative: true,
                        originalUrl: extractOriginalURLFromChromeExtension(url),
                        url: url 
                    });
                    return;
                }
                
                // Outras verificações de PDF
                if (url.includes('chrome-extension://') && (
                    url.includes('pdf') || 
                    url.includes('viewer') ||
                    (tab.title && tab.title.toLowerCase().includes('pdf'))
                )) {
                    console.log("PDF detectado via extensão do Chrome");
                    resolve({ type: 'PDF', isPDF: true, isNative: false, url: url });
                    return;
                }
                
                if (url.toLowerCase().endsWith('.pdf')) {
                    console.log("PDF detectado via extensão .pdf");
                    resolve({ type: 'PDF', isPDF: true, isNative: false, url: url });
                    return;
                }
                
                if (url.includes('blob:') || url.includes('pdf')) {
                    console.log("PDF detectado via blob/pdf na URL"); 
                    resolve({ type: 'PDF', isPDF: true, isNative: false, url: url });
                    return;
                }

                // Tentar ping no content script para confirmação (apenas para não-nativos)
                chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("Content script não respondeu, assumindo HTML");
                        resolve({ type: 'HTML', isPDF: false, isNative: false, url: url });
                        return;
                    }

                    if (response && response.pageType) {
                        console.log("Content script confirmou tipo:", response.pageType);
                        resolve({
                            type: response.pageType,
                            isPDF: response.isPDF || false,
                            isNative: false,
                            url: response.url || url
                        });
                    } else {
                        console.log("Resposta inválida do content script, assumindo HTML");
                        resolve({ type: 'HTML', isPDF: false, isNative: false, url: url });
                    }
                });
            });
        });
    }

    // Extrair URL original da extensão do Chrome
    function extractOriginalURLFromChromeExtension(chromeExtensionUrl) {
        try {
            const match = chromeExtensionUrl.match(/chrome-extension:\/\/efaidnbmnnnibpcajpcglclefindmkaj\/(.+)/);
            if (match && match[1]) {
                return match[1];
            }
            return null;
        } catch (error) {
            console.error("Erro ao extrair URL original:", error);
            return null;
        }
    }

    // Gerar análise simulada para PDF nativo baseada na URL
    function generateNativePDFAnalysis(originalUrl, categories) {
        console.log("🎭 Gerando análise para PDF nativo baseada na URL:", originalUrl);
        
        const allResults = [];
        
        // Analisar cada categoria
        categories.forEach(category => {
            const categoryResults = [];
            
            category.terms.forEach(term => {
                let count = 0;
                
                // Buscar termos na URL original
                if (originalUrl) {
                    const searchText = originalUrl.toLowerCase();
                    const termText = term.term.toLowerCase();
                    
                    if (term.type === 'regex') {
                        try {
                            const regex = new RegExp(term.term, 'gi');
                            const matches = searchText.match(regex);
                            count = matches ? matches.length : 0;
                        } catch (e) {
                            count = 0;
                        }
                    } else {
                        // Busca simples na URL
                        if (searchText.includes(termText)) {
                            count = 1;
                        }
                    }
                }
                
                categoryResults.push({
                    term: term.term,
                    alias: term.alias,
                    type: term.type || 'text',
                    category: category.name,
                    count: count
                });
            });
            
            allResults.push(...categoryResults);
        });
        
        // Adicionar alguns resultados especiais baseados na URL
        if (originalUrl) {
            const specialResults = [];
            
            // Detectar boletim
            if (originalUrl.includes('boletim') || originalUrl.includes('Boletim')) {
                specialResults.push({
                    term: "boletim",
                    alias: "BOLETIM DETECTADO",
                    category: "📄 Análise da URL",
                    count: 1
                });
            }
            
            // Extrair código do boletim
            const boletimMatch = originalUrl.match(/codigoBoletim=(\d+)/);
            if (boletimMatch) {
                specialResults.push({
                    term: boletimMatch[1],
                    alias: `CÓDIGO BOLETIM ${boletimMatch[1]}`,
                    category: "📄 Análise da URL",
                    count: 1
                });
            }
            
            // Sistema SISP
            if (originalUrl.includes('sisp.ssp.go.gov.br')) {
                specialResults.push({
                    term: "SISP",
                    alias: "SISTEMA SISP",
                    category: "📄 Análise da URL",
                    count: 1
                });
            }
            
            allResults.push(...specialResults);
        }
        
        console.log("📊 Análise de PDF nativo gerada:", allResults.length, "resultados");
        return allResults;
    }

    // Carregar categorias (mantido igual)
    function loadCategories() {
        return new Promise((resolve) => {
            if (window.splashManager) {
                const message = isPDFContent ? "Carregando categorias (PDF)..." : "Carregando categorias...";
                window.splashManager.updateProgress(20, message);
            }
            
            chrome.storage.local.get(['categoriesData'], (data) => {
                if (data.categoriesData) {
                    try {
                        const parsed = JSON.parse(data.categoriesData);
                        categories = parsed.categories || defaultCategories;
                        
                        if (parsed.config) {
                            caseSensitive = parsed.config.caseSensitive !== undefined ? 
                                parsed.config.caseSensitive : false;
                            wholeWords = parsed.config.wholeWords !== undefined ? 
                                parsed.config.wholeWords : true;
                        }
                        
                        console.log("Categorias carregadas:", categories.length);
                        updateUISettings();
                        
                        if (window.splashManager) {
                            window.splashManager.completeTask(1, "Categorias carregadas");
                        }
                        
                        resolve(categories);
                        return;
                    } catch (e) {
                        console.error("Erro ao analisar JSON:", e);
                    }
                }
                
                categories = defaultCategories;
                updateUISettings();
                
                if (window.splashManager) {
                    window.splashManager.completeTask(1, "Usando categorias padrão");
                }
                
                resolve(categories);
            });
        });
    }

    // Atualizar configurações na UI
    function updateUISettings() {
        const caseSensitiveEl = document.getElementById('case-sensitive');
        const wholeWordsEl = document.getElementById('whole-words');
        
        if (caseSensitiveEl) caseSensitiveEl.checked = caseSensitive;
        if (wholeWordsEl) wholeWordsEl.checked = wholeWords;
    }

    // Atualizar informações da página (MELHORADO)
    async function updatePageInfo() {
        try {
            const pageData = await detectPageType();
            currentPageType = pageData.type;
            isPDFContent = pageData.isPDF;
            isNativePDF = pageData.isNative;
            
            const url = pageData.url || 'URL indisponível';
            const fileName = url.split('/').pop() || url;
            
            let displayText = '';
            if (isNativePDF) {
                displayText = `📄 PDF Nativo: ${fileName}`;
                if (pageInfoElement) {
                    pageInfoElement.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
                    pageInfoElement.style.fontWeight = 'bold';
                }
            } else if (isPDFContent) {
                displayText = `📄 PDF: ${fileName}`;
                if (pageInfoElement) {
                    pageInfoElement.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
                    pageInfoElement.style.fontWeight = 'bold';
                }
            } else {
                displayText = `🌐 Página: ${fileName}`;
                if (pageInfoElement) {
                    pageInfoElement.style.background = '';
                    pageInfoElement.style.fontWeight = '';
                }
            }
            
            if (pageInfoElement) {
                pageInfoElement.textContent = displayText;
                pageInfoElement.title = url;
            }
            
            console.log("Tipo detectado:", currentPageType, "PDF:", isPDFContent, "Nativo:", isNativePDF);
            return pageData;
        } catch (error) {
            console.error("Erro ao detectar tipo de página:", error);
            currentPageType = 'HTML';
            isPDFContent = false;
            isNativePDF = false;
            return null;
        }
    }

    // Injetar script de conteúdo (ADAPTADO)
    function injectContentScript() {
        return new Promise((resolve) => {
            // Se for PDF nativo, não tentar injetar script
            if (isNativePDF) {
                console.log("⚠️ PDF nativo detectado - não é possível injetar script");
                if (window.splashManager) {
                    window.splashManager.completeTask(0, "PDF nativo - script não necessário");
                }
                resolve(true); // Retornar sucesso pois não é erro
                return;
            }
            
            const message = isPDFContent ? 
                "Injetando analisador de PDF..." : 
                "Injetando script...";
                
            if (window.splashManager) {
                window.splashManager.updateProgress(10, message);
            }
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || !tabs.length) {
                    console.error("Nenhuma aba ativa encontrada");
                    if (window.splashManager) {
                        window.splashManager.completeTask(0, "Erro: Nenhuma aba ativa");
                    }
                    resolve(false);
                    return;
                }
                
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }).then(() => {
                    console.log("Content script injetado com sucesso");
                    if (window.splashManager) {
                        window.splashManager.completeTask(0, "Script injetado");
                    }
                    resolve(true);
                }).catch(error => {
                    console.error("Erro ao injetar script:", error);
                    if (window.splashManager) {
                        window.splashManager.completeTask(0, "Erro ao injetar script");
                    }
                    resolve(false);
                });
            });
        });
    }

    // Contar todos os termos (ADAPTADO PARA PDF NATIVO)
    async function countAllTerms() {
        console.log("Iniciando contagem para", currentPageType, isNativePDF ? "(NATIVO)" : "");
        
        const baseMessage = isNativePDF ? "PDF nativo" : 
                           isPDFContent ? "PDF" : "página";
        
        if (window.splashManager) {
            window.splashManager.updateProgress(30, `Analisando ${baseMessage}...`);
        }
        
        let allResults = [];
        
        // Se for PDF nativo, usar análise especial
        if (isNativePDF) {
            console.log("🔧 Usando análise especial para PDF nativo");
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const originalUrl = extractOriginalURLFromChromeExtension(tabs[0].url);
                allResults = generateNativePDFAnalysis(originalUrl, categories);
                
                if (window.splashManager) {
                    window.splashManager.completeTask(2, "Análise de PDF nativo concluída");
                }
                
                // Salvar e exibir resultados
                chrome.storage.local.set({ 
                    countResults: allResults,
                    lastAnalyzedType: currentPageType,
                    lastAnalyzedIsPDF: isPDFContent,
                    lastAnalyzedIsNative: isNativePDF
                }, () => {
                    updateCategorySummary(allResults);
                    displayDetailedResults(allResults);
                    displayNativePDFInterface(originalUrl);
                    
                    if (window.splashManager) {
                        window.splashManager.completeTask(3, "Resultados exibidos");
                    }
                });
            });
            
            return allResults;
        }
        
        // Análise normal para páginas não-nativas
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const terms = category.terms;
            
            if (!terms || terms.length === 0) continue;
            
            console.log(`Contando termos para categoria: ${category.name}`);
            
            if (window.splashManager) {
                const progress = 40 + Math.round((i / categories.length) * 50);
                window.splashManager.updateProgress(progress, `Contando: ${category.name}...`);
            }
            
            try {
                const results = await countWordsForCategory(category);
                if (results && results.length > 0) {
                    allResults.push(...results);
                }
            } catch (error) {
                console.error(`Erro ao contar termos para ${category.name}:`, error);
            }
        }
        
        console.log("Contagem concluída, resultados:", allResults);
        
        if (window.splashManager) {
            window.splashManager.completeTask(2, "Contagem concluída");
        }
        
        // Salvar e exibir resultados
        chrome.storage.local.set({ 
            countResults: allResults,
            lastAnalyzedType: currentPageType,
            lastAnalyzedIsPDF: isPDFContent,
            lastAnalyzedIsNative: isNativePDF
        }, () => {
            updateCategorySummary(allResults);
            displayDetailedResults(allResults);
            
            if (window.splashManager) {
                window.splashManager.completeTask(3, "Resultados exibidos");
            }
        });
        
        return allResults;
    }

    // Contar palavras para uma categoria (mantido original)
    function countWordsForCategory(category) {
        return new Promise((resolve, reject) => {
            const terms = category.terms;
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs || !tabs[0]) {
                    reject(new Error("Nenhuma aba ativa encontrada"));
                    return;
                }
                
                const timeout = isPDFContent ? 30000 : 10000;
                
                const timeoutId = setTimeout(() => {
                    reject(new Error("Timeout na análise"));
                }, timeout);
                
                const message = {
                    terms: terms,
                    category: category.name,
                    caseSensitive: caseSensitive,
                    wholeWords: wholeWords,
                    isPDF: isPDFContent
                };
                
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    clearTimeout(timeoutId);
                    
                    if (chrome.runtime.lastError) {
                        console.error("Erro ao comunicar com script:", chrome.runtime.lastError);
                        reject(new Error(`Erro de comunicação: ${chrome.runtime.lastError.message}`));
                        return;
                    }
                    
                    if (response && response.error) {
                        console.error("Erro retornado pelo content script:", response.error);
                        reject(new Error(response.error));
                        return;
                    }
                    
                    if (response && response.counts) {
                        console.log(`Resultados para ${category.name}:`, response.counts.length, "termos");
                        resolve(response.counts);
                    } else if (response && response.contagens) {
                        console.log(`Convertendo formato antigo para ${category.name}`);
                        
                        const counts = terms.map((term, index) => {
                            return {
                                term: term.term,
                                alias: term.alias,
                                type: term.type || 'text',
                                category: category.name,
                                count: response.contagens[index] || 0
                            };
                        });
                        
                        resolve(counts);
                    } else {
                        console.warn("Resposta inesperada:", response);
                        reject(new Error("Formato de resposta inválido"));
                    }
                });
            });
        });
    }

    // Exibir interface especial para PDF nativo
    function displayNativePDFInterface(originalUrl) {
        const specialMessage = document.createElement('div');
        specialMessage.className = 'native-pdf-notice';
        specialMessage.innerHTML = `
            <div class="native-pdf-header">
                <i class="fas fa-info-circle"></i>
                <h3>PDF na Extensão Nativa do Chrome</h3>
            </div>
            <div class="native-pdf-content">
                <p>📄 Este PDF está sendo visualizado pela extensão nativa do Chrome.</p>
                <p>🔧 A análise acima é baseada na URL original do documento.</p>
                <p>💡 Para análise completa do conteúdo, você pode:</p>
                <ul>
                    <li>✅ Baixar o PDF e abrir diretamente no Chrome</li>
                    <li>✅ Usar Ctrl+A para copiar todo o texto e analisar manualmente</li>
                    <li>✅ Abrir a URL original em nova aba</li>
                </ul>
                ${originalUrl ? `<p><strong>📎 URL Original:</strong> <span class="original-url">${originalUrl}</span></p>` : ''}
            </div>
            <div class="native-pdf-actions">
                <button onclick="copyOriginalURL()" class="pdf-action-btn">
                    <i class="fas fa-copy"></i> Copiar URL Original
                </button>
                <button onclick="openOriginalURL()" class="pdf-action-btn">
                    <i class="fas fa-external-link-alt"></i> Abrir URL Original
                </button>
            </div>
        `;
        
        // Inserir no início do container
        if (detailedResultsContainer) {
            detailedResultsContainer.insertBefore(specialMessage, detailedResultsContainer.firstChild);
        }
        
        // Adicionar estilos
        if (!document.getElementById('native-pdf-styles')) {
            const styles = document.createElement('style');
            styles.id = 'native-pdf-styles';
            styles.textContent = `
                .native-pdf-notice {
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .native-pdf-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .native-pdf-header i {
                    color: #856404;
                    font-size: 18px;
                }
                .native-pdf-header h3 {
                    margin: 0;
                    color: #856404;
                    font-size: 16px;
                }
                .native-pdf-content p {
                    margin: 8px 0;
                    color: #856404;
                    font-size: 14px;
                }
                .native-pdf-content ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .native-pdf-content li {
                    margin: 5px 0;
                    color: #856404;
                    font-size: 14px;
                }
                .original-url {
                    word-break: break-all;
                    font-family: monospace;
                    background: rgba(0,0,0,0.1);
                    padding: 2px 4px;
                    border-radius: 3px;
                }
                .native-pdf-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                .pdf-action-btn {
                    background: #ffc107;
                    color: #856404;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .pdf-action-btn:hover {
                    background: #e0a800;
                    transform: translateY(-1px);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Funções para botões da interface nativa
    window.copyOriginalURL = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const originalUrl = extractOriginalURLFromChromeExtension(tabs[0].url);
            if (originalUrl) {
                navigator.clipboard.writeText(originalUrl).then(() => {
                    console.log("✅ URL original copiada:", originalUrl);
                    const btn = document.querySelector('button[onclick="copyOriginalURL()"]');
                    if (btn) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                        }, 2000);
                    }
                });
            }
        });
    };

    window.openOriginalURL = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const originalUrl = extractOriginalURLFromChromeExtension(tabs[0].url);
            if (originalUrl) {
                chrome.tabs.create({ url: originalUrl });
            }
        });
    };

    // Resto das funções (updateCategorySummary, displayDetailedResults, etc.) 
    // mantidas iguais ao código anterior...
    
    // Exibir resumo por categoria (mantido)
    function updateCategorySummary(results) {
        if (!categorySummary) return;
        
        categorySummary.innerHTML = '';
        
        if (!results || results.length === 0) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'category-card';
            emptyCard.innerHTML = `
                <div class="category-name">Total</div>
                <div class="category-value">0</div>
            `;
            categorySummary.appendChild(emptyCard);
            return;
        }
        
        const categoryTotals = {};
        results.forEach(item => {
            const category = item.category || 'Sem categoria';
            const count = parseInt(item.count) || 0;
            
            if (categoryTotals[category]) {
                categoryTotals[category] += count;
            } else {
                categoryTotals[category] = count;
            }
        });
        
        for (const [category, total] of Object.entries(categoryTotals)) {
            const card = document.createElement('div');
            card.className = 'category-card';
            
            const typeIcon = isNativePDF ? '📄🔧' : isPDFContent ? '📄' : '🌐';
            
            card.innerHTML = `
                <div class="category-name">${typeIcon} ${category}</div>
                <div class="category-value">${total}</div>
            `;
            
            if (isNativePDF) {
                card.style.borderLeftColor = '#ffc107';
                card.style.backgroundColor = '#fff3cd';
            } else if (isPDFContent) {
                card.style.borderLeftColor = '#ff6b6b';
                card.style.backgroundColor = '#fff5f5';
            }
            
            categorySummary.appendChild(card);
        }
        
        const totalGeral = Object.values(categoryTotals).reduce((sum, count) => sum + count, 0);
        const totalCard = document.createElement('div');
        totalCard.className = 'category-card';
        totalCard.style.backgroundColor = '#f0f4ff';
        totalCard.style.borderLeftColor = '#46c93a';
        
        const typeText = isNativePDF ? 'PDF Nativo' : isPDFContent ? 'PDF' : 'Página';
        totalCard.innerHTML = `
            <div class="category-name">Total ${typeText}</div>
            <div class="category-value">${totalGeral}</div>
        `;
        categorySummary.appendChild(totalCard);
    }

    // Exibir resultados detalhados (mantido)
    function displayDetailedResults(results) {
        if (!detailedResultsContainer) return;
        
        // Não limpar se já temos interface nativa
        if (!isNativePDF) {
            detailedResultsContainer.innerHTML = '';
        }
        
        if (!results || results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <p>Nenhum resultado encontrado neste ${isNativePDF ? 'PDF nativo' : isPDFContent ? 'PDF' : 'documento'}.</p>
            `;
            detailedResultsContainer.appendChild(noResults);
            return;
        }
        
        // Adicionar cabeçalho (apenas se não for nativo)
        if (!isNativePDF) {
            const header = document.createElement('div');
            header.className = 'results-header';
            header.innerHTML = `
                <div class="results-type-info">
                    <i class="fas fa-${isPDFContent ? 'file-pdf' : 'globe'}"></i>
                    <span>Resultados extraídos de: ${isPDFContent ? 'Documento PDF' : 'Página Web'}</span>
                </div>
            `;
            detailedResultsContainer.appendChild(header);
        }
        
        // Processar e exibir resultados (lógica mantida)
        const categorizedResults = {};
        results.forEach(item => {
            if (!categorizedResults[item.category]) {
                categorizedResults[item.category] = [];
            }
            categorizedResults[item.category].push(item);
        });
        
        // Resto da lógica de exibição mantida igual...
        for (const [categoryName, categoryResults] of Object.entries(categorizedResults)) {
            const aliasGroups = {};
            
            categoryResults.forEach(result => {
                const alias = result.alias;
                const term = result.term;
                const count = parseInt(result.count) || 0;
                const type = result.type || 'text';
                
                if (!aliasGroups[alias]) {
                    aliasGroups[alias] = {
                        totalCount: 0,
                        terms: []
                    };
                }
                
                aliasGroups[alias].totalCount += count;
                aliasGroups[alias].terms.push({
                    term: term,
                    count: count,
                    type: type
                });
            });
            
            const categoryTotal = Object.values(aliasGroups).reduce((sum, item) => sum + item.totalCount, 0);
            
            const categoryTable = document.createElement('div');
            categoryTable.className = 'category-table';
            
            const tableHeader = document.createElement('div');
            tableHeader.className = 'category-table-header';
            const typeIcon = isNativePDF ? '📄🔧' : isPDFContent ? '📄' : '🌐';
            tableHeader.innerHTML = `
                <div>${typeIcon} ${categoryName}</div>
                <div>${categoryTotal}</div>
            `;
            categoryTable.appendChild(tableHeader);
            
            let rowIndex = 0;
            for (const [alias, data] of Object.entries(aliasGroups)) {
                const row = document.createElement('div');
                row.className = 'table-row';
                rowIndex++;
                
                const nameCell = document.createElement('div');
                nameCell.className = 'term-name';
                
                const hasMultipleTerms = data.terms.length > 1;
                const hasNonMatchingTerm = data.terms.some(t => t.term !== alias);
                const hasRegex = data.terms.some(t => t.type === 'regex');
                
                if (hasMultipleTerms || hasNonMatchingTerm || hasRegex) {
                    let badgeHtml = '';
                    if (hasRegex) {
                        badgeHtml = '<span class="regex-badge" title="Expressão Regular">RE</span>';
                    }
                    
                    nameCell.innerHTML = `${alias} ${badgeHtml} <span class="term-toggle" data-row="${rowIndex}"><i class="fas fa-chevron-down"></i></span>`;
                } else {
                    nameCell.textContent = alias;
                }
                
                const countCell = document.createElement('div');
                countCell.className = 'term-count';
                countCell.textContent = data.totalCount;
                
                row.appendChild(nameCell);
                row.appendChild(countCell);
                categoryTable.appendChild(row);
                
                if (hasMultipleTerms || hasNonMatchingTerm || hasRegex) {
                    const detailsRow = document.createElement('div');
                    detailsRow.className = 'term-details';
                    detailsRow.dataset.for = rowIndex;
                    
                    let detailsContent = '<div class="term-details-list">';
                    data.terms.forEach(termData => {
                        const isRegex = termData.type === 'regex';
                        const regexClass = isRegex ? 'regex-term' : '';
                        const regexBadge = isRegex ? '<span class="regex-badge-small" title="Expressão Regular">RE</span>' : '';
                        
                        detailsContent += `
                            <div class="term-detail-item ${regexClass}">
                                <div class="term-detail-name">${termData.term} ${regexBadge}</div>
                                <div class="term-detail-count">${termData.count}</div>
                            </div>
                        `;
                    });
                    detailsContent += '</div>';
                    
                    detailsRow.innerHTML = detailsContent;
                    categoryTable.appendChild(detailsRow);
                }
            }
            
            const totalRow = document.createElement('div');
            totalRow.className = 'category-total';
            totalRow.innerHTML = `
                <div>Total</div>
                <div>${categoryTotal}</div>
            `;
            categoryTable.appendChild(totalRow);
            
            detailedResultsContainer.appendChild(categoryTable);
        }
        
        // Adicionar eventos de toggle
        document.querySelectorAll('.term-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const rowIndex = toggle.dataset.row;
                const detailsRow = document.querySelector(`.term-details[data-for="${rowIndex}"]`);
                
                if (detailsRow) {
                    detailsRow.classList.toggle('expanded');
                    toggle.classList.toggle('expanded');
                }
            });
        });
    }

    // Event listeners (mantidos)
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log("Iniciando atualização completa");
            
            try {
                await updatePageInfo();
                await loadCategories();
                
                if (!isNativePDF) {
                    const injected = await injectContentScript();
                    if (!injected) {
                        throw new Error("Falha ao injetar script");
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                await countAllTerms();
                
            } catch (error) {
                console.error("Erro na atualização:", error);
                alert(`Erro na atualização: ${error.message}`);
            }
        });
    }

    const applyBtn = document.getElementById('apply-settings');
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const caseSensitiveEl = document.getElementById('case-sensitive');
            const wholeWordsEl = document.getElementById('whole-words');
            
            if (caseSensitiveEl) caseSensitive = caseSensitiveEl.checked;
            if (wholeWordsEl) wholeWords = wholeWordsEl.checked;
            
            console.log("Configurações atualizadas:", { caseSensitive, wholeWords });
            
            try {
                if (!isNativePDF) {
                    await injectContentScript();
                }
                await countAllTerms();
            } catch (error) {
                console.error("Erro ao aplicar configurações:", error);
            }
        });
    }

    // Inicialização
    async function initialize() {
        console.log("Inicializando popup com detecção de PDF nativo");
        
        try {
            await updatePageInfo();
            
            if (!window.splashManager) {
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        setTimeout(resolve, 500);
                    } else {
                        window.addEventListener('load', () => setTimeout(resolve, 500));
                    }
                });
            }
            
            if (splashSubtitle) {
                const message = isNativePDF ? 
                    "Analisando PDF nativo do Chrome..." :
                    isPDFContent ? 
                    "Inicializando analisador de PDF..." : 
                    "Iniciando análise da página...";
                splashSubtitle.textContent = message;
            }
            
            await injectContentScript(); // Retorna true mesmo para PDFs nativos
            await loadCategories();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            chrome.storage.local.get(['countResults', 'lastAnalyzedType', 'lastAnalyzedIsPDF', 'lastAnalyzedIsNative'], (data) => {
                if (data.countResults && data.countResults.length > 0 && 
                    data.lastAnalyzedType === currentPageType && 
                    data.lastAnalyzedIsPDF === isPDFContent &&
                    data.lastAnalyzedIsNative === isNativePDF) {
                    console.log("Carregando resultados salvos do mesmo tipo");
                    updateCategorySummary(data.countResults);
                    displayDetailedResults(data.countResults);
                    if (isNativePDF) {
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            const originalUrl = extractOriginalURLFromChromeExtension(tabs[0].url);
                            displayNativePDFInterface(originalUrl);
                        });
                    }
                } else {
                    console.log("Iniciando nova contagem para", currentPageType);
                    countAllTerms().catch(error => {
                        console.error("Erro na contagem inicial:", error);
                    });
                }
            });
            
        } catch (error) {
            console.error("Erro na inicialização:", error);
            await loadCategories();
            updateCategorySummary([]);
            displayDetailedResults([]);
        }
    }

    // Iniciar
    initialize();
});