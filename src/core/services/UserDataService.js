const fs = require('fs').promises;
const path = require('path');

class UserDataService {
    constructor() {
        this.dataBasePath = path.join(__dirname, '../../data/users');
        this.perplexityService = null; // Lazy loading to avoid circular dependency
        this.initializeDataDirectory();
        
        // Solo loggear una vez por instancia
        if (!UserDataService._logged) {
            console.log('📊 UserDataService inicializado con gestión AI por usuario');
            UserDataService._logged = true;
        }
    }

    // Obtener PerplexityService usando ServiceRegistry para evitar dependencia circular
    getPerplexityService() {
        if (!this.perplexityService) {
            const ServiceRegistry = require('./ServiceRegistry');
            const registry = ServiceRegistry.getInstance();
            this.perplexityService = registry.getService('PerplexityService');
        }
        return this.perplexityService;
    }

    async initializeDataDirectory() {
        try {
            await fs.mkdir(this.dataBasePath, { recursive: true });
        } catch (error) {
            console.error('❌ Error creando directorio de datos:', error);
        }
    }

    // Método principal para obtener datos de usuario
    async getUserData(userId) {
        const userDir = await this.ensureUserDirectory(userId);
        const userData = {
            profile: await this.loadUserProfile(userId),
            financial: await this.loadUserFinancialData(userId),
            history: await this.loadUserHistory(userId),
            analytics: await this.loadUserAnalytics(userId)
        };
        
        return userData;
    }

    // Crear directorio del usuario si no existe
    async ensureUserDirectory(userId) {
        const sanitizedUserId = this.sanitizeUserId(userId);
        const userDir = path.join(this.dataBasePath, sanitizedUserId);
        
        try {
            await fs.mkdir(userDir, { recursive: true });
            return userDir;
        } catch (error) {
            console.error(`❌ Error creando directorio para usuario ${userId}:`, error);
            throw error;
        }
    }

    // Sanear ID de usuario para nombre de carpeta
    sanitizeUserId(userId) {
        return userId.replace(/[^a-zA-Z0-9@._-]/g, '_').substring(0, 50);
    }

