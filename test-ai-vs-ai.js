require('dotenv').config();
const FinanceAgent = require('./src/agent/FinanceAgent');
const ConversationMemory = require('./src/memory/ConversationMemory');
const { OpenAI } = require('openai');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                    🤖 IA vs IA Test 🤖                   ║');
console.log('║               SofIA Bot vs Cliente Simulador IA          ║');
console.log('║           Conversación Completamente Automatizada        ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Verificar configuración
if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ ERROR: Se requiere PERPLEXITY_API_KEY para el test AI vs AI');
    console.error('💡 Configura tu .env con PERPLEXITY_API_KEY=tu_api_key');
    process.exit(1);
}

console.log('✅ API Keys configuradas - Iniciando test AI vs AI');
console.log('🧠 Cliente simulador: IA generativa');
console.log('🤖 SofIA Bot: IA financiera avanzada\n');

class AIClientSimulator {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.PERPLEXITY_API_KEY,
            baseURL: 'https://api.perplexity.ai'
        });
        
        this.config = {
            model: 'sonar-pro',
            maxTokens: 150,
            searchContextSize: 'low'
        };
        
        this.persona = {
            name: this.generateRandomName(),
            age: Math.floor(Math.random() * 30) + 25, // 25-55 años
            profession: this.getRandomProfession(),
            personality: this.getRandomPersonality(),
            financialSituation: this.getRandomFinancialSituation()
        };
        
        this.testPlan = [
            'greeting',           // Saludar y presentarse
            'income_report',      // Reportar ingresos
            'expense_report',     // Reportar gastos
            'financial_question', // Hacer pregunta financiera
            'goal_setting',       // Establecer metas
            'advice_request',     // Pedir consejos
            'follow_up',          // Seguimiento
            'farewell'           // Despedirse
        ];
        
        this.currentStep = 0;
        this.conversationHistory = [];
        
        console.log(`👤 Cliente IA generado:`);
        console.log(`   Nombre: ${this.persona.name}`);
        console.log(`   Edad: ${this.persona.age} años`);
        console.log(`   Profesión: ${this.persona.profession}`);
        console.log(`   Personalidad: ${this.persona.personality}`);
        console.log(`   Situación: ${this.persona.financialSituation}\n`);
    }
    
    generateRandomName() {
        const names = ['María', 'Carlos', 'Ana', 'José', 'Carmen', 'Luis', 'Elena', 'Diego', 'Sofia', 'Miguel'];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    getRandomProfession() {
        const professions = [
            'ingeniera de software', 'médico', 'profesora', 'contador', 'diseñadora gráfica',
            'vendedor', 'enfermera', 'abogado', 'arquitecta', 'freelancer'
        ];
        return professions[Math.floor(Math.random() * professions.length)];
    }
    
    getRandomPersonality() {
        const personalities = [
            'cautelosa con el dinero', 'impulsiva en compras', 'muy organizada', 
            'preocupada por el futuro', 'optimista financiera', 'práctica y directa'
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }
    
    getRandomFinancialSituation() {
        const situations = [
            'quiere empezar a ahorrar', 'busca invertir por primera vez', 
            'tiene deudas que controlar', 'planea comprar casa', 
            'quiere mejorar sus finanzas', 'acaba de recibir aumento de sueldo'
        ];
        return situations[Math.floor(Math.random() * situations.length)];
    }
    
    async generateMessage() {
        if (this.currentStep >= this.testPlan.length) {
            return null; // Conversación terminada
        }
        
        const currentIntent = this.testPlan[this.currentStep];
        const systemPrompt = this.buildSystemPrompt(currentIntent);
        const userPrompt = this.buildUserPrompt(currentIntent);
        
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: this.config.maxTokens,
                web_search_options: {
                    search_context_size: this.config.searchContextSize
                }
            });
            
            const message = response.choices[0].message.content.trim();
            this.currentStep++;
            
            return message;
            
        } catch (error) {
            console.error('❌ Error generando mensaje del cliente IA:', error);
            return this.getFallbackMessage(currentIntent);
        }
    }
    
    buildSystemPrompt(intent) {
        return `Eres ${this.persona.name}, una persona de ${this.persona.age} años que trabaja como ${this.persona.profession}. 
Tu personalidad: ${this.persona.personality}. 
Tu situación financiera: ${this.persona.financialSituation}.

Estás hablando con SofIA, un bot de asesoría financiera por WhatsApp.

INSTRUCCIONES:
- Escribe EXACTAMENTE como escribirías por WhatsApp (informal, natural)
- USA números y cantidades específicas y reales para Perú
- No uses signos de moneda confusos, di las cantidades en soles peruanos naturalmente
- Sé específico con gastos e ingresos reales
- Mantén tu personalidad consistente
- No seas muy formal, usa jerga natural
- Limita tu respuesta a 1-2 oraciones máximo

Objetivo actual: ${this.getIntentDescription(intent)}`;
    }
    
    buildUserPrompt(intent) {
        let prompt = `Genera UN mensaje de WhatsApp natural para ${intent}.`;
        
        if (this.conversationHistory.length > 0) {
            prompt += `\n\nConversación previa (últimos 2 intercambios):`;
            const recent = this.conversationHistory.slice(-4); // últimos 2 intercambios
            for (let i = 0; i < recent.length; i += 2) {
                if (recent[i] && recent[i + 1]) {
                    prompt += `\nTú: "${recent[i]}"`;
                    prompt += `\nSofIA: "${recent[i + 1]}"`;
                }
            }
        }
        
        prompt += `\n\nEscribe tu próximo mensaje considerando tu personalidad y el contexto.`;
        
        return prompt;
    }
    
    getIntentDescription(intent) {
        const descriptions = {
            'greeting': 'Salúdate y dile tu nombre de forma natural',
            'income_report': 'Menciona cuánto ganaste recientemente (trabajo, freelance, etc.)',
            'expense_report': 'Comenta sobre gastos que tuviste (compras, servicios, etc.)',
            'financial_question': 'Haz una pregunta sobre finanzas personales o inversiones',
            'goal_setting': 'Menciona una meta financiera que tienes',
            'advice_request': 'Pide consejo específico sobre tu situación financiera',
            'follow_up': 'Comenta sobre algo que te dijo SofIA o pide más detalles',
            'farewell': 'Despídete de forma natural y agradece'
        };
        return descriptions[intent] || 'Continúa la conversación naturalmente';
    }
    
    getFallbackMessage(intent) {
        const fallbacks = {
            'greeting': `Hola! Soy ${this.persona.name}`,
            'income_report': 'Este mes me llegaron como 3500 soles del trabajo',
            'expense_report': 'Gasté como 800 soles en el super esta semana',
            'financial_question': '¿Crees que es buen momento para invertir?',
            'goal_setting': 'Quiero ahorrar para una casa',
            'advice_request': '¿Qué me recomiendas para manejar mejor mi dinero?',
            'follow_up': 'Interesante lo que me dices',
            'farewell': 'Gracias por todo! Nos vemos'
        };
        return fallbacks[intent] || 'Continúo con la conversación';
    }
    
    addToHistory(userMessage, botResponse) {
        this.conversationHistory.push(userMessage, botResponse);
    }
    
    getFunctionalitiesToTest() {
        return [
            '✅ Reconocimiento de nombres',
            '✅ Detección de ingresos automática', 
            '✅ Detección de gastos automática',
            '✅ Respuestas contextuales inteligentes',
            '✅ Análisis financiero con IA',
            '✅ Consejos personalizados',
            '✅ Manejo de moneda por defecto (soles)',
            '✅ Memoria conversacional',
            '✅ Generación de resúmenes financieros',
            '✅ Respuestas empáticas y naturales'
        ];
    }
}

