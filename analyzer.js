// analyzer.js - Versão compatível com CSP

document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo analisador SEI/RG carregado (compatível com CSP)");
    
    // Elementos DOM
    const runAnalysisBtn = document.getElementById('run-analysis-btn');
    const clearAnalysisBtn = document.getElementById('clear-analysis-btn');
    const analysisStatus = document.getElementById('analysis-status');
    const analysisResults = document.getElementById('analysis-results');
    
    // Verificar se temos todos os elementos necessários
    if (!runAnalysisBtn || !clearAnalysisBtn || !analysisStatus || !analysisResults) {
        console.error("Elementos do analisador não encontrados!");
        return;
    }
    
    // Configuração
    const CONFIG = {
        // Padrão para processos SEI (2025 + 11 dígitos)
        seiPattern: "2025\\d{11}",
        
        // Padrão para RG militar (exatamente 5 dígitos, começa com 2-4, com ou sem pontos)
        rgPattern: "\\b(?:[2-4][0-9]{4}|[2-4]\\.[0-9]{1}\\.[0-9]{1}\\.[0-9]{2}|[2-4]\\.[0-9]{2}\\.[0-9]{2}|[2-4]\\.[0-9]{1}\\.[0-9]{3}|[2-4]\\.[0-9]{3}\\.?[0-9]{1})\\b",
        
        // Texto que indica que não é necessário SEI
        exemptionText: "(SEM ALTERAÇÃO)",
        
        // Seletor CSS para as tabelas de certificados/processos
        tableSelector: "table.frm-borda[bgcolor='#99ccff'], table.frm-borda[bgcolor='#99CCFF']",
        
        // Cores para os diferentes status
        colors: {
            hasSei: "#4a6fff",        // Azul
            missingSei: "#ff9500",    // Laranja
            hasRg: "#ff3b30",         // Vermelho
            success: "#34c759",       // Verde
            exempt: "#8e8e93"         // Cinza (para SEM ALTERAÇÃO)
        }
    };
    
    // Botão de execução de análise
    runAnalysisBtn.addEventListener('click', () => {
        executeAnalysis();
    });
    
    // Botão de limpar análise
    clearAnalysisBtn.addEventListener('click', () => {
        clearAnalysis();
    });
    
    // Executar análise de SEI e RG
  // Atualize apenas a parte de execução do analyzer.js
// Mantenha todo o resto (incluindo a interface do usuário)

