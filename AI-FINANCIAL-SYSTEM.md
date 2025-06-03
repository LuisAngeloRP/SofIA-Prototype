# 🤖 Sistema AI de Datos Financieros por Usuario

## 📋 Descripción

Sistema inteligente que gestiona datos financieros individuales para cada usuario de SofIA, utilizando **Perplexity AI** para detección automática de transacciones y análisis financiero personalizado.

## 🚀 Características Principales

### ✨ Gestión Individual por Usuario
- **Carpetas separadas**: Cada usuario tiene su directorio en `src/data/users/`
- **Archivos JSON estructurados**: 
  - `profile.json` - Perfil y preferencias
  - `financial.json` - Ingresos, gastos y resumen
  - `history.json` - Historial de conversaciones
  - `analytics.json` - Análisis e insights de IA

### 🔍 Detección Automática con IA
- **Análisis en tiempo real** de mensajes usando Perplexity Sonar API
- **Extracción inteligente** de información financiera
- **Clasificación automática** de ingresos y gastos
- **Soporte multi-moneda**: Soles peruanos (por defecto), dólares, pesos

### 🧠 Análisis Inteligente
- **Recomendaciones personalizadas** basadas en patrones de gasto
- **Análisis de impacto presupuestario**
- **Insights financieros** generados con IA
- **Respuestas contextuales** adaptadas a cada usuario

## 📁 Estructura del Sistema

```
src/
├── data/
│   └── users/
│       └── [user_id]/
│           ├── profile.json      # Perfil del usuario
│           ├── financial.json    # Datos financieros
│           ├── history.json      # Historial conversacional
│           └── analytics.json    # Análisis de IA
├── core/
│   ├── services/
│   │   ├── UserDataService.js           # Gestión de datos por usuario
│   │   ├── TransactionDetectorService.js # Detección de transacciones
│   │   └── PerplexityService.js         # Integración con IA
│   └── middleware/
│       └── UserDataMiddleware.js        # Middleware de integración
```

## 🛠️ Servicios Principales

### 1. UserDataService
```javascript
// Cargar datos del usuario
const userData = await userDataService.getUserData(userId);

// Registrar ingreso
await userDataService.registerIncome(userId, amount, source, description, currency);

// Registrar gasto  
await userDataService.registerExpense(userId, amount, category, description, currency);

// Análisis completo
const analysis = await userDataService.generateComprehensiveAnalysis(userId);
```

### 2. TransactionDetectorService
```javascript
// Analizar mensaje para detectar transacciones
const result = await transactionDetector.analyzeMessage(userId, message);

if (result.hasTransaction) {
    console.log('Transacción detectada:', result.transactionData);
    console.log('Respuesta IA:', result.aiResponse);
}
```

### 3. UserDataMiddleware
```javascript
// Procesar mensaje completo
const result = await middleware.processUserMessage(userId, message, platform);

// Obtener resumen financiero
const summary = await middleware.getUserFinancialSummary(userId);

// Actualizar perfil
await middleware.updateUserProfile(userId, { name: 'Luis' });
```

## 📊 Estructura de Datos

### Profile.json
```json
{
  "userId": "user123",
  "name": "Luis",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastActiveAt": "2024-01-01T12:00:00.000Z",
  "preferences": {
    "currency": "soles",
    "timezone": "America/Lima",
    "language": "es"
  },
  "aiPersonalization": {
    "communicationStyle": "friendly",
    "financialGoals": [],
    "riskTolerance": "moderate"
  }
}
```

### Financial.json
```json
{
  "income": [
    {
      "id": "inc_123",
      "amount": 3000,
      "source": "salario",
      "description": "Salario mensual",
      "currency": "soles",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "aiClassification": "salary",
      "verified": false
    }
  ],
  "expenses": [
    {
      "id": "exp_456",
      "amount": 50,
      "category": "alimentación",
      "description": "Almuerzo",
      "currency": "soles",
      "timestamp": "2024-01-01T13:00:00.000Z",
      "aiClassification": "essential",
      "budgetImpact": "low",
      "verified": false
    }
  ],
  "summary": {
    "totalIncome": 3000,
    "totalExpenses": 50,
    "currentBalance": 2950,
    "lastUpdated": "2024-01-01T13:00:00.000Z",
    "transactionCount": 2
  }
}
```