    // Cargar perfil de usuario
    async loadUserProfile(userId) {
        const filePath = await this.getUserFilePath(userId, 'profile.json');
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Si no existe, crear perfil básico
            const newProfile = {
                userId,
                name: null,
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                preferences: {
                    currency: 'soles', // Por defecto soles peruanos
                    timezone: 'America/Lima',
                    language: 'es'
                },
                aiPersonalization: {
                    communicationStyle: 'friendly',
                    financialGoals: [],
                    riskTolerance: 'moderate'
                }
            };
            
            await this.saveUserProfile(userId, newProfile);
            return newProfile;
        }
    }

    // Cargar datos financieros del usuario
    async loadUserFinancialData(userId) {
        const filePath = await this.getUserFilePath(userId, 'financial.json');
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Si no existe, crear estructura financiera vacía
            const newFinancialData = {
                income: [],
                expenses: [],
                savings: [],
                goals: [],
                summary: {
                    totalIncome: 0,
                    totalExpenses: 0,
                    currentBalance: 0,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            await this.saveUserFinancialData(userId, newFinancialData);
            return newFinancialData;
        }
    }

    // Cargar historial de conversaciones del usuario
    async loadUserHistory(userId) {
        const filePath = await this.getUserFilePath(userId, 'history.json');
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            const newHistory = {
                conversations: [],
                totalInteractions: 0,
                firstInteraction: new Date().toISOString(),
                lastInteraction: new Date().toISOString()
            };
            
            await this.saveUserHistory(userId, newHistory);
            return newHistory;
        }
    }

    // Cargar análisis de IA del usuario
    async loadUserAnalytics(userId) {
        const filePath = await this.getUserFilePath(userId, 'analytics.json');
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            const newAnalytics = {
                spendingPatterns: [],
                aiInsights: [],
                recommendations: [],
                lastAnalysis: null
            };
            
            await this.saveUserAnalytics(userId, newAnalytics);
            return newAnalytics;
        }
    }

    // Obtener ruta de archivo para usuario
    async getUserFilePath(userId, filename) {
        const userDir = await this.ensureUserDirectory(userId);
        return path.join(userDir, filename);
    }

    // Registrar ingreso con IA
    async registerIncome(userId, amount, source, description = '', currency = 'soles') {
        try {
            const userData = await this.getUserData(userId);
            
            // Crear registro de ingreso
            const incomeRecord = {
                id: this.generateTransactionId(),
                amount: parseFloat(amount),
                source,
                description,
                currency,
                timestamp: new Date().toISOString(),
                aiClassification: await this.classifyIncomeWithAI(source, description),
                verified: false
            };

            // Agregar al array de ingresos
            userData.financial.income.push(incomeRecord);
            
            // Actualizar resumen
            await this.updateFinancialSummary(userId, userData.financial);
            
            // Guardar datos actualizados
            await this.saveUserFinancialData(userId, userData.financial);
            
            // Actualizar historial con IA
            await this.addToUserHistory(userId, 'income_registered', {
                amount,
                source,
                currency,
                aiAnalysis: await this.generateIncomeAnalysisWithAI(incomeRecord, userData)
            });

            console.log(`💰 Ingreso registrado para ${userId}: ${currency === 'soles' ? 'S/' : '$'}${amount} de ${source}`);
            
            return {
                success: true,
                record: incomeRecord,
                aiRecommendations: await this.generateAIRecommendations(userId, userData, 'income')
            };

        } catch (error) {
            console.error(`❌ Error registrando ingreso para ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Registrar gasto con IA
    async registerExpense(userId, amount, category, description = '', currency = 'soles') {
        try {
            const userData = await this.getUserData(userId);
            
            // Crear registro de gasto
            const expenseRecord = {
                id: this.generateTransactionId(),
                amount: parseFloat(amount),
                category,
                description,
                currency,
                timestamp: new Date().toISOString(),
                aiClassification: await this.classifyExpenseWithAI(category, description),
                budgetImpact: await this.analyzeBudgetImpactWithAI(amount, category, userData),
                verified: false
            };

            // Agregar al array de gastos
            userData.financial.expenses.push(expenseRecord);
            
            // Actualizar resumen
            await this.updateFinancialSummary(userId, userData.financial);
            
            // Guardar datos actualizados
            await this.saveUserFinancialData(userId, userData.financial);
            
            // Actualizar historial con IA
            await this.addToUserHistory(userId, 'expense_registered', {
                amount,
                category,
                currency,
                aiAnalysis: await this.generateExpenseAnalysisWithAI(expenseRecord, userData)
            });

            console.log(`💸 Gasto registrado para ${userId}: ${currency === 'soles' ? 'S/' : '$'}${amount} en ${category}`);
            
            return {
                success: true,
                record: expenseRecord,
                aiRecommendations: await this.generateAIRecommendations(userId, userData, 'expense')
            };

        } catch (error) {
            console.error(`❌ Error registrando gasto para ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Clasificar ingreso con IA
    async classifyIncomeWithAI(source, description) {
        try {
            const prompt = `Clasifica este ingreso financiero automáticamente:
Fuente: ${source}
Descripción: ${description}

Devuelve SOLO una clasificación de estas opciones:
- salary (salario/sueldo)
- freelance (trabajo independiente)  
- business (negocio/empresa)
- investment (inversiones)
- rental (alquiler)
- gift (regalo/donación)
- bonus (bonificación)
- other (otro)

Responde solo con la palabra en inglés, sin explicaciones.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50
            });

            return response?.choices[0]?.message?.content?.trim().toLowerCase() || 'other';
        } catch (error) {
            console.error('Error clasificando ingreso con IA:', error);
            return 'other';
        }
    }

    // Clasificar gasto con IA
    async classifyExpenseWithAI(category, description) {
        try {
            const prompt = `Clasifica este gasto financiero:
Categoría: ${category}
Descripción: ${description}

Devuelve SOLO una clasificación de estas opciones:
- essential (esencial/necesario)
- discretionary (discrecional/opcional)
- investment (inversión a futuro)
- emergency (emergencia)
- entertainment (entretenimiento)
- health (salud)
- education (educación)
- transportation (transporte)

Responde solo con la palabra en inglés, sin explicaciones.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50
            });

            return response?.choices[0]?.message?.content?.trim().toLowerCase() || 'discretionary';
        } catch (error) {
            console.error('Error clasificando gasto con IA:', error);
            return 'discretionary';
        }
    }

    // Analizar impacto en presupuesto con IA
    async analyzeBudgetImpactWithAI(amount, category, userData) {
        try {
            const totalExpenses = userData.financial.expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const totalIncome = userData.financial.income.reduce((sum, inc) => sum + inc.amount, 0);
            const categoryExpenses = userData.financial.expenses
                .filter(exp => exp.category === category)
                .reduce((sum, exp) => sum + exp.amount, 0);

            const prompt = `Analiza el impacto de este gasto en el presupuesto:
Gasto actual: S/${amount}
Categoría: ${category}
Total gastado en esta categoría: S/${categoryExpenses}
Gastos totales del usuario: S/${totalExpenses}
Ingresos totales del usuario: S/${totalIncome}

Clasifica el impacto como: low, medium, high, critical
Responde solo con una palabra.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50
            });

            return response?.choices[0]?.message?.content?.trim().toLowerCase() || 'medium';
        } catch (error) {
            console.error('Error analizando impacto presupuestario con IA:', error);
            return 'medium';
        }
    }

    // Generar análisis de ingreso con IA
    async generateIncomeAnalysisWithAI(incomeRecord, userData) {
        try {
            const context = this.buildFinancialContext(userData);
            
            const prompt = `Como SofIA, analiza este nuevo ingreso:
${JSON.stringify(incomeRecord, null, 2)}

Contexto financiero del usuario:
${context}

Genera un análisis breve (2-3 oraciones) sobre:
1. Qué tan positivo es este ingreso para su situación
2. Una recomendación práctica específica

Mantén el tono amigable y motivador de SofIA.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200
            });

            return response?.choices[0]?.message?.content || 'Excelente nuevo ingreso registrado 💰';
        } catch (error) {
            console.error('Error generando análisis de ingreso:', error);
            return 'Excelente nuevo ingreso registrado 💰';
        }
    }

    // Generar análisis de gasto con IA
    async generateExpenseAnalysisWithAI(expenseRecord, userData) {
        try {
            const context = this.buildFinancialContext(userData);
            
            const prompt = `Como SofIA, analiza este nuevo gasto:
${JSON.stringify(expenseRecord, null, 2)}

Contexto financiero del usuario:
${context}

Genera un análisis breve (2-3 oraciones) sobre:
1. Si este gasto está alineado con un presupuesto saludable
2. Una recomendación práctica si es necesario

Mantén el tono empático y constructivo de SofIA.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200
            });

            return response?.choices[0]?.message?.content || 'Gasto registrado correctamente 📊';
        } catch (error) {
            console.error('Error generando análisis de gasto:', error);
            return 'Gasto registrado correctamente 📊';
        }
    }

    // Construir contexto financiero para IA
    buildFinancialContext(userData) {
        const financial = userData.financial;
        const totalIncome = financial.income.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpenses = financial.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        return `
Ingresos totales: S/${totalIncome.toLocaleString()}
Gastos totales: S/${totalExpenses.toLocaleString()}
Balance actual: S/${balance.toLocaleString()}
Últimas transacciones: ${financial.income.length + financial.expenses.length}
`;
    }

    // Generar recomendaciones con IA
    async generateAIRecommendations(userId, userData, transactionType) {
        try {
            const context = this.buildFinancialContext(userData);
            
            const prompt = `Como SofIA, asesora financiera con IA, genera 2-3 recomendaciones específicas y prácticas para este usuario después de registrar un ${transactionType}:

${context}

Las recomendaciones deben ser:
1. Específicas para su situación actual
2. Prácticas y realizables
3. En tono amigable de SofIA
4. Máximo 2 oraciones cada una

Devuelve como JSON array: ["recomendación 1", "recomendación 2", "recomendación 3"]`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            });

            const content = response?.choices[0]?.message?.content;
            try {
                return JSON.parse(content);
            } catch {
                return [content || 'Continúa registrando tus transacciones para mejores análisis 📈'];
            }
        } catch (error) {
            console.error('Error generando recomendaciones IA:', error);
            return ['Continúa registrando tus transacciones para mejores análisis 📈'];
        }
    }

    // Actualizar resumen financiero
    async updateFinancialSummary(userId, financialData) {
        const totalIncome = financialData.income.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpenses = financialData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        financialData.summary = {
            totalIncome,
            totalExpenses,
            currentBalance: totalIncome - totalExpenses,
            lastUpdated: new Date().toISOString(),
            transactionCount: financialData.income.length + financialData.expenses.length
        };
    }

    // Agregar al historial del usuario
    async addToUserHistory(userId, actionType, data) {
        try {
            const history = await this.loadUserHistory(userId);
            
            history.conversations.push({
                timestamp: new Date().toISOString(),
                actionType,
                data
            });
            
            history.totalInteractions++;
            history.lastInteraction = new Date().toISOString();
            
            // Mantener solo las últimas 100 interacciones
            if (history.conversations.length > 100) {
                history.conversations = history.conversations.slice(-100);
            }
            
            await this.saveUserHistory(userId, history);
        } catch (error) {
            console.error('Error actualizando historial:', error);
        }
    }

    // Métodos de guardado
    async saveUserProfile(userId, profile) {
        const filePath = await this.getUserFilePath(userId, 'profile.json');
        await fs.writeFile(filePath, JSON.stringify(profile, null, 2));
    }

    async saveUserFinancialData(userId, financial) {
        const filePath = await this.getUserFilePath(userId, 'financial.json');
        await fs.writeFile(filePath, JSON.stringify(financial, null, 2));
    }

    async saveUserHistory(userId, history) {
        const filePath = await this.getUserFilePath(userId, 'history.json');
        await fs.writeFile(filePath, JSON.stringify(history, null, 2));
    }

    async saveUserAnalytics(userId, analytics) {
        const filePath = await this.getUserFilePath(userId, 'analytics.json');
        await fs.writeFile(filePath, JSON.stringify(analytics, null, 2));
    }

    // Generar ID único para transacciones
    generateTransactionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Análisis financiero completo con IA
    async generateComprehensiveAnalysis(userId) {
        try {
            const userData = await this.getUserData(userId);
            const context = this.buildFinancialContext(userData);
            
            const prompt = `Como SofIA, genera un análisis financiero completo para este usuario:

${context}

Historial completo:
${JSON.stringify(userData.financial, null, 2)}

Genera un análisis estructurado que incluya:
1. Resumen de situación actual
2. Patrones de ingresos y gastos identificados
3. 3 recomendaciones específicas y prácticas
4. Metas sugeridas para el próximo mes

Mantén el tono empático y motivador de SofIA. Máximo 300 palabras.`;

            const response = await this.getPerplexityService().client?.chat.completions.create({
                model: "sonar-pro",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
                web_search_options: {
                    search_context_size: "medium"
                }
            });

            const analysis = response?.choices[0]?.message?.content || 'Análisis completo generado correctamente';
            
            // Guardar análisis en analytics
            const analytics = await this.loadUserAnalytics(userId);
            analytics.aiInsights.push({
                timestamp: new Date().toISOString(),
                type: 'comprehensive_analysis',
                content: analysis
            });
            
            await this.saveUserAnalytics(userId, analytics);
            
            return analysis;

        } catch (error) {
            console.error('Error generando análisis completo:', error);
            return 'No pude generar el análisis completo en este momento. Inténtalo más tarde.';
        }
    }

    // Método para obtener estadísticas del servicio
    getServiceStats() {
        return {
            name: 'UserDataService',
            version: '1.0.0',
            description: 'Gestión de datos financieros por usuario con IA',
            features: [
                'Carpetas individuales por usuario',
                'Archivos JSON separados por tipo de dato',
                'Análisis automático con Perplexity AI',
                'Clasificación inteligente de transacciones',
                'Recomendaciones personalizadas',
                'Historial conversacional'
            ]
        };
    }

    // Editar transacción existente (gasto o ingreso)
    async editTransaction(userId, transactionId, transactionType, updatedData) {
        try {
            const userData = await this.getUserData(userId);
            let transaction = null;
            let transactionIndex = -1;
            
            // Buscar la transacción en el tipo correspondiente (ingreso o gasto)
            if (transactionType === 'income') {
                transactionIndex = userData.financial.income.findIndex(item => item.id === transactionId);
                if (transactionIndex !== -1) {
                    transaction = userData.financial.income[transactionIndex];
                }
            } else if (transactionType === 'expense') {
                transactionIndex = userData.financial.expenses.findIndex(item => item.id === transactionId);
                if (transactionIndex !== -1) {
                    transaction = userData.financial.expenses[transactionIndex];
                }
            }
            
            // Si no se encontró la transacción
            if (!transaction) {
                return {
                    success: false,
                    error: `Transacción con ID ${transactionId} no encontrada`
                };
            }
            
            // Guardar datos originales para historial
            const originalData = { ...transaction };
            
            // Actualizar los campos proporcionados
            Object.keys(updatedData).forEach(key => {
                // Si el campo es monto, asegurarse de que sea número
                if (key === 'amount' && updatedData[key]) {
                    transaction[key] = parseFloat(updatedData[key]);
                } else if (updatedData[key] !== undefined) {
                    transaction[key] = updatedData[key];
                }
            });
            
            // Añadir información de la edición
            transaction.lastEdited = new Date().toISOString();
            transaction.editHistory = transaction.editHistory || [];
            
            // Crear copia sin la propiedad editHistory para evitar estructura circular
            const transactionCopy = { ...transaction };
            delete transactionCopy.editHistory;
            
            transaction.editHistory.push({
                timestamp: new Date().toISOString(),
                originalData,
                newData: transactionCopy
            });
            
            // Actualizar la transacción en el array correspondiente
            if (transactionType === 'income') {
                userData.financial.income[transactionIndex] = transaction;
            } else {
                userData.financial.expenses[transactionIndex] = transaction;
            }
            
            // Actualizar resumen financiero
            await this.updateFinancialSummary(userId, userData.financial);
            
            // Guardar datos actualizados
            await this.saveUserFinancialData(userId, userData.financial);
            
            // Agregar al historial con IA
            const analysisText = await this.generateTransactionEditAnalysis(transaction, originalData, transactionType);
            await this.addToUserHistory(userId, `${transactionType}_edited`, {
                transactionId,
                originalData,
                newData: { ...transaction },
                aiAnalysis: analysisText
            });
            
            console.log(`✏️ ${transactionType === 'income' ? 'Ingreso' : 'Gasto'} editado para ${userId}: ID ${transactionId}`);
            
            return {
                success: true,
                transaction,
                aiAnalysis: analysisText
            };
            
        } catch (error) {
            console.error(`❌ Error editando transacción para ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }
    
    // Generar análisis de edición de transacción con IA
    async generateTransactionEditAnalysis(transaction, originalData, transactionType) {
        try {
            const prompt = `Como SofIA, genera un breve mensaje de confirmación para la edición de esta ${transactionType === 'income' ? 'ingreso' : 'gasto'}:

Original: ${JSON.stringify(originalData, null, 2)}
Editado: ${JSON.stringify(transaction, null, 2)}

Genera una confirmación breve (máximo 2 oraciones) que:
1. Confirme qué se cambió exactamente
2. Sea natural y empática como SofIA
3. Incluya un emoji apropiado
4. Sea clara y precisa

La respuesta debe ser breve y conversacional.`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                return transactionType === 'income' 
                    ? `✅ He modificado tu ingreso correctamente 📊` 
                    : `✅ He actualizado tu gasto según lo solicitado 📊`;
            }

            const response = await perplexityService.client.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150
            });
            
            return response?.choices[0]?.message?.content || 
                   `✅ Transacción editada correctamente 📊`;
                   
        } catch (error) {
            console.error('Error generando análisis de edición:', error);
            return `✅ Transacción actualizada correctamente 📊`;
        }
    }
    
    // Buscar transacciones recientes para edición
    async findRecentTransactions(userId, limit = 5) {
        try {
            const userData = await this.getUserData(userId);
            
            // Obtener ingresos y gastos recientes
            const recentIncome = userData.financial.income
                .slice(-limit)
                .map(item => ({
                    id: item.id,
                    type: 'income',
                    amount: item.amount,
                    description: item.source || 'Ingreso',
                    category: 'ingreso', 
                    currency: item.currency,
                    date: item.timestamp,
                    details: `${item.currency === 'dolares' ? '$' : item.currency === 'pesos' ? '$' : 'S/'}${item.amount} de ${item.source || 'No especificado'}`
                }));
                
            const recentExpenses = userData.financial.expenses
                .slice(-limit)
                .map(item => ({
                    id: item.id,
                    type: 'expense',
                    amount: item.amount,
                    description: item.description || 'Gasto',
                    category: item.category || 'General',
                    currency: item.currency,
                    date: item.timestamp,
                    details: `${item.currency === 'dolares' ? '$' : item.currency === 'pesos' ? '$' : 'S/'}${item.amount} en ${item.category || 'General'}`
                }));
            
            // Combinar y ordenar por fecha (más recientes primero)
            const allTransactions = [...recentIncome, ...recentExpenses]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, limit);
                
            return {
                success: true,
                transactions: allTransactions
            };
            
        } catch (error) {
            console.error(`❌ Error buscando transacciones recientes para ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Método para identificar una transacción por descripción usando IA
    async identifyTransactionByDescription(userId, description) {
        try {
            const { success, transactions } = await this.findRecentTransactions(userId, 10);
            
            if (!success || transactions.length === 0) {
                return { success: false, error: "No se encontraron transacciones recientes" };
            }
            
            const prompt = `Como SofIA, analiza este mensaje del usuario: "${description}"

Identifica a cuál de estas transacciones recientes se refiere:
${transactions.map((t, i) => `${i+1}. ${t.type === 'income' ? 'INGRESO' : 'GASTO'}: ${t.details} (${new Date(t.date).toLocaleDateString()})`).join('\n')}

Responde SOLO con el número (1-${transactions.length}) de la transacción más probable a la que se refiere. 
Si no puedes identificarla con certeza, responde "0".
Solo responde con el número, sin texto adicional.`;

            const perplexityService = this.getPerplexityService();
            if (!perplexityService?.client) {
                // Fallback simple basado en palabras clave si no hay IA
                return this.identifyTransactionByKeywords(description, transactions);
            }

            const response = await perplexityService.client.chat.completions.create({
                model: "sonar",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 10
            });
            
            const content = response?.choices[0]?.message?.content?.trim();
            const transactionIndex = parseInt(content, 10);
            
            if (isNaN(transactionIndex) || transactionIndex < 1 || transactionIndex > transactions.length) {
                return { 
                    success: false, 
                    error: "No se pudo identificar la transacción",
                    needsMoreInfo: true,
                    availableTransactions: transactions
                };
            }
            
            return {
                success: true,
                transaction: transactions[transactionIndex - 1]
            };
            
        } catch (error) {
            console.error('Error identificando transacción:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Fallback para identificar transacción por palabras clave
    identifyTransactionByKeywords(description, transactions) {
        const lowerDesc = description.toLowerCase();
        
        // Buscar coincidencias en categorías, descripciones o montos
        for (const transaction of transactions) {
            const amount = transaction.amount.toString();
            const category = transaction.category.toLowerCase();
            const details = transaction.details.toLowerCase();
            
            if (lowerDesc.includes(amount) || 
                lowerDesc.includes(category) || 
                details.split(' ').some(word => lowerDesc.includes(word))) {
                
                return {
                    success: true,
                    transaction
                };
            }
        }
        
        return { 
            success: false, 
            error: "No se pudo identificar la transacción",
            needsMoreInfo: true,
            availableTransactions: transactions
        };
    }
}

module.exports = UserDataService; 