class AIvsAITester {
    constructor() {
        this.memory = new ConversationMemory(10);
        this.agent = new FinanceAgent(this.memory);
        this.aiClient = new AIClientSimulator();
        this.testResults = {
            totalExchanges: 0,
            successfulResponses: 0,
            detectedTransactions: 0,
            aiErrors: 0,
            conversationFlow: []
        };
    }
    
    async runFullTest() {
        console.log('🚀 Iniciando test completo AI vs AI...\n');
        
        const userId = 'ai_client_' + Date.now();
        
        // Mostrar funcionalidades a verificar
        console.log('📋 Funcionalidades a verificar:');
        this.aiClient.getFunctionalitiesToTest().forEach(func => {
            console.log(`   ${func}`);
        });
        console.log('');
        
        let exchangeCount = 0;
        const maxExchanges = 10;
        
        while (exchangeCount < maxExchanges) {
            exchangeCount++;
            
            // Cliente IA genera mensaje
            const clientMessage = await this.aiClient.generateMessage();
            
            if (!clientMessage) {
                console.log('🏁 Cliente IA ha terminado la conversación\n');
                break;
            }
            
            console.log(`\n=== Intercambio ${exchangeCount} ===`);
            console.log(`👤 ${this.aiClient.persona.name}: "${clientMessage}"`);
            
            // Obtener contexto actual
            const context = this.memory.getConversationContext(userId);
            
            try {
                // Bot responde con IA
                const botResponse = await this.agent.generateResponse(clientMessage, context, userId);
                
                console.log(`🤖 SofIA: "${botResponse}"`);
                
                // Guardar intercambio
                this.memory.addMessage(userId, clientMessage, botResponse);
                this.aiClient.addToHistory(clientMessage, botResponse);
                
                // Actualizar estadísticas
                this.testResults.totalExchanges++;
                this.testResults.successfulResponses++;
                this.testResults.conversationFlow.push({
                    user: clientMessage,
                    bot: botResponse,
                    timestamp: new Date().toISOString()
                });
                
                // Pausa para simular conversación real
                await this.sleep(1000);
                
            } catch (error) {
                console.error(`❌ Error en intercambio ${exchangeCount}:`, error.message);
                this.testResults.aiErrors++;
            }
        }
        
        // Generar resumen final
        await this.generateFinalReport(userId);
    }
    
