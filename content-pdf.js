// Content Script Melhorado para PDFs Locais - DOPM Intelligence v2.2
console.log("content.js carregado com suporte aprimorado para PDFs locais! (Versão 2.2)");

// Detectar tipo de conteúdo
const isPDF = detectPDFContent();
const pageType = isPDF ? 'PDF' : 'HTML';

console.log(`Tipo de conteúdo detectado: ${pageType}`);
console.log("URL atual:", window.location.href);

// Variável para cache de texto extraído
let cachedText = null;
let lastExtractionTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Listener para receber mensagens do popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Mensagem recebida:", request, "Tipo de página:", pageType);

    // Responder com informações sobre o tipo de página
    if (request.action === 'ping') {
        sendResponse({ 
            status: 'active', 
            version: '2.2', 
            features: ['regex', 'aliases', 'categories', 'pdf', 'local-files'],
            pageType: pageType,
            isPDF: isPDF,
            url: window.location.href
        });
        return true;
    }

    // Processar solicitação de contagem
    if (request.palavras || request.terms) {
        handleCountRequest(request, sendResponse);
        return true; // Indica resposta assíncrona
    }

    // Formato de mensagem inválido
    console.error("Formato da mensagem inválido:", request);
    sendResponse({ contagens: [], counts: [], error: "Formato inválido" });
    return true;
});

// Detectar se o conteúdo é um PDF (MELHORADO)
function detectPDFContent() {
    try {
        const url = window.location.href;
        
        console.log("🔍 Detectando tipo de conteúdo para:", url);
        
        // Método 1: Arquivo local .pdf
        if (url.startsWith('file:///') && url.toLowerCase().endsWith('.pdf')) {
            console.log("PDF detectado: arquivo local .pdf");
            return true;
        }
        
        // Método 2: Extensão nativa do Chrome
        if (url.includes('chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/')) {
            console.log("PDF detectado: extensão nativa do Chrome");
            return true;
        }
        
        // Método 3: Outras extensões de PDF
        if (url.includes('chrome-extension://') && (
            url.includes('pdf') || 
            url.includes('viewer') ||
            document.title.toLowerCase().includes('pdf')
        )) {
            console.log("PDF detectado: extensão do Chrome");
            return true;
        }
        
        // Método 4: URL .pdf
        if (url.toLowerCase().endsWith('.pdf')) {
            console.log("PDF detectado: URL .pdf");
            return true;
        }
        
        // Método 5: Verificar embed
        if (document.querySelector('embed[type="application/pdf"]')) {
            console.log("PDF detectado: embed tag");
            return true;
        }
        
        // Método 6: PDF.js
        if (window.PDFViewerApplication || document.getElementById('viewer')) {
            console.log("PDF detectado: PDF.js");
            return true;
        }
        
        // Método 7: Estrutura DOM típica de PDF
        if (document.querySelector('#viewer') || 
            document.querySelector('.page') || 
            document.querySelector('#viewerContainer') ||
            document.querySelector('.textLayer')) {
            console.log("PDF detectado: estrutura DOM");
            return true;
        }
        
        // Método 8: Meta content-type
        const metaContentType = document.querySelector('meta[http-equiv="content-type"]');
        if (metaContentType && metaContentType.content.includes('application/pdf')) {
            console.log("PDF detectado: meta tag");
            return true;
        }
        
        // Método 9: Blob URLs
        if (url.includes('blob:') && document.title.toLowerCase().includes('pdf')) {
            console.log("PDF detectado: blob URL");
            return true;
        }
        
        console.log("Não é PDF - detectado como HTML");
        return false;
    } catch (error) {
        console.error("Erro na detecção de PDF:", error);
        return false;
    }
}

