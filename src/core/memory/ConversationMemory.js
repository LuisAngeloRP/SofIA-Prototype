const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

class ConversationMemory {
    constructor(maxContextMessages = 10) {
        this.maxContextMessages = maxContextMessages;
        this.dataBasePath = path.join(__dirname, '../../data/users');
        
        // Importar el nuevo sistema de datos de usuario
        this.initializeUserDataService();
        
        console.log('💾 ConversationMemory actualizado - Sistema de carpetas por usuario');
    }

    // Inicializar el servicio de datos de usuario
    initializeUserDataService() {
        try {
            const UserDataService = require('../services/UserDataService');
            this.userDataService = new UserDataService();
            console.log('✅ UserDataService integrado con ConversationMemory');
        } catch (error) {
            console.warn('⚠️ No se pudo cargar UserDataService:', error.message);
            this.userDataService = null;
        }
    }

    // Agregar mensaje al historial del usuario
    async addMessage(userId, userMessage, agentResponse) {
        try {
            if (this.userDataService) {
                // Usar el nuevo sistema de datos por usuario
                await this.userDataService.addToUserHistory(userId, 'conversation', {
                    user: userMessage.substring(0, 500), // Limitar longitud
                    agent: agentResponse.substring(0, 500),
                    timestamp: new Date().toISOString(),
                    formatted_time: format(new Date(), 'dd/MM/yyyy HH:mm')
                });
            } else {
                // Fallback al sistema manual si no está disponible UserDataService
                await this.addMessageManual(userId, userMessage, agentResponse);
            }
        } catch (error) {
            console.error(`❌ Error agregando mensaje para ${userId}:`, error);
        }
    }

    // Método manual de fallback
    async addMessageManual(userId, userMessage, agentResponse) {
        try {
            const userDir = await this.ensureUserDirectory(userId);
            const historyFile = path.join(userDir, 'history.json');
            
            let history = { conversations: [], totalInteractions: 0 };
            
            try {
                const data = await fs.readFile(historyFile, 'utf8');
                history = JSON.parse(data);
            } catch (error) {
                // Archivo no existe, usar estructura vacía
            }

            // Agregar nueva conversación
            history.conversations.push({
                timestamp: new Date().toISOString(),
                actionType: 'conversation',
                data: {
                    user: userMessage.substring(0, 500),
                    agent: agentResponse.substring(0, 500),
                    formatted_time: format(new Date(), 'dd/MM/yyyy HH:mm')
                }
            });

            history.totalInteractions++;
            history.lastInteraction = new Date().toISOString();

            // Mantener solo las últimas 100 conversaciones
            if (history.conversations.length > 100) {
                history.conversations = history.conversations.slice(-100);
            }

            await fs.writeFile(historyFile, JSON.stringify(history, null, 2));

        } catch (error) {
            console.error('Error en addMessageManual:', error);
        }
    }

    // Obtener contexto de conversación del usuario
    async getConversationContext(userId) {
        try {
            if (this.userDataService) {
                // Usar el nuevo sistema
                const userData = await this.userDataService.getUserData(userId);
                
                return {
                    recent_messages: this.formatRecentMessages(userData.history.conversations),
                    user_profile: {
                        name: userData.profile.name,
                        preferences: userData.profile.preferences,
                        financial_data: {
                            income: userData.financial.income,
                            expenses: userData.financial.expenses,
                            summary: userData.financial.summary,
                            hasData: userData.financial.income.length > 0 || userData.financial.expenses.length > 0
                        }
                    },
                    total_interactions: userData.history.totalInteractions,
                    first_interaction: userData.history.firstInteraction,
                    last_interaction: userData.history.lastInteraction
                };
            } else {
                // Fallback manual
                return await this.getConversationContextManual(userId);
            }
        } catch (error) {
            console.error(`❌ Error obteniendo contexto para ${userId}:`, error);
            return this.getEmptyContext();
        }
    }

