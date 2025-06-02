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
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.memory = new ConversationMemory();
        this.agent = new FinanceAgent(this.memory);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 Escanea el código QR para conectar SofIA:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
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
        });

        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        this.client.on('disconnected', (reason) => {
            console.log('❌ Cliente desconectado:', reason);
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

            // Enviar respuesta
            await message.reply(response);

            console.log(`✅ Respuesta enviada a ${userNumber}`);

        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            await message.reply('Disculpa, tuve un pequeño problema. ¿Podrías repetir lo que me dijiste? 😅');
        }
    }

    async start() {
        console.log('🔄 Iniciando SofIA Finance Advisor (WhatsApp)...');
        console.log('🧠 Configurando motor de IA...');
        await this.client.initialize();
    }

    async stop() {
        console.log('⏹️ Deteniendo SofIA Finance Advisor (WhatsApp)...');
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

// Iniciar el bot
whatsappPlatform.start().catch(console.error);

module.exports = WhatsAppPlatform; 