// Processar solicitação de contagem
async function handleCountRequest(request, sendResponse) {
    try {
        console.log("🔄 Processando solicitação de contagem...");
        
        let texto = '';
        
        // Verificar cache primeiro
        const now = Date.now();
        if (cachedText && (now - lastExtractionTime) < CACHE_DURATION) {
            console.log("📋 Usando texto em cache");
            texto = cachedText;
        } else {
            console.log("🔍 Extraindo texto fresco...");
            
            if (isPDF) {
                console.log("📄 Extraindo texto de PDF...");
                texto = await extractPDFTextImproved();
            } else {
                console.log("🌐 Extraindo texto de página HTML...");
                texto = extractHTMLText();
            }
            
            // Cache do texto extraído
            cachedText = texto;
            lastExtractionTime = now;
        }
        
        if (!texto || texto.trim().length === 0) {
            throw new Error("Não foi possível extrair texto da página");
        }
        
        console.log(`✅ Texto extraído (${pageType}): ${texto.length} caracteres`);
        console.log("📋 Primeiros 200 caracteres:", texto.substring(0, 200));
        
        // Processar formato original (lista de palavras)
        if (request.palavras && Array.isArray(request.palavras)) {
            const result = await processSimpleWords(request.palavras, texto);
            sendResponse(result);
            return;
        }
        
        // Processar formato novo (termos com aliases e regex)
        if (request.terms && Array.isArray(request.terms)) {
            const result = await processTermsWithAliases(request, texto);
            sendResponse(result);
            return;
        }
        
        throw new Error("Formato de solicitação não reconhecido");
        
    } catch (error) {
        console.error("❌ Erro ao processar solicitação:", error);
        sendResponse({ 
            contagens: [], 
            counts: [], 
            error: error.message,
            pageType: pageType,
            extractedLength: cachedText ? cachedText.length : 0
        });
    }
}

// Extrair texto de página HTML
function extractHTMLText() {
    try {
        return document.body.innerText || document.body.textContent || '';
    } catch (error) {
        console.error("Erro ao extrair texto HTML:", error);
        return '';
    }
}

// Extrair texto de PDF com múltiplas estratégias MELHORADAS
async function extractPDFTextImproved() {
    console.log("🔍 Iniciando extração melhorada de texto do PDF...");
    
    const strategies = [
        { name: "Seleção Global", func: extractByGlobalSelection },
        { name: "Elementos de Texto", func: extractFromTextElements },
        { name: "PDF.js", func: extractFromPDFJS },
        { name: "Análise de Canvas", func: extractFromCanvasAnalysis },
        { name: "Estrutura DOM", func: extractFromDOMStructure },
        { name: "Fallback Geral", func: extractFallback }
    ];
    
    for (const strategy of strategies) {
        try {
            console.log(`🧪 Tentando estratégia: ${strategy.name}`);
            
            const result = await strategy.func();
            
            if (result && result.length > 50) { // Mínimo de 50 caracteres
                console.log(`✅ Sucesso com ${strategy.name}: ${result.length} caracteres`);
                return result;
            } else {
                console.log(`❌ ${strategy.name} produziu resultado insuficiente: ${result ? result.length : 0} caracteres`);
            }
        } catch (error) {
            console.warn(`⚠️ Falha na estratégia ${strategy.name}:`, error.message);
        }
    }
    
    throw new Error("Todas as estratégias de extração falharam");
}

// Estratégia 1: Seleção global
async function extractByGlobalSelection() {
    return new Promise((resolve) => {
        try {
            console.log("🔍 Tentando seleção global...");
            
            // Salvar seleção atual
            const currentSelection = window.getSelection().toString();
            
            // Selecionar tudo
            const selection = window.getSelection();
            selection.selectAllChildren(document.body);
            
            // Aguardar um pouco para a seleção se estabelecer
            setTimeout(() => {
                const text = selection.toString();
                selection.removeAllRanges();
                
                // Restaurar seleção se havia alguma
                if (currentSelection) {
                    // Não há forma simples de restaurar, mas limpar é ok
                }
                
                resolve(text.trim());
            }, 100);
            
        } catch (error) {
            console.error("Erro na seleção global:", error);
            resolve('');
        }
    });
}

