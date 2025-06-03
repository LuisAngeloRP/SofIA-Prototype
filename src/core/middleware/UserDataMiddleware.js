const UserDataService = require('../services/UserDataService');
const TransactionDetectorService = require('../services/TransactionDetectorService');

class UserDataMiddleware {
    constructor() {
        this.userDataService = new UserDataService();
        this.transactionDetector = new TransactionDetectorService();
        
        console.log('🔌 UserDataMiddleware integrado con plataformas');
    }

    // Middleware principal para procesar mensajes
    async processUserMessage(userId, message, platform = 'unknown') {
        try {
            console.log(`📨 Procesando mensaje de ${userId} en ${platform}`);
            
            // 1. Actualizar actividad del usuario
            await this.updateUserActivity(userId, platform);
            
            // 2. Detectar y procesar transacciones automáticamente
            const transactionResult = await this.transactionDetector.analyzeMessage(userId, message);
            
            // 3. Agregar mensaje al historial
            await this.addMessageToHistory(userId, message, transactionResult);
            
            // 4. Obtener datos actualizados del usuario
            const userData = await this.userDataService.getUserData(userId);
            
            // 5. Preparar contexto para el motor de IA
            const context = this.buildAIContext(userData, message);
            
            return {
                hasTransaction: transactionResult.hasTransaction,
                transactionData: transactionResult.transactionData,
                userData,
                context,
                aiResponse: transactionResult.aiResponse
            };

        } catch (error) {
            console.error(`❌ Error procesando mensaje de ${userId}:`, error);
            return {
                hasTransaction: false,
                error: error.message,
                userData: null,
                context: null
            };
        }
    }

    // Actualizar actividad del usuario
    async updateUserActivity(userId, platform) {
        try {
            const profile = await this.userDataService.loadUserProfile(userId);
            
            profile.lastActiveAt = new Date().toISOString();
            profile.platform = platform;
            
            if (!profile.name) {
                // Si es la primera vez, marcar como nuevo usuario
                profile.isNewUser = true;
            }
            
            await this.userDataService.saveUserProfile(userId, profile);
            
        } catch (error) {
            console.error('Error actualizando actividad del usuario:', error);
        }
    }

    // Agregar mensaje al historial
    async addMessageToHistory(userId, message, transactionResult) {
        try {
            await this.userDataService.addToUserHistory(userId, 'message_received', {
                message: message.substring(0, 200), // Limitar longitud
                hasTransaction: transactionResult.hasTransaction,
                transactionType: transactionResult.transactionData?.type,
                platform: 'system'
            });
        } catch (error) {
            console.error('Error agregando mensaje al historial:', error);
        }
    }

    // Construir contexto para IA
    buildAIContext(userData, message) {
        const financial = userData.financial;
        const profile = userData.profile;
        const history = userData.history;

        return {
            user_profile: {
                name: profile.name,
                isNewUser: profile.isNewUser || false,
                preferences: profile.preferences,
                financial_data: {
                    income: financial.income,
                    expenses: financial.expenses,
                    summary: financial.summary,
                    hasData: financial.income.length > 0 || financial.expenses.length > 0
                }
            },
            total_interactions: history.totalInteractions,
            recent_messages: history.conversations.slice(-3).map(conv => ({
                user: conv.data.message || 'Interacción',
                agent: conv.data.aiAnalysis || 'Procesado'
            })),
            current_message: message,
            platform_context: {
                timestamp: new Date().toISOString(),
                messageLength: message.length
            }
        };
    }

    // Registrar ingreso manual
    async registerManualIncome(userId, amount, source, description = '', currency = 'soles') {
        try {
            const result = await this.userDataService.registerIncome(
                userId, amount, source, description, currency
            );

            if (result.success) {
                console.log(`💰 Ingreso manual registrado para ${userId}: ${currency === 'soles' ? 'S/' : '$'}${amount}`);
            }

            return result;
        } catch (error) {
            console.error('Error registrando ingreso manual:', error);
            return { success: false, error: error.message };
        }
    }