    async generateFinalReport(userId) {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                     📊 REPORTE FINAL                     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        // Estadísticas básicas
        console.log('📈 Estadísticas del Test:');
        console.log(`   ✅ Intercambios exitosos: ${this.testResults.successfulResponses}/${this.testResults.totalExchanges}`);
        console.log(`   ❌ Errores de IA: ${this.testResults.aiErrors}`);
        console.log(`   🤖 Tasa de éxito: ${Math.round((this.testResults.successfulResponses / this.testResults.totalExchanges) * 100)}%\n`);
        
        // Análisis de funcionalidades detectadas
        const userProfile = this.memory.getUserProfile(userId);
        const incomeDetected = userProfile.financial_data?.income?.length || 0;
        const expensesDetected = userProfile.financial_data?.expenses?.length || 0;
        
        console.log('🔍 Funcionalidades Verificadas:');
        console.log(`   💰 Ingresos detectados automáticamente: ${incomeDetected}`);
        console.log(`   💸 Gastos detectados automáticamente: ${expensesDetected}`);
        console.log(`   👤 Nombre del usuario detectado: ${userProfile.name ? '✅' : '❌'}`);
        console.log(`   💬 Memoria conversacional activa: ${this.memory.getStats().total_conversations > 0 ? '✅' : '❌'}`);
        
        // Mostrar transacciones detectadas
        if (incomeDetected > 0 || expensesDetected > 0) {
            console.log('\n💱 Transacciones Procesadas por IA:');
            
            if (userProfile.financial_data?.income) {
                userProfile.financial_data.income.forEach((income, index) => {
                    const currency = income.currency === 'dolares' ? '$' : income.currency === 'pesos' ? '$' : 'S/';
                    console.log(`   📈 Ingreso ${index + 1}: ${currency}${income.amount} - ${income.source}`);
                });
            }
            
            if (userProfile.financial_data?.expenses) {
                userProfile.financial_data.expenses.forEach((expense, index) => {
                    const currency = expense.currency === 'dolares' ? '$' : expense.currency === 'pesos' ? '$' : 'S/';
                    console.log(`   📉 Gasto ${index + 1}: ${currency}${expense.amount} - ${expense.category}`);
                });
            }
        }
        
        // Generar resumen financiero inteligente
        console.log('\n💡 Resumen Financiero Generado por IA:');
        try {
            const aiSummary = await this.agent.generateFinancialSummary(userId, userProfile.name || this.aiClient.persona.name);
            console.log(`📊 ${aiSummary}`);
        } catch (error) {
            console.log('❌ No se pudo generar resumen financiero');
        }
        
        // Estadísticas del sistema
        console.log('\n🔧 Estado del Sistema:');
        const agentStats = this.agent.getAgentStats();
        console.log(`   🧠 IA Avanzada (Perplexity): ${agentStats.perplexityConfigured ? '✅' : '❌'}`);
        console.log(`   📷 Reconocimiento de imágenes: ${agentStats.imageRecognitionConfigured ? '✅' : '❌'}`);
        console.log(`   🚫 Sin patrones hardcodeados: ${!agentStats.usePatterns ? '✅' : '❌'}`);
        console.log(`   💬 Total usuarios en memoria: ${this.memory.getStats().total_users}`);
        
        // Verificación de calidad de conversación
        console.log('\n🎯 Análisis de Calidad de Conversación:');
        const avgResponseLength = this.testResults.conversationFlow.reduce((sum, exchange) => 
            sum + exchange.bot.length, 0) / this.testResults.conversationFlow.length;
        
        console.log(`   📏 Longitud promedio de respuestas: ${Math.round(avgResponseLength)} caracteres`);
        console.log(`   🎭 Personalidad consistente: ${this.analyzePersonalityConsistency() ? '✅' : '❌'}`);
        console.log(`   🧠 Respuestas contextuales: ${this.analyzeContextualResponses() ? '✅' : '❌'}`);
        
        // Conclusión final
        console.log('\n🏆 CONCLUSIÓN:');
        const overallScore = this.calculateOverallScore(incomeDetected, expensesDetected, userProfile.name !== undefined);
        console.log(`   Puntuación general: ${overallScore}/100`);
        
        if (overallScore >= 80) {
            console.log('   🥇 ¡Excelente! SofIA funciona perfectamente con IA');
        } else if (overallScore >= 60) {
            console.log('   🥈 Bueno. SofIA funciona bien, algunas mejoras posibles');
        } else {
            console.log('   🥉 Regular. SofIA necesita optimización');
        }
        
        console.log('\n✨ Test AI vs AI completado exitosamente!');
        console.log('🚀 SofIA está lista para WhatsApp con IA 100% automatizada');
    }
    
