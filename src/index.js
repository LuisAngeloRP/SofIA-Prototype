/**
 * SofIA Finance Advisor - Punto de entrada principal
 * Soporta WhatsApp y Web App con sistema AI de datos por usuario
 */

const SofiaMultiPlatform = require('./platforms/server');

// Inicializar servicios de datos de usuario
const UserDataService = require('./core/services/UserDataService');
const TransactionDetectorService = require('./core/services/TransactionDetectorService');

console.log('🚀 Sistema AI de datos financieros por usuario inicializado');
console.log('📊 Cada usuario tendrá su carpeta personal con archivos JSON');
console.log('🤖 Detección automática de transacciones con Perplexity AI');

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
        console.log('  PERPLEXITY_API_KEY=tu_key    # API de IA (requerida para funciones avanzadas)');
        console.log('  API_PORT=3001                # Puerto del Web API');
        console.log('  WEBAPP_URL=http://localhost:3000 # URL de la WebApp');
        console.log('\n🤖 Sistema AI de Datos Financieros:');
        console.log('  • Cada usuario tiene su carpeta en src/data/users/');
        console.log('  • Archivos JSON separados: profile.json, financial.json, history.json');
        console.log('  • Detección automática de transacciones con Perplexity');
        console.log('  • Análisis inteligente y recomendaciones personalizadas');
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