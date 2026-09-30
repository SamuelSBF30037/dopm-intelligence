// Script para feedback visual dos gráficos
document.addEventListener('DOMContentLoaded', function() {
    console.log("🎯 [ChartStatus] Sistema interno de gráficos inicializado");
    
    // Monitor para detectar quando os gráficos são criados
    let checkInterval = setInterval(() => {
        const categoryCanvas = document.getElementById('category-chart');
        const termCanvas = document.getElementById('term-chart');
        const categoryStatus = document.getElementById('category-status');
        const termStatus = document.getElementById('term-status');
        
        // Verificar se os gráficos estão funcionando
        if (categoryCanvas && termCanvas) {
            const catRect = categoryCanvas.getBoundingClientRect();
            const termRect = termCanvas.getBoundingClientRect();
            
            if (catRect.width > 0 && catRect.height > 0 && categoryStatus) {
                categoryStatus.className = 'chart-status success';
                categoryStatus.innerHTML = '<i class="fas fa-check"></i> Gráfico carregado (Sistema Interno)!';
                setTimeout(() => categoryStatus.style.display = 'none', 3000);
            }
            
            if (termRect.width > 0 && termRect.height > 0 && termStatus) {
                termStatus.className = 'chart-status success';
                termStatus.innerHTML = '<i class="fas fa-check"></i> Gráfico carregado (Sistema Interno)!';
                setTimeout(() => termStatus.style.display = 'none', 3000);
            }
        }
        
        // Parar verificação após 10 segundos
        if (Date.now() - startTime > 10000) {
            clearInterval(checkInterval);
        }
    }, 1000);
    
    const startTime = Date.now();
});