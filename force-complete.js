// Este script garante que o splash screen seja eventualmente fechado,
// mesmo que ocorra algum problema no processo

document.addEventListener('DOMContentLoaded', () => {
    // Força o fechamento do splash após 15 segundos
    setTimeout(() => {
        console.log("[ForceComplete] Verificando se o splash screen ainda está ativo...");
        
        const splashScreen = document.getElementById('splash-screen');
        const appContainer = document.getElementById('app-container');
        
        if (splashScreen && splashScreen.style.display !== 'none') {
            console.warn("[ForceComplete] Splash screen ainda ativo após 15 segundos. Forçando fechamento.");
            
            // Tentar completar tarefas via splash manager
            if (window.splashManager) {
                for (let i = 0; i < 10; i++) {
                    try {
                        if (!window.splashManager.isTaskCompleted(i)) {
                            window.splashManager.completeTask(i, "Concluído (forçado)");
                        }
                    } catch (e) {
                        // Ignorar erros
                    }
                }
                
                // Tentar finalizar via método do gerenciador
                try {
                    window.splashManager.finish();
                } catch (e) {
                    console.error("[ForceComplete] Erro ao finalizar via splashManager:", e);
                }
            }
            
            // Se ainda estiver visível, forçar manualmente
            if (splashScreen.style.display !== 'none') {
                splashScreen.style.opacity = '0';
                
                if (appContainer) {
                    appContainer.style.display = 'flex';
                    
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                        appContainer.style.opacity = '1';
                        
                        // Forçar atualização do dashboard
                        const dashboardTab = document.querySelector('.tab[data-tab="dashboard"]');
                        if (dashboardTab) {
                            dashboardTab.click();
                        }
                        
                        console.log("[ForceComplete] Splash screen fechado forçadamente");
                    }, 500);
                }
            }
        } else {
            console.log("[ForceComplete] Splash screen já está fechado, tudo ok.");
        }
    }, 15000); // 15 segundos de timeout
});