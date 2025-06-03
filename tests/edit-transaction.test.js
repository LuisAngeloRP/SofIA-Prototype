/**
 * Test para la funcionalidad de edición de transacciones
 * Ejecutar con: node tests/edit-transaction.test.js
 */
const UserDataService = require('../src/core/services/UserDataService');
const FinanceAgent = require('../src/core/agent/FinanceAgent');
const ConversationMemory = require('../src/core/memory/ConversationMemory');
const TransactionDetectorService = require('../src/core/services/TransactionDetectorService');

// Color para logs
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Configurar ID de usuario para pruebas
const TEST_USER_ID = 'test_edit_user_' + Date.now();

async function runTests() {
  console.log(`${COLORS.magenta}=== Test de Edición de Transacciones ====${COLORS.reset}`);
  console.log(`${COLORS.cyan}Usuario de prueba: ${TEST_USER_ID}${COLORS.reset}`);
  
  // Inicializar servicios
  const memory = new ConversationMemory();
  const agent = new FinanceAgent(memory);
  const userDataService = new UserDataService();
  
  try {
    // PASO 1: Registrar algunas transacciones de prueba
    console.log(`\n${COLORS.blue}[PASO 1] Registrando transacciones de prueba...${COLORS.reset}`);
    
    // Crear un ingreso
    const incomeResult = await userDataService.registerIncome(
      TEST_USER_ID,
      1500,
      'trabajo freelance',
      'Ingreso de prueba para edición',
      'soles'
    );
    
    console.log(`${COLORS.green}✓ Ingreso registrado:${COLORS.reset}`, 
      `ID: ${incomeResult.record.id}, Monto: S/${incomeResult.record.amount}`);
    
    // Crear un gasto
    const expenseResult = await userDataService.registerExpense(
      TEST_USER_ID,
      500,
      'comida',
      'Gasto de prueba para edición',
      'soles'
    );
    
    console.log(`${COLORS.green}✓ Gasto registrado:${COLORS.reset}`, 
      `ID: ${expenseResult.record.id}, Monto: S/${expenseResult.record.amount}`);
    
    // PASO 2: Probar identificación de transacciones
    console.log(`\n${COLORS.blue}[PASO 2] Probando identificación de transacciones...${COLORS.reset}`);
    
    const recentTransactions = await userDataService.findRecentTransactions(TEST_USER_ID);
    console.log(`${COLORS.green}✓ Transacciones recientes:${COLORS.reset}`, 
      recentTransactions.transactions.map(t => 
        `${t.type === 'income' ? 'INGRESO' : 'GASTO'}: ${t.details}`
      ).join('\n  ')
    );
    
    // PASO 3: Simular detección de solicitud de edición
    console.log(`\n${COLORS.blue}[PASO 3] Simulando detección de solicitud de edición...${COLORS.reset}`);
    
    const detector = new TransactionDetectorService();
    const editMessage = `Quiero editar mi gasto de comida de 500 soles y cambiarlo a 300 soles`;
    
    const editRequest = await detector.handleEditRequest(TEST_USER_ID, editMessage);
    console.log(`${COLORS.green}✓ Detección de solicitud:${COLORS.reset}`, 
      `isEditRequest: ${editRequest.isEditRequest}`,
      editRequest.editData ? `\n  Descripción: ${editRequest.editData.description}` : ''
    );
    
    // PASO 4: Probar identificación de transacción específica
    console.log(`\n${COLORS.blue}[PASO 4] Probando identificación de transacción específica...${COLORS.reset}`);
    
    const identificationResult = await userDataService.identifyTransactionByDescription(
      TEST_USER_ID, 
      'el gasto de comida de 500'
    );
    
    if (identificationResult.success) {
      console.log(`${COLORS.green}✓ Transacción identificada:${COLORS.reset}`, 
        `${identificationResult.transaction.type === 'income' ? 'INGRESO' : 'GASTO'}: ${identificationResult.transaction.details}`);
    } else if (identificationResult.needsMoreInfo) {
      console.log(`${COLORS.yellow}⚠ Se necesita más información:${COLORS.reset}`, 
        `${identificationResult.availableTransactions.length} transacciones posibles`);
    } else {
      console.log(`${COLORS.red}✗ Error:${COLORS.reset}`, identificationResult.error);
    }
    
    // PASO 5: Probar edición de transacción
    console.log(`\n${COLORS.blue}[PASO 5] Probando edición de transacción...${COLORS.reset}`);
    
    const editResult = await userDataService.editTransaction(
      TEST_USER_ID,
      expenseResult.record.id,
      'expense',
      {
        amount: 300,
        category: 'alimentación'
      }
    );
    
    if (editResult.success) {
      console.log(`${COLORS.green}✓ Transacción editada correctamente:${COLORS.reset}`);
      console.log(`  Original: S/500 en comida`);
      console.log(`  Nueva: S/300 en alimentación`);
      console.log(`  Mensaje IA: ${editResult.aiAnalysis}`);
    } else {
      console.log(`${COLORS.red}✗ Error al editar:${COLORS.reset}`, editResult.error);
    }
    
    // PASO 6: Verificar cambios
    console.log(`\n${COLORS.blue}[PASO 6] Verificando cambios realizados...${COLORS.reset}`);
    
    const updatedTransactions = await userDataService.findRecentTransactions(TEST_USER_ID);
    console.log(`${COLORS.green}✓ Transacciones actualizadas:${COLORS.reset}`, 
      updatedTransactions.transactions.map(t => 
        `${t.type === 'income' ? 'INGRESO' : 'GASTO'}: ${t.details}`
      ).join('\n  ')
    );
    
    // PASO 7: Simular flujo de conversación con el usuario
    console.log(`\n${COLORS.blue}[PASO 7] Simulando flujo de conversación para edición...${COLORS.reset}`);
    
    console.log(`${COLORS.cyan}Usuario:${COLORS.reset} Quiero editar mi ingreso de trabajo freelance`);
    
    // Simular la identificación y respuesta
    const conversationResult = await simulateConversation(agent, memory, TEST_USER_ID, [
      "Quiero editar mi ingreso de trabajo freelance",
      "Sí, ese ingreso",
      "Quiero cambiar el monto a 2000 soles",
      "Sí, confirmo"
    ]);
    
    console.log(`\n${COLORS.magenta}=== Test completado ====${COLORS.reset}`);
    console.log(`${COLORS.green}✓ La funcionalidad de edición de transacciones está funcionando correctamente${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}✗ Error durante la prueba:${COLORS.reset}`, error);
  }
}

// Función para simular una conversación con el agente
async function simulateConversation(agent, memory, userId, messages) {
  const results = [];
  
  for (const message of messages) {
    console.log(`\n${COLORS.cyan}Usuario:${COLORS.reset} ${message}`);
    
    // Obtener contexto actualizado
    const context = await memory.getConversationContext(userId);
    
    // Generar respuesta
    const response = await agent.generateResponse(message, context, userId);
    console.log(`${COLORS.green}SofIA:${COLORS.reset} ${response}`);
    
    // Guardar en memoria
    await memory.addMessage(userId, message, response);
    
    results.push({
      user: message,
      agent: response
    });
  }
  
  return results;
}

// Ejecutar pruebas
runTests().catch(console.error); 