// Executar análise de SEI e RG
function executeAnalysis() {
    console.log("Iniciando análise de SEI e RG");
    
    analysisStatus.textContent = "Iniciando análise...";
    analysisStatus.className = "analysis-status-running";
    analysisResults.innerHTML = "";
    
    // Injetar o script completo como um arquivo separado
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) {
            showError("Erro: Nenhuma aba ativa encontrada");
            return;
        }
        
        // Solução mais simples: usar chrome.scripting.executeScript com uma função autocontida
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: function() {
                // Esta função contém todo o código necessário em um único bloco
                // para evitar problemas de escopo
                
                // Configuração
                const CONFIG = {
                    seiPattern: "2025\\d{11}",
                    rgPattern: "\\b(?:[2-4][0-9]{4}|[2-4]\\.[0-9]{1}\\.[0-9]{1}\\.[0-9]{2}|[2-4]\\.[0-9]{2}\\.[0-9]{2}|[2-4]\\.[0-9]{1}\\.[0-9]{3}|[2-4]\\.[0-9]{3}\\.?[0-9]{1})\\b",
                    exemptionText: "(SEM ALTERAÇÃO)",
                    tableSelector: "table.frm-borda[bgcolor='#99ccff'], table.frm-borda[bgcolor='#99CCFF']",
                    colors: {
                        hasSei: "#4a6fff",
                        missingSei: "#ff9500",
                        hasRg: "#ff3b30",
                        success: "#34c759",
                        exempt: "#8e8e93"
                    }
                };
                
                // TODAS AS FUNÇÕES NECESSÁRIAS AGORA ESTÃO DEFINIDAS DENTRO DESTA FUNÇÃO PRINCIPAL
                
                // Analisar tabelas para SEI e RG
                function analyzeTablesForSEI(tables) {
                    const results = {
                        total: tables.length,
                        hasSei: [],
                        missingSei: [],
                        exempt: [],
                        hasRg: [],
                        all: []
                    };
                    
                    // Expressões regulares
                    const seiRegex = new RegExp(CONFIG.seiPattern, "g");
                    const rgRegex = new RegExp(CONFIG.rgPattern, "g");
                    const exemptRegex = new RegExp(CONFIG.exemptionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
                    
                    // Analisar cada tabela
                    tables.forEach((table, index) => {
                        // Identificar a tabela com um ID único se não tiver
                        const tableId = table.id || `table-${index}`;
                        if (!table.id) {
                            table.id = tableId;
                        }
                        
                        // Obter texto da tabela
                        const tableText = table.innerText || table.textContent;
                        
                        // Verificar se é uma tabela isenta (SEM ALTERAÇÃO)
                        const isExempt = exemptRegex.test(tableText);
                        
                        // Verificar se contém número SEI
                        let seiMatches = [];
                        let hasSei = false;
                        let seiMatch;
                        
                        seiRegex.lastIndex = 0; // Resetar o índice
                        while ((seiMatch = seiRegex.exec(tableText)) !== null) {
                            hasSei = true;
                            seiMatches.push({
                                number: seiMatch[0],
                                position: seiMatch.index
                            });
                        }
                        
                        // Verificar se contém RGs militares
                        let rgMatches = [];
                        let hasRg = false;
                        let rgMatch;
                        
                        rgRegex.lastIndex = 0; // Resetar o índice
                        while ((rgMatch = rgRegex.exec(tableText)) !== null) {
                            // Verificar se tem exatamente 5 dígitos
                            const digitCount = rgMatch[0].replace(/\./g, '').length;
                            if (digitCount === 5) {
                                hasRg = true;
                                rgMatches.push({
                                    number: rgMatch[0],
                                    position: rgMatch.index
                                });
                            }
                        }
                        
                        // Extrair informações importantes da tabela
                        const infoExtracted = extractTableInfo(table);
                        
                        // Armazenar resultado desta tabela
                        const tableResult = {
                            id: tableId,
                            index: index,
                            element: table,
                            text: tableText.substring(0, 100) + (tableText.length > 100 ? "..." : ""),
                            fullText: tableText,
                            hasSei: hasSei,
                            seiNumbers: seiMatches,
                            hasRg: hasRg,
                            rgNumbers: rgMatches,
                            isExempt: isExempt,
                            info: infoExtracted
                        };
                        
                        // Adicionar às categorias apropriadas
                        results.all.push(tableResult);
                        
                        if (isExempt) {
                            results.exempt.push(tableResult);
                        } else if (hasSei) {
                            results.hasSei.push(tableResult);
                        } else {
                            results.missingSei.push(tableResult);
                        }
                        
                        if (hasRg) {
                            results.hasRg.push(tableResult);
                        }
                    });
                    
                    // Estatísticas
                    results.stats = {
                        total: results.total,
                        withSei: results.hasSei.length,
                        missingSei: results.missingSei.length,
                        exempt: results.exempt.length,
                        withRg: results.hasRg.length,
                        required: results.total - results.exempt.length,  // Total excluindo isentos
                        completionRate: ((results.hasSei.length / (results.total - results.exempt.length || 1)) * 100).toFixed(1) + "%"
                    };
                    
                    return results;
                }
                
                // Extrair informações importantes da tabela
                function extractTableInfo(table) {
                    const text = table.innerText || table.textContent;
                    
                    // Extrair nome e patente
                    const nameMatch = text.match(/([0-9º]º\s+\w+)\s+([^,]+)/i);
                    const name = nameMatch ? nameMatch[2].trim() : "Não identificado";
                    const rank = nameMatch ? nameMatch[1].trim() : "";
                    
                    // Extrair unidade/batalhão
                    const unitMatch = text.match(/([0-9]+º\s+(?:BATALHÃO|BPM|CRPM|CIPM)[^,)]*)/i);
                    const unit = unitMatch ? unitMatch[1].trim() : "";
                    
                    // Extrair curso/certificado
                    const courseMatch = text.match(/CURSO\s+DE\s+([^,]+)/i) || 
                                      text.match(/CERTIFICADO\s+DO\s+CURSO\s+([^,]+)/i);
                    const course = courseMatch ? courseMatch[1].trim() : "";
                    
                    // Extrair número do processo ou último número na tabela
                    const processMatch = text.match(/PROCESSO\s+(?:SEI\s+)?(?:Nº\s+)?([0-9]+)/i);
                    const processNumber = processMatch ? processMatch[1] : "";
                    
                    // Extrair última sigla encontrada
                    const siglaMatches = text.match(/\b[A-Z]{2,}\b/g);
                    const lastSigla = siglaMatches ? siglaMatches[siglaMatches.length - 1] : "";
                    
                    return {
                        name: name,
                        rank: rank, 
                        unit: unit,
                        course: course,
                        processNumber: processNumber,
                        lastSigla: lastSigla
                    };
                }
                
                // Aplicar destaque visual
                function applyHighlighting(results) {
                    // Adicionar CSS para os destaques
                    addHighlightStyles();
                    
                    // Destacar tabelas com SEI
                    results.hasSei.forEach(item => {
                        const table = item.element;
                        table.classList.add('sei-table-with-sei');
                        
                        // Adicionar badge
                        addTableBadge(table, "SEI", CONFIG.colors.hasSei);
                    });
                    
                    // Destacar tabelas sem SEI (exceto isentas)
                    results.missingSei.forEach(item => {
                        const table = item.element;
                        table.classList.add('sei-table-missing-sei');
                        
                        // Adicionar badge
                        addTableBadge(table, `SEM SEI (${item.info.lastSigla})`, CONFIG.colors.missingSei);
                    });
                    
                    // Destacar tabelas com SEM ALTERAÇÃO
                    results.exempt.forEach(item => {
                        const table = item.element;
                        table.classList.add('sei-table-exempt');
                        
                        // Adicionar badge
                        addTableBadge(table, "SEM ALTERAÇÃO", CONFIG.colors.exempt);
                    });
                    
                    // Destacar tabelas com RG
                    results.hasRg.forEach(item => {
                        const table = item.element;
                        table.classList.add('sei-table-with-rg');
                        
                        // Adicionar badge
                        if (!table.querySelector('.sei-table-badge[data-type="RG"]')) {
                            addTableBadge(table, "RG EXPOSTO", CONFIG.colors.hasRg);
                        }
                    });
                    
                    // Destacar números SEI e RG no texto
                    highlightTextPatterns(CONFIG.seiPattern, 'sei-highlight');
                    highlightTextPatterns(CONFIG.rgPattern, 'rg-highlight', node => {
                        // Verificar se tem exatamente 5 dígitos para RG
                        const digitCount = node.textContent.replace(/\./g, '').length;
                        return digitCount === 5;
                    });
                    
                    return true;
                }
                
                // Adicionar estilos CSS
                function addHighlightStyles() {
                    // Remover estilos existentes
                    const existingStyle = document.getElementById('sei-analyzer-styles');
                    if (existingStyle) {
                        existingStyle.remove();
                    }
                    
                    // Criar novo elemento de estilo
                    const style = document.createElement('style');
                    style.id = 'sei-analyzer-styles';
                    style.textContent = `
                        /* Estilos para tabelas */
                        .sei-table-with-sei {
                            border: 2px solid ${CONFIG.colors.hasSei} !important;
                            position: relative;
                        }
                        
                        .sei-table-missing-sei {
                            border: 2px solid ${CONFIG.colors.missingSei} !important;
                            position: relative;
                        }
                        
                        .sei-table-with-rg {
                            border: 2px solid ${CONFIG.colors.hasRg} !important;
                            position: relative;
                        }
                        
                        .sei-table-exempt {
                            border: 2px solid ${CONFIG.colors.exempt} !important;
                            position: relative;
                        }
                        
                        /* Badges de tabela */
                        .sei-table-badge {
                            position: absolute;
                            top: -10px;
                            right: 10px;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: bold;
                            color: white;
                            z-index: 100;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                            font-family: Arial, sans-serif;
                        }
                        
                        /* Destaques de texto */
                        .sei-highlight {
                            background-color: rgba(74, 111, 255, 0.2);
                            border: 1px solid ${CONFIG.colors.hasSei};
                            border-radius: 3px;
                            padding: 1px 3px;
                            font-weight: bold;
                        }
                        
                        .rg-highlight {
                            background-color: rgba(255, 59, 48, 0.2);
                            border: 1px solid ${CONFIG.colors.hasRg};
                            border-radius: 3px;
                            padding: 1px 3px;
                            font-weight: bold;
                        }
                        
                        /* Painel de navegação */
                        .sei-navigation-panel {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            width: 300px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            z-index: 9999;
                            max-height: 80vh;
                            overflow-y: auto;
                            font-family: Arial, sans-serif;
                            transition: all 0.3s ease;
                        }
                        
                        .sei-nav-header {
                            background: #4a6fff;
                            color: white;
                            padding: 10px 15px;
                            border-radius: 8px 8px 0 0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            cursor: move;
                        }
                        
                        .sei-nav-title {
                            font-weight: bold;
                            font-size: 14px;
                        }
                        
                        .sei-nav-controls {
                            display: flex;
                            gap: 8px;
                        }
                        
                        .sei-nav-button {
                            background: none;
                            border: none;
                            color: white;
                            cursor: pointer;
                            padding: 2px;
                        }
                        
                        .sei-nav-content {
                            padding: 10px;
                        }
                        
                        .sei-nav-list {
                            list-style-type: none;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .sei-nav-item {
                            padding: 8px 10px;
                            border-bottom: 1px solid #eee;
                            font-size: 12px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        
                        .sei-nav-item:hover {
                            background: #f5f8ff;
                        }
                        
                        .sei-nav-item:last-child {
                            border-bottom: none;
                        }
                        
                        .sei-nav-badge {
                            font-size: 10px;
                            padding: 2px 6px;
                            border-radius: 10px;
                            color: white;
                            font-weight: bold;
                            min-width: 16px;
                            text-align: center;
                        }
                        
                        .sei-nav-status {
                            padding: 10px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            background: #f5f5f5;
                            border-radius: 0 0 8px 8px;
                        }
                        
                        .sei-restore-button {
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            width: 50px;
                            height: 50px;
                            border-radius: 25px;
                            background: #4a6fff;
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                            z-index: 9999;
                            font-size: 20px;
                            font-weight: bold;
                            display: none;
                        }
                        
                        /* Tema escuro */
                        @media (prefers-color-scheme: dark) {
                            .sei-navigation-panel {
                                background: #333;
                                color: #eee;
                            }
                            
                            .sei-nav-item {
                                border-bottom: 1px solid #444;
                            }
                            
                            .sei-nav-item:hover {
                                background: #444;
                            }
                            
                            .sei-nav-status {
                                background: #444;
                                color: #ddd;
                            }
                        }
                    `;
                    
                    document.head.appendChild(style);
                }
                
                // Adicionar badge à tabela
                function addTableBadge(table, text, color) {
                    // Verificar se já existe uma badge com este texto
                    const existingBadge = Array.from(table.querySelectorAll('.sei-table-badge'))
                        .find(badge => badge.textContent === text);
                    
                    if (existingBadge) return;
                    
                    // Criar badge
                    const badge = document.createElement('div');
                    badge.className = 'sei-table-badge';
                    badge.textContent = text;
                    badge.style.backgroundColor = color;
                    badge.dataset.type = text.split(' ')[0]; // SEI, SEM, RG
                    
                    // Adicionar à tabela
                    table.style.position = 'relative';
                    table.appendChild(badge);
                }
                
                // Destacar padrões de texto
                function highlightTextPatterns(pattern, className, validationFunc = null) {
                    const regex = new RegExp(pattern, "g");
                    
                    // Função para processar nós de texto
                    function processNode(node) {
                        if (node.nodeType === 3) { // Nó de texto
                            const text = node.textContent;
                            if (regex.test(text)) {
                                // Resetar o lastIndex
                                regex.lastIndex = 0;
                                
                                // Criar um wrapper
                                const wrapper = document.createElement('span');
                                
                                // Construir o novo conteúdo com destaques
                                let lastIndex = 0;
                                let parts = [];
                                let match;
                                
                                while ((match = regex.exec(text)) !== null) {
                                    // Se houver uma função de validação, verificar se o match é válido
                                    if (validationFunc) {
                                        const tempNode = document.createElement('span');
                                        tempNode.textContent = match[0];
                                        if (!validationFunc(tempNode)) continue;
                                    }
                                    
                                    // Adicionar o texto antes do match
                                    if (match.index > lastIndex) {
                                        parts.push(document.createTextNode(
                                            text.substring(lastIndex, match.index)
                                        ));
                                    }
                                    
                                    // Criar o elemento destacado
                                    const highlight = document.createElement('span');
                                    highlight.className = className;
                                    highlight.textContent = match[0];
                                    
                                    parts.push(highlight);
                                    
                                    lastIndex = match.index + match[0].length;
                                }
                                
                                // Adicionar o texto restante
                                if (lastIndex < text.length) {
                                    parts.push(document.createTextNode(
                                        text.substring(lastIndex)
                                    ));
                                }
                                
                                // Adicionar partes ao wrapper
                                parts.forEach(part => wrapper.appendChild(part));
                                
                                // Substituir o nó de texto pelo wrapper
                                node.parentNode.replaceChild(wrapper, node);
                                
                                return true;
                            }
                        } 
                        else if (node.nodeType === 1 && 
                                node.nodeName !== 'SCRIPT' && 
                                node.nodeName !== 'STYLE' &&
                                !node.classList.contains(className)) {
                            // Processar filhos
                            Array.from(node.childNodes).forEach(processNode);
                        }
                        
                        return false;
                    }
                    
                    try {
                        processNode(document.body);
                        return true;
                    } catch (error) {
                        console.error(`Erro ao destacar ${className}:`, error);
                        return false;
                    }
                }
                
                // Criar painel de navegação
                function createNavigationPanel(results) {
                    // Remover painel existente
                    const existingPanel = document.getElementById('sei-navigation-panel');
                    if (existingPanel) {
                        existingPanel.remove();
                    }
                    
                    const existingButton = document.getElementById('sei-restore-button');
                    if (existingButton) {
                        existingButton.remove();
                    }
                    
                    // Criar painel
                    const panel = document.createElement('div');
                    panel.className = 'sei-navigation-panel';
                    panel.id = 'sei-navigation-panel';
                    
                    // Cabeçalho
                    panel.innerHTML = `
                        <div class="sei-nav-header" id="sei-nav-header">
                            <div class="sei-nav-title">DOPM Intelligence - Problemas Encontrados</div>
                            <div class="sei-nav-controls">
                                <button class="sei-nav-button" id="sei-nav-minimize" title="Minimizar">_</button>
                                <button class="sei-nav-button" id="sei-nav-close" title="Fechar">×</button>
                            </div>
                        </div>
                        
                        <div class="sei-nav-content">
                            <ul class="sei-nav-list" id="sei-nav-list">
                                ${createNavigationItems(results)}
                            </ul>
                        </div>
                        
                        <div class="sei-nav-status">
                            Problemas: ${results.missingSei.length + results.hasRg.length} | Sem SEI: ${results.missingSei.length} | RGs expostos: ${results.hasRg.length}
                        </div>
                    `;
                    
                    // Adicionar ao documento
                    document.body.appendChild(panel);
                    
                    // Adicionar evento para restaurar o painel quando minimizado
                    const restoreButton = document.createElement('div');
                    restoreButton.className = 'sei-restore-button';
                    restoreButton.id = 'sei-restore-button';
                    restoreButton.innerHTML = '↑';
                    restoreButton.title = 'Restaurar painel de navegação';
                    restoreButton.style.display = 'none';
                    
                    restoreButton.addEventListener('click', () => {
                        panel.style.display = 'block';
                        restoreButton.style.display = 'none';
                    });
                    
                    document.body.appendChild(restoreButton);
                    
                    // Configurar eventos
                    setupNavigationEvents(panel, restoreButton, results);
                    
                    return panel;
                }
                
                // Criar itens de navegação
                function createNavigationItems(results) {
                    // Filtrar para mostrar apenas itens com problemas (sem SEI ou com RG)
                    const filteredItems = results.all.filter(item => {
                        // Se não tem SEI (exceto os isentos) ou tem RG, mostrar no painel
                        return (!item.hasSei && !item.isExempt) || item.hasRg;
                    });
                    
                    // Se não houver itens com problemas, mostrar uma mensagem
                    if (filteredItems.length === 0) {
                        return `
                            <li class="sei-nav-item sei-item-info">
                                <div class="sei-nav-item-text" style="text-align: center; width: 100%;">
                                    Nenhum problema encontrado! 🎉
                                </div>
                            </li>
                        `;
                    }
                    
                    return filteredItems.map((item) => {
                        // Determinar classe e badge baseado nos status
                        let badgeText = '';
                        let badgeColor = '';
                        let itemClass = '';
                        
                        if (!item.hasSei) {
                            badgeText = 'SEM SEI';
                            badgeColor = CONFIG.colors.missingSei;
                            itemClass = 'missing';
                        } else if (item.hasRg) {
                            badgeText = 'RG';
                            badgeColor = CONFIG.colors.hasRg;
                            itemClass = 'rg';
                        }
                        
                        // Extrair nome para exibição
                        let displayName = `${item.info.rank} ${item.info.name}`.trim();
                        if (!displayName || displayName === 'Não identificado') {
                            // Tentar extrair algo que identifique o item
                            displayName = item.text.substring(0, 50) + '...';
                        }
                        
                        return `
                            <li class="sei-nav-item sei-item-${itemClass}" data-id="${item.id}" data-index="${item.index}">
                                <div class="sei-nav-item-text">
                                    <a href="#${item.id}">${displayName}</a>
                                </div>
                                <div class="sei-nav-badge" style="background: ${badgeColor};">${badgeText}</div>
                            </li>
                        `;
                    }).join('');
                }
                
                // Configurar eventos do painel de navegação
                function setupNavigationEvents(panel, restoreButton, results) {
                    // Evento de fechar
                    const closeButton = document.getElementById('sei-nav-close');
                    if (closeButton) {
                        closeButton.addEventListener('click', () => {
                            panel.remove();
                            restoreButton.remove();
                        });
                    }
                    
                    // Evento de minimizar
                    const minimizeButton = document.getElementById('sei-nav-minimize');
                    if (minimizeButton) {
                        minimizeButton.addEventListener('click', () => {
                            panel.style.display = 'none';
                            restoreButton.style.display = 'flex';
                        });
                    }
                    
                    // Eventos de clique em itens para rolar até eles
                    const navItems = panel.querySelectorAll('.sei-nav-item');
                    navItems.forEach(item => {
                        item.addEventListener('click', (e) => {
                            // Não interromper o comportamento de âncora
                            if (e.target.tagName.toLowerCase() !== 'a') {
                                const id = item.dataset.id;
                                const targetElement = document.getElementById(id);
                                
                                if (targetElement) {
                                    // Rolar até o elemento
                                    targetElement.scrollIntoView({
                                        behavior: 'smooth', 
                                        block: 'center'
                                    });
                                    
                                    // Destacar temporariamente
                                    const originalBg = targetElement.style.backgroundColor;
                                    targetElement.style.backgroundColor = '#ffff99';
                                    setTimeout(() => {
                                        targetElement.style.backgroundColor = originalBg;
                                    }, 2000);
                                }
                            }
                        });
                    });
                    
                    // Fazer o painel arrastável
                    makeElementDraggable(panel, document.getElementById('sei-nav-header'));
                }
                
                // Função para tornar um elemento arrastável
                function makeElementDraggable(element, handle) {
                    if (!element || !handle) return;
                    
                    let offsetX = 0;
                    let offsetY = 0;
                    let isDragging = false;
                    
                    handle.addEventListener('mousedown', startDrag);
                    
                    function startDrag(e) {
                        e.preventDefault();
                        
                        // Obter a posição inicial
                        offsetX = e.clientX - element.getBoundingClientRect().left;
                        offsetY = e.clientY - element.getBoundingClientRect().top;
                        isDragging = true;
                        
                        // Adicionar eventos temporários
                        document.addEventListener('mousemove', dragElement);
                        document.addEventListener('mouseup', stopDrag);
                    }
                    
                    function dragElement(e) {
                        if (!isDragging) return;
                        
                        // Calcular nova posição
                        const x = e.clientX - offsetX;
                        const y = e.clientY - offsetY;
                        
                        // Limitar ao viewport
                        const maxX = window.innerWidth - element.offsetWidth;
                        const maxY = window.innerHeight - element.offsetHeight;
                        
                        const limitedX = Math.max(0, Math.min(x, maxX));
                        const limitedY = Math.max(0, Math.min(y, maxY));
                        
                        // Definir nova posição
                        element.style.left = limitedX + 'px';
                        element.style.top = limitedY + 'px';
                    }
                    
                    function stopDrag() {
                        isDragging = false;
                        document.removeEventListener('mousemove', dragElement);
                        document.removeEventListener('mouseup', stopDrag);
                    }
                }
                
                // Remover destaques
                function removeHighlights() {
                    // Remover classes e badges das tabelas
                    document.querySelectorAll('.sei-table-with-sei, .sei-table-missing-sei, .sei-table-with-rg, .sei-table-exempt').forEach(table => {
                        table.classList.remove('sei-table-with-sei', 'sei-table-missing-sei', 'sei-table-with-rg', 'sei-table-exempt');
                        
                        // Remover badges
                        table.querySelectorAll('.sei-table-badge').forEach(badge => badge.remove());
                    });
                    
                    // Remover destaques de texto
                    document.querySelectorAll('.sei-highlight, .rg-highlight').forEach(el => {
                        const parent = el.parentNode;
                        parent.replaceChild(document.createTextNode(el.textContent), el);
                        parent.normalize();
                    });
                    
                    // Remover painel de navegação
                    const panel = document.getElementById('sei-navigation-panel');
                    if (panel) {
                        panel.remove();
                    }
                    
                    const restoreButton = document.getElementById('sei-restore-button');
                    if (restoreButton) {
                        restoreButton.remove();
                    }
                    
                    // Remover estilos
                    const style = document.getElementById('sei-analyzer-styles');
                    if (style) {
                        style.remove();
                    }
                    
                    console.log("%c🗑️ Todos os destaques foram removidos", "color: #999;");
                    return true;
                }
                
                // INÍCIO DA EXECUÇÃO PRINCIPAL
                
                // 1. Localizar todas as tabelas relevantes
                const tables = document.querySelectorAll(CONFIG.tableSelector);
                console.log(`Encontradas ${tables.length} tabelas para análise`);
                
                if (tables.length === 0) {
                    console.log("Nenhuma tabela encontrada na página");
                    return { status: "error", message: "Nenhuma tabela encontrada" };
                }
                
                // 2. Analisar cada tabela
                const results = analyzeTablesForSEI(tables);
                
                // 3. Aplicar destaques visuais
                applyHighlighting(results);
                
                // 4. Criar painel de navegação
                createNavigationPanel(results);
                
                // Definir função para remover destaques globalmente
                window.removeHighlights = removeHighlights;
                
                // Retornar resultados
                return results;
            }
        }).then((results) => {
            console.log("Resultados da análise:", results);
            
            if (results && results[0] && results[0].result) {
                const analysisData = results[0].result;
                
                // Atualizar status
                analysisStatus.textContent = `Análise concluída: ${analysisData.stats.withSei}/${analysisData.stats.required} necessários (${analysisData.stats.completionRate})`;
                analysisStatus.className = "analysis-status-complete";
                
                // Exibir resumo na interface
                displayAnalysisResults(analysisData);
            } else {
                showError("Não foi possível obter resultados da análise");
            }
        }).catch((error) => {
            console.error("Erro ao executar análise:", error);
            showError(`Erro ao executar análise: ${error.message}`);
        });
    });
}
    
    // Limpar análise atual
    function clearAnalysis() {
        analysisStatus.textContent = "Análise limpa";
        analysisStatus.className = "analysis-status-normal";
        analysisResults.innerHTML = "";
        
        // Limpar destaques na página
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0]) return;
            
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: limparDestaques
            });
        });
    }
    
    // Exibir resultados da análise
    function displayAnalysisResults(results) {
        analysisStatus.textContent = `Análise concluída: ${results.stats.withSei}/${results.stats.required} necessários (${results.stats.completionRate})`;
        analysisStatus.className = "analysis-status-complete";
        
        // Construir HTML de resultados
        let resultsHTML = `
            <div class="analyzer-summary">
                <div class="analyzer-stat" style="border-color: ${CONFIG.colors.hasSei}">
                    <div class="analyzer-stat-value">${results.stats.withSei}</div>
                    <div class="analyzer-stat-label">Com SEI</div>
                </div>
                <div class="analyzer-stat" style="border-color: ${CONFIG.colors.missingSei}">
                    <div class="analyzer-stat-value">${results.stats.missingSei}</div>
                    <div class="analyzer-stat-label">Sem SEI</div>
                </div>
                <div class="analyzer-stat" style="border-color: ${CONFIG.colors.exempt}">
                    <div class="analyzer-stat-value">${results.stats.exempt}</div>
                    <div class="analyzer-stat-label">SEM ALTERAÇÃO</div>
                </div>
                <div class="analyzer-stat" style="border-color: ${CONFIG.colors.hasRg}">
                    <div class="analyzer-stat-value">${results.stats.withRg}</div>
                    <div class="analyzer-stat-label">RG Exposto</div>
                </div>
            </div>
        `;
        
        // Criar seções detalhadas
        if (results.missingSei.length > 0) {
            resultsHTML += `
                <div class="analyzer-section">
                    <div class="analyzer-section-header" style="background-color: ${CONFIG.colors.missingSei}">
                        <span>Tabelas sem SEI (${results.missingSei.length})</span>
                    </div>
                    <div class="analyzer-section-content">
                        <ul class="analyzer-list">
                            ${results.missingSei.map((item, i) => `
                                <li>${item.info.rank} ${item.info.name} - ${item.info.course || item.info.unit || ""}
                                <span class="analyzer-detail-sigla">${item.info.lastSigla || ""}</span></li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        if (results.hasRg.length > 0) {
            resultsHTML += `
                <div class="analyzer-section">
                    <div class="analyzer-section-header" style="background-color: ${CONFIG.colors.hasRg}">
                        <span>RGs Expostos (${results.hasRg.length})</span>
                    </div>
                    <div class="analyzer-section-content">
                        <ul class="analyzer-list">
                            ${results.hasRg.map((item, i) => `
                                <li>${item.info.rank} ${item.info.name} - ${item.rgNumbers.map(r => r.number).join(", ")}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // Atualizar conteúdo
        analysisResults.innerHTML = resultsHTML;
    }
    
    // Exibir mensagem de erro
    function showError(message) {
        analysisStatus.textContent = message;
        analysisStatus.className = "analysis-status-error";
        analysisResults.innerHTML = `
            <div class="analyzer-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <p class="analyzer-error-help">Tente usar o método alternativo: copie o código do console e execute diretamente.</p>
                <button id="show-console-code" class="analyzer-button" style="margin-top: 15px;">
                    <i class="fas fa-terminal"></i> Mostrar Código para Console
                </button>
            </div>
        `;
        
        // Adicionar evento para mostrar o código do console
        setTimeout(() => {
            const showCodeBtn = document.getElementById('show-console-code');
            if (showCodeBtn) {
                showCodeBtn.addEventListener('click', showConsoleCode);
            }
        }, 100);
    }
    
    // Mostrar código para o console
    function showConsoleCode() {
        analysisResults.innerHTML = `
            <div class="analyzer-code-container">
                <h4>Copie o código abaixo e cole no console do navegador:</h4>
                <div class="analyzer-code-box">
                    <pre style="white-space: pre-wrap; font-size: 12px; background: #f5f5f5; padding: 10px; max-height: 300px; overflow: auto; border-radius: 4px;">
// Código do analisador (versão para console)
(function() {
    console.clear();
    console.log("%c🔍 ANÁLISE DE SEI E RG - EXECUÇÃO DIRETA", "font-size: 16px; font-weight: bold; color: #4a6fff;");
    
    // Configuração
    const CONFIG = {
        seiPattern: "2025\\\\d{11}",
        rgPattern: "\\\\b(?:[2-4][0-9]{4}|[2-4]\\\\.[0-9]{1}\\\\.[0-9]{1}\\\\.[0-9]{2}|[2-4]\\\\.[0-9]{2}\\\\.[0-9]{2}|[2-4]\\\\.[0-9]{1}\\\\.[0-9]{3}|[2-4]\\\\.[0-9]{3}\\\\.?[0-9]{1})\\\\b",
        exemptionText: "(SEM ALTERAÇÃO)",
        tableSelector: "table.frm-borda[bgcolor='#99ccff'], table.frm-borda[bgcolor='#99CCFF']",
        colors: { hasSei: "#4a6fff", missingSei: "#ff9500", hasRg: "#ff3b30", success: "#34c759", exempt: "#8e8e93" }
    };

    // 1. Localizar tabelas
    const tables = document.querySelectorAll(CONFIG.tableSelector);
    if (tables.length === 0) {
        alert("Nenhuma tabela encontrada na página do DOPM");
        return;
    }
    
    // O código completo estaria aqui...
    alert("Encontradas " + tables.length + " tabelas! Para a versão completa do script, consulte a documentação ou entre em contato com o suporte.");
})();
                    </pre>
                </div>
                <button id="back-to-results" class="analyzer-button" style="margin-top: 15px;">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
        `;
        
        // Adicionar evento para voltar
        setTimeout(() => {
            const backBtn = document.getElementById('back-to-results');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    showError("Tente usar o método alternativo: copie o código do console e execute diretamente.");
                });
            }
        }, 100);
    }
});

