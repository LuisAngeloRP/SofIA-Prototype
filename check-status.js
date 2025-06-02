#!/usr/bin/env node

/**
 * Script para verificar el estado de SofIA Finance Advisor
 */

const http = require('http');

const config = {
    webApiPort: process.env.API_PORT || 3001,
    webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000'
};

console.log('╔════════════════════════════════════════╗');
console.log('║     SofIA Finance Advisor - Estado    ║');
console.log('╚════════════════════════════════════════╝\n');

// Función para verificar si un puerto está activo
function checkPort(port, name) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        name,
                        port,
                        status: 'online',
                        details: response
                    });
                } catch (e) {
                    resolve({
                        name,
                        port,
                        status: 'online',
                        details: null
                    });
                }
            });
        });

        req.on('error', () => {
            resolve({
                name,
                port,
                status: 'offline',
                details: null
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name,
                port,
                status: 'timeout',
                details: null
            });
        });

        req.end();
    });
}

async function checkStatus() {
    console.log('🔍 Verificando servicios...\n');

    // Verificar Web API
    const webApiStatus = await checkPort(config.webApiPort, 'Web API');
    
    console.log('🌐 Backend (Web API):');
    if (webApiStatus.status === 'online') {
        console.log(`   ✅ Estado: Online en puerto ${webApiStatus.port}`);
        console.log(`   🔗 URLs disponibles:`);
        console.log(`      ├─ API Base: http://localhost:${webApiStatus.port}`);
        console.log(`      ├─ Health: http://localhost:${webApiStatus.port}/health`);
        console.log(`      ├─ Chat: http://localhost:${webApiStatus.port}/api/chat`);
        console.log(`      └─ WebSocket: ws://localhost:${webApiStatus.port}`);
        
        if (webApiStatus.details) {
            console.log(`   🤖 IA: ${webApiStatus.details.ai?.perplexityConfigured ? 'Perplexity ✅' : 'Local ⚠️'}`);
            console.log(`   📷 Imágenes: ${webApiStatus.details.ai?.imageRecognitionConfigured ? 'Activado ✅' : 'No disponible ⚠️'}`);
        }
    } else {
        console.log(`   ❌ Estado: Offline (puerto ${webApiStatus.port})`);
        console.log(`   💡 Ejecuta: npm start o npm run web:start`);
    }

    console.log('\n🖥️  Frontend (WebApp):');
    console.log(`   🌍 URL: ${config.webappUrl}`);
    console.log(`   💡 Ejecuta: npm run webapp:dev`);

    console.log('\n📋 Comandos útiles:');
    console.log('   npm start           # Iniciar ambas plataformas');
    console.log('   npm run web:start   # Solo Web API');
    console.log('   npm run webapp:dev  # Solo WebApp');
    console.log('   npm run status      # Verificar estado de API');
    
    console.log('\n' + '═'.repeat(50));
}

// Ejecutar verificación
checkStatus().catch(console.error); 