    // Formatear mensajes recientes para el contexto
    formatRecentMessages(conversations) {
        return conversations
            .filter(conv => conv.actionType === 'conversation')
            .slice(-this.maxContextMessages)
            .map(conv => ({
                timestamp: conv.timestamp,
                user: conv.data.user,
                agent: conv.data.agent,
                formatted_time: conv.data.formatted_time
            }));
    }

    // Método manual de fallback para obtener contexto
    async getConversationContextManual(userId) {
        try {
            const userDir = await this.ensureUserDirectory(userId);
            const historyFile = path.join(userDir, 'history.json');
            const profileFile = path.join(userDir, 'profile.json');
            const financialFile = path.join(userDir, 'financial.json');

            let history = { conversations: [], totalInteractions: 0 };
            let profile = { name: null, preferences: {} };
            let financial = { income: [], expenses: [], summary: {} };

            try {
                const historyData = await fs.readFile(historyFile, 'utf8');
                history = JSON.parse(historyData);
            } catch (error) {
                // Archivo no existe
            }

            try {
                const profileData = await fs.readFile(profileFile, 'utf8');
                profile = JSON.parse(profileData);
            } catch (error) {
                // Archivo no existe
            }

            try {
                const financialData = await fs.readFile(financialFile, 'utf8');
                financial = JSON.parse(financialData);
            } catch (error) {
                // Archivo no existe
            }

            return {
                recent_messages: this.formatRecentMessages(history.conversations),
                user_profile: {
                    name: profile.name,
                    preferences: profile.preferences,
                    financial_data: {
                        income: financial.income,
                        expenses: financial.expenses,
                        summary: financial.summary,
                        hasData: financial.income.length > 0 || financial.expenses.length > 0
                    }
                },
                total_interactions: history.totalInteractions,
                first_interaction: history.firstInteraction,
                last_interaction: history.lastInteraction
            };

        } catch (error) {
            console.error('Error en getConversationContextManual:', error);
            return this.getEmptyContext();
        }
    }

    // Contexto vacío por defecto
    getEmptyContext() {
        return {
            recent_messages: [],
            user_profile: {
                name: null,
                preferences: {},
                financial_data: {
                    income: [],
                    expenses: [],
                    summary: {},
                    hasData: false
                }
            },
            total_interactions: 0,
            first_interaction: null,
            last_interaction: null
        };
    }

    // Actualizar perfil de usuario
    async updateUserProfile(userId, profileData) {
        try {
            if (this.userDataService) {
                // Usar el nuevo sistema
                const currentProfile = await this.userDataService.loadUserProfile(userId);
                const updatedProfile = { ...currentProfile, ...profileData };
                await this.userDataService.saveUserProfile(userId, updatedProfile);
            } else {
                // Fallback manual
                await this.updateUserProfileManual(userId, profileData);
            }
        } catch (error) {
            console.error(`❌ Error actualizando perfil de ${userId}:`, error);
        }
    }

    // Método manual para actualizar perfil
    async updateUserProfileManual(userId, profileData) {
        try {
            const userDir = await this.ensureUserDirectory(userId);
            const profileFile = path.join(userDir, 'profile.json');

            let profile = {
                userId,
                name: null,
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                preferences: {
                    currency: 'soles',
                    timezone: 'America/Lima',
                    language: 'es'
                }
            };

            try {
                const data = await fs.readFile(profileFile, 'utf8');
                profile = JSON.parse(data);
            } catch (error) {
                // Archivo no existe, usar perfil por defecto
            }

            // Actualizar con nuevos datos
            Object.keys(profileData).forEach(key => {
                if (key === 'preferences' && typeof profileData[key] === 'object') {
                    profile.preferences = { ...profile.preferences, ...profileData[key] };
                } else {
                    profile[key] = profileData[key];
                }
            });

            profile.lastActiveAt = new Date().toISOString();

            await fs.writeFile(profileFile, JSON.stringify(profile, null, 2));

        } catch (error) {
            console.error('Error en updateUserProfileManual:', error);
        }
    }