// Funções que serão injetadas e executadas na página

// Função principal de análise
function analisarSEI(config) {
    // Localizar tabelas
    const tables = document.querySelectorAll(config.tableSelector);
    console.log(`Encontradas ${tables.length} tabelas para análise`);
    
    if (tables.length === 0) {
        return {
            status: "error",
            message: "Nenhuma tabela encontrada"
        };
    }
    
    // Analisar tabelas
    const results = analyzeTablesForSEI(tables, config);
    
    // Aplicar destaques visuais
    applyHighlighting(results, config);
    
    // Criar painel de navegação
    createNavigationPanel(results, config);
    
    // Definir função para remover destaques
    window.removeHighlights = function() {
        removeHighlights(config);
    };
    
    return results;
}

// Analisar tabelas para SEI e RG
function analyzeTablesForSEI(tables, config) {
    const results = {
        total: tables.length,
        hasSei: [],
        missingSei: [],
        exempt: [],
        hasRg: [],
        all: []
    };
    
    // Expressões regulares
    const seiRegex = new RegExp(config.seiPattern, "g");
    const rgRegex = new RegExp(config.rgPattern, "g");
    const exemptRegex = new RegExp(config.exemptionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    
    // Analisar cada tabela
    tables.forEach((table, index) => {
        // Identificar a tabela com um ID único se não tiver
        const tableId = table.id || `table-${index}`;
        if (!table.id) {
            table.id = tableId;
        }
        
        // Obter texto da tabela
        const tableText = table.innerText || table.textContent;
        
        // Verificar se é uma tabela isenta (SEM ALTERAÇÃO)
        const isExempt = exemptRegex.test(tableText);
        
        // Verificar se contém número SEI
        let seiMatches = [];
        let hasSei = false;
        let seiMatch;
        
        seiRegex.lastIndex = 0; // Resetar o índice
        while ((seiMatch = seiRegex.exec(tableText)) !== null) {
            hasSei = true;
            seiMatches.push({
                number: seiMatch[0],
                position: seiMatch.index
            });
        }
        
        // Verificar se contém RGs militares
        let rgMatches = [];
        let hasRg = false;
        let rgMatch;
        
        rgRegex.lastIndex = 0; // Resetar o índice
        while ((rgMatch = rgRegex.exec(tableText)) !== null) {
            // Verificar se tem exatamente 5 dígitos
            const digitCount = rgMatch[0].replace(/\./g, '').length;
            if (digitCount === 5) {
                hasRg = true;
                rgMatches.push({
                    number: rgMatch[0],
                    position: rgMatch.index
                });
            }
        }
        
        // Extrair informações importantes da tabela
        const infoExtracted = extractTableInfo(table);
        
        // Armazenar resultado desta tabela
        const tableResult = {
            id: tableId,
            index: index,
            element: table,
            text: tableText.substring(0, 100) + (tableText.length > 100 ? "..." : ""),
            fullText: tableText,
            hasSei: hasSei,
            seiNumbers: seiMatches,
            hasRg: hasRg,
            rgNumbers: rgMatches,
            isExempt: isExempt,
            info: infoExtracted
        };
        
        // Adicionar às categorias apropriadas
        results.all.push(tableResult);
        
        if (isExempt) {
            results.exempt.push(tableResult);
        } else if (hasSei) {
            results.hasSei.push(tableResult);
        } else {
            results.missingSei.push(tableResult);
        }
        
        if (hasRg) {
            results.hasRg.push(tableResult);
        }
    });
    
    // Estatísticas
    results.stats = {
        total: results.total,
        withSei: results.hasSei.length,
        missingSei: results.missingSei.length,
        exempt: results.exempt.length,
        withRg: results.hasRg.length,
        required: results.total - results.exempt.length,  // Total excluindo isentos
        completionRate: ((results.hasSei.length / (results.total - results.exempt.length || 1)) * 100).toFixed(1) + "%"
    };
    
    return results;
}

// Extrair informações importantes da tabela
function extractTableInfo(table) {
    const text = table.innerText || table.textContent;
    
    // Extrair nome e patente
    const nameMatch = text.match(/([0-9º]º\s+\w+)\s+([^,]+)/i);
    const name = nameMatch ? nameMatch[2].trim() : "Não identificado";
    const rank = nameMatch ? nameMatch[1].trim() : "";
    
    // Extrair unidade/batalhão
    const unitMatch = text.match(/([0-9]+º\s+(?:BATALHÃO|BPM|CRPM|CIPM)[^,)]*)/i);
    const unit = unitMatch ? unitMatch[1].trim() : "";
    
    // Extrair curso/certificado
    const courseMatch = text.match(/CURSO\s+DE\s+([^,]+)/i) || 
                      text.match(/CERTIFICADO\s+DO\s+CURSO\s+([^,]+)/i);
    const course = courseMatch ? courseMatch[1].trim() : "";
    
    // Extrair número do processo ou último número na tabela
    const processMatch = text.match(/PROCESSO\s+(?:SEI\s+)?(?:Nº\s+)?([0-9]+)/i);
    const processNumber = processMatch ? processMatch[1] : "";
    
    // Extrair última sigla encontrada
    const siglaMatches = text.match(/\b[A-Z]{2,}\b/g);
    const lastSigla = siglaMatches ? siglaMatches[siglaMatches.length - 1] : "";
    
    return {
        name: name,
        rank: rank, 
        unit: unit,
        course: course,
        processNumber: processNumber,
        lastSigla: lastSigla
    };
}

