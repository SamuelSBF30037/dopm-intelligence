// Log para confirmar que o script foi injetado na página
console.log("content.js carregado!");

// Listener para receber mensagens do popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Mensagem recebida:", request);

    // Verifica se a mensagem contém a lista de palavras
    if (request.palavras && Array.isArray(request.palavras)) {
        const palavras = request.palavras.map(palavra => palavra.toLowerCase());
        const texto = document.body.innerText.toLowerCase();
        
        // Conta as ocorrências de cada palavra usando regex
        const contagens = palavras.map(palavra => {
            const regex = new RegExp(`\\b${palavra}\\b`, 'g');
            const matches = texto.match(regex);
            return matches ? matches.length : 0;
        });

        console.log("Contagens calculadas:", contagens);

        // Envia a resposta de volta para o popup.js
        sendResponse({ contagens });
    } else {
        console.error("Formato da mensagem inválido:", request);
        sendResponse({ contagens: [] });
    }

    // Retorna true para indicar que a resposta será feita de forma assíncrona
    return true;
});