    // Obtener perfil de usuario
    async getUserProfile(userId) {
        try {
            if (this.userDataService) {
                return await this.userDataService.loadUserProfile(userId);
            } else {
                return await this.getUserProfileManual(userId);
            }
        } catch (error) {
            console.error(`❌ Error obteniendo perfil de ${userId}:`, error);
            return { name: null, preferences: {} };
        }
    }

    // Método manual para obtener perfil
    async getUserProfileManual(userId) {
        try {
            const userDir = await this.ensureUserDirectory(userId);
            const profileFile = path.join(userDir, 'profile.json');

            const data = await fs.readFile(profileFile, 'utf8');
            return JSON.parse(data);

        } catch (error) {
            return {
                userId,
                name: null,
                preferences: {
                    currency: 'soles',
                    timezone: 'America/Lima',
                    language: 'es'
                }
            };
        }
    }

    // Extraer datos financieros del usuario
    async extractFinancialData(userId) {
        try {
            if (this.userDataService) {
                const userData = await this.userDataService.getUserData(userId);
                return {
                    income: userData.financial.income,
                    expenses: userData.financial.expenses,
                    savings: userData.financial.savings || [],
                    goals: userData.financial.goals || [],
                    summary: userData.financial.summary
                };
            } else {
                return await this.extractFinancialDataManual(userId);
            }
        } catch (error) {
            console.error(`❌ Error extrayendo datos financieros de ${userId}:`, error);
            return {
                income: [],
                expenses: [],
                savings: [],
                goals: [],
                summary: {}
            };
        }
    }

    // Método manual para extraer datos financieros
    async extractFinancialDataManual(userId) {
        try {
            const userDir = await this.ensureUserDirectory(userId);
            const financialFile = path.join(userDir, 'financial.json');

            const data = await fs.readFile(financialFile, 'utf8');
            const financial = JSON.parse(data);

            return {
                income: financial.income || [],
                expenses: financial.expenses || [],
                savings: financial.savings || [],
                goals: financial.goals || [],
                summary: financial.summary || {}
            };

        } catch (error) {
            return {
                income: [],
                expenses: [],
                savings: [],
                goals: [],
                summary: {}
            };
        }
    }

    // Asegurar que existe el directorio del usuario
    async ensureUserDirectory(userId) {
        const sanitizedUserId = this.sanitizeUserId(userId);
        const userDir = path.join(this.dataBasePath, sanitizedUserId);
        
        try {
            await fs.mkdir(userDir, { recursive: true });
            return userDir;
        } catch (error) {
            console.error(`❌ Error creando directorio para ${userId}:`, error);
            throw error;
        }
    }

    // Sanear ID de usuario para nombre de carpeta
    sanitizeUserId(userId) {
        return userId.replace(/[^a-zA-Z0-9@._-]/g, '_').substring(0, 50);
    }