// Aplicar destaque visual
function applyHighlighting(results, config) {
    // Adicionar CSS para os destaques
    addHighlightStyles(config);
    
    // Destacar tabelas com SEI
    results.hasSei.forEach(item => {
        const table = item.element;
        table.classList.add('sei-table-with-sei');
        
        // Adicionar badge
        addTableBadge(table, "SEI", config.colors.hasSei);
    });
    
    // Destacar tabelas sem SEI (exceto isentas)
    results.missingSei.forEach(item => {
        const table = item.element;
        table.classList.add('sei-table-missing-sei');
        
        // Adicionar badge
        addTableBadge(table, `SEM SEI (${item.info.lastSigla})`, config.colors.missingSei);
    });
    
    // Destacar tabelas com SEM ALTERAÇÃO
    results.exempt.forEach(item => {
        const table = item.element;
        table.classList.add('sei-table-exempt');
        
        // Adicionar badge
        addTableBadge(table, "SEM ALTERAÇÃO", config.colors.exempt);
    });
    
    // Destacar tabelas com RG
    results.hasRg.forEach(item => {
        const table = item.element;
        table.classList.add('sei-table-with-rg');
        
        // Adicionar badge
        if (!table.querySelector('.sei-table-badge[data-type="RG"]')) {
            addTableBadge(table, "RG EXPOSTO", config.colors.hasRg);
        }
    });
    
    // Destacar números SEI e RG no texto
    highlightTextPatterns(config.seiPattern, 'sei-highlight', config);
    highlightTextPatterns(config.rgPattern, 'rg-highlight', config, node => {
        // Verificar se tem exatamente 5 dígitos para RG
        const digitCount = node.textContent.replace(/\./g, '').length;
        return digitCount === 5;
    });
    
    return true;
}

