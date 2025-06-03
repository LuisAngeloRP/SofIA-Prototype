#!/usr/bin/env node

/**
 * Script de demostración del Sistema AI de Datos Financieros por Usuario
 * Muestra cómo funciona la detección automática y el registro de transacciones
 */

require('dotenv').config();

const UserDataMiddleware = require('../src/core/middleware/UserDataMiddleware');

async function demonstrateAISystem() {
    console.log('🚀 === DEMOSTRACIÓN DEL SISTEMA AI DE DATOS FINANCIEROS ===\n');
    
    const middleware = new UserDataMiddleware();
    const testUserId = 'demo_user_123';
    
    console.log('📊 Sistema inicializado. Características principales:');
    console.log('• Carpetas individuales por usuario');
    console.log('• Archivos JSON separados (profile, financial, history, analytics)');
    console.log('• Detección automática de transacciones con Perplexity AI');
    console.log('• Análisis y recomendaciones inteligentes\n');

    // Simular diferentes tipos de mensajes con transacciones
    const testMessages = [
        'Hola, me llamo Luis y acabo de ganar S/1500 de mi trabajo freelance',
        'Gasté 45 soles en almuerzo hoy',
        'Recibí $200 dólares por una venta',
        'Pagué 120 soles de luz este mes',
        'Mi salario de este mes fue de 3000 soles',
        'Compré una laptop por S/2500',
        'Hola Sofia, ¿cómo van mis finanzas?'
    ];

    console.log('🎯 DEMOSTRANDO DETECCIÓN AUTOMÁTICA DE TRANSACCIONES:\n');

    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        console.log(`📝 Mensaje ${i + 1}: "${message}"`);
        
        try {
            const result = await middleware.processUserMessage(testUserId, message, 'demo');
            
            if (result.hasTransaction) {
                console.log('   ✅ TRANSACCIÓN DETECTADA:');
                console.log(`   💰 Tipo: ${result.transactionData.type === 'income' ? 'Ingreso' : 'Gasto'}`);
                console.log(`   💵 Cantidad: ${result.transactionData.amount} ${result.transactionData.currency}`);
                
                if (result.transactionData.type === 'income') {
                    console.log(`   📥 Fuente: ${result.transactionData.source}`);
                } else {
                    console.log(`   📤 Categoría: ${result.transactionData.category}`);
                }
                
                console.log(`   🤖 Respuesta IA: "${result.aiResponse}"`);
            } else {
                console.log('   ℹ️  No se detectó transacción financiera');
            }
            
            console.log('');
            
            // Pausa para simular tiempo real
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}\n`);
        }
    }

    // Mostrar resumen financiero
    console.log('📈 RESUMEN FINANCIERO FINAL:\n');
    
    try {
        const summaryResult = await middleware.getUserFinancialSummary(testUserId);
        
        if (summaryResult.success) {
            const summary = summaryResult.summary;
            
            console.log(`💰 Total Ingresos: S/${summary.totalIncome.toLocaleString()}`);
            console.log(`💸 Total Gastos: S/${summary.totalExpenses.toLocaleString()}`);
            console.log(`💵 Balance Actual: S/${summary.currentBalance.toLocaleString()}`);
            console.log(`📊 Total Transacciones: ${summary.transactionCount}`);
            console.log(`⏰ Última Actualización: ${new Date(summary.lastUpdated).toLocaleString()}\n`);
            
            if (summary.recentTransactions.length > 0) {
                console.log('📋 ÚLTIMAS TRANSACCIONES:');
                summary.recentTransactions.forEach((transaction, index) => {
                    const type = transaction.type === 'income' ? '📥' : '📤';
                    const currencySymbol = transaction.currency === 'soles' ? 'S/' : '$';
                    const description = transaction.type === 'income' ? transaction.source : transaction.category;
                    console.log(`   ${type} ${currencySymbol}${transaction.amount} - ${description}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo resumen:', error.message);
    }

    console.log('\n🤖 ANÁLISIS COMPLETO CON IA:\n');
    
    try {
        const analysisResult = await middleware.generateComprehensiveAnalysis(testUserId);
        
        if (analysisResult.success) {
            console.log('📝 Análisis de SofIA:');
            console.log(`"${analysisResult.analysis}"`);
        } else {
            console.log('ℹ️  Análisis no disponible (requiere PERPLEXITY_API_KEY configurada)');
        }
        
    } catch (error) {
        console.log('ℹ️  Análisis no disponible:', error.message);
    }

    console.log('\n📁 ESTRUCTURA DE CARPETAS CREADA:');
    console.log('src/data/users/');
    console.log(`├── ${testUserId.replace(/[^a-zA-Z0-9@._-]/g, '_')}/`);
    console.log('    ├── profile.json      # Perfil y preferencias del usuario');
    console.log('    ├── financial.json    # Ingresos, gastos y resumen financiero');
    console.log('    ├── history.json      # Historial de conversaciones');
    console.log('    └── analytics.json    # Análisis e insights de IA');

    console.log('\n🎉 DEMOSTRACIÓN COMPLETADA');
    console.log('\n💡 Para usar el sistema en producción:');
    console.log('1. Configura PERPLEXITY_API_KEY en tu archivo .env');
    console.log('2. Ejecuta: npm start');
    console.log('3. El sistema detectará automáticamente transacciones en tiempo real');
    console.log('4. Cada usuario tendrá su carpeta con datos separados');
    
    // Mostrar estadísticas del sistema
    console.log('\n🔧 ESTADÍSTICAS DEL SISTEMA:');
    const stats = middleware.getSystemStats();
    console.log(`📊 Servicios integrados: ${stats.services.length}`);
    stats.features.forEach(feature => {
        console.log(`✓ ${feature}`);
    });
}

// Ejecutar demostración si es llamado directamente
if (require.main === module) {
    demonstrateAISystem().catch(error => {
        console.error('❌ Error en la demostración:', error);
        process.exit(1);
    });
}

module.exports = { demonstrateAISystem }; 