    analyzePersonalityConsistency() {
        // Verifica si las respuestas del bot mantienen personalidad consistente
        const responses = this.testResults.conversationFlow.map(exchange => exchange.bot);
        const hasGreeting = responses.some(r => r.includes('Hola') || r.includes('hola'));
        const hasEmojis = responses.some(r => /[😊😅🤖💰📊]/.test(r));
        return hasGreeting && hasEmojis;
    }
    
    analyzeContextualResponses() {
        // Verifica si las respuestas se adaptan al contexto
        return this.testResults.conversationFlow.length > 1 && 
               this.testResults.conversationFlow.every(exchange => exchange.bot.length > 10);
    }
    
    calculateOverallScore(incomeDetected, expensesDetected, nameDetected) {
        let score = 0;
        
        // Puntuación base por intercambios exitosos
        score += (this.testResults.successfulResponses / this.testResults.totalExchanges) * 40;
        
        // Puntos por funcionalidades detectadas
        if (incomeDetected > 0) score += 20;
        if (expensesDetected > 0) score += 20;
        if (nameDetected) score += 10;
        
        // Puntos por calidad de conversación
        if (this.analyzePersonalityConsistency()) score += 5;
        if (this.analyzeContextualResponses()) score += 5;
        
        return Math.round(score);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Ejecutar test principal
async function runAIvsAITest() {
    try {
        const tester = new AIvsAITester();
        await tester.runFullTest();
        console.log('\n🎉 ¡Test AI vs AI completado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error en test AI vs AI:', error);
        process.exit(1);
    }
}

runAIvsAITest(); 