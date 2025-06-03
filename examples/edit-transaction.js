/**
 * Ejemplo de uso de la funcionalidad de edición de transacciones
 * Ejecutar con: node examples/edit-transaction.js
 */
const FinanceAgent = require('../src/core/agent/FinanceAgent');
const ConversationMemory = require('../src/core/memory/ConversationMemory');
const UserDataService = require('../src/core/services/UserDataService');

// Configurar ID de usuario para demostración
const DEMO_USER_ID = 'demo_user_edit_' + Date.now();

async function runDemo() {
  console.log('🧪 Demostración de Edición de Transacciones con SofIA');
  console.log('-----------------------------------------------');
  
  // Inicializar servicios
  const memory = new ConversationMemory();
  const agent = new FinanceAgent(memory);
  const userDataService = new UserDataService();
  
  try {
    // Paso 1: Registrar algunas transacciones iniciales
    console.log('\n🔄 Registrando transacciones iniciales...');
    
    await userDataService.registerIncome(
      DEMO_USER_ID,
      1200,
      'freelance',
      'Pago por proyecto de diseño',
      'soles'
    );
    
    await userDataService.registerExpense(
      DEMO_USER_ID,
      350,
      'comida',
      'Compras de supermercado',
      'soles'
    );
    
    await userDataService.registerExpense(
      DEMO_USER_ID,
      200,
      'transporte',
      'Gastos de taxi',
      'soles'
    );
    
    console.log('✅ Transacciones registradas');
    
    // Mostrar transacciones registradas
    const initialTransactions = await userDataService.findRecentTransactions(DEMO_USER_ID);
    console.log('\n📊 Transacciones iniciales:');
    initialTransactions.transactions.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.type === 'income' ? '💰 INGRESO' : '💸 GASTO'}: ${t.details}`);
    });
    
    // Paso 2: Iniciar conversación con el usuario
    console.log('\n🤖 Iniciando conversación para editar transacción...');
    console.log('-----------------------------------------------');
    
    // Ejemplo de interacción para editar transacción (simulado)
    const conversations = [
      {
        user: "Hola SofIA, quiero modificar mi gasto de comida",
        expected: "editar transacción / pedir clarificación"
      },
      {
        user: "El gasto de supermercado de 350 soles",
        expected: "confirmar transacción identificada y pedir cambios"
      },
      {
        user: "Quiero cambiar el monto a 400 soles y la categoría a alimentación",
        expected: "pedir confirmación de cambios"
      },
      {
        user: "Sí, confirmo los cambios",
        expected: "confirmar edición"
      }
    ];
    
    // Simular conversación
    for (const turn of conversations) {
      await simulateInteraction(agent, memory, DEMO_USER_ID, turn.user, turn.expected);
    }
    
    // Paso 3: Verificar cambios
    console.log('\n🔍 Verificando cambios realizados...');
    
    const finalTransactions = await userDataService.findRecentTransactions(DEMO_USER_ID);
    console.log('\n📊 Estado final de transacciones:');
    finalTransactions.transactions.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.type === 'income' ? '💰 INGRESO' : '💸 GASTO'}: ${t.details}`);
    });
    
    // Ejemplos adicionales
    console.log('\n🔄 Ejemplos adicionales de solicitudes que soporta SofIA:');
    console.log('  - "Necesito cambiar mi ingreso de freelance de 1200 a 1500 soles"');
    console.log('  - "Modifica el gasto de taxi, lo pagué en dólares no en soles"');
    console.log('  - "Edita el último ingreso que registré, la fuente fue salario no freelance"');
    console.log('  - "Corrige mi ingreso del proyecto de diseño, fueron 1250 soles"');
    
    console.log('\n✨ Demostración completada!');
    
  } catch (error) {
    console.error('❌ Error durante la demostración:', error);
  }
}

// Función para simular interacción con el agente
async function simulateInteraction(agent, memory, userId, userMessage, expected) {
  console.log(`\n👤 Usuario: ${userMessage}`);
  console.log(`🔮 Esperando: ${expected}`);
  
  // Obtener contexto de conversación
  const context = await memory.getConversationContext(userId);
  
  // Generar respuesta
  const response = await agent.generateResponse(userMessage, context, userId);
  console.log(`🤖 SofIA: ${response}`);
  
  // Guardar en memoria
  await memory.addMessage(userId, userMessage, response);
  
  // Pequeña pausa para legibilidad en la consola
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Ejecutar la demostración
runDemo().catch(console.error); 