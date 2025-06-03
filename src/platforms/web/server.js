require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const FinanceAgent = require('../../core/agent/FinanceAgent');
const ConversationMemory = require('../../core/memory/ConversationMemory');

class WebPlatform {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.WEBAPP_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        
        this.memory = new ConversationMemory();
        this.agent = new FinanceAgent(this.memory);
        this.port = process.env.API_PORT || 3001;
        
        // Contador de conexiones para logs menos intrusivos
        this.connectionStats = {
            active: 0,
            total: 0,
            sessions: new Set()
        };
        this.statsInterval = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.startConnectionStatsLogger();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: process.env.WEBAPP_URL || "http://localhost:3000",
            credentials: true
        }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    }

    setupRoutes() {
        // Ruta de salud
        this.app.get('/health', (req, res) => {
            const agentStats = this.agent.getAgentStats();
            res.json({
                status: 'ok',
                platform: 'web',
                version: '2.1.0',
                ai: {
                    perplexityConfigured: agentStats.perplexityConfigured,
                    imageRecognitionConfigured: agentStats.imageRecognitionConfigured
                }
            });
        });

        // Ruta para enviar mensajes de texto
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, sessionId } = req.body;
                
                if (!message || !sessionId) {
                    return res.status(400).json({ 
                        error: 'Mensaje y sessionId son requeridos' 
                    });
                }

                // Obtener contexto de la conversación
                const conversationContext = this.memory.getConversationContext(sessionId);
                
                // Generar respuesta del agente
                const response = await this.agent.generateResponse(
                    message, 
                    conversationContext, 
                    sessionId
                );
                
                // Guardar el intercambio en memoria
                this.memory.addMessage(sessionId, message, response);
                
                // Emitir respuesta por WebSocket también
                this.io.to(sessionId).emit('message', {
                    type: 'bot',
                    content: response,
                    timestamp: new Date().toISOString()
                });

                res.json({
                    response,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error en /api/chat:', error);
                res.status(500).json({ 
                    error: 'Error interno del servidor' 
                });
            }
        });

        // Ruta para procesar imágenes
        this.app.post('/api/chat/image', async (req, res) => {
            try {
                const { imageData, message, sessionId, isBase64 } = req.body;
                
                if (!imageData || !sessionId) {
                    return res.status(400).json({ 
                        error: 'ImageData y sessionId son requeridos' 
                    });
                }

                // Obtener contexto de la conversación
                const conversationContext = this.memory.getConversationContext(sessionId);
                
                // Procesar imagen con IA
                const response = await this.agent.generateImageResponse(
                    imageData,
                    message || '',
                    conversationContext,
                    sessionId,
                    isBase64 || false
                );
                
                // Emitir respuesta por WebSocket también
                this.io.to(sessionId).emit('message', {
                    type: 'bot',
                    content: response,
                    timestamp: new Date().toISOString()
                });

                res.json({
                    response,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error en /api/chat/image:', error);
                res.status(500).json({ 
                    error: 'Error procesando imagen' 
                });
            }
        });

        // Ruta para obtener el historial de conversación
        this.app.get('/api/conversation/:sessionId', (req, res) => {
            try {
                const { sessionId } = req.params;
                const conversationContext = this.memory.getConversationContext(sessionId);
                
                res.json({
                    sessionId,
                    messages: conversationContext.messages || [],
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error obteniendo conversación:', error);
                res.status(500).json({ 
                    error: 'Error obteniendo conversación' 
                });
            }
        });

        // Ruta para limpiar conversación
        this.app.delete('/api/conversation/:sessionId', (req, res) => {
            try {
                const { sessionId } = req.params;
                this.memory.clearConversation(sessionId);
                
                res.json({
                    message: 'Conversación limpiada exitosamente',
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error limpiando conversación:', error);
                res.status(500).json({ 
                    error: 'Error limpiando conversación' 
                });
            }
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            // Actualizar estadísticas
            this.connectionStats.active++;
            this.connectionStats.total++;
            
            // Solo log de debug en desarrollo y reducir spam
            if (process.env.NODE_ENV === 'development' && process.env.DEBUG_WEBSOCKET === 'true') {
                console.log(`🔌 Cliente conectado: ${socket.id}`);
            }

            // Unirse a una sala basada en sessionId
            socket.on('join-session', (sessionId) => {
                socket.join(sessionId);
                this.connectionStats.sessions.add(sessionId);
                
                // Solo log de debug en desarrollo y reducir spam
                if (process.env.NODE_ENV === 'development' && process.env.DEBUG_WEBSOCKET === 'true') {
                    console.log(`👤 Cliente ${socket.id} se unió a sesión: ${sessionId}`);
                }
                
                // Enviar estado de la IA
                const agentStats = this.agent.getAgentStats();
                socket.emit('agent-status', agentStats);
            });

            // Manejar mensajes en tiempo real
            socket.on('send-message', async (data) => {
                try {
                    const { message, sessionId } = data;
                    
                    if (!message || !sessionId) {
                        socket.emit('error', { 
                            message: 'Mensaje y sessionId son requeridos' 
                        });
                        return;
                    }

                    // Emitir mensaje del usuario a otros clientes en la misma sesión
                    socket.to(sessionId).emit('message', {
                        type: 'user',
                        content: message,
                        timestamp: new Date().toISOString()
                    });

                    // Obtener contexto y generar respuesta
                    const conversationContext = this.memory.getConversationContext(sessionId);
                    const response = await this.agent.generateResponse(
                        message, 
                        conversationContext, 
                        sessionId
                    );
                    
                    // Guardar en memoria
                    this.memory.addMessage(sessionId, message, response);
                    
                    // Emitir respuesta del bot
                    this.io.to(sessionId).emit('message', {
                        type: 'bot',
                        content: response,
                        timestamp: new Date().toISOString()
                    });

                } catch (error) {
                    console.error('❌ Error en send-message:', error);
                    socket.emit('error', { 
                        message: 'Error procesando mensaje' 
                    });
                }
            });

            socket.on('disconnect', () => {
                // Actualizar estadísticas
                this.connectionStats.active--;
                
                // Solo log de debug en desarrollo y reducir spam
                if (process.env.NODE_ENV === 'development' && process.env.DEBUG_WEBSOCKET === 'true') {
                    console.log(`🔌 Cliente desconectado: ${socket.id}`);
                }
            });
        });
    }

    startConnectionStatsLogger() {
        // Mostrar estadísticas de conexión cada 30 segundos si hay actividad
        this.statsInterval = setInterval(() => {
            if (this.connectionStats.active > 0) {
                console.log(`📊 WebSocket: ${this.connectionStats.active} conexiones activas, ${this.connectionStats.sessions.size} sesiones`);
                
                // Reset contador total para no acumular indefinidamente
                if (this.connectionStats.total > 1000) {
                    this.connectionStats.total = this.connectionStats.active;
                }
            }
        }, 30 * 1000); // 30 segundos
    }

    async start() {
        console.log('🔄 Iniciando SofIA Finance Advisor (Web API)...');
        console.log('🧠 Configurando motor de IA...');
        
        // Mostrar información de configuración
        const agentStats = this.agent.getAgentStats();
        console.log(`🤖 Motor IA: ${agentStats.perplexityConfigured ? 'Perplexity Sonar ✅' : 'Modo Local ⚠️'}`);
        console.log(`📷 Reconocimiento de imágenes: ${agentStats.imageRecognitionConfigured ? 'Activado ✅' : 'No disponible ⚠️'}`);

        return new Promise((resolve) => {
            this.server.listen(this.port, () => {
                console.log(`🚀 SofIA Finance Advisor (Web API) escuchando en puerto ${this.port}`);
                
                // URLs detalladas
                console.log('\n🌐 URLs disponibles:');
                console.log(`   ├─ 🔗 API Base: http://localhost:${this.port}`);
                console.log(`   ├─ 💊 Health Check: http://localhost:${this.port}/health`);
                console.log(`   ├─ 💬 Chat API: http://localhost:${this.port}/api/chat`);
                console.log(`   ├─ 📷 Image API: http://localhost:${this.port}/api/chat/image`);
                console.log(`   └─ 🔌 WebSocket: ws://localhost:${this.port}`);
                
                console.log('\n🖥️  Frontend (WebApp):');
                console.log(`   └─ 🌍 WebApp: ${process.env.WEBAPP_URL || 'http://localhost:3000'}`);
                console.log('      💡 Ejecuta: npm run webapp:dev (si no está corriendo)');
                
                console.log('\n🔄 Estado: Servidor listo para recibir requests!');
                console.log('═'.repeat(50));
                
                resolve();
            });
        });
    }

    async stop() {
        console.log('⏹️ Deteniendo SofIA Finance Advisor (Web API)...');
        
        // Limpiar interval de estadísticas
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        
        return new Promise((resolve) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// Mostrar información de inicio
console.log('╔════════════════════════════════════════╗');
console.log('║   SofIA Finance Advisor v2.1 - WEB    ║');
console.log('║   IA Conversacional + Reconocimiento  ║');
console.log('║          de Imágenes Financieras       ║');
console.log('╚════════════════════════════════════════╝');

// Verificar configuración de Perplexity
if (process.env.PERPLEXITY_API_KEY) {
    console.log('✅ API Key de Perplexity detectada - Modo IA Avanzada + Imágenes');
} else {
    console.log('⚠️ Sin API Key de Perplexity - Modo Local (sin reconocimiento de imágenes)');
    console.log('💡 Crea un archivo .env con PERPLEXITY_API_KEY=tu_api_key para IA + imágenes');
}

// Inicializar servidor web si este archivo se ejecuta directamente
if (require.main === module) {
    const webPlatform = new WebPlatform();

    // Manejar cierre graceful
    process.on('SIGINT', async () => {
        console.log('\n🛑 Cerrando SofIA Finance Advisor (Web API)...');
        webPlatform.memory.forceSync();
        await webPlatform.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Cerrando SofIA Finance Advisor (Web API)...');
        webPlatform.memory.forceSync();
        await webPlatform.stop();
        process.exit(0);
    });

    // Iniciar el servidor
    webPlatform.start().catch(console.error);
}

module.exports = WebPlatform; 