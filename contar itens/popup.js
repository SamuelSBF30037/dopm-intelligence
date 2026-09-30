document.addEventListener('DOMContentLoaded', () => {
    const pageInfoElement = document.getElementById('page-info');

    // Obtém a URL e o título da aba ativa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
            const url = tab.url || "URL indisponível";
            const title = tab.title || "Título indisponível";
            pageInfoElement.textContent = `Contando palavras na página: ${title} (${url})`;
        } else {
            pageInfoElement.textContent = "Não foi possível obter informações da página.";
        }
    });

    document.getElementById('contar').addEventListener('click', () => {
        const palavras = Array.from(document.querySelectorAll('.palavra-input'))
            .map(input => input.value.trim())
            .filter(palavra => palavra.length > 0);
        
        if (palavras.length > 0) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { palavras }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError.message);
                        document.getElementById('resultado').innerText = 'Erro ao se comunicar com a página.';
                        return;
                    }

                    if (response && response.contagens) {
                        const resultado = response.contagens.map(
                            (contagem, index) => `A palavra "${palavras[index]}" apareceu ${contagem} vezes.`
                        ).join('\n');
                        document.getElementById('resultado').innerText = resultado;
                    } else {
                        document.getElementById('resultado').innerText = 'Nenhuma contagem foi retornada.';
                    }
                });
            });
        }
    });
});
