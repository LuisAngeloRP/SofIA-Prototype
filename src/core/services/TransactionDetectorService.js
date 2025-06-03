class TransactionDetectorService {
    constructor() {
        this.perplexityService = null; // Lazy loading to avoid circular dependency
        this.userDataService = null;   // Lazy loading to avoid circular dependency
        
        // Patrones de expresiones financieras en español
        this.financialKeywords = [
            'gané', 'gane', 'cobré', 'cobre', 'recibí', 'recibi', 'me pagaron',
            'gasté', 'gaste', 'pagué', 'pague', 'compré', 'compre', 'me costó',
            'soles', 'sol', 'dólares', 'dolares', 'pesos', 'plata', 'dinero',
            'S/', '$', 'USD', 'PEN', 'CLP', 'ingresos', 'gastos', 'salario',
            'sueldo', 'freelance', 'negocio', 'venta', 'compra', 'factura'
        ];
        
        // Solo loggear una vez por instancia
        if (!TransactionDetectorService._logged) {
            console.log('🔍 TransactionDetectorService inicializado con IA');
            TransactionDetectorService._logged = true;
        }
    }

    // Obtener servicios usando ServiceRegistry para evitar dependencia circular
    getPerplexityService() {
        if (!this.perplexityService) {
            const ServiceRegistry = require('./ServiceRegistry');
            const registry = ServiceRegistry.getInstance();
            this.perplexityService = registry.getService('PerplexityService');
        }
        return this.perplexityService;
    }

    getUserDataService() {
        if (!this.userDataService) {
            const ServiceRegistry = require('./ServiceRegistry');
            const registry = ServiceRegistry.getInstance();
            this.userDataService = registry.getService('UserDataService');
        }
        return this.userDataService;
    }

    // Método principal para analizar mensaje y detectar transacciones
    async analyzeMessage(userId, message) {
        try {
            // Verificar si el mensaje contiene información financiera
            const hasFinancialContent = this.containsFinancialKeywords(message);
            
            // Verificar si es una solicitud de edición
            const isEditRequest = this.isEditRequest(message);
            
            if (!hasFinancialContent && !isEditRequest) {
                return {
                    hasTransaction: false,
                    message: 'No se detectó información financiera'
                };
            }
            
            // Si es una solicitud de edición, manejarla de forma especial
            if (isEditRequest) {
                return await this.handleEditRequest(userId, message);
            }

            // Usar IA para detectar y extraer transacciones
            const transactionData = await this.extractTransactionWithAI(message);
            
            if (!transactionData.hasTransaction) {
                return {
                    hasTransaction: false,
                    message: 'No se pudo extraer información de transacción válida'
                };
            }

            // Registrar la transacción automáticamente
            const result = await this.registerTransaction(userId, transactionData);
            
            return {
                hasTransaction: true,
                transactionData,
                registrationResult: result,
                aiResponse: await this.generateConfirmationResponse(transactionData, result)
            };

        } catch (error) {
            console.error('❌ Error analizando mensaje para transacciones:', error);
            return {
                hasTransaction: false,
                error: error.message
            };
        }
    }

    // Verificar si es una solicitud de edición
    isEditRequest(message) {
        const lowerMessage = message.toLowerCase();
        const editKeywords = [
            'editar', 'edita', 'modificar', 'modifica', 'cambiar', 'cambia',
            'corregir', 'corrige', 'actualizar', 'actualiza', 'arreglar', 'arregla'
        ];
        
        return editKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    
    // Manejar solicitud de edición
    async handleEditRequest(userId, message) {
        try {
            const prompt = `Analiza este mensaje del usuario:
"${message}"

Determina si está pidiendo editar una transacción financiera (ingreso o gasto).
Si es así, extrae la información para identificar qué transacción quiere editar.

Devuelve SOLO un objeto JSON con este formato:
{
  "isEditRequest": true/false,
  "transactionType": "income" o "expense" o null,
  "description": "descripción de la transacción a editar",
  "changes": {
    "amount": número o null,
    "category": "categoría" o null,
    "source": "fuente" o null
  },
  "confidence": 0.0-1.0
}

NO incluyas nada más que el JSON en tu respuesta.`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                return this.fallbackEditDetection(message);
            }

            const response = await perplexityService.client.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            });

            const content = response?.choices[0]?.message?.content?.trim();
            
            try {
                // Intentar extraer JSON válido de la respuesta
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : content;
                
                const result = JSON.parse(jsonString);
                
                if (result.isEditRequest) {
                    return {
                        isEditRequest: true,
                        editData: {
                            description: result.description,
                            transactionType: result.transactionType,
                            changes: result.changes || {}
                        }
                    };
                } else {
                    return {
                        hasTransaction: false,
                        isEditRequest: false
                    };
                }
            } catch (error) {
                console.error('Error parseando respuesta de edición:', error);
                return this.fallbackEditDetection(message);
            }
            
        } catch (error) {
            console.error('Error analizando solicitud de edición:', error);
            return this.fallbackEditDetection(message);
        }
    }
    
    // Detección manual de solicitud de edición (fallback)
    fallbackEditDetection(message) {
        const lowerMessage = message.toLowerCase();
        
        // Verificar si es una solicitud de edición
        if (!this.isEditRequest(lowerMessage)) {
            return {
                isEditRequest: false,
                hasTransaction: false
            };
        }
        
        // Intentar determinar si es ingreso o gasto
        const incomeKeywords = ['ingreso', 'ganancia', 'salario', 'cobré', 'recibí', 'me pagaron'];
        const expenseKeywords = ['gasto', 'compra', 'pagué', 'gasté', 'pago'];
        
        let transactionType = null;
        
        if (incomeKeywords.some(word => lowerMessage.includes(word))) {
            transactionType = 'income';
        } else if (expenseKeywords.some(word => lowerMessage.includes(word))) {
            transactionType = 'expense';
        }
        
        // Extraer posibles cambios
        const changes = {};
        
        // Buscar montos
        const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch) {
            changes.amount = parseFloat(amountMatch[1]);
        }
        
        return {
            isEditRequest: true,
            editData: {
                description: message,
                transactionType,
                changes
            }
        };
    }

    // Verificar si el mensaje contiene palabras clave financieras
    containsFinancialKeywords(message) {
        const lowerMessage = message.toLowerCase();
        return this.financialKeywords.some(keyword => 
            lowerMessage.includes(keyword.toLowerCase())
        );
    }

    // Extraer información de transacción usando IA
    async extractTransactionWithAI(message) {
        try {
            const prompt = `Analiza este mensaje en español para detectar transacciones financieras:

"${message}"

INSTRUCCIONES PRECISAS:
1. Detecta si hay una transacción financiera (ingreso o gasto)
2. Extrae la información estructurada
3. Por defecto, asume SOLES PERUANOS (PEN) si no se especifica moneda
4. Clasifica como 'income' o 'expense'

Devuelve SOLO el formato JSON (sin texto adicional):
{
  "hasTransaction": true/false,
  "type": "income" o "expense",
  "amount": número_sin_símbolos,
  "currency": "soles" o "dolares" o "pesos",
  "source": "fuente_del_ingreso" (solo para income),
  "category": "categoría_del_gasto" (solo para expense),
  "description": "descripción_extraída",
  "confidence": 0.0-1.0
}

EJEMPLOS DE MONEDAS:
- "gané 500" → currency: "soles"
- "recibí $100" → currency: "dolares" 
- "gasté S/50" → currency: "soles"
- "pagué 200 pesos" → currency: "pesos"

REGLAS:
- Solo USA "dolares" si hay símbolo $ o mencionan explícitamente dólares
- Solo USA "pesos" si mencionan explícitamente pesos
- POR DEFECTO todo es "soles" (moneda local peruana)
- SOLO DEVUELVE JSON VÁLIDO, sin texto explicativo adicional`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                return this.fallbackExtraction(message);
            }

            const response = await perplexityService.client.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300,
                web_search_options: {
                    search_context_size: "low"
                }
            });

            const content = response?.choices[0]?.message?.content?.trim();
            
            // Si no hay contenido, usar extracción manual
            if (!content) {
                console.log('📝 Respuesta de IA vacía, usando extracción manual');
                return this.fallbackExtraction(message);
            }
            
            try {
                // Intentar extraer JSON válido de la respuesta
                let jsonContent = content;
                
                // Si la respuesta contiene más texto, intentar extraer solo la parte JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonContent = jsonMatch[0];
                }
                
                // Intentar parsear como JSON
                const extracted = JSON.parse(jsonContent);
                
                // Validar la estructura
                if (this.validateTransactionData(extracted)) {
                    console.log('✅ JSON extraído correctamente de la respuesta de IA');
                    return extracted;
                } else {
                    console.log('⚠️ El JSON extraído no cumple con la estructura esperada, usando extracción manual');
                    return this.fallbackExtraction(message);
                }
            } catch (parseError) {
                console.log('📝 Respuesta IA no es JSON válido, intentando extracción manual');
                console.log(`⚠️ Error de parsing: ${parseError.message}`);
                if (content.length < 100) {
                    console.log(`⚠️ Contenido recibido: ${content}`);
                }
            }

            // Si no se puede parsear, usar extracción manual como fallback
            return this.fallbackExtraction(message);

        } catch (error) {
            console.error('❌ Error extrayendo transacción con IA:', error);
            return this.fallbackExtraction(message);
        }
    }

    // Validar datos de transacción extraídos
    validateTransactionData(data) {
        if (!data || typeof data !== 'object') return false;
        if (typeof data.hasTransaction !== 'boolean') return false;
        if (!data.hasTransaction) return true;
        
        if (!['income', 'expense'].includes(data.type)) return false;
        if (typeof data.amount !== 'number' || data.amount <= 0) return false;
        if (!['soles', 'dolares', 'pesos'].includes(data.currency)) return false;
        if (typeof data.confidence !== 'number') return false;
        
        return true;
    }

    // Extracción manual como fallback
    fallbackExtraction(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detectar cantidades
        const amountMatches = message.match(/(\d+(?:\.\d{2})?)/g);
        if (!amountMatches) {
            return { hasTransaction: false };
        }

        const amount = parseFloat(amountMatches[0]);
        
        // Detectar moneda
        let currency = 'soles'; // Por defecto
        if (message.includes('$') || lowerMessage.includes('dólar')) {
            currency = 'dolares';
        } else if (lowerMessage.includes('peso')) {
            currency = 'pesos';
        }

        // Detectar tipo de transacción
        const incomeKeywords = ['gané', 'gane', 'cobré', 'cobre', 'recibí', 'recibi', 'me pagaron'];
        const expenseKeywords = ['gasté', 'gaste', 'pagué', 'pague', 'compré', 'compre', 'me costó'];
        
        let type = 'expense'; // Por defecto
        if (incomeKeywords.some(keyword => lowerMessage.includes(keyword))) {
            type = 'income';
        }

        const result = {
            hasTransaction: true,
            type,
            amount,
            currency,
            description: message.substring(0, 100),
            confidence: 0.6
        };

        if (type === 'income') {
            result.source = 'trabajo'; // Categoría por defecto
        } else {
            result.category = 'varios'; // Categoría por defecto
        }

        return result;
    }

    // Registrar transacción automáticamente
    async registerTransaction(userId, transactionData) {
        try {
            const userDataService = this.getUserDataService();
            if (!userDataService) {
                return { success: false, error: 'UserDataService no disponible' };
            }

            if (transactionData.type === 'income') {
                return await userDataService.registerIncome(
                    userId,
                    transactionData.amount,
                    transactionData.source || 'no especificado',
                    transactionData.description,
                    transactionData.currency
                );
            } else {
                return await userDataService.registerExpense(
                    userId,
                    transactionData.amount,
                    transactionData.category || 'varios',
                    transactionData.description,
                    transactionData.currency
                );
            }
        } catch (error) {
            console.error('❌ Error registrando transacción:', error);
            return { success: false, error: error.message };
        }
    }

    // Generar respuesta de confirmación con IA
    async generateConfirmationResponse(transactionData, registrationResult) {
        try {
            const currencySymbol = this.getCurrencySymbol(transactionData.currency);
            const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto';
            
            if (!registrationResult.success) {
                return `❌ Ups, no pude registrar tu ${typeText} automáticamente. Inténtalo de nuevo.`;
            }

            const prompt = `Como SofIA, genera una respuesta natural y breve (máximo 2 oraciones) confirmando el registro de esta transacción:

Tipo: ${typeText}
Cantidad: ${currencySymbol}${transactionData.amount}
${transactionData.type === 'income' ? 'Fuente: ' + transactionData.source : 'Categoría: ' + transactionData.category}

La respuesta debe:
1. Confirmar que se registró correctamente
2. Ser natural y empática como SofIA
3. Incluir un emoji apropiado
4. Ser motivadora pero breve

No incluyas recomendaciones adicionales en esta respuesta.
IMPORTANTE: No devuelvas JSON, solo texto plano.`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                // Respuesta de fallback si no hay servicio IA disponible
                return `✅ Listo! Registré tu ${typeText} de ${currencySymbol}${transactionData.amount} correctamente 📊`;
            }

            try {
                const response = await perplexityService.client.chat.completions.create({
                    model: "sonar",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 150
                });
                
                const content = response?.choices[0]?.message?.content || '';
                
                // Verificar que la respuesta no está vacía
                if (!content.trim()) {
                    throw new Error('Respuesta vacía de la IA');
                }
                
                // Eliminar cualquier estructura JSON que podría estar presente
                const cleanedContent = content.replace(/\{[\s\S]*\}/, '').trim();
                
                // Si después de limpiar JSON sigue habiendo contenido, devolverlo
                if (cleanedContent) {
                    return cleanedContent;
                }
                
                // Si no hay contenido después de limpiar, usar la respuesta predeterminada
                return `✅ Perfecto, registré tu ${typeText} de ${currencySymbol}${transactionData.amount} ${transactionData.type === 'income' ? 'de ' + transactionData.source : 'en ' + transactionData.category} 😊`;
            } catch (error) {
                console.error('Error obteniendo respuesta de IA:', error.message);
                return `✅ Listo! Tu ${typeText} de ${currencySymbol}${transactionData.amount} ${transactionData.type === 'income' ? 'de ' + transactionData.source : 'en ' + transactionData.category} ha sido registrado 📊`;
            }
        } catch (error) {
            console.error('Error general en generateConfirmationResponse:', error);
            const currencySymbol = this.getCurrencySymbol(transactionData.currency);
            const typeText = transactionData.type === 'income' ? 'ingreso' : 'gasto';
            return `✅ Transacción registrada: ${typeText} de ${currencySymbol}${transactionData.amount}`;
        }
    }

    // Obtener símbolo de moneda
    getCurrencySymbol(currency) {
        switch (currency) {
            case 'dolares': return '$';
            case 'pesos': return '$';
            case 'soles':
            default: return 'S/';
        }
    }

    // Método para detectar múltiples transacciones en un mensaje
    async detectMultipleTransactions(userId, message) {
        try {
            const prompt = `Analiza este mensaje para detectar MÚLTIPLES transacciones financieras:

"${message}"

Busca todas las transacciones mencionadas y devuelve un array JSON con cada una:

[
  {
    "hasTransaction": true,
    "type": "income/expense",
    "amount": número,
    "currency": "soles/dolares/pesos",
    "source": "fuente" (solo income),
    "category": "categoría" (solo expense),
    "description": "descripción"
  }
]

Si no hay transacciones válidas, devuelve: []
Por defecto asume SOLES PERUANOS si no se especifica moneda.`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                return { success: false, transactions: [] };
            }

            const response = await perplexityService.client.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 400
            });

            const content = response?.choices[0]?.message?.content?.trim();
            
            try {
                const transactions = JSON.parse(content);
                if (Array.isArray(transactions)) {
                    const results = [];
                    
                    for (const transaction of transactions) {
                        if (this.validateTransactionData(transaction)) {
                            const result = await this.registerTransaction(userId, transaction);
                            results.push({
                                transaction,
                                result
                            });
                        }
                    }
                    
                    return {
                        success: true,
                        transactions: results,
                        message: await this.generateMultipleTransactionResponse(results)
                    };
                }
            } catch (parseError) {
                console.log('No se pudieron detectar múltiples transacciones');
            }

            return { success: false, transactions: [] };

        } catch (error) {
            console.error('Error detectando múltiples transacciones:', error);
            return { success: false, error: error.message };
        }
    }

    // Generar respuesta para múltiples transacciones
    async generateMultipleTransactionResponse(results) {
        const successCount = results.filter(r => r.result.success).length;
        const totalCount = results.length;
        
        if (successCount === 0) {
            return '❌ No pude registrar ninguna transacción. Inténtalo de nuevo.';
        }
        
        if (successCount === totalCount) {
            return `✅ Perfecto! Registré todas tus ${totalCount} transacciones correctamente 🎉`;
        }
        
        return `✅ Registré ${successCount} de ${totalCount} transacciones. Algunas no se pudieron procesar.`;
    }

    // Método para obtener estadísticas del detector
    getDetectorStats() {
        return {
            name: 'TransactionDetectorService',
            version: '1.0.0',
            description: 'Detección automática de transacciones con IA',
            supportedCurrencies: ['soles', 'dolares', 'pesos'],
            supportedLanguages: ['español'],
            features: [
                'Detección automática en tiempo real',
                'Extracción inteligente con Perplexity AI',
                'Clasificación automática de ingresos/gastos',
                'Registro inmediato en JSON por usuario',
                'Soporte para múltiples monedas',
                'Confirmación natural con IA'
            ]
        };
    }

    // Método para entrenar el detector con ejemplos personalizados
    async trainWithUserExamples(userId, examples) {
        try {
            // Guardar ejemplos de entrenamiento para mejorar la detección
            const userDataService = this.getUserDataService();
            if (!userDataService) {
                return { success: false, error: 'UserDataService no disponible' };
            }

            const userData = await userDataService.getUserData(userId);
            
            if (!userData.analytics.trainingExamples) {
                userData.analytics.trainingExamples = [];
            }
            
            userData.analytics.trainingExamples.push({
                timestamp: new Date().toISOString(),
                examples: examples
            });
            
            await userDataService.saveUserAnalytics(userId, userData.analytics);
            
            return {
                success: true,
                message: 'Ejemplos de entrenamiento guardados para mejorar la detección'
            };

        } catch (error) {
            console.error('Error guardando ejemplos de entrenamiento:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TransactionDetectorService; 