// Adicionar estilos CSS
function addHighlightStyles(config) {
    // Remover estilos existentes
    const existingStyle = document.getElementById('sei-analyzer-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Criar novo elemento de estilo
    const style = document.createElement('style');
    style.id = 'sei-analyzer-styles';
    style.textContent = `
        /* Estilos para tabelas */
        .sei-table-with-sei {
            border: 2px solid ${config.colors.hasSei} !important;
            position: relative;
        }
        
        .sei-table-missing-sei {
            border: 2px solid ${config.colors.missingSei} !important;
            position: relative;
        }
        
        .sei-table-with-rg {
            border: 2px solid ${config.colors.hasRg} !important;
            position: relative;
        }
        
        .sei-table-exempt {
            border: 2px solid ${config.colors.exempt} !important;
            position: relative;
        }
        
        /* Badges de tabela */
        .sei-table-badge {
            position: absolute;
            top: -10px;
            right: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            color: white;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        }
        
        /* Destaques de texto */
        .sei-highlight {
            background-color: rgba(74, 111, 255, 0.2);
            border: 1px solid ${config.colors.hasSei};
            border-radius: 3px;
            padding: 1px 3px;
            font-weight: bold;
        }
        
        .rg-highlight {
            background-color: rgba(255, 59, 48, 0.2);
            border: 1px solid ${config.colors.hasRg};
            border-radius: 3px;
            padding: 1px 3px;
            font-weight: bold;
        }
        
        /* Painel de navegação */
        .sei-navigation-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-height: 80vh;
            overflow-y: auto;
            font-family: Arial, sans-serif;
            transition: all 0.3s ease;
        }
        
        .sei-nav-header {
            background: #4a6fff;
            color: white;
            padding: 10px 15px;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        
        .sei-nav-title {
            font-weight: bold;
            font-size: 14px;
        }
        
        .sei-nav-controls {
            display: flex;
            gap: 8px;
        }
        
        .sei-nav-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px;
        }
        
        .sei-nav-content {
            padding: 10px;
        }
        
        .sei-nav-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        
        .sei-nav-item {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .sei-nav-item:hover {
            background: #f5f8ff;
        }
        
        .sei-nav-item:last-child {
            border-bottom: none;
        }
        
        .sei-nav-badge {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            min-width: 16px;
            text-align: center;
        }
        
        .sei-nav-status {
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #666;
            background: #f5f5f5;
            border-radius: 0 0 8px 8px;
        }
        
        .sei-restore-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 25px;
            background: #4a6fff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            font-size: 20px;
            font-weight: bold;
            display: none;
        }
        
        /* Tema escuro */
        @media (prefers-color-scheme: dark) {
            .sei-navigation-panel {
                background: #333;
                color: #eee;
            }
            
            .sei-nav-item {
                border-bottom: 1px solid #444;
            }
            
            .sei-nav-item:hover {
                background: #444;
            }
            
            .sei-nav-status {
                background: #444;
                color: #ddd;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Adicionar badge à tabela
function addTableBadge(table, text, color) {
    // Verificar se já existe uma badge com este texto
    const existingBadge = Array.from(table.querySelectorAll('.sei-table-badge'))
        .find(badge => badge.textContent === text);
    
    if (existingBadge) return;
    
    // Criar badge
    const badge = document.createElement('div');
    badge.className = 'sei-table-badge';
    badge.textContent = text;
    badge.style.backgroundColor = color;
    badge.dataset.type = text.split(' ')[0]; // SEI, SEM, RG
    
    // Adicionar à tabela
    table.style.position = 'relative';
    table.appendChild(badge);
}

// Destacar padrões de texto
function highlightTextPatterns(pattern, className, config, validationFunc = null) {
    const regex = new RegExp(pattern, "g");
    
    // Função para processar nós de texto
    function processNode(node) {
        if (node.nodeType === 3) { // Nó de texto
            const text = node.textContent;
            if (regex.test(text)) {
                // Resetar o lastIndex
                regex.lastIndex = 0;
                
                // Criar um wrapper
                const wrapper = document.createElement('span');
                
                // Construir o novo conteúdo com destaques
                let lastIndex = 0;
                let parts = [];
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    // Se houver uma função de validação, verificar se o match é válido
                    if (validationFunc) {
                        const tempNode = document.createElement('span');
                        tempNode.textContent = match[0];
                        if (!validationFunc(tempNode)) continue;
                    }
                    
                    // Adicionar o texto antes do match
                    if (match.index > lastIndex) {
                        parts.push(document.createTextNode(
                            text.substring(lastIndex, match.index)
                        ));
                    }
                    
                    // Criar o elemento destacado
                    const highlight = document.createElement('span');
                    highlight.className = className;
                    highlight.textContent = match[0];
                    
                    parts.push(highlight);
                    
                    lastIndex = match.index + match[0].length;
                }
                
                // Adicionar o texto restante
                if (lastIndex < text.length) {
                    parts.push(document.createTextNode(
                        text.substring(lastIndex)
                    ));
                }
                
                // Adicionar partes ao wrapper
                parts.forEach(part => wrapper.appendChild(part));
                
                // Substituir o nó de texto pelo wrapper
                node.parentNode.replaceChild(wrapper, node);
                
                return true;
            }
        } 
        else if (node.nodeType === 1 && 
                node.nodeName !== 'SCRIPT' && 
                node.nodeName !== 'STYLE' &&
                !node.classList.contains(className)) {
            // Processar filhos
            Array.from(node.childNodes).forEach(processNode);
        }
        
        return false;
    }
    
    try {
        processNode(document.body);
        return true;
    } catch (error) {
        console.error(`Erro ao destacar ${className}:`, error);
        return false;
    }
}

// Criar painel de navegação
function createNavigationPanel(results, config) {
    // Remover painel existente
    const existingPanel = document.getElementById('sei-navigation-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const existingButton = document.getElementById('sei-restore-button');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Criar painel
    const panel = document.createElement('div');
    panel.className = 'sei-navigation-panel';
    panel.id = 'sei-navigation-panel';
    
    // Cabeçalho
    panel.innerHTML = `
        <div class="sei-nav-header" id="sei-nav-header">
            <div class="sei-nav-title">DOPM Intelligence - Problemas Encontrados</div>
            <div class="sei-nav-controls">
                <button class="sei-nav-button" id="sei-nav-minimize" title="Minimizar">_</button>
                <button class="sei-nav-button" id="sei-nav-close" title="Fechar">×</button>
            </div>
        </div>
        
        <div class="sei-nav-content">
            <ul class="sei-nav-list" id="sei-nav-list">
                ${createNavigationItems(results, config)}
            </ul>
        </div>
        
        <div class="sei-nav-status">
            Problemas: ${results.missingSei.length + results.hasRg.length} | Sem SEI: ${results.missingSei.length} | RGs expostos: ${results.hasRg.length}
        </div>
    `;
    
    // Adicionar ao documento
    document.body.appendChild(panel);
    
    // Adicionar evento para restaurar o painel quando minimizado
    const restoreButton = document.createElement('div');
    restoreButton.className = 'sei-restore-button';
    restoreButton.id = 'sei-restore-button';
    restoreButton.innerHTML = '↑';
    restoreButton.title = 'Restaurar painel de navegação';
    restoreButton.style.display = 'none';
    
    restoreButton.addEventListener('click', () => {
        panel.style.display = 'block';
        restoreButton.style.display = 'none';
    });
    
    document.body.appendChild(restoreButton);
    
    // Configurar eventos
    setupNavigationEvents(panel, restoreButton, results);
    
    return panel;
}

// Criar itens de navegação
function createNavigationItems(results, config) {
    // Filtrar para mostrar apenas itens com problemas (sem SEI ou com RG)
    const filteredItems = results.all.filter(item => {
        // Se não tem SEI (exceto os isentos) ou tem RG, mostrar no painel
        return (!item.hasSei && !item.isExempt) || item.hasRg;
    });
    
    // Se não houver itens com problemas, mostrar uma mensagem
    if (filteredItems.length === 0) {
        return `
            <li class="sei-nav-item sei-item-info">
                <div class="sei-nav-item-text" style="text-align: center; width: 100%;">
                    Nenhum problema encontrado! 🎉
                </div>
            </li>
        `;
    }
    
    return filteredItems.map((item) => {
        // Determinar classe e badge baseado nos status
        let badgeText = '';
        let badgeColor = '';
        let itemClass = '';
        
        if (!item.hasSei) {
            badgeText = 'SEM SEI';
            badgeColor = config.colors.missingSei;
            itemClass = 'missing';
        } else if (item.hasRg) {
            badgeText = 'RG';
            badgeColor = config.colors.hasRg;
            itemClass = 'rg';
        }
        
        // Extrair nome para exibição
        let displayName = `${item.info.rank} ${item.info.name}`.trim();
        if (!displayName || displayName === 'Não identificado') {
            // Tentar extrair algo que identifique o item
            displayName = item.text.substring(0, 50) + '...';
        }
        
        return `
            <li class="sei-nav-item sei-item-${itemClass}" data-id="${item.id}" data-index="${item.index}">
                <div class="sei-nav-item-text">
                    <a href="#${item.id}">${displayName}</a>
                </div>
                <div class="sei-nav-badge" style="background: ${badgeColor};">${badgeText}</div>
            </li>
        `;
    }).join('');
}

// Configurar eventos do painel de navegação
function setupNavigationEvents(panel, restoreButton, results) {
    // Evento de fechar
    const closeButton = document.getElementById('sei-nav-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            panel.remove();
            restoreButton.remove();
        });
    }
    
    // Evento de minimizar
    const minimizeButton = document.getElementById('sei-nav-minimize');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            panel.style.display = 'none';
            restoreButton.style.display = 'flex';
        });
    }
    
    // Eventos de clique em itens para rolar até eles
    const navItems = panel.querySelectorAll('.sei-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Não interromper o comportamento de âncora
            if (e.target.tagName.toLowerCase() !== 'a') {
                const id = item.dataset.id;
                const targetElement = document.getElementById(id);
                
                if (targetElement) {
                    // Rolar até o elemento
                    targetElement.scrollIntoView({
                        behavior: 'smooth', 
                        block: 'center'
                    });
                    
                    // Destacar temporariamente
                    const originalBg = targetElement.style.backgroundColor;
                    targetElement.style.backgroundColor = '#ffff99';
                    setTimeout(() => {
                        targetElement.style.backgroundColor = originalBg;
                    }, 2000);
                }
            }
        });
    });
    
    // Fazer o painel arrastável
    makeElementDraggable(panel, document.getElementById('sei-nav-header'));
}

// Função para tornar um elemento arrastável
function makeElementDraggable(element, handle) {
    if (!element || !handle) return;
    
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    
    handle.addEventListener('mousedown', startDrag);
    
    function startDrag(e) {
        e.preventDefault();
        
        // Obter a posição inicial
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        isDragging = true;
        
        // Adicionar eventos temporários
        document.addEventListener('mousemove', dragElement);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function dragElement(e) {
        if (!isDragging) return;
        
        // Calcular nova posição
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Limitar ao viewport
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        
        const limitedX = Math.max(0, Math.min(x, maxX));
        const limitedY = Math.max(0, Math.min(y, maxY));
        
        // Definir nova posição
        element.style.left = limitedX + 'px';
        element.style.top = limitedY + 'px';
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', dragElement);
        document.removeEventListener('mouseup', stopDrag);
    }
}

// Função para limpar todos os destaques e painéis
function limparDestaques() {
    // Remover classes e badges das tabelas
    document.querySelectorAll('.sei-table-with-sei, .sei-table-missing-sei, .sei-table-with-rg, .sei-table-exempt').forEach(table => {
        table.classList.remove('sei-table-with-sei', 'sei-table-missing-sei', 'sei-table-with-rg', 'sei-table-exempt');
        
        // Remover badges
        table.querySelectorAll('.sei-table-badge').forEach(badge => badge.remove());
    });
    
    // Remover destaques de texto
    document.querySelectorAll('.sei-highlight, .rg-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
    
    // Remover painel de navegação
    const panel = document.getElementById('sei-navigation-panel');
    if (panel) {
        panel.remove();
    }
    
    const restoreButton = document.getElementById('sei-restore-button');
    if (restoreButton) {
        restoreButton.remove();
    }
    
    // Remover estilos
    const style = document.getElementById('sei-analyzer-styles');
    if (style) {
        style.remove();
    }
    
    console.log("Todos os destaques foram removidos");
    return true;
}

// Função auxiliar para remover destaques - para uso global
function removeHighlights(config) {
    return limparDestaques();
}