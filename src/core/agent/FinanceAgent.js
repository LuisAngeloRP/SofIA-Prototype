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
            // Verificar si hay alguna acción pendiente (edición de transacción)
            const userProfile = this.memory.getUserProfile(userId);
            if (userProfile.pendingAction) {
                // Validar que la acción pendiente no sea muy antigua (30 minutos)
                const pendingActionTime = new Date(userProfile.pendingAction.createdAt).getTime();
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - pendingActionTime;
                
                if (timeDiff < 30 * 60 * 1000) { // 30 minutos en milisegundos
                    // Continuar con la acción pendiente
                    const result = await this.continueTransactionEdit(userId, userMessage, userProfile.pendingAction);
                    
                    if (result) {
                        // Si se completó una acción, refrescar el contexto
                        if (result.completed) {
                            context = this.memory.getConversationContext(userId);
                        }
                        
                        // Si tiene un mensaje de respuesta, devolverlo
                        if (result.message) {
                            return result.message;
                        }
                    }
                } else {
                    // La acción es muy antigua, eliminarla
                    delete userProfile.pendingAction;
                    this.memory.updateUserProfile(userId, userProfile);
                }
            }

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
            // Verificar si es una solicitud de edición primero
            const transactionDetector = this.getTransactionDetector();
            if (transactionDetector) {
                const editAnalysis = await transactionDetector.handleEditRequest(userId, userMessage);
                
                if (editAnalysis.isEditRequest) {
                    console.log(`🔍 Solicitud de edición detectada para ${userId}: ${JSON.stringify(editAnalysis.editData)}`);
                    
                    return {
                        intent: "transaction_edit",
                        actions: [
                            {
                                type: "edit_transaction",
                                data: editAnalysis.editData
                            }
                        ],
                        requires_financial_data: true,
                        analysis: "Solicitud de edición de transacción"
                    };
                }
            }
            
            // Continuar con el análisis normal si no es edición
            const decisionPrompt = this.buildDecisionPrompt(userMessage, context);
            
            const response = await this.perplexity.client.chat.completions.create({
                model: this.perplexity.config.model,
                messages: [
                    { 
                        role: "system", 
                        content: `Eres un analizador inteligente para SofIA. Tu trabajo es analizar mensajes y decidir qué acciones tomar.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO (sin explicaciones adicionales):
{
    "intent": "greeting|financial_transaction|question|conversation|edit_request",
    "actions": [
        {
            "type": "register_income|register_expense|update_profile|edit_transaction|none",
            "data": {
                "amount": number_or_null,
                "category": "string_or_null",
                "source": "string_or_null",
                "name": "string_or_null",
                "description": "string_or_null"
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
6. ¿El usuario quiere editar una transacción existente?

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

                    case 'edit_transaction':
                        if (action.data.description) {
                            await this.handleTransactionEdit(userId, action.data);
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

    // Método para manejar la edición de transacciones
    async handleTransactionEdit(userId, data) {
        try {
            // Paso 1: Intentar identificar a qué transacción se refiere el usuario
            const userDataService = this.getUserDataService();
            if (!userDataService) {
                console.error('No se pudo obtener UserDataService');
                return {
                    success: false,
                    message: "No se pudo procesar la edición de la transacción"
                };
            }
            
            // Buscar transacción por descripción
            const identificationResult = await userDataService.identifyTransactionByDescription(
                userId, 
                data.description
            );
            
            // Si se necesita más información, guardar el estado para el siguiente mensaje
            if (!identificationResult.success && identificationResult.needsMoreInfo) {
                // Guardar información en el perfil del usuario para continuar la edición
                const userProfile = this.memory.getUserProfile(userId);
                userProfile.pendingAction = {
                    type: 'edit_transaction',
                    data: {
                        description: data.description,
                        availableTransactions: identificationResult.availableTransactions
                    },
                    createdAt: new Date().toISOString()
                };
                this.memory.updateUserProfile(userId, userProfile);
                
                return {
                    success: false,
                    needsMoreInfo: true,
                    message: "Se necesita más información para identificar la transacción"
                };
            }
            
            // Si no se encontró la transacción
            if (!identificationResult.success) {
                return {
                    success: false,
                    message: identificationResult.error
                };
            }
            
            // Si el usuario no proporcionó cambios, guardar un estado pendiente
            if (!data.changes || Object.keys(data.changes).length === 0) {
                const userProfile = this.memory.getUserProfile(userId);
                userProfile.pendingAction = {
                    type: 'edit_transaction_update',
                    data: {
                        transaction: identificationResult.transaction
                    },
                    createdAt: new Date().toISOString()
                };
                this.memory.updateUserProfile(userId, userProfile);
                
                return {
                    success: true,
                    needsChanges: true,
                    message: "Transacción identificada, esperando cambios específicos"
                };
            }
            
            // Si hay cambios, proceder con la edición
            const transaction = identificationResult.transaction;
            const result = await userDataService.editTransaction(
                userId,
                transaction.id,
                transaction.type,
                data.changes
            );
            
            return result;
            
        } catch (error) {
            console.error('Error en handleTransactionEdit:', error);
            return {
                success: false,
                message: "Ocurrió un error al editar la transacción"
            };
        }
    }
    
    // Obtener UserDataService
    getUserDataService() {
        try {
            const ServiceRegistry = require('../services/ServiceRegistry');
            const registry = ServiceRegistry.getInstance();
            return registry.getService('UserDataService');
        } catch (error) {
            console.error('Error obteniendo UserDataService:', error);
            return null;
        }
    }

    // Método para continuar la edición de una transacción con selección del usuario
    async continueTransactionEdit(userId, userMessage, pendingAction) {
        try {
            const userDataService = this.getUserDataService();
            if (!userDataService) {
                return null;
            }
            
            // Si la acción pendiente es para seleccionar una transacción
            if (pendingAction.type === 'edit_transaction') {
                const availableTransactions = pendingAction.data.availableTransactions;
                
                // Intentar identificar cuál transacción seleccionó el usuario
                let selectedTransaction = null;
                const lowerMessage = userMessage.toLowerCase();
                
                // Comprobar si el mensaje contiene un número de selección
                const numberMatch = userMessage.match(/(\d+)/);
                if (numberMatch) {
                    const selectedIndex = parseInt(numberMatch[1], 10) - 1;
                    if (selectedIndex >= 0 && selectedIndex < availableTransactions.length) {
                        selectedTransaction = availableTransactions[selectedIndex];
                    }
                } else {
                    // Buscar por texto descriptivo
                    for (const transaction of availableTransactions) {
                        const details = transaction.details.toLowerCase();
                        if (lowerMessage.includes(details) || 
                            (transaction.category && lowerMessage.includes(transaction.category.toLowerCase())) ||
                            lowerMessage.includes(transaction.amount.toString())) {
                            selectedTransaction = transaction;
                            break;
                        }
                    }
                }
                
                if (!selectedTransaction) {
                    return {
                        success: false,
                        message: "No pude identificar la transacción seleccionada. Por favor, sé más específico."
                    };
                }
                
                // Actualizar la acción pendiente para esperar los cambios
                const userProfile = this.memory.getUserProfile(userId);
                userProfile.pendingAction = {
                    type: 'edit_transaction_update',
                    data: {
                        transaction: selectedTransaction
                    },
                    createdAt: new Date().toISOString()
                };
                this.memory.updateUserProfile(userId, userProfile);
                
                return {
                    success: true,
                    needsChanges: true,
                    transaction: selectedTransaction,
                    message: "Transacción seleccionada, ahora indícame qué cambios deseas hacer."
                };
            }
            
            // Si la acción pendiente es para actualizar una transacción ya seleccionada
            if (pendingAction.type === 'edit_transaction_update') {
                const transaction = pendingAction.data.transaction;
                
                // Extraer cambios del mensaje del usuario usando IA
                const changes = await this.extractTransactionChanges(userMessage, transaction);
                
                if (!changes || Object.keys(changes).length === 0) {
                    return {
                        success: false,
                        message: "No pude identificar qué cambios deseas hacer. Por favor, sé más específico."
                    };
                }
                
                // Pedir confirmación antes de hacer los cambios
                const userProfile = this.memory.getUserProfile(userId);
                userProfile.pendingAction = {
                    type: 'confirm_transaction_edit',
                    data: {
                        transaction,
                        changes
                    },
                    createdAt: new Date().toISOString()
                };
                this.memory.updateUserProfile(userId, userProfile);
                
                // Formato amigable para la confirmación
                const formattedChanges = Object.entries(changes).map(([key, value]) => {
                    if (key === 'amount') return `monto: ${transaction.currency === 'dolares' ? '$' : 'S/'}${value}`;
                    if (key === 'category') return `categoría: ${value}`;
                    if (key === 'source') return `fuente: ${value}`;
                    if (key === 'description') return `descripción: ${value}`;
                    if (key === 'currency') return `moneda: ${value}`;
                    return `${key}: ${value}`;
                }).join(', ');
                
                return {
                    success: true,
                    needsConfirmation: true,
                    transaction,
                    changes,
                    formattedChanges,
                    message: `¿Confirmas estos cambios? Cambiar ${formattedChanges}`
                };
            }
            
            // Si la acción pendiente es para confirmar una edición
            if (pendingAction.type === 'confirm_transaction_edit') {
                const transaction = pendingAction.data.transaction;
                const changes = pendingAction.data.changes;
                
                // Verificar si el usuario confirmó el cambio
                if (this.isConfirmationMessage(userMessage)) {
                    // Realizar la edición
                    const result = await userDataService.editTransaction(
                        userId,
                        transaction.id,
                        transaction.type,
                        changes
                    );
                    
                    // Limpiar acción pendiente
                    const userProfile = this.memory.getUserProfile(userId);
                    delete userProfile.pendingAction;
                    this.memory.updateUserProfile(userId, userProfile);
                    
                    return {
                        success: true,
                        completed: true,
                        result,
                        message: result.aiAnalysis || "Transacción editada correctamente"
                    };
                } else {
                    // Si no confirmó, cancelar la edición
                    const userProfile = this.memory.getUserProfile(userId);
                    delete userProfile.pendingAction;
                    this.memory.updateUserProfile(userId, userProfile);
                    
                    return {
                        success: false,
                        cancelled: true,
                        message: "He cancelado la edición de la transacción."
                    };
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('Error en continueTransactionEdit:', error);
            return {
                success: false,
                message: "Ocurrió un error al procesar la edición."
            };
        }
    }
    
    // Extraer cambios de transacción del mensaje del usuario usando IA
    async extractTransactionChanges(userMessage, transaction) {
        try {
            const prompt = `Analiza este mensaje del usuario sobre la edición de una transacción:
"${userMessage}"

Transacción actual:
${JSON.stringify(transaction, null, 2)}

Extrae SOLO los campos que el usuario quiere cambiar. Los campos posibles son:
- amount (monto)
- category (categoría, solo para gastos)
- source (fuente, solo para ingresos)
- description (descripción)
- currency (moneda: "soles", "dolares" o "pesos")

Devuelve SOLO un objeto JSON con los campos a cambiar, ejemplo:
{
  "amount": 123.45,
  "category": "nueva categoría"
}

Si el usuario no especifica claramente los cambios, devuelve un objeto vacío {}.
NO incluyas campos que el usuario no mencionó cambiar.`;

            const perplexityService = this.perplexity;
            if (!perplexityService?.client) {
                // Fallback simple si no hay IA
                return this.extractChangesManual(userMessage, transaction);
            }

            const response = await perplexityService.client.chat.completions.create({
                model: perplexityService.config.model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200
            });
            
            const content = response?.choices[0]?.message?.content?.trim();
            
            try {
                // Extraer JSON si hay texto adicional
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : content;
                
                return JSON.parse(jsonString);
            } catch (error) {
                console.error('Error parseando cambios:', error);
                return {};
            }
            
        } catch (error) {
            console.error('Error extrayendo cambios con IA:', error);
            return this.extractChangesManual(userMessage, transaction);
        }
    }
    
    // Extraer cambios de forma manual (fallback)
    extractChangesManual(userMessage, transaction) {
        const changes = {};
        const lowerMessage = userMessage.toLowerCase();
        
        // Buscar montos
        const amountMatch = userMessage.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch) {
            changes.amount = parseFloat(amountMatch[1]);
        }
        
        // Buscar categorías comunes (para gastos)
        const categories = ['alimentación', 'comida', 'transporte', 'vivienda', 'salud', 
                          'entretenimiento', 'vestimenta', 'educación', 'servicios', 'general'];
        
        for (const category of categories) {
            if (lowerMessage.includes(category)) {
                changes.category = category;
                break;
            }
        }
        
        // Buscar fuentes de ingreso (para ingresos)
        const sources = ['salario', 'freelance', 'venta', 'negocio', 'inversión', 'regalo', 'otros'];
        
        for (const source of sources) {
            if (lowerMessage.includes(source)) {
                changes.source = source;
                break;
            }
        }
        
        // Buscar moneda
        if (lowerMessage.includes('dólar') || lowerMessage.includes('dolar') || lowerMessage.includes('usd')) {
            changes.currency = 'dolares';
        } else if (lowerMessage.includes('sol') || lowerMessage.includes('pen')) {
            changes.currency = 'soles';
        } else if (lowerMessage.includes('peso')) {
            changes.currency = 'pesos';
        }
        
        return changes;
    }
    
    // Verificar si un mensaje es de confirmación
    isConfirmationMessage(message) {
        const lowerMessage = message.toLowerCase();
        const confirmWords = ['sí', 'si', 'confirmo', 'confirmar', 'ok', 'okay', 'dale', 
                           'adelante', 'procede', 'hazlo', 'afirmativo', 'correcto', 'exacto'];
        
        return confirmWords.some(word => lowerMessage.includes(word));
    }

    // Obtener TransactionDetector
    getTransactionDetector() {
        try {
            const ServiceRegistry = require('../services/ServiceRegistry');
            const registry = ServiceRegistry.getInstance();
            return registry.getService('TransactionDetectorService');
        } catch (error) {
            console.error('Error obteniendo TransactionDetectorService:', error);
            return null;
        }
    }
}

module.exports = FinanceAgent; 