    // Registrar gasto manual
    async registerManualExpense(userId, amount, category, description = '', currency = 'soles') {
        try {
            const result = await this.userDataService.registerExpense(
                userId, amount, category, description, currency
            );

            if (result.success) {
                console.log(`💸 Gasto manual registrado para ${userId}: ${currency === 'soles' ? 'S/' : '$'}${amount}`);
            }

            return result;
        } catch (error) {
            console.error('Error registrando gasto manual:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener resumen financiero del usuario
    async getUserFinancialSummary(userId) {
        try {
            const userData = await this.userDataService.getUserData(userId);
            const financial = userData.financial;
            
            const summary = {
                totalIncome: financial.summary.totalIncome,
                totalExpenses: financial.summary.totalExpenses,
                currentBalance: financial.summary.currentBalance,
                transactionCount: financial.summary.transactionCount,
                lastUpdated: financial.summary.lastUpdated,
                recentTransactions: [
                    ...financial.income.slice(-3).map(inc => ({
                        type: 'income',
                        amount: inc.amount,
                        source: inc.source,
                        currency: inc.currency,
                        timestamp: inc.timestamp
                    })),
                    ...financial.expenses.slice(-3).map(exp => ({
                        type: 'expense',
                        amount: exp.amount,
                        category: exp.category,
                        currency: exp.currency,
                        timestamp: exp.timestamp
                    }))
                ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
            };

            return { success: true, summary };

        } catch (error) {
            console.error('Error obteniendo resumen financiero:', error);
            return { success: false, error: error.message };
        }
    }

    // Generar análisis completo con IA
    async generateComprehensiveAnalysis(userId) {
        try {
            const analysis = await this.userDataService.generateComprehensiveAnalysis(userId);
            return { success: true, analysis };
        } catch (error) {
            console.error('Error generando análisis completo:', error);
            return { success: false, error: error.message };
        }
    }

    // Actualizar perfil de usuario
    async updateUserProfile(userId, updates) {
        try {
            const profile = await this.userDataService.loadUserProfile(userId);
            
            // Aplicar actualizaciones
            Object.keys(updates).forEach(key => {
                if (key === 'preferences' && typeof updates[key] === 'object') {
                    profile.preferences = { ...profile.preferences, ...updates[key] };
                } else if (key === 'aiPersonalization' && typeof updates[key] === 'object') {
                    profile.aiPersonalization = { ...profile.aiPersonalization, ...updates[key] };
                } else {
                    profile[key] = updates[key];
                }
            });

            profile.lastActiveAt = new Date().toISOString();
            
            await this.userDataService.saveUserProfile(userId, profile);
            
            return { success: true, profile };

        } catch (error) {
            console.error('Error actualizando perfil de usuario:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener estadísticas del sistema
    getSystemStats() {
        return {
            name: 'UserDataMiddleware',
            version: '1.0.0',
            description: 'Middleware de integración para datos de usuario AI-driven',
            services: [
                this.userDataService.getServiceStats(),
                this.transactionDetector.getDetectorStats()
            ],
            features: [
                'Procesamiento automático de mensajes',
                'Detección de transacciones en tiempo real',
                'Gestión de historial conversacional',
                'Análisis financiero con IA',
                'Carpetas individuales por usuario',
                'Integración con múltiples plataformas'
            ]
        };
    }

    // Migrar datos del sistema anterior (si existe)
    async migrateOldUserData(userId, oldData) {
        try {
            console.log(`🔄 Migrando datos del usuario ${userId} al nuevo sistema`);
            
            // Migrar perfil básico
            if (oldData.name) {
                await this.updateUserProfile(userId, { name: oldData.name });
            }

            // Migrar datos financieros si existen
            if (oldData.financial_data) {
                const financial = oldData.financial_data;
                
                // Migrar ingresos
                if (financial.income && Array.isArray(financial.income)) {
                    for (const income of financial.income) {
                        await this.registerManualIncome(
                            userId,
                            income.amount,
                            income.source || 'migración',
                            'Migrado del sistema anterior',
                            income.currency || 'soles'
                        );
                    }
                }

                // Migrar gastos
                if (financial.expenses && Array.isArray(financial.expenses)) {
                    for (const expense of financial.expenses) {
                        await this.registerManualExpense(
                            userId,
                            expense.amount,
                            expense.category || 'varios',
                            'Migrado del sistema anterior',
                            expense.currency || 'soles'
                        );
                    }
                }
            }

            console.log(`✅ Migración completada para ${userId}`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Error migrando datos de ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = UserDataMiddleware; 