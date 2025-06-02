require('dotenv').config();
const WhatsAppPlatform = require('./whatsapp/server');
const WebPlatform = require('./web/server');
const { validateEnvironmentConfig } = require('../shared/utils');

class SofiaMultiPlatform {
    constructor() {
        this.platforms = {};
        this.config = this.loadConfiguration();
        
        console.log('╔════════════════════════════════════════╗');
        console.log('║   SofIA Finance Advisor v2.1 - MULTI  ║');
        console.log('║   IA Conversacional + Reconocimiento  ║');
        console.log('║          de Imágenes Financieras       ║');
        console.log('╚════════════════════════════════════════╝');
        
        this.displayConfiguration();
    }

    loadConfiguration() {
        const envConfig = validateEnvironmentConfig();
        
        return {
            enableWhatsApp: process.env.ENABLE_WHATSAPP !== 'false', // Por defecto true
            enableWeb: process.env.ENABLE_WEB !== 'false', // Por defecto true
            webPort: process.env.API_PORT || 3001,
            webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000',
            perplexityConfigured: envConfig.hasPerplexity,
            ...envConfig
        };
    }

    displayConfiguration() {
        console.log('\n🔧 Configuración de Plataformas:');
        console.log(`📱 WhatsApp: ${this.config.enableWhatsApp ? '✅ Habilitado' : '❌ Deshabilitado'}`);
        console.log(`🌐 Web API: ${this.config.enableWeb ? '✅ Habilitado' : '❌ Deshabilitado'}`);
        
        if (this.config.enableWeb) {
            console.log(`   └─ Puerto: ${this.config.webPort}`);
            console.log(`   └─ WebApp URL: ${this.config.webappUrl}`);
        }
        
        console.log(`🤖 IA Perplexity: ${this.config.perplexityConfigured ? '✅ Configurada' : '⚠️ No configurada'}`);
        
        if (!this.config.perplexityConfigured) {
            console.log('💡 Para funcionalidad completa, configura PERPLEXITY_API_KEY en .env');
        }
        
        if (this.config.missingVars.length > 0) {
            console.log(`⚠️ Variables faltantes: ${this.config.missingVars.join(', ')}`);
        }
        console.log('');
    }

    displaySuccessfulStartup(enabledPlatforms) {
        console.log('\n🎉 SofIA Finance Advisor Multi-Platform está lista!');
        console.log(`📊 Plataformas activas: ${enabledPlatforms.join(', ')}`);
        
        // Web API URLs
        if (this.platforms.web) {
            console.log('\n🌐 URLs del Backend (Web API):');
            console.log(`   ├─ 🔗 API Base: http://localhost:${this.config.webPort}`);
            console.log(`   ├─ 💊 Health Check: http://localhost:${this.config.webPort}/health`);
            console.log(`   ├─ 💬 Chat API: http://localhost:${this.config.webPort}/api/chat`);
            console.log(`   ├─ 📷 Image API: http://localhost:${this.config.webPort}/api/chat/image`);
            console.log(`   └─ 🔌 WebSocket: ws://localhost:${this.config.webPort}`);
        }
        
        // WhatsApp Platform
        if (this.platforms.whatsapp) {
            console.log('\n📱 WhatsApp Platform:');
            console.log('   └─ ⏳ Esperando código QR para conectar...');
        }
        
        // WebApp Information
        if (this.config.enableWeb) {
            console.log('\n🖥️  Frontend (WebApp):');
            console.log(`   └─ 🌍 WebApp: ${this.config.webappUrl}`);
            console.log('      💡 Ejecuta: npm run webapp:dev (si no está corriendo)');
        }
        
        // Instructions
        console.log('\n📋 Instrucciones:');
        if (this.platforms.web && this.platforms.whatsapp) {
            console.log('   ├─ 🌐 Usa la WebApp en:', this.config.webappUrl);
            console.log('   └─ 📱 Escanea el QR cuando aparezca para WhatsApp');
        } else if (this.platforms.web) {
            console.log('   └─ 🌐 Usa la WebApp en:', this.config.webappUrl);
        } else if (this.platforms.whatsapp) {
            console.log('   └─ 📱 Escanea el QR cuando aparezca para WhatsApp');
        }
        
        console.log('\n🔄 Estado: Todo listo para recibir mensajes!');
        console.log('═'.repeat(60));
    }

    async initializeWhatsApp() {
        if (!this.config.enableWhatsApp) {
            console.log('📱 WhatsApp deshabilitado por configuración');
            return;
        }

        console.log('🔄 Inicializando plataforma WhatsApp...');
        
        try {
            this.platforms.whatsapp = new WhatsAppPlatform();
            console.log('✅ Plataforma WhatsApp inicializada');
        } catch (error) {
            console.error('❌ Error inicializando WhatsApp:', error.message);
            throw error;
        }
    }

    async initializeWeb() {
        if (!this.config.enableWeb) {
            console.log('🌐 Web API deshabilitado por configuración');
            return;
        }

        console.log('🔄 Inicializando plataforma Web...');
        
        try {
            this.platforms.web = new WebPlatform();
            await this.platforms.web.start();
            console.log('✅ Plataforma Web inicializada');
        } catch (error) {
            console.error('❌ Error inicializando Web API:', error.message);
            throw error;
        }
    }

    async start() {
        console.log('🚀 Iniciando SofIA Multi-Platform...');
        
        const enabledPlatforms = [];
        
        try {
            // Inicializar plataformas habilitadas
            if (this.config.enableWhatsApp) {
                await this.initializeWhatsApp();
                enabledPlatforms.push('WhatsApp');
            }
            
            if (this.config.enableWeb) {
                await this.initializeWeb();
                enabledPlatforms.push('Web API');
            }

            if (enabledPlatforms.length === 0) {
                console.log('⚠️ No hay plataformas habilitadas. Verifica tu configuración.');
                return;
            }

            this.displaySuccessfulStartup(enabledPlatforms);

        } catch (error) {
            console.error('❌ Error durante el inicio:', error);
            await this.stop();
            throw error;
        }
    }

    async stop() {
        console.log('🛑 Deteniendo SofIA Multi-Platform...');
        
        const stopPromises = [];
        
        if (this.platforms.whatsapp) {
            console.log('⏹️ Deteniendo WhatsApp...');
            this.platforms.whatsapp.memory.forceSync();
            stopPromises.push(this.platforms.whatsapp.stop());
        }
        
        if (this.platforms.web) {
            console.log('⏹️ Deteniendo Web API...');
            this.platforms.web.memory.forceSync();
            stopPromises.push(this.platforms.web.stop());
        }

        await Promise.all(stopPromises);
        console.log('✅ Todas las plataformas detenidas');
    }

    getStatus() {
        return {
            platforms: Object.keys(this.platforms),
            config: this.config,
            isRunning: Object.keys(this.platforms).length > 0
        };
    }
}

// Función para mostrar ayuda de configuración
function showConfigHelp() {
    console.log('\n📖 Variables de Entorno Disponibles:');
    console.log('  PERPLEXITY_API_KEY=tu_api_key    # Requerida para IA completa');
    console.log('  ENABLE_WHATSAPP=true|false       # Habilitar WhatsApp (default: true)');
    console.log('  ENABLE_WEB=true|false             # Habilitar Web API (default: true)');
    console.log('  API_PORT=3001                     # Puerto para Web API (default: 3001)');
    console.log('  WEBAPP_URL=http://localhost:3000  # URL de la webapp NextJS');
    console.log('\n💡 Ejemplos de uso:');
    console.log('  # Solo WhatsApp:');
    console.log('  ENABLE_WEB=false npm start');
    console.log('  # Solo Web:');
    console.log('  ENABLE_WHATSAPP=false npm start');
    console.log('  # Ambas plataformas (default):');
    console.log('  npm start');
}

// Inicializar si este archivo se ejecuta directamente
if (require.main === module) {
    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showConfigHelp();
        process.exit(0);
    }

    const sofia = new SofiaMultiPlatform();

    // Manejar cierre graceful
    const handleShutdown = async (signal) => {
        console.log(`\n📡 Recibida señal ${signal}`);
        await sofia.stop();
        process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    
    // Manejar errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        sofia.stop().then(() => process.exit(1));
    });

    // Iniciar la aplicación
    sofia.start().catch(async (error) => {
        console.error('❌ Error fatal durante el inicio:', error);
        await sofia.stop();
        process.exit(1);
    });
}

module.exports = SofiaMultiPlatform; 