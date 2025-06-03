require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const FinanceAgent = require('../../core/agent/FinanceAgent');
const ConversationMemory = require('../../core/memory/ConversationMemory');

class WhatsAppPlatform {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "sofia-finance-bot"
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ],
                timeout: 60000 // 60 segundos de timeout
            },
            webVersionCache: {
                type: 'local'
            },
            takeoverOnConflict: true,
            restartOnAuthFail: true
        });
        
        this.memory = new ConversationMemory();
        this.agent = new FinanceAgent(this.memory);
        this.setupEventHandlers();
        this.connectionStatus = 'disconnected';
        this.lastQrTimestamp = 0;
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            const currentTime = Date.now();
            // Limitamos a mostrar QR máximo cada 30 segundos
            if (currentTime - this.lastQrTimestamp > 30000) {
                console.log('📱 Escanea el código QR para conectar SofIA:');
                qrcode.generate(qr, { small: true });
                this.lastQrTimestamp = currentTime;
            }
        });

        this.client.on('ready', () => {
            this.connectionStatus = 'connected';
            console.log('🚀 SofIA Finance Advisor (WhatsApp) está lista!');
            console.log('💰 Tu asesor financiero personal ya está en línea');
            
            // Mostrar información de configuración
            const agentStats = this.agent.getAgentStats();
            console.log(`🤖 Motor IA: ${agentStats.perplexityConfigured ? 'Perplexity Sonar ✅' : 'Modo Local ⚠️'}`);
            console.log(`📷 Reconocimiento de imágenes: ${agentStats.imageRecognitionConfigured ? 'Activado ✅' : 'No disponible ⚠️'}`);
            
            if (agentStats.perplexityConfigured) {
                console.log(`📡 Modelo: ${agentStats.serviceStats.model}`);
                console.log(`🔍 Contexto de búsqueda: ${agentStats.serviceStats.searchContextSize}`);
                
                if (agentStats.imageRecognitionConfigured) {
                    console.log(`🖼️ Modelo de imágenes: ${agentStats.imageServiceStats.model}`);
                    console.log(`📋 Formatos soportados: ${agentStats.imageServiceStats.supportedFormats.join(', ')}`);
                    console.log(`📏 Tamaño máximo: ${agentStats.imageServiceStats.maxImageSize}`);
                }
            } else {
                console.log('💡 Para usar IA avanzada e imágenes, configura PERPLEXITY_API_KEY en archivo .env');
            }
            
            // Establecer ping para mantener la conexión activa
            this.startKeepAlive();
        });

        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        this.client.on('disconnected', (reason) => {
            this.connectionStatus = 'disconnected';
            console.log('❌ Cliente desconectado:', reason);
            
            // Intentar reconectar automáticamente después de 10 segundos
            console.log('🔄 Intentando reconectar en 10 segundos...');
            setTimeout(() => this.reconnect(), 10000);
        });
        
        this.client.on('auth_failure', (error) => {
            console.error('❌ Error de autenticación:', error);
            console.log('🔑 Por favor, borra la carpeta .wwebjs_auth y reinicia la aplicación');
        });
        
        this.client.on('loading_screen', (percent, message) => {
            console.log(`⏳ Cargando WhatsApp Web: ${percent}% - ${message}`);
        });
        
        this.client.on('change_state', state => {
            console.log(`📊 Estado cambiado a: ${state}`);
        });
    }

    async handleMessage(message) {
        try {
            // Evitar grupos
            if (message.from.includes('@g.us')) {
                return;
            }

            const userNumber = message.from;
            let userMessage = '';
            let isImageMessage = false;

            // Manejar diferentes tipos de mensajes
            if (message.type === 'chat') {
                userMessage = message.body;
            } else if (message.type === 'image') {
                isImageMessage = true;
                userMessage = message.body || ''; // Caption de la imagen si existe
                
                console.log(`📷 Imagen recibida de ${userNumber} con caption: "${userMessage}"`);
            } else {
                // Otros tipos de mensaje no soportados
                return;
            }

            console.log(`📨 Mensaje de ${userNumber}: ${isImageMessage ? '[IMAGEN]' : userMessage} ${userMessage ? `- "${userMessage}"` : ''}`);

            // Verificar estado de conexión
            if (this.connectionStatus !== 'connected') {
                console.warn('⚠️ Cliente no está completamente conectado. Estado:', this.connectionStatus);
                // Intentar enviar mensaje de todos modos
            }
            
            // Registrar recepción del mensaje
            console.log(`✅ Mensaje recibido a las ${new Date().toLocaleTimeString()}`);
            
            // Obtener el contexto de la conversación
            const conversationContext = this.memory.getConversationContext(userNumber);
            
            let response;

            if (isImageMessage) {
                try {
                    // Descargar la imagen como base64
                    const media = await message.downloadMedia();
                    
                    if (!media) {
                        response = '📷 Lo siento, no pude descargar tu imagen. ¿Podrías intentar enviarla otra vez? 😊';
                    } else {
                        // Procesar imagen con IA
                        response = await this.agent.generateImageResponse(
                            media.data,
                            userMessage,
                            conversationContext,
                            userNumber,
                            true // isBase64 = true
                        );
                    }
                } catch (error) {
                    console.error('❌ Error descargando imagen:', error);
                    response = '📷 Ups, tuve un problema descargando tu imagen. ¿Podrías enviarla de nuevo? 😅';
                }
            } else {
                // Generar respuesta del agente con IA para mensajes de texto
                response = await this.agent.generateResponse(userMessage, conversationContext, userNumber);
                
                // Guardar el intercambio en memoria
                this.memory.addMessage(userNumber, userMessage, response);
            }

            // Enviar respuesta con manejo de errores
            try {
                console.log(`🔄 Enviando respuesta a ${userNumber} a las ${new Date().toLocaleTimeString()}`);
                await message.reply(response);
                console.log(`✅ Respuesta enviada a ${userNumber}`);
            } catch (replyError) {
                console.error('❌ Error enviando respuesta:', replyError);
                // Intentar enviar mensaje directo si la respuesta falla
                try {
                    const chat = await message.getChat();
                    await chat.sendMessage(response);
                    console.log(`✅ Respuesta enviada como mensaje directo a ${userNumber}`);
                } catch (directMsgError) {
                    console.error('❌ Error en mensaje directo:', directMsgError);
                }
            }

        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            try {
                await message.reply('Disculpa, tuve un pequeño problema. ¿Podrías repetir lo que me dijiste? 😅');
            } catch (replyError) {
                console.error('❌ No se pudo enviar mensaje de error:', replyError);
            }
        }
    }

    startKeepAlive() {
        // Enviar ping cada 5 minutos para mantener la conexión activa
        this.keepAliveInterval = setInterval(() => {
            if (this.connectionStatus === 'connected') {
                console.log(`🔄 Ping de mantenimiento: ${new Date().toLocaleTimeString()}`);
                this.client.sendPresenceAvailable().catch(err => {
                    console.warn('❌ Error en ping de mantenimiento:', err.message);
                });
            }
        }, 5 * 60 * 1000);
    }
    
    async reconnect() {
        try {
            console.log('🔄 Intentando reconexión...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Error en reconexión:', error);
            console.log('🔄 Reintentando en 30 segundos...');
            setTimeout(() => this.reconnect(), 30000);
        }
    }

    async start() {
        console.log('🔄 Iniciando SofIA Finance Advisor (WhatsApp)...');
        console.log('🧠 Configurando motor de IA...');
        try {
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Error inicializando cliente:', error);
            console.log('🔄 Reintentando en 10 segundos...');
            setTimeout(() => this.start(), 10000);
        }
    }

    async stop() {
        console.log('⏹️ Deteniendo SofIA Finance Advisor (WhatsApp)...');
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        await this.client.destroy();
    }
}

// Mostrar información de inicio
console.log('╔════════════════════════════════════════╗');
console.log('║    SofIA Finance Advisor v2.1 - WSP   ║');
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

// Inicializar el bot de WhatsApp
const whatsappPlatform = new WhatsAppPlatform();

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando SofIA Finance Advisor (WhatsApp)...');
    whatsappPlatform.memory.forceSync();
    await whatsappPlatform.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando SofIA Finance Advisor (WhatsApp)...');
    whatsappPlatform.memory.forceSync();
    await whatsappPlatform.stop();
    process.exit(0);
});

// Agregar manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    console.log('🔄 Intentando continuar a pesar del error...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    console.log('🔄 Intentando continuar a pesar del error...');
});

// Iniciar el bot
whatsappPlatform.start().catch(console.error);

module.exports = WhatsAppPlatform; 