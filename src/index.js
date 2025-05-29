require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const FinanceAgent = require('./agent/FinanceAgent');
const ConversationMemory = require('./memory/ConversationMemory');

class SofiaFinanceBot {
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
            console.log('🚀 SofIA Finance Advisor está lista!');
            console.log('💰 Tu asesor financiero personal ya está en línea');
            
            // Mostrar información de configuración
            const agentStats = this.agent.getAgentStats();
            console.log(`🤖 Motor IA: ${agentStats.perplexityConfigured ? 'Perplexity Sonar ✅' : 'Modo Local ⚠️'}`);
            if (agentStats.perplexityConfigured) {
                console.log(`📡 Modelo: ${agentStats.serviceStats.model}`);
                console.log(`🔍 Contexto de búsqueda: ${agentStats.serviceStats.searchContextSize}`);
            } else {
                console.log('💡 Para usar IA avanzada, configura PERPLEXITY_API_KEY en archivo .env');
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
            // Solo responder a mensajes de texto y evitar grupos
            if (message.type !== 'chat' || message.from.includes('@g.us')) {
                return;
            }

            const userNumber = message.from;
            const userMessage = message.body;

            console.log(`📨 Mensaje de ${userNumber}: ${userMessage}`);

            // Obtener el contexto de la conversación
            const conversationContext = this.memory.getConversationContext(userNumber);
            
            // Generar respuesta del agente con IA
            const response = await this.agent.generateResponse(userMessage, conversationContext, userNumber);
            
            // Guardar el intercambio en memoria
            this.memory.addMessage(userNumber, userMessage, response);

            // Enviar respuesta
            await message.reply(response);

            console.log(`✅ Respuesta enviada a ${userNumber}`);

        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            await message.reply('Disculpa, tuve un pequeño problema. ¿Podrías repetir lo que me dijiste? 😅');
        }
    }

    async start() {
        console.log('🔄 Iniciando SofIA Finance Advisor...');
        console.log('🧠 Configurando motor de IA...');
        await this.client.initialize();
    }

    async stop() {
        console.log('⏹️ Deteniendo SofIA Finance Advisor...');
        await this.client.destroy();
    }
}

// Mostrar información de inicio
console.log('╔════════════════════════════════════════╗');
console.log('║       SofIA Finance Advisor v2.0      ║');
console.log('║    IA Conversacional con Perplexity   ║');
console.log('╚════════════════════════════════════════╝');

// Verificar configuración de Perplexity
if (process.env.PERPLEXITY_API_KEY) {
    console.log('✅ API Key de Perplexity detectada - Modo IA Avanzada');
} else {
    console.log('⚠️ Sin API Key de Perplexity - Modo Local');
    console.log('💡 Crea un archivo .env con PERPLEXITY_API_KEY=tu_api_key para IA avanzada');
}

// Inicializar el bot
const bot = new SofiaFinanceBot();

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando SofIA Finance Advisor...');
    bot.memory.forceSync();
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando SofIA Finance Advisor...');
    bot.memory.forceSync();
    await bot.stop();
    process.exit(0);
});

// Iniciar el bot
bot.start().catch(console.error);

module.exports = SofiaFinanceBot; 