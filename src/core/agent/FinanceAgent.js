const { format, parseISO, isToday, isThisWeek, isThisMonth } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const PerplexityService = require('../services/PerplexityService');
const ImageRecognitionService = require('../services/ImageRecognitionService');

class FinanceAgent {
    constructor(memory) {
        this.memory = memory;
        this.perplexity = new PerplexityService();
        this.imageRecognition = new ImageRecognitionService();
        
        this.personality = {
            name: "SofIA",
            role: "asesor financiero personal y amigo",
            style: "amigable, casual pero profesional, empático"
        };

        console.log(`🤖 FinanceAgent inicializado - TODO manejado por IA: ${this.perplexity.isConfigured() ? '✅' : '⚠️ Modo local'}`);
        console.log(`📷 Reconocimiento de imágenes: ${this.imageRecognition.isConfigured() ? '✅' : '⚠️ No disponible'}`);
    }

    async generateResponse(userMessage, context, userId) {
        try {
            // TODO se maneja por IA - sin patrones hardcodeados
            const aiDecision = await this.getAIDecision(userMessage, context, userId);
            
            // Ejecutar acciones basadas en la decisión de IA
            if (aiDecision.actions && aiDecision.actions.length > 0) {
                await this.executeAIActions(aiDecision.actions, userId);
                // Refrescar contexto después de acciones
                context = this.memory.getConversationContext(userId);
            }

            // Generar respuesta final con IA
            const response = await this.perplexity.generateFinancialResponse(userMessage, context, userId);
            
            return response;

        } catch (error) {
            console.error('Error generando respuesta:', error);
            return await this.getAIErrorResponse(userMessage, context);
        }
    }

    async generateImageResponse(imageData, userMessage, context, userId, isBase64 = false) {
        try {
            console.log(`📷 Procesando imagen para usuario ${userId}: ${userMessage || 'Sin texto acompañante'}`);

            // Detectar tipo de imagen basado en el mensaje del usuario
            const imageType = this.imageRecognition.detectImageType(userMessage || '');
            
            let response;
            
            // Análisis específico según el tipo detectado
            switch (imageType) {
                case 'receipt':
                    response = await this.imageRecognition.analyzeReceiptImage(imageData, context, isBase64);
                    break;
                case 'bank_statement':
                    response = await this.imageRecognition.analyzeBankStatementImage(imageData, context, isBase64);
                    break;
                case 'financial_chart':
                    response = await this.imageRecognition.analyzeFinancialChartImage(imageData, context, isBase64);
                    break;
                default:
                    response = await this.imageRecognition.analyzeImageWithFinancialContext(imageData, userMessage, context, isBase64);
                    break;
            }

            // Guardar el intercambio en memoria
            const imageDescription = `[Imagen enviada: ${imageType}] ${userMessage || 'Imagen sin texto'}`;
            this.memory.addMessage(userId, imageDescription, response);

            return response;

        } catch (error) {
            console.error('❌ Error procesando imagen:', error);
            return '📷 Ups, tuve un problema analizando tu imagen. ¿Podrías describirme qué contiene o intentar con otra imagen? 😊';
        }
    }

    async getAIDecision(userMessage, context, userId) {
        if (this.perplexity.useLocalMode) {
            return { actions: [], response: "Modo local activo" };
        }

        try {
            const decisionPrompt = this.buildDecisionPrompt(userMessage, context);
            
            const response = await this.perplexity.client.chat.completions.create({
                model: this.perplexity.config.model,
                messages: [
                    { 
                        role: "system", 
                        content: `Eres un analizador inteligente para SofIA. Tu trabajo es analizar mensajes y decidir qué acciones tomar.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO (sin explicaciones adicionales):
{
    "intent": "greeting|financial_transaction|question|conversation",
    "actions": [
        {
            "type": "register_income|register_expense|update_profile|none",
            "data": {
                "amount": number_or_null,
                "category": "string_or_null",
                "source": "string_or_null",
                "name": "string_or_null"
            }
        }
    ],
    "requires_financial_data": boolean,
    "analysis": "brief_explanation"
}`
                    },
                    { role: "user", content: decisionPrompt }
                ],
                max_tokens: 500
            });

            const content = response.choices[0].message.content.trim();
            
            // Intentar extraer JSON si hay texto adicional
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : content;
            
            return JSON.parse(jsonString);

        } catch (error) {
            console.error('Error en decisión IA:', error);
            return { actions: [], response: "Error en análisis" };
        }
    }

    buildDecisionPrompt(userMessage, context) {
        const userName = context.user_profile?.name || 'sin nombre';
        const totalInteractions = context.total_interactions || 0;
        const recentMessages = context.recent_messages || [];

        let prompt = `Analiza este mensaje y decide qué acciones tomar:

MENSAJE DEL USUARIO: "${userMessage}"

CONTEXTO:
- Nombre del usuario: ${userName}
- Total de interacciones: ${totalInteractions}
- Es primera vez: ${totalInteractions === 0}`;

        if (recentMessages.length > 0) {
            prompt += `\n- Conversación reciente:`;
            recentMessages.slice(-2).forEach((exchange, index) => {
                prompt += `\n  ${index + 1}. Usuario: "${exchange.user}"`;
                prompt += `\n     SofIA: "${exchange.agent}"`;
            });
        }

        prompt += `\n\nDECIDE:
1. ¿Qué tipo de mensaje es?
2. ¿Hay cantidades de dinero mencionadas?
3. ¿Se debe registrar alguna transacción financiera?
4. ¿Se menciona el nombre del usuario?
5. ¿Necesita información financiera actualizada?

IMPORTANTE - MANEJO DE MONEDAS:
- Por defecto, asume que todas las cantidades son en SOLES PERUANOS (S/)
- Solo usa otras monedas si el usuario las menciona explícitamente (dólares, pesos, euros, etc.)
- Si detectas una cantidad pero no está clara la moneda, marca que necesita confirmación

Analiza todo de forma inteligente y natural - NO uses patrones rígidos.`;

        return prompt;
    }