    // Limpiar conversaciones antiguas
    async cleanOldConversations(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const usersDir = await fs.readdir(this.dataBasePath);
            
            for (const userDir of usersDir) {
                const historyFile = path.join(this.dataBasePath, userDir, 'history.json');
                
                try {
                    const data = await fs.readFile(historyFile, 'utf8');
                    const history = JSON.parse(data);
                    
                    const filteredConversations = history.conversations.filter(conv => {
                        const messageDate = new Date(conv.timestamp);
                        return messageDate > cutoffDate;
                    });
                    
                    if (filteredConversations.length !== history.conversations.length) {
                        history.conversations = filteredConversations;
                        history.totalInteractions = filteredConversations.length;
                        
                        await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
                        console.log(`🧹 Limpieza completada para usuario: ${userDir}`);
                    }
                    
                } catch (error) {
                    // Archivo no existe o error de lectura, continuar
                }
            }
            
            console.log(`🧹 Limpieza de conversaciones antiguas completada (>${daysOld} días)`);
            
        } catch (error) {
            console.error('❌ Error limpiando conversaciones antiguas:', error);
        }
    }

    // Obtener estadísticas del sistema
    async getStats() {
        try {
            const usersDir = await fs.readdir(this.dataBasePath);
            let totalConversations = 0;
            let activeUsersToday = 0;
            const today = new Date().toDateString();

            for (const userDir of usersDir) {
                try {
                    const historyFile = path.join(this.dataBasePath, userDir, 'history.json');
                    const data = await fs.readFile(historyFile, 'utf8');
                    const history = JSON.parse(data);
                    
                    totalConversations += history.totalInteractions || 0;
                    
                    if (history.lastInteraction) {
                        const lastDate = new Date(history.lastInteraction).toDateString();
                        if (lastDate === today) {
                            activeUsersToday++;
                        }
                    }
                } catch (error) {
                    // Archivo no existe, continuar
                }
            }

            return {
                total_users: usersDir.length,
                total_conversations: totalConversations,
                active_users_today: activeUsersToday,
                memory_usage: process.memoryUsage(),
                data_structure: 'individual_user_folders',
                system_version: '2.0_AI_driven'
            };

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                total_users: 0,
                total_conversations: 0,
                active_users_today: 0,
                memory_usage: process.memoryUsage(),
                data_structure: 'individual_user_folders',
                system_version: '2.0_AI_driven'
            };
        }
    }

    // Migrar datos del sistema legacy (si existen)
    async migrateLegacyData() {
        try {
            const legacyConversationsFile = path.join(__dirname, '../../data/conversations.json');
            const legacyProfilesFile = path.join(__dirname, '../../data/user_profiles.json');

            let migrationCount = 0;

            // Migrar conversaciones legacy
            try {
                const conversationsData = await fs.readFile(legacyConversationsFile, 'utf8');
                const conversations = JSON.parse(conversationsData);

                for (const [userId, userConversations] of Object.entries(conversations)) {
                    if (Array.isArray(userConversations) && userConversations.length > 0) {
                        for (const conv of userConversations) {
                            await this.addMessage(userId, conv.user || '', conv.agent || '');
                        }
                        migrationCount++;
                    }
                }

                console.log(`📦 Migradas conversaciones de ${migrationCount} usuarios`);
            } catch (error) {
                // Archivo legacy no existe
            }

            // Migrar perfiles legacy
            try {
                const profilesData = await fs.readFile(legacyProfilesFile, 'utf8');
                const profiles = JSON.parse(profilesData);

                for (const [userId, profile] of Object.entries(profiles)) {
                    await this.updateUserProfile(userId, profile);
                }

                console.log(`👤 Migrados perfiles de ${Object.keys(profiles).length} usuarios`);
            } catch (error) {
                // Archivo legacy no existe
            }

            if (migrationCount > 0) {
                console.log('✅ Migración de datos legacy completada');
            }

        } catch (error) {
            console.error('❌ Error en migración de datos legacy:', error);
        }
    }

    // Forzar sincronización (para compatibilidad)
    async forceSync() {
        try {
            // En el nuevo sistema, los datos se guardan inmediatamente
            // Este método se mantiene para compatibilidad con el código existente
            console.log('💾 Sistema de carpetas por usuario - Datos siempre sincronizados');
            
            // Ejecutar limpieza opcional
            await this.cleanOldConversations(30);
            
        } catch (error) {
            console.error('❌ Error en forceSync:', error);
        }
    }

    // Método para obtener información del sistema
    getSystemInfo() {
        return {
            name: 'ConversationMemory',
            version: '2.0.0',
            description: 'Sistema de memoria conversacional con carpetas por usuario',
            dataStructure: 'individual_user_folders',
            features: [
                'Carpetas separadas por usuario',
                'Archivos JSON estructurados',
                'Integración con UserDataService',
                'Migración automática de datos legacy',
                'Limpieza automática de datos antiguos',
                'Estadísticas en tiempo real'
            ],
            compatibility: 'Totalmente compatible con sistema anterior'
        };
    }
}

module.exports = ConversationMemory; 
module.exports = ConversationMemory; 