## 🤖 Integración con Perplexity AI

### Configuración
```bash
# En tu archivo .env
PERPLEXITY_API_KEY=tu_api_key_aqui
```

### Funcionalidades IA
1. **Detección de transacciones**: Análisis automático de mensajes
2. **Clasificación inteligente**: Categorización de ingresos/gastos
3. **Análisis de impacto**: Evaluación del efecto en el presupuesto
4. **Recomendaciones**: Consejos personalizados
5. **Respuestas naturales**: Confirmaciones contextuales

### Ejemplo de Detección
```javascript
// Usuario escribe: "Gasté 45 soles en almuerzo hoy"
// IA detecta automáticamente:
{
  "hasTransaction": true,
  "type": "expense",
  "amount": 45,
  "currency": "soles",
  "category": "alimentación",
  "description": "almuerzo hoy",
  "confidence": 0.95
}
```

## 🚀 Uso del Sistema

### 1. Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tu PERPLEXITY_API_KEY
```

### 2. Demostración
```bash
# Ejecutar demostración del sistema
node test-ai-system.js
```

### 3. Integración en Producción
```javascript
const UserDataMiddleware = require('./src/core/middleware/UserDataMiddleware');
const middleware = new UserDataMiddleware();

// En tu handler de mensajes
app.post('/message', async (req, res) => {
    const { userId, message } = req.body;
    
    const result = await middleware.processUserMessage(userId, message, 'web');
    
    if (result.hasTransaction) {
        // Transacción detectada y registrada automáticamente
        return res.json({ 
            response: result.aiResponse,
            transactionData: result.transactionData 
        });
    }
    
    // Procesar como mensaje normal...
});
```

## 📈 Ejemplos de Uso

### Detección Automática
```
Usuario: "Gané 1500 soles de mi trabajo freelance"
Sistema: ✅ ¡Excelente! Registré tu ingreso de S/1,500 de trabajo freelance 💰
```

```
Usuario: "Pagué 120 soles de luz este mes"  
Sistema: ✅ Perfecto, registré tu gasto de S/120 en servicios públicos 📊
```

### Análisis Inteligente
```
Usuario: "¿Cómo van mis finanzas?"
Sistema: Tienes un balance positivo de S/2,850 💚 Este mes has tenido 
        buenos ingresos por freelance. Te recomiendo apartar el 20% 
        para ahorros y considerar invertir en capacitación.
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Requeridas
PERPLEXITY_API_KEY=tu_api_key

# Opcionales
SOFIA_MAX_TOKENS=1500                    # Límite de tokens por respuesta
SOFIA_SEARCH_CONTEXT_SIZE=low            # Tamaño de contexto de búsqueda
```

### Personalización IA
```javascript
// Actualizar preferencias del usuario
await middleware.updateUserProfile(userId, {
    preferences: {
        currency: 'dolares',
        language: 'en'
    },
    aiPersonalization: {
        communicationStyle: 'professional',
        riskTolerance: 'conservative'
    }
});
```

## 🛡️ Seguridad y Privacidad

- **Datos separados**: Cada usuario tiene archivos completamente aislados
- **IDs sanitizados**: Los IDs de usuario se sanean para nombres de carpeta seguros
- **Sin datos compartidos**: No hay cruzamiento de información entre usuarios
- **Historial limitado**: Se mantienen solo las últimas 100 interacciones por usuario

## 📊 Estadísticas y Monitoreo

```javascript
// Obtener estadísticas del sistema
const stats = middleware.getSystemStats();
console.log('Servicios activos:', stats.services.length);
console.log('Características:', stats.features);
```

## 🚀 Roadmap Futuro

- [ ] **Análisis predictivo** de gastos futuros
- [ ] **Detección de patrones** de comportamiento financiero  
- [ ] **Alertas inteligentes** para gastos inusuales
- [ ] **Integración con bancos** para importación automática
- [ ] **Dashboard web** para visualización de datos
- [ ] **Exportación** a formatos estándar (CSV, Excel)
- [ ] **API REST** para integraciones externas

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -am 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**SofIA Finance Advisor** - Sistema AI de gestión financiera personal 🤖💰 