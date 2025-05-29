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

### 📷 **Reconocimiento de Imágenes Financieras (NUEVO v2.1)**
- ✅ **Análisis de recibos y comprobantes** automático por IA
- ✅ **Interpretación de estados de cuenta bancarios** con OCR inteligente
- ✅ **Lectura de gráficos financieros** y tablas de inversión
- ✅ **Extracción de datos financieros** de cualquier imagen
- ✅ **Protección de privacidad** (oculta números sensibles automáticamente)
- ✅ **Registro automático** de transacciones encontradas en imágenes
- ✅ **Consejos basados en imágenes** enviadas por el usuario

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
- **API Key de Perplexity** (REQUERIDA para funcionalidad completa + imágenes)

### 1. Clonar e instalar dependencias
```bash
git clone <tu-repositorio>
cd SofIA-Prototype
npm install
```

### 2. Configurar Perplexity Sonar (REQUERIDO)
Para funcionalidad completa SIN patrones hardcodeados + reconocimiento de imágenes:

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
3. ¡SofIA estará lista con IA 100% inteligente + reconocimiento de imágenes!

## 📷 Nuevas Capacidades de Imagen

### Tipos de Imágenes Soportadas
- **🧾 Recibos y facturas**: Extracción automática de montos, fechas y comercios
- **🏦 Estados de cuenta**: Análisis de movimientos y patrones financieros
- **📊 Gráficos financieros**: Interpretación de inversiones y tendencias
- **💳 Documentos financieros**: Análisis general con protección de privacidad

### Ejemplos de Uso con Imágenes
```
Usuario: [Envía foto de recibo del supermercado]
SofIA: 📷 Perfecto! Veo tu compra en Walmart por $1,247.50 del 15/12/2024. 
Incluye alimentos básicos y productos de limpieza 🛒 
¿Quieres que lo registre en "Alimentación" o prefieres dividirlo en categorías?

Usuario: [Envía estado de cuenta bancario]
SofIA: 📊 Analicé tu estado de cuenta. Tienes un flujo saludable con $15,000 
de ingresos regulares y gastos por $12,300. Tu ahorro mensual de $2,700 está 
excelente! 💪 ¿Te muestro algunas oportunidades de optimización que detecto?
```

## 💬 Cómo Funciona la IA Inteligente

### Análisis Completamente por IA

**ANTES (con patrones):**
```
if (message.includes("gasté")) {
    // Lógica hardcodeada...
}
```

**AHORA (100% IA + Imágenes):**
```
Usuario: "Ayer se me fueron como veintitantos mil en el súper"
IA analiza: "Detecta gasto de ~20,000 en supermercado"
SofIA: "Entiendo que gastaste alrededor de $20,000 en el supermercado ayer 🛒..."

Usuario: [Envía imagen de recibo]
IA analiza: "Recibo Walmart, $1,247.50, fecha actual, productos alimentarios"
SofIA: "Veo tu recibo de Walmart por $1,247.50. ¿Lo registro en alimentación? 🛒"
```

### Ejemplos de IA Inteligente

```
Usuario: "Este mes cobré setenta y cinco lucas del laburo"
IA: Extrae automáticamente $75,000 como ingreso laboral
SofIA: "¡Perfecto! Registré tu ingreso de $75,000 del trabajo 💼..."

Usuario: "¿Cómo está la inflación ahora?"
IA: Busca datos actuales de inflación en tiempo real
SofIA: "Según los datos más recientes, la inflación está en 4.2%..."

Usuario: [Imagen de gráfico de inversiones]
IA: Analiza el gráfico y extrae tendencias
SofIA: "Tu gráfico muestra una tendencia alcista del 8.5% este trimestre 📈..."
```

## 🎯 Ventajas del Enfoque 100% IA

### ❌ **Lo que NO hacemos (y odias):**
- Patrones de texto rígidos
- Regex hardcodeadas
- Reglas if/else predefinidas
- Templates de respuestas fijas
- Detección por palabras clave
- OCR básico sin contexto

### ✅ **Lo que SÍ hacemos:**
- **Análisis semántico real** de cada mensaje e imagen
- **Decisiones contextuales** basadas en IA
- **Respuestas únicas** para cada situación
- **Aprendizaje de patrones naturales** del usuario
- **Adaptación inteligente** al contexto conversacional
- **OCR inteligente** con comprensión financiera
- **Protección automática** de datos sensibles

## 🧠 Arquitectura de IA Avanzada

```
Mensaje/Imagen del Usuario
        ↓
    Perplexity Sonar IA
    (Análisis completo + OCR)
        ↓
    Decisión Inteligente
    {
        "intent": "financial_transaction",
        "actions": [
            {
                "type": "register_expense",
                "data": {
                    "amount": 20000,
                    "category": "Supermercado",
                    "source": "imagen_recibo"
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
# API Key (REQUERIDA para IA completa + imágenes)
PERPLEXITY_API_KEY=tu_api_key

# Configuraciones de IA
SOFIA_MAX_TOKENS=1500           # Tokens máximos por respuesta
SOFIA_SEARCH_CONTEXT_SIZE=high  # low, medium, high
SOFIA_DEBUG_MODE=false          # Mostrar debug de IA
```

### Modos de Funcionamiento

1. **Modo IA Completa + Imágenes** (Con API Key):
   - **CERO patrones hardcodeados**
   - Análisis inteligente de TODOS los mensajes e imágenes
   - OCR avanzado con comprensión financiera
   - Decisiones contextuales por IA
   - Respuestas completamente naturales
   - Acceso a información actualizada del mercado
   - Protección automática de datos sensibles

2. **Modo Básico** (Sin API Key):
   - Funciones limitadas con respuestas amigables
   - Sin capacidades de imagen
   - Registro manual básico
   - Sin análisis inteligente

## 🔒 Seguridad y Privacidad con Imágenes

- **Protección automática**: Oculta números de tarjetas y cuentas
- **No almacenamiento**: Las imágenes no se guardan en el servidor
- **Procesamiento local**: Análisis en tiempo real sin retención
- **Datos sensibles**: Solo muestra últimos 4 dígitos si es necesario

## 📋 Formatos de Imagen Soportados

- **PNG, JPEG, WEBP, GIF** hasta 5MB
- **Calidad automática**: Optimización inteligente
- **OCR avanzado**: Reconocimiento de texto financiero especializado

## 🚨 Diferencias Clave con Otros Bots

### Bots Tradicionales:
```python
# ❌ Enfoque tradicional con patrones
if "gané" in message or "recibí" in message:
    amount = extract_with_regex(message)
    category = check_keywords(message)

# ❌ OCR básico
text = basic_ocr(image)
if "total" in text.lower():
    # Regex para encontrar montos...
```

### SofIA con IA:
```python
# ✅ Enfoque 100% IA
ai_decision = await perplexity.analyze_message(message, context)
intelligent_response = await perplexity.generate_response(decision)

# ✅ OCR inteligente
financial_analysis = await sonar_pro.analyze_financial_image(image, context)
contextual_response = await ai.generate_financial_advice(analysis)
```

---

## 📖 Documentación Adicional

- [📷 Guía de Reconocimiento de Imágenes](docs/reconocimiento-imagenes.md)
- [🚀 Casos de Uso del Agente](casos-de-uso-agente-financiero.md)
- [💰 Funciones para Usuarios Básicos](funciones-esenciales-usuarios-basicos.md)

---

**SofIA v2.1 - La evolución de la asesoría financiera inteligente con capacidades visuales avanzadas** 🚀📷