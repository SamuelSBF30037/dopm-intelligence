// Background script simplificado

// Carregar o JSON padrão na instalação/atualização
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensão instalada/atualizada');
    
    // Estrutura padrão (usada se o arquivo JSON não estiver disponível)
    const defaultData = {
      "config": {
        "caseSensitive": false,
        "wholeWords": true,
        "autoCount": true
      },
      "categories": [
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
      ]
    };
    
    // Tentativa de carregar o arquivo JSON
    fetch(chrome.runtime.getURL('categories.json'))
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar JSON: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("JSON carregado com sucesso");
        
        // Salvar no storage local
        chrome.storage.local.set({
          categoriesData: JSON.stringify(data)
        }, () => {
          console.log("Arquivo JSON salvo no storage local");
        });
      })
      .catch(error => {
        console.error("Erro ao carregar arquivo JSON:", error);
        
        // Em caso de erro, usar dados padrão
        chrome.storage.local.set({
          categoriesData: JSON.stringify(defaultData)
        }, () => {
          console.log("Dados padrão salvos no storage local");
        });
      });
  });