require('dotenv').config();
const ImageRecognitionService = require('./src/services/ImageRecognitionService');

class ImageRecognitionTest {
    constructor() {
        this.imageService = new ImageRecognitionService();
        this.mockContext = {
            user_profile: {
                name: "Usuario Test",
                financial_data: {
                    income: [],
                    expenses: []
                }
            },
            total_interactions: 5,
            recent_messages: []
        };
    }

    async runTests() {
        console.log('🧪 Iniciando pruebas del reconocimiento de imágenes...\n');

        await this.testServiceConfiguration();
        await this.testImageTypeDetection();
        await this.testFallbackResponses();
        
        console.log('\n✅ Pruebas completadas!');
    }

    async testServiceConfiguration() {
        console.log('📋 Test 1: Configuración del servicio');
        
        const isConfigured = this.imageService.isConfigured();
        const stats = this.imageService.getServiceStats();
        
        console.log(`   Configurado: ${isConfigured ? '✅' : '⚠️'}`);
        console.log(`   Modelo: ${stats.model}`);
        console.log(`   Formatos soportados: ${stats.supportedFormats.join(', ')}`);
        console.log(`   Tamaño máximo: ${stats.maxImageSize}`);
        console.log(`   Características: ${stats.features.join(', ')}`);
        console.log('');
    }

    async testImageTypeDetection() {
        console.log('🔍 Test 2: Detección de tipos de imagen');
        
        const testCases = [
            { message: "Este es mi recibo del supermercado", expected: "receipt" },
            { message: "Mi estado de cuenta bancario", expected: "bank_statement" },
            { message: "Gráfico de mis inversiones", expected: "financial_chart" },
            { message: "Una imagen cualquiera", expected: "general" },
            { message: "Factura de servicios", expected: "receipt" },
            { message: "Mi tarjeta de débito", expected: "bank_statement" }
        ];

        testCases.forEach((testCase, index) => {
            const detected = this.imageService.detectImageType(testCase.message);
            const status = detected === testCase.expected ? '✅' : '❌';
            console.log(`   ${index + 1}. "${testCase.message}"`);
            console.log(`      Detectado: ${detected} ${status}`);
        });
        console.log('');
    }

    async testFallbackResponses() {
        console.log('💬 Test 3: Respuestas de fallback');
        
        if (!this.imageService.isConfigured()) {
            const fallbackResponse = this.imageService.getFallbackImageResponse();
            console.log('   Respuesta sin API Key:');
            console.log(`   "${fallbackResponse}"`);
        } else {
            console.log('   ✅ API Key configurada - usando modo IA completa');
        }
        
        const errorResponse = this.imageService.getErrorImageResponse(new Error('Test error'));
        console.log('   Respuesta de error:');
        console.log(`   "${errorResponse}"`);
        console.log('');
    }

    async testSpecificAnalysisMethods() {
        console.log('🎯 Test 4: Métodos de análisis específicos');
        
        if (this.imageService.isConfigured()) {
            console.log('   ⚠️ Saltando pruebas de análisis real (requiere imágenes)');
            console.log('   Los métodos disponibles son:');
            console.log('   - analyzeReceiptImage()');
            console.log('   - analyzeBankStatementImage()');
            console.log('   - analyzeFinancialChartImage()');
            console.log('   - analyzeImageWithFinancialContext()');
        } else {
            console.log('   ⚠️ API Key no configurada - análisis no disponible');
        }
        console.log('');
    }
}

// Ejecutar pruebas
console.log('╔══════════════════════════════════════════════╗');
console.log('║      Pruebas de Reconocimiento de Imágenes   ║');
console.log('║               SofIA v2.1                     ║');
console.log('╚══════════════════════════════════════════════╝\n');

const test = new ImageRecognitionTest();
test.runTests().catch(console.error); 