    async executeAIActions(actions, userId) {
        for (const action of actions) {
            try {
                switch (action.type) {
                    case 'register_income':
                        if (action.data.amount && action.data.amount > 0) {
                            await this.registerIncomeIntelligent(userId, action.data);
                        }
                        break;
                    
                    case 'register_expense':
                        if (action.data.amount && action.data.amount > 0) {
                            await this.registerExpenseIntelligent(userId, action.data);
                        }
                        break;
                    
                    case 'update_profile':
                        if (action.data.name) {
                            this.memory.updateUserProfile(userId, { name: action.data.name });
                        }
                        break;
                }
            } catch (error) {
                console.error('Error ejecutando acción IA:', error);
            }
        }
    }

    async registerIncomeIntelligent(userId, data) {
        const userProfile = this.memory.getUserProfile(userId);
        if (!userProfile.financial_data) {
            userProfile.financial_data = { income: [], expenses: [], goals: [] };
        }
        
        userProfile.financial_data.income.push({
            id: uuidv4(),
            amount: data.amount,
            source: data.source || 'No especificado',
            currency: data.currency || 'soles',
            date: new Date().toISOString(),
            registered_at: new Date().toISOString(),
            ai_processed: true
        });

        this.memory.updateUserProfile(userId, userProfile);
        const currencySymbol = data.currency === 'dolares' ? '$' : data.currency === 'pesos' ? '$' : 'S/';
        console.log(`💰 [IA] Ingreso registrado: ${currencySymbol}${data.amount} (${data.source || 'No especificado'}) para usuario ${userId}`);
    }

    async registerExpenseIntelligent(userId, data) {
        const userProfile = this.memory.getUserProfile(userId);
        if (!userProfile.financial_data) {
            userProfile.financial_data = { income: [], expenses: [], goals: [] };
        }
        
        userProfile.financial_data.expenses.push({
            id: uuidv4(),
            amount: data.amount,
            category: data.category || 'General',
            currency: data.currency || 'soles',
            date: new Date().toISOString(),
            registered_at: new Date().toISOString(),
            ai_processed: true
        });

        this.memory.updateUserProfile(userId, userProfile);
        const currencySymbol = data.currency === 'dolares' ? '$' : data.currency === 'pesos' ? '$' : 'S/';
        console.log(`💸 [IA] Gasto registrado: ${currencySymbol}${data.amount} (${data.category || 'General'}) para usuario ${userId}`);
    }

    // Método para generar resumen financiero completamente con IA
    async generateFinancialSummary(userId, userName) {
        const userProfile = this.memory.getUserProfile(userId);
        const financialData = userProfile.financial_data || { income: [], expenses: [], goals: [] };
        
        const summary = this.calculateFinancialSummary(financialData);
        
        // Usar IA para TODO el análisis y presentación
        const fullContext = this.memory.getConversationContext(userId);
        return await this.perplexity.generateIntelligentFinancialAnalysis(summary, userName, fullContext);
    }

    calculateFinancialSummary(financialData) {
        const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = financialData.expenses.reduce((sum, item) => sum + item.amount, 0);
        const balance = totalIncome - totalExpenses;

        return {
            totalIncome,
            totalExpenses,
            balance,
            incomeCount: financialData.income.length,
            expenseCount: financialData.expenses.length
        };
    }

    async getAIErrorResponse(userMessage, context) {
        // Incluso los errores son manejados por IA si es posible
        if (this.perplexity.useLocalMode) {
            return "Disculpa, tuve un problema técnico 😅 ¿Podrías repetir lo que me dijiste?";
        }

        try {
            const errorPrompt = `El usuario escribió: "${userMessage}"

Hubo un error técnico procesando su mensaje. Genera una respuesta natural y empática como SofIA explicando que hubo un problema pero mantén la conversación fluida.`;

            const response = await this.perplexity.client.chat.completions.create({
                model: this.perplexity.config.model,
                messages: [
                    { 
                        role: "system", 
                        content: "Eres SofIA. Hubo un error técnico. Responde de forma empática y natural sin ser técnica." 
                    },
                    { role: "user", content: errorPrompt }
                ],
                max_tokens: 300
            });

            return response.choices[0].message.content;

        } catch (error) {
            return "Ay, perdón! Tuve un problemita técnico 😅 ¿Me repites qué me decías?";
        }
    }

    // Método para obtener estadísticas del agente
    getAgentStats() {
        return {
            personality: this.personality,
            aiDriven: true,
            perplexityConfigured: this.perplexity.isConfigured(),
            imageRecognitionConfigured: this.imageRecognition.isConfigured(),
            serviceStats: this.perplexity.getServiceStats(),
            imageServiceStats: this.imageRecognition.getServiceStats(),
            usePatterns: false // Confirmación de que NO usa patrones
        };
    }
}

module.exports = FinanceAgent; 