// Estratégia 2: Elementos de texto específicos
async function extractFromTextElements() {
    try {
        console.log("🔍 Procurando elementos de texto específicos...");
        
        const selectors = [
            '.textLayer span',
            '.page .textLayer span',
            '.textLayer div',
            '[data-text]',
            '.textLayer',
            '.page span',
            'span[style*="position: absolute"]',
            '.page div',
            '#textLayer span',
            '.pdfViewer span'
        ];
        
        let allText = [];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`🔍 Seletor "${selector}": ${elements.length} elementos`);
            
            if (elements.length > 0) {
                const texts = Array.from(elements)
                    .map(el => (el.textContent || el.innerText || '').trim())
                    .filter(text => text.length > 0);
                
                if (texts.length > 0) {
                    allText.push(...texts);
                    console.log(`✅ Coletados ${texts.length} textos do seletor "${selector}"`);
                }
            }
        }
        
        const result = allText.join(' ').trim();
        console.log(`📋 Total de texto coletado via elementos: ${result.length} caracteres`);
        
        return result;
        
    } catch (error) {
        console.error("Erro na extração via elementos:", error);
        return '';
    }
}

// Estratégia 3: PDF.js (melhorada)
async function extractFromPDFJS() {
    return new Promise((resolve, reject) => {
        try {
            console.log("🔍 Tentando PDF.js...");
            
            const timeout = setTimeout(() => {
                reject(new Error("Timeout na extração PDF.js"));
            }, 5000);
            
            const checkPDFJS = () => {
                if (window.PDFViewerApplication && window.PDFViewerApplication.pdfDocument) {
                    const pdfViewer = window.PDFViewerApplication;
                    
                    extractTextFromPDFDocument(pdfViewer.pdfDocument)
                        .then(text => {
                            clearTimeout(timeout);
                            resolve(text);
                        })
                        .catch(error => {
                            clearTimeout(timeout);
                            reject(error);
                        });
                } else {
                    // Aguardar um pouco mais
                    setTimeout(() => {
                        if (window.PDFViewerApplication && window.PDFViewerApplication.pdfDocument) {
                            extractTextFromPDFDocument(window.PDFViewerApplication.pdfDocument)
                                .then(text => {
                                    clearTimeout(timeout);
                                    resolve(text);
                                })
                                .catch(error => {
                                    clearTimeout(timeout);
                                    reject(error);
                                });
                        } else {
                            clearTimeout(timeout);
                            reject(new Error("PDF.js não disponível"));
                        }
                    }, 1000);
                }
            };
            
            checkPDFJS();
            
        } catch (error) {
            reject(error);
        }
    });
}

// Extrair texto de documento PDF via PDF.js
async function extractTextFromPDFDocument(pdfDocument) {
    const textContent = [];
    const numPages = Math.min(pdfDocument.numPages, 20); // Limitar a 20 páginas para teste
    
    console.log(`📄 Extraindo texto de ${numPages} páginas via PDF.js...`);
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
            const page = await pdfDocument.getPage(pageNum);
            const textContentPage = await page.getTextContent();
            
            const pageText = textContentPage.items
                .map(item => item.str)
                .join(' ')
                .trim();
            
            if (pageText.length > 0) {
                textContent.push(pageText);
                console.log(`📄 Página ${pageNum}: ${pageText.length} caracteres`);
            }
            
        } catch (error) {
            console.warn(`⚠️ Erro na página ${pageNum}:`, error);
        }
    }
    
    const fullText = textContent.join('\n\n').trim();
    console.log(`✅ PDF.js extraiu: ${fullText.length} caracteres`);
    
    return fullText;
}

// Estratégia 4: Análise de Canvas
async function extractFromCanvasAnalysis() {
    try {
        console.log("🔍 Analisando canvas...");
        
        const canvases = document.querySelectorAll('canvas');
        console.log(`🖼️ Encontrados ${canvases.length} canvas`);
        
        if (canvases.length === 0) {
            return '';
        }
        
        let extractedText = '';
        
        canvases.forEach((canvas, index) => {
            try {
                const parent = canvas.parentElement;
                if (parent) {
                    // Procurar texto próximo ao canvas
                    const textElements = parent.querySelectorAll('span, div[data-text], .textLayer span');
                    textElements.forEach(el => {
                        const text = (el.textContent || el.innerText || '').trim();
                        if (text && text.length > 0) {
                            extractedText += text + ' ';
                        }
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Erro no canvas ${index}:`, error);
            }
        });
        
        const result = extractedText.trim();
        console.log(`🖼️ Canvas analysis extraiu: ${result.length} caracteres`);
        
        return result;
        
    } catch (error) {
        console.error("Erro na análise de canvas:", error);
        return '';
    }
}

// Estratégia 5: Estrutura DOM geral
async function extractFromDOMStructure() {
    try {
        console.log("🔍 Analisando estrutura DOM...");
        
        // Procurar por qualquer texto visível no documento
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Ignorar scripts, styles, etc.
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'meta', 'link'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Verificar se o texto é visível
                    const text = node.textContent.trim();
                    if (text.length === 0) return NodeFilter.FILTER_REJECT;
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (text.length > 0) {
                textNodes.push(text);
            }
        }
        
        const result = textNodes.join(' ').trim();
        console.log(`🏗️ DOM structure extraiu: ${result.length} caracteres de ${textNodes.length} nós`);
        
        return result;
        
    } catch (error) {
        console.error("Erro na análise DOM:", error);
        return '';
    }
}

// Estratégia 6: Fallback geral
async function extractFallback() {
    try {
        console.log("🔍 Usando fallback geral...");
        
        // Tentar diferentes abordagens básicas
        const methods = [
            () => document.body.innerText,
            () => document.body.textContent,
            () => document.documentElement.innerText,
            () => document.documentElement.textContent,
            () => {
                // Pegar todo texto de todos os elementos
                const allElements = document.querySelectorAll('*');
                const texts = [];
                
                allElements.forEach(el => {
                    const text = (el.textContent || el.innerText || '').trim();
                    if (text && text.length > 0 && text.length < 1000) { // Evitar elementos muito grandes
                        texts.push(text);
                    }
                });
                
                return [...new Set(texts)].join(' '); // Remover duplicatas
            }
        ];
        
        for (const method of methods) {
            try {
                const result = method();
                if (result && result.trim().length > 50) {
                    console.log(`✅ Fallback funcionou: ${result.length} caracteres`);
                    return result.trim();
                }
            } catch (e) {
                console.warn("Método fallback falhou:", e);
            }
        }
        
        return '';
        
    } catch (error) {
        console.error("Erro no fallback:", error);
        return '';
    }
}

// Processar palavras simples (formato original)
async function processSimpleWords(palavras, texto) {
    const palavrasLower = palavras.map(palavra => palavra.toLowerCase());
    const textoLower = texto.toLowerCase();
    
    console.log("🔍 Processando", palavrasLower.length, "palavras simples");
    
    const contagens = palavrasLower.map(palavra => {
        const regex = new RegExp(`\\b${escapeRegExp(palavra)}\\b`, 'g');
        const matches = textoLower.match(regex);
        const count = matches ? matches.length : 0;
        console.log(`📊 Palavra "${palavra}" encontrada ${count} vezes`);
        return count;
    });

    console.log("✅ Contagens calculadas:", contagens);
    return { contagens: contagens, pageType: pageType };
}

// Processar termos com aliases e regex (formato novo)
async function processTermsWithAliases(request, texto) {
    console.log("🔍 Processando termos com aliases para", pageType);
    
    const terms = request.terms;
    const category = request.category || 'Sem categoria';
    const caseSensitive = request.caseSensitive || false;
    const wholeWords = request.wholeWords !== false;
    
    // Processar texto baseado na configuração case-sensitive
    let textoProcessado = texto;
    if (!caseSensitive) {
        textoProcessado = texto.toLowerCase();
    }
    
    console.log(`🔍 Processando ${terms.length} termos para categoria: ${category}`);
    
    // Contar ocorrências
    const contagens = terms.map(term => {
        let count = 0;
        
        try {
            if (term.type === 'regex') {
                console.log(`🔧 Processando regex: "${term.term}"`);
                
                let flags = 'g';
                if (!caseSensitive) flags += 'i';
                
                const regex = new RegExp(term.term, flags);
                const matches = textoProcessado.match(regex);
                count = matches ? matches.length : 0;
                
                console.log(`📊 Regex "${term.term}" encontrou ${count} ocorrências`);
            } else {
                let termText = term.term;
                
                if (!caseSensitive) {
                    termText = termText.toLowerCase();
                }
                
                const regex = wholeWords ? 
                    new RegExp(`\\b${escapeRegExp(termText)}\\b`, caseSensitive ? 'g' : 'gi') : 
                    new RegExp(escapeRegExp(termText), caseSensitive ? 'g' : 'gi');
                
                const matches = textoProcessado.match(regex);
                count = matches ? matches.length : 0;
                
                console.log(`📊 Termo "${termText}" encontrado ${count} vezes`);
            }
        } catch (error) {
            console.error(`❌ Erro ao processar termo "${term.term}":`, error);
            count = 0;
        }
        
        return count;
    });
    
    // Converter para o formato de resposta
    const counts = terms.map((term, index) => {
        return {
            term: term.term,
            alias: term.alias,
            category: category,
            type: term.type || 'text',
            count: contagens[index]
        };
    });
    
    console.log(`✅ Resultados para ${category}:`, counts.length, "termos processados");
    
    return { 
        contagens: contagens,
        counts: counts,
        pageType: pageType,
        extractionMethod: isPDF ? 'PDF-Local' : 'HTML',
        textLength: texto.length
    };
}

// Função auxiliar para escapar regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Monitorar mudanças no documento
if (isPDF) {
    console.log("🔍 Configurando observer para PDF...");
    
    const observer = new MutationObserver((mutations) => {
        let shouldClearCache = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                if (addedNodes.some(node => 
                    node.className && 
                    (node.className.includes('page') || 
                     node.className.includes('textLayer') ||
                     node.className.includes('pdf'))
                )) {
                    shouldClearCache = true;
                }
            }
        });
        
        if (shouldClearCache) {
            console.log("🔄 PDF: Conteúdo alterado, limpando cache");
            cachedText = null;
            lastExtractionTime = 0;
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Aguardar carregamento completo para PDFs
if (isPDF) {
    console.log("⏳ Aguardando carregamento completo do PDF...");
    
    // Aguardar um pouco para o PDF se estabilizar
    setTimeout(() => {
        console.log("🔄 PDF carregado, fazendo pré-extração...");
        extractPDFTextImproved().then(text => {
            if (text && text.length > 0) {
                cachedText = text;
                lastExtractionTime = Date.now();
                console.log(`✅ Pré-extração concluída: ${text.length} caracteres em cache`);
            } else {
                console.log("⚠️ Pré-extração não produziu resultados");
            }
        }).catch(error => {
            console.warn("⚠️ Erro na pré-extração:", error);
        });
    }, 2000);
}

// Notificar que o script está pronto
console.log(`✅ Content script carregado e pronto para ${pageType}`);
console.log("🔗 URL:", window.location.href);
console.log("📄 Título:", document.title);

// Debug: mostrar informações do DOM
setTimeout(() => {
    if (isPDF) {
        console.log("🔍 Debug DOM PDF:");
        console.log("- Elementos .textLayer:", document.querySelectorAll('.textLayer').length);
        console.log("- Elementos .page:", document.querySelectorAll('.page').length);
        console.log("- Elementos canvas:", document.querySelectorAll('canvas').length);
        console.log("- Elementos span:", document.querySelectorAll('span').length);
        console.log("- PDF.js disponível:", !!window.PDFViewerApplication);
        console.log("- Viewer element:", !!document.getElementById('viewer'));
    }
}, 1000);