// Gerenciador de Splash Screen
class SplashManager {
    constructor() {
        this.splashScreen = document.getElementById('splash-screen');
        this.appContainer = document.getElementById('app-container');
        this.progressElement = document.querySelector('.loading-bar-progress');
        this.splashSubtitle = document.getElementById('splash-subtitle');
        this.maxProgress = 100;
        this.currentProgress = 0;
        this.tasks = [];
        this.isVisible = true;
        
        // Definir timeout para fechamento de segurança (7 segundos)
        this.safetyTimeout = setTimeout(() => {
            console.log("Safety timeout: forçando encerramento do splash após 7 segundos");
            this.finish();
        }, 7000);
    }

    // Adicionar uma tarefa ao processo
    addTask(name, weight = 1) {
        this.tasks.push({ name, weight, completed: false });
        return this.tasks.length - 1; // Retorna o índice da tarefa
    }

    // Iniciar o splash screen com todas as tarefas
    start() {
        this.showSplash();
        this.updateProgress(0, 'Iniciando...');
        
        // Resetar estado das tarefas
        this.tasks.forEach(task => {
            task.completed = false;
        });
        
        return this;
    }
    
    // Verificar se uma tarefa está completa
    isTaskCompleted(taskIndex) {
        if (taskIndex >= 0 && taskIndex < this.tasks.length) {
            return this.tasks[taskIndex].completed;
        }
        return false;
    }

    // Marcar uma tarefa como completa e atualizar o progresso
    completeTask(taskIndex, message = null) {
        if (taskIndex >= 0 && taskIndex < this.tasks.length) {
            const task = this.tasks[taskIndex];
            
            if (!task.completed) {
                task.completed = true;
                
                // Calcular o novo progresso
                const totalWeight = this.tasks.reduce((sum, t) => sum + t.weight, 0);
                const completedWeight = this.tasks
                    .filter(t => t.completed)
                    .reduce((sum, t) => sum + t.weight, 0);
                
                const progress = Math.min(Math.round((completedWeight / totalWeight) * 100), 100);
                
                // Atualizar o progresso visualmente
                this.updateProgress(progress, message || task.name);
                
                // Se todas as tarefas estiverem completas, finalizar
                const allCompleted = this.tasks.every(t => t.completed);
                if (allCompleted) {
                    // Aguardar um momento para que o usuário veja 100%
                    setTimeout(() => {
                        this.finish();
                    }, 300);
                }
            }
        }
        
        return this;
    }

    // Atualizar a barra de progresso
    updateProgress(progress, message = null) {
        this.currentProgress = progress;
        
        if (this.progressElement) {
            this.progressElement.style.width = `${progress}%`;
        }
        
        if (message && this.splashSubtitle) {
            this.splashSubtitle.textContent = message;
        }
        
        return this;
    }

    // Mostrar o splash screen
    showSplash() {
        if (this.splashScreen && this.appContainer) {
            this.splashScreen.style.display = 'flex';
            this.splashScreen.style.opacity = '1';
            this.appContainer.style.display = 'none';
            this.isVisible = true;
        }
        
        return this;
    }

    // Concluir e esconder o splash screen
    finish() {
        // Cancelar o timeout de segurança
        if (this.safetyTimeout) {
            clearTimeout(this.safetyTimeout);
            this.safetyTimeout = null;
        }
        
        if (this.isVisible && this.splashScreen && this.appContainer) {
            // Garantir que o progresso esteja em 100%
            this.updateProgress(100, 'Concluído');
            
            // Fade out do splash
            setTimeout(() => {
                this.splashScreen.style.opacity = '0';
                
                // Mostrar app container
                this.appContainer.style.display = 'flex';
                
                // Aguardar transição
                setTimeout(() => {
                    this.splashScreen.style.display = 'none';
                    this.appContainer.style.opacity = '1';
                    this.isVisible = false;
                    
                    document.dispatchEvent(new CustomEvent('splash:finished'));
                }, 500);
            }, 200);
        }
        
        return this;
    }
}

// Instanciar o gerenciador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando splash manager");
    
    const splashManager = new SplashManager();
    window.splashManager = splashManager;
    
    // Definir tarefas padrão (simplificadas)
    const injectScriptTask = splashManager.addTask('Injetando script na página...', 1);
    const loadCategoriesTask = splashManager.addTask('Carregando configurações...', 1);
    const countWordsTask = splashManager.addTask('Contando ocorrências...', 2);
    const prepareResultsTask = splashManager.addTask('Preparando resultados...', 1);
    
    // Iniciar o splash
    splashManager.start();
    
    // Disparar evento de splash pronto
    document.dispatchEvent(new CustomEvent('splash:ready', { 
        detail: { 
            tasks: {
                injectScriptTask,
                loadCategoriesTask,
                countWordsTask,
                prepareResultsTask
            }
        } 
    }));
    
    console.log("Splash manager inicializado");
});