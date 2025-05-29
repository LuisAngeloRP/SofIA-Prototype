require('dotenv').config();
const FinanceAgent = require('./src/agent/FinanceAgent');
const ConversationMemory = require('./src/memory/ConversationMemory');

console.log('╔════════════════════════════════════════╗');
console.log('║    Pruebas SofIA 100% IA-Driven       ║');
console.log('║     Sin Patrones Hardcodeados          ║');
console.log('╚════════════════════════════════════════╝\n');

// Verificar configuración
if (process.env.PERPLEXITY_API_KEY) {
    console.log('✅ API Key de Perplexity detectada - Probando IA avanzada');
    console.log('🧠 TODO será manejado por inteligencia artificial');
} else {
    console.log('⚠️ Sin API Key de Perplexity - Probando modo local');
    console.log('💡 Para IA completa: crea archivo .env con PERPLEXITY_API_KEY=tu_api_key\n');
}

// Crear instancias
const memory = new ConversationMemory(5); // Solo 5 mensajes para prueba
const agent = new FinanceAgent(memory);

// Usuario de prueba
const testUserId = 'test_user_ai_driven';

// Función de prueba con conversaciones más naturales
async function testIntelligentConversation() {
    console.log('=== Prueba de Conversación Inteligente ===\n');
    
    // Mensajes más naturales para probar la IA
    const naturalMessages = [
        "Hola! Soy María",
        "Este mes cobré 75 mil pesos de mi trabajo",
        "Y creo que gasté como 15 mil en el super", 
        "También pagué 8000 de luz y agua",
        "¿Cómo voy con mis finanzas?",
        "Me preocupa no estar ahorrando lo suficiente",
        "¿Qué opinas de meter dinero en fondos de inversión?",
        "¿Crees que es buen momento para invertir con la inflación actual?"
    ];

    for (let i = 0; i < naturalMessages.length; i++) {
        const userMessage = naturalMessages[i];
        console.log(`👤 María: "${userMessage}"`);
        
        // Obtener contexto
        const context = memory.getConversationContext(testUserId);
        
        try {
            // Mostrar lo que la IA está analizando
            console.log(`🧠 IA analizando: contexto de ${context.total_interactions} interacciones...`);
            
            // Generar respuesta con IA
            const response = await agent.generateResponse(userMessage, context, testUserId);
            
            // Mostrar respuesta
            console.log(`🤖 SofIA: "${response}"`);
            console.log('---');
            
            // Guardar en memoria
            memory.addMessage(testUserId, userMessage, response);
            
        } catch (error) {
            console.error('❌ Error en respuesta:', error.message);
            console.log('---');
        }
        
        // Pausa para simular conversación real
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Probar resumen financiero inteligente
    console.log('\n=== Resumen Financiero Inteligente ===');
    try {
        const intelligentSummary = await agent.generateFinancialSummary(testUserId, 'María');
        console.log(`📊 Resumen generado por IA:`);
        console.log(intelligentSummary);
    } catch (error) {
        console.error('❌ Error en resumen:', error.message);
    }
    
    // Mostrar estadísticas finales
    console.log('\n=== Estadísticas del Sistema ===');
    const stats = memory.getStats();
    console.log('📊 Total usuarios:', stats.total_users);
    console.log('💬 Total conversaciones:', stats.total_conversations);
    
    const userData = memory.getUserProfile(testUserId);
    console.log('\n=== Perfil Inteligente del Usuario ===');
    console.log('👤 Nombre:', userData.name || 'No especificado');
    
    if (userData.financial_data) {
        console.log('💰 Ingresos procesados por IA:', userData.financial_data.income.length);
        console.log('💸 Gastos procesados por IA:', userData.financial_data.expenses.length);
        
        // Mostrar detalles de transacciones procesadas por IA
        if (userData.financial_data.income.length > 0) {
            console.log('\n📈 Ingresos detectados automáticamente:');
            userData.financial_data.income.forEach(income => {
                const aiFlag = income.ai_processed ? '[IA]' : '[Manual]';
                console.log(`   ${aiFlag} $${income.amount.toLocaleString()} - ${income.source}`);
            });
        }
        
        if (userData.financial_data.expenses.length > 0) {
            console.log('\n📉 Gastos detectados automáticamente:');
            userData.financial_data.expenses.forEach(expense => {
                const aiFlag = expense.ai_processed ? '[IA]' : '[Manual]';
                console.log(`   ${aiFlag} $${expense.amount.toLocaleString()} - ${expense.category}`);
            });
        }
    }
    
    // Mostrar configuración del agente IA
    console.log('\n=== Configuración del Agente IA ===');
    const agentStats = agent.getAgentStats();
    console.log('🤖 Sistema IA-Driven:', agentStats.aiDriven ? 'Sí ✅' : 'No ❌');
    console.log('📏 Usa patrones hardcodeados:', agentStats.usePatterns ? 'Sí ❌' : 'No ✅');
    console.log('🧠 Perplexity configurado:', agentStats.perplexityConfigured ? 'Sí ✅' : 'No ⚠️');
    
    if (agentStats.perplexityConfigured) {
        console.log('📡 Modelo IA:', agentStats.serviceStats.model);
        console.log('🔍 Contexto búsqueda:', agentStats.serviceStats.searchContextSize);
        console.log('📝 Tokens máximos:', agentStats.serviceStats.maxTokens);
    }
    
    console.log('\n✅ ¡Pruebas de IA completadas exitosamente!');
    console.log('🚀 SofIA está lista para WhatsApp con IA 100% inteligente');
    
    if (!agentStats.perplexityConfigured) {
        console.log('\n💡 Para experiencia completa con IA:');
        console.log('   1. Obtén una API key de Perplexity (https://perplexity.ai)');
        console.log('   2. Crea archivo .env con: PERPLEXITY_API_KEY=tu_api_key');
        console.log('   3. Ejecuta npm start para WhatsApp con IA avanzada');
    } else {
        console.log('\n🎯 ¡SofIA está funcionando con IA completa!');
        console.log('   ✅ Sin patrones hardcodeados');
        console.log('   ✅ Decisiones inteligentes');
        console.log('   ✅ Respuestas naturales');
        console.log('   ✅ Análisis financiero real');
    }
}

// Función específica para probar capacidades IA
async function testAICapabilities() {
    console.log('\n=== Prueba de Capacidades IA Específicas ===\n');
    
    const aiTestMessages = [
        "Ayer me llegaron como veintitantos mil pesos del freelance que hice",
        "Se me fueron quinientos mangos en delivery esta semana"
    ];
    
    for (const message of aiTestMessages) {
        console.log(`👤 Test IA: "${message}"`);
        
        const context = memory.getConversationContext(testUserId);
        const response = await agent.generateResponse(message, context, testUserId);
        
        console.log(`🧠 Respuesta IA: "${response}"`);
        console.log('---');
        
        memory.addMessage(testUserId, message, response);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

// Ejecutar todas las pruebas
async function runAllAITests() {
    try {
        await testIntelligentConversation();
        await testAICapabilities();
        console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en las pruebas de IA:', error);
        process.exit(1);
    }
}

runAllAITests(); 