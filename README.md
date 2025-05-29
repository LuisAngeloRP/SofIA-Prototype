# SofIA Finance Advisor 💰

**Agente de IA 100% inteligente para asesoría financiera personal en WhatsApp**

SofIA es tu asesora financiera personal que actúa como un amigo cercano. **Potenciada completamente por Perplexity Sonar**, SIN patrones de texto hardcodeados - TODO es manejado por inteligencia artificial real.

## 🌟 Características Principales

### 🧠 **100% IA-Driven - Sin Patrones Hardcodeados**
- **CERO detección de patrones de texto** - TODO es manejado por IA
- **Motor de IA real** usando Perplexity Sonar API para TODAS las decisiones
- **Análisis inteligente** de cada mensaje sin reglas predefinidas
- **Extracción automática** de información financiera por IA
- **Decisiones contextuales** basadas en análisis semántico real
- **Respuestas completamente naturales** sin templates

### 💼 **Funciones Financieras Inteligentes por IA**
- ✅ **Detección automática por IA** de ingresos y gastos en lenguaje natural
- ✅ **Categorización inteligente** sin patrones fijos
- ✅ **Análisis financiero completamente generado por IA**
- ✅ **Consejos basados en datos actuales del mercado en tiempo real**
- ✅ **Extracción de cantidades y categorías por IA** (no regex)
- ✅ **Resúmenes financieros adaptativos** según contexto específico
- ✅ **Reconocimiento de nombres e información personal por IA**

### 🚀 **Inteligencia Artificial Avanzada**
- Cada mensaje es **analizado completamente por IA** para decidir qué hacer
- **Prompts contextuales dinámicos** que se adaptan a cada situación
- **Búsqueda en tiempo real** de información financiera actualizada
- **Análisis de mercado actual** para consejos específicos
- **Respuestas únicas** para cada conversación (nunca genéricas)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- WhatsApp instalado en tu teléfono
- **API Key de Perplexity** (REQUERIDA para funcionalidad completa)

### 1. Clonar e instalar dependencias
```bash
git clone <tu-repositorio>
cd SofIA-Prototype
npm install
```

### 2. Configurar Perplexity Sonar (REQUERIDO)
Para funcionalidad completa SIN patrones hardcodeados:

1. **Obtén tu API Key:**
   - Ve a [Perplexity AI](https://perplexity.ai)
   - Crea una cuenta y obtén tu API key

2. **Configura las variables de entorno:**
```bash
# Copia el archivo de ejemplo
cp env.example .env

# Edita .env y agrega tu API key
PERPLEXITY_API_KEY=tu_api_key_aqui
```

### 3. Ejecutar el bot
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start

# Probar el agente IA
npm test
```

### 4. Conectar WhatsApp
1. Ejecuta el bot
2. Escanea el código QR que aparece en la terminal con WhatsApp
3. ¡SofIA estará lista con IA 100% inteligente!

## 💬 Cómo Funciona la IA Inteligente

### Análisis Completamente por IA

**ANTES (con patrones):**
```
if (message.includes("gasté")) {
    // Lógica hardcodeada...
}
```

**AHORA (100% IA):**
```
Usuario: "Ayer se me fueron como veintitantos mil en el súper"
IA analiza: "Detecta gasto de ~20,000 en supermercado"
SofIA: "Entiendo que gastaste alrededor de $20,000 en el supermercado ayer 🛒..."
```

### Ejemplos de IA Inteligente

```
Usuario: "Este mes cobré setenta y cinco lucas del laburo"
IA: Extrae automáticamente $75,000 como ingreso laboral
SofIA: "¡Perfecto! Registré tu ingreso de $75,000 del trabajo 💼..."

Usuario: "¿Cómo está la inflación ahora?"
IA: Busca datos actuales de inflación en tiempo real
SofIA: "Según los datos más recientes, la inflación está en 4.2%..."

Usuario: "¿Es buen momento para invertir?"
IA: Analiza condiciones actuales del mercado
SofIA: "Basándome en las tendencias actuales del mercado..."
```

## 🎯 Ventajas del Enfoque 100% IA

### ❌ **Lo que NO hacemos (y odias):**
- Patrones de texto rígidos
- Regex hardcodeadas
- Reglas if/else predefinidas
- Templates de respuestas fijas
- Detección por palabras clave

### ✅ **Lo que SÍ hacemos:**
- **Análisis semántico real** de cada mensaje
- **Decisiones contextuales** basadas en IA
- **Respuestas únicas** para cada situación
- **Aprendizaje de patrones naturales** del usuario
- **Adaptación inteligente** al contexto conversacional

## 🧠 Arquitectura de IA Avanzada

```
Mensaje del Usuario
        ↓
    Perplexity IA
    (Análisis completo)
        ↓
    Decisión Inteligente
    {
        "intent": "financial_transaction",
        "actions": [
            {
                "type": "register_expense",
                "data": {
                    "amount": 20000,
                    "category": "Supermercado"
                }
            }
        ]
    }
        ↓
    Ejecución de Acciones
        ↓
    Respuesta Natural por IA
```

## 🔧 Configuración de IA Avanzada

### Variables de Entorno

```bash
# API Key (REQUERIDA para IA completa)
PERPLEXITY_API_KEY=tu_api_key

# Configuraciones de IA
SOFIA_MAX_TOKENS=1500           # Tokens máximos por respuesta
SOFIA_SEARCH_CONTEXT_SIZE=high  # low, medium, high
SOFIA_DEBUG_MODE=false          # Mostrar debug de IA
```

### Modos de Funcionamiento

1. **Modo IA Completa** (Con API Key):
   - **CERO patrones hardcodeados**
   - Análisis inteligente de TODOS los mensajes
   - Decisiones contextuales por IA
   - Respuestas completamente naturales
   - Acceso a información actualizada del mercado

2. **Modo Básico** (Sin API Key):
   - Funciones limitadas con respuestas amigables
   - Registro manual básico
   - Sin análisis inteligente

## 🚨 Diferencias Clave con Otros Bots

### Bots Tradicionales:
```python
# ❌ Enfoque tradicional con patrones
if "gané" in message or "recibí" in message:
    amount = extract_with_regex(message)
    category = check_keywords(message)
```

### SofIA con IA:
```python
# ✅ Enfoque 100% IA
ai_decision = await perplexity.analyze_message(message, context)
intelligent_response = await perplexity.generate_response(decision)
```

## 📊 Capacidades de IA Específicas

### 1. **Análisis Contextual Inteligente**
- Entiende el flujo completo de la conversación
- Recuerda preferencias y patrones del usuario
- Adapta comunicación al nivel de relación

### 2. **Extracción Inteligente de Datos**
```
"Ayer se me fueron como veinte lucas en delivery"
↓ IA extrae: $20,000, Categoría: "Delivery/Comida"

"Cobré mi sueldo de sesenta y cinco mil"
↓ IA extrae: $65,000, Fuente: "Salario"
```

### 3. **Búsqueda Financiera en Tiempo Real**
- Tasas de interés actuales
- Inflación y economía
- Mercados de inversión
- Análisis de riesgo contextual

## 🔍 Pruebas de IA

```bash
# Probar capacidades de IA
npm test

# Ejemplos de pruebas automáticas:
"Este mes cobré setenta y cinco mil del laburo"
"Se me fueron quinientos mangos en delivery"
"¿Es verdad que la inflación está alta?"
"¿Me conviene meter plata en dólares?"
```

## 💰 Optimización de Costos de IA

### Configuración Inteligente de Costos
```bash
# Para uso básico
SOFIA_SEARCH_CONTEXT_SIZE=low
SOFIA_MAX_TOKENS=800

# Para análisis profundo
SOFIA_SEARCH_CONTEXT_SIZE=high
SOFIA_MAX_TOKENS=1500
```

### Precios Perplexity
- **Sonar Pro**: ~$0.001 por consulta
- **Búsquedas web**: Incluidas en el plan
- **Optimización**: SofIA usa contexto inteligente para minimizar costos

## 🎯 ¡Listo para IA Avanzada!

**SofIA con IA 100% inteligente te ofrece:**
- 🧠 **Cero patrones hardcodeados**
- 🤖 **Análisis completamente por IA**
- 💬 **Conversaciones verdaderamente naturales**
- 📊 **Información financiera en tiempo real**
- 🎯 **Consejos específicos para cada situación**
- 🔄 **Adaptación inteligente al contexto**

### Comandos Rápidos

```bash
# Instalar
npm install

# Configurar IA (REQUERIDO)
cp env.example .env
# Editar .env con tu PERPLEXITY_API_KEY

# Probar IA
npm test

# Usar en WhatsApp con IA completa
npm start
```

---

💡 **¿Necesitas ayuda?** Abre un issue en GitHub

🎉 **¡Disfruta de SofIA con IA 100% inteligente - sin patrones hardcodeados!**