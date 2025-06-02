/**
 * SofIA Finance Advisor - Punto de entrada principal
 * Soporta WhatsApp y Web App
 */

const SofiaMultiPlatform = require('./platforms/server');

// Si se ejecuta directamente, inicializar la aplicación
if (require.main === module) {
    console.log('🚀 Iniciando SofIA desde punto de entrada principal...');
    
    // Verificar argumentos de línea de comandos para ayuda
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log('\n📖 SofIA Finance Advisor - Uso:');
        console.log('  npm start                    # Ejecutar ambas plataformas');
        console.log('  ENABLE_WEB=false npm start   # Solo WhatsApp');
        console.log('  ENABLE_WHATSAPP=false npm start # Solo Web API');
        console.log('\n📋 Variables de entorno:');
        console.log('  PERPLEXITY_API_KEY=tu_key    # API de IA (requerida)');
        console.log('  API_PORT=3001                # Puerto del Web API');
        console.log('  WEBAPP_URL=http://localhost:3000 # URL de la WebApp');
        process.exit(0);
    }
    
    // Inicializar el multi-platform server
    const sofia = new SofiaMultiPlatform();
    sofia.start().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

// Re-exportar para compatibilidad con versiones anteriores
module.exports = SofiaMultiPlatform; 