// Versão minimalista do Chart.js embutida diretamente na extensão
// Esta versão simplificada suporta apenas gráficos de pizza e barras básicos

(function(global) {
    console.log("[EmbeddedChart] Iniciando carregamento...");
    
    // Verificar se Chart já existe
    if (typeof global.Chart !== 'undefined') {
      console.log("[EmbeddedChart] Chart.js já está definido. Usando implementação original.");
      return;
    }
    
    // Definição da classe Chart
    class MiniChart {
      constructor(canvas, config) {
        console.log("[EmbeddedChart] Criando novo gráfico:", config.type);
        console.log("[EmbeddedChart] Canvas:", canvas);
        console.log("[EmbeddedChart] Configuração:", config);
        
        this.canvas = canvas;
        if (!canvas) {
          console.error("[EmbeddedChart] Canvas inválido!");
          return;
        }
        
        try {
          this.ctx = canvas.getContext('2d');
          if (!this.ctx) {
            console.error("[EmbeddedChart] Não foi possível obter contexto 2d do canvas");
          }
        } catch (e) {
          console.error("[EmbeddedChart] Erro ao obter contexto do canvas:", e);
        }
        
        this.config = config;
        this.data = config.data || { labels: [], datasets: [] };
        this.options = config.options || {};
        this.type = config.type || 'bar';
        
        // Inicializar o canvas
        try {
          this.resize();
        } catch (e) {
          console.error("[EmbeddedChart] Erro ao redimensionar canvas:", e);
        }
        
        // Renderizar imediatamente
        try {
          this.update();
          console.log("[EmbeddedChart] Gráfico criado e renderizado com sucesso");
        } catch (e) {
          console.error("[EmbeddedChart] Erro ao atualizar/renderizar gráfico:", e);
        }
      }
      
      // Redimensionar o canvas
      resize() {
        try {
          const dpr = window.devicePixelRatio || 1;
          const rect = this.canvas.getBoundingClientRect();
          
          console.log("[EmbeddedChart] Redimensionando canvas:", {
            width: rect.width,
            height: rect.height,
            dpr: dpr
          });
          
          this.canvas.width = rect.width * dpr;
          this.canvas.height = rect.height * dpr;
          this.ctx.scale(dpr, dpr);
        } catch (error) {
          console.error("[EmbeddedChart] Erro ao redimensionar:", error);
        }
      }
      
      // Atualizar o gráfico
      update() {
        console.log("[EmbeddedChart] Atualizando gráfico com dados:", this.data);
        
        if (!this.ctx) {
          console.error("[EmbeddedChart] Contexto do canvas não disponível para atualização");
          return;
        }
        
        // Limpar o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Verificar se há dados
        if (!this.data.labels || !this.data.datasets || this.data.datasets.length === 0 || 
            !this.data.datasets[0].data || this.data.datasets[0].data.length === 0) {
          console.warn("[EmbeddedChart] Sem dados para renderizar");
          this.drawNoDataMessage();
          return;
        }
        
        console.log("[EmbeddedChart] Renderizando gráfico tipo:", this.type);
        
        // Renderizar o tipo de gráfico apropriado
        if (this.type === 'pie') {
          this.drawPieChart();
        } else if (this.type === 'bar') {
          this.drawBarChart();
        } else {
          console.warn("[EmbeddedChart] Tipo de gráfico não suportado:", this.type);
          this.drawUnsupportedMessage();
        }
      }
      
      // Desenhar mensagem de nenhum dado
      drawNoDataMessage() {
        const ctx = this.ctx;
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Nenhum dado disponível para exibição', width / 2, height / 2);
        
        console.log("[EmbeddedChart] Mensagem 'Nenhum dado disponível' renderizada");
      }
      
      // Desenhar mensagem de tipo não suportado
      drawUnsupportedMessage() {
        const ctx = this.ctx;
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`Tipo de gráfico '${this.type}' não suportado`, width / 2, height / 2);
      }
      
      // Desenhar gráfico de pizza
      drawPieChart() {
        console.log("[EmbeddedChart] Desenhando gráfico de pizza");
        
        const ctx = this.ctx;
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.7; // Reduzido para dar espaço para legendas
        
        console.log("[EmbeddedChart] Dimensões do gráfico:", {width, height, centerX, centerY, radius});
        
        const dataset = this.data.datasets[0];
        const data = dataset.data;
        const colors = dataset.backgroundColor || 
          ['#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', '#9c6ade', '#2ecc71', '#e67e22', '#9b59b6'];
        
        console.log("[EmbeddedChart] Dados para gráfico de pizza:", {
          data: data,
          labels: this.data.labels
        });
        
        // Calcular total
        const total = data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
        
        if (total <= 0) {
          console.warn("[EmbeddedChart] Total dos dados é zero ou negativo");
          this.drawNoDataMessage();
          return;
        }
        
        // Desenhar setores
        let startAngle = -Math.PI / 2;
        
        data.forEach((value, index) => {
          const numValue = parseFloat(value) || 0;
          const sliceAngle = (numValue / total) * 2 * Math.PI;
          const endAngle = startAngle + sliceAngle;
          const color = colors[index % colors.length];
          
          console.log(`[EmbeddedChart] Desenhando setor ${index}:`, {
            valor: numValue,
            angulo: sliceAngle,
            cor: color
          });
          
          // Desenhar setor
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          startAngle = endAngle;
        });
        
        // Desenhar legenda
        this.drawLegend();
        
        console.log("[EmbeddedChart] Gráfico de pizza concluído");
      }
      
      // Desenhar gráfico de barras
      drawBarChart() {
        console.log("[EmbeddedChart] Desenhando gráfico de barras");
        
        const ctx = this.ctx;
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        console.log("[EmbeddedChart] Dimensões do canvas:", {width, height});
        
        const dataset = this.data.datasets[0];
        const data = dataset.data.map(val => parseFloat(val) || 0);
        const labels = this.data.labels;
        const color = dataset.backgroundColor || '#4a6fff';
        
        console.log("[EmbeddedChart] Dados para gráfico de barras:", {
          dados: data,
          labels: labels
        });
        
        if (data.length === 0) {
          console.warn("[EmbeddedChart] Sem dados para o gráfico de barras");
          this.drawNoDataMessage();
          return;
        }
        
        // Definir margens
        const marginTop = 20;
        const marginBottom = 60;
        const marginLeft = 40;
        const marginRight = 20;
        
        // Calcular área útil
        const chartWidth = width - marginLeft - marginRight;
        const chartHeight = height - marginTop - marginBottom;
        
        console.log("[EmbeddedChart] Área útil do gráfico:", {chartWidth, chartHeight});
        
        // Encontrar valor máximo
        const maxValue = Math.max(...data);
        const yScale = chartHeight / (maxValue || 1);
        
        console.log("[EmbeddedChart] Escala Y:", {maxValue, yScale});
        
        // Calcular largura das barras
        const barCount = data.length;
        const barWidth = chartWidth / barCount * 0.8;
        const barSpacing = chartWidth / barCount * 0.2;
        
        console.log("[EmbeddedChart] Configuração das barras:", {
          quantidade: barCount,
          largura: barWidth,
          espacamento: barSpacing
        });
        
        // Desenhar eixo Y
        ctx.beginPath();
        ctx.moveTo(marginLeft, marginTop);
        ctx.lineTo(marginLeft, height - marginBottom);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Desenhar eixo X
        ctx.beginPath();
        ctx.moveTo(marginLeft, height - marginBottom);
        ctx.lineTo(width - marginRight, height - marginBottom);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Desenhar graduações eixo Y
        const yTickCount = 5;
        for (let i = 0; i <= yTickCount; i++) {
          const value = maxValue * (i / yTickCount);
          const y = height - marginBottom - (value * yScale);
          
          ctx.beginPath();
          ctx.moveTo(marginLeft - 5, y);
          ctx.lineTo(marginLeft, y);
          ctx.strokeStyle = '#aaa';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.font = '10px Arial';
          ctx.fillStyle = '#666';
          ctx.fillText(Math.round(value), marginLeft - 8, y);
        }
        
        // Desenhar barras e rótulos
        data.forEach((value, index) => {
          const x = marginLeft + (index * chartWidth / barCount) + (barSpacing / 2);
          const barHeight = value * yScale;
          
          console.log(`[EmbeddedChart] Barra ${index}:`, {
            x: x,
            altura: barHeight,
            valor: value
          });
          
          ctx.fillStyle = color;
          ctx.fillRect(x, height - marginBottom - barHeight, barWidth, barHeight);
          
          // Desenhar rótulo
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.font = '10px Arial';
          ctx.fillStyle = '#666';
          
          // Truncar texto se for muito longo
          let label = labels[index] || '';
          if (label.length > 12) {
            label = label.substring(0, 10) + '...';
          }
          
          ctx.save();
          ctx.translate(x + barWidth / 2, height - marginBottom + 5);
          ctx.rotate(Math.PI / 6); // Reduzido o ângulo para melhor legibilidade
          ctx.fillText(label, 0, 0);
          ctx.restore();
          
          // Desenhar valor acima da barra
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.font = '10px Arial';
          ctx.fillStyle = '#333';
          ctx.fillText(value, x + barWidth / 2, height - marginBottom - barHeight - 5);
        });
        
        console.log("[EmbeddedChart] Gráfico de barras concluído");
      }
      
      // Desenhar legenda
      drawLegend() {
        console.log("[EmbeddedChart] Desenhando legenda");
        
        const ctx = this.ctx;
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        const data = this.data.datasets[0].data;
        const labels = this.data.labels;
        const colors = this.data.datasets[0].backgroundColor || 
          ['#4a6fff', '#ff6b6b', '#46c93a', '#ffb347', '#9c6ade', '#2ecc71', '#e67e22', '#9b59b6'];
        
        // Definir posição e tamanho
        const legendY = height * 0.7;
        const itemHeight = 15;
        const itemMargin = 5;
        const boxSize = 10;
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '10px Arial';
        
        // Limitar a quantidade de itens na legenda
        const maxItems = Math.min(data.length, 7);
        
        console.log("[EmbeddedChart] Configuração da legenda:", {
          items: maxItems,
          startY: legendY
        });
        
        for (let i = 0; i < maxItems; i++) {
          const y = legendY + i * (itemHeight + itemMargin);
          const color = colors[i % colors.length];
          
          // Desenhar caixa colorida
          ctx.fillStyle = color;
          ctx.fillRect(width * 0.1, y, boxSize, boxSize);
          
          // Desenhar texto
          ctx.fillStyle = '#333';
          // Truncar texto se for muito longo
          let label = labels[i] || '';
          if (label.length > 15) {
            label = label.substring(0, 13) + '...';
          }
          
          const value = data[i] || 0;
          ctx.fillText(`${label} (${value})`, width * 0.1 + boxSize + 5, y + boxSize / 2);
        }
        
        // Indicar que há mais itens
        if (data.length > maxItems) {
          const y = legendY + maxItems * (itemHeight + itemMargin);
          ctx.fillStyle = '#666';
          ctx.fillText(`... e mais ${data.length - maxItems} itens`, width * 0.1, y + boxSize / 2);
        }
        
        console.log("[EmbeddedChart] Legenda concluída");
      }
      
      destroy() {
        console.log("[EmbeddedChart] Destruindo gráfico");
        // Limpar o canvas
        if (this.ctx && this.canvas) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }
    }
    
    // Registrar globalmente
    global.Chart = MiniChart;
    
    console.log("[EmbeddedChart] MiniChart carregado como alternativa ao Chart.js");
  })(window);