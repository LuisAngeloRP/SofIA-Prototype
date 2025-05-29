# 📷 Reconocimiento de Imágenes Financieras - SofIA v2.1

## 🎯 Descripción

SofIA ahora puede analizar imágenes financieras usando la API Sonar de Perplexity. Esta funcionalidad permite a los usuarios enviar fotos de documentos financieros y recibir análisis inteligentes y consejos personalizados.

## 🚀 Funcionalidades

### Tipos de Imágenes Soportadas

#### 🧾 **Recibos y Comprobantes**
- Extracción automática de montos, fechas y conceptos
- Identificación del establecimiento
- Sugerencia de categorización del gasto
- Opción de registro automático en el historial financiero

#### 🏦 **Estados de Cuenta Bancarios**
- Análisis de movimientos principales
- Identificación de patrones de gasto
- Evaluación de saldos y tendencias
- Consejos basados en el flujo de dinero observado

#### 📊 **Gráficos y Tablas Financieras**
- Interpretación de gráficos de inversión
- Análisis de tendencias en datos financieros
- Explicación de información compleja
- Consejos de optimización basados en los datos

#### 💳 **Tarjetas y Documentos Financieros**
- Análisis general manteniendo la privacidad
- Ocultación automática de números sensibles
- Solo muestra últimos 4 dígitos de tarjetas
- Protección completa de datos personales

## 🔧 Configuración

### Requisitos
- API Key de Perplexity configurada en `.env`
- Modelo Sonar Pro habilitado
- WhatsApp Web.js para recepción de imágenes

### Variables de Entorno
```bash
PERPLEXITY_API_KEY=tu_api_key_aqui
SOFIA_MAX_TOKENS=1500
```

## 📱 Uso

### Envío de Imágenes
1. **Con descripción**: Envía la imagen con texto como "Este es mi recibo de compras"
2. **Sin descripción**: Envía solo la imagen y SofIA la analizará automáticamente
3. **Especifica el tipo**: Incluye palabras clave como "recibo", "estado de cuenta", "gráfico"

### Palabras Clave de Detección
- **Recibos**: "recibo", "ticket", "comprobante", "factura"
- **Estados**: "estado", "cuenta", "banco", "tarjeta"
- **Gráficos**: "gráfico", "grafica", "inversión", "tabla"

## 🔒 Seguridad y Privacidad

### Protección de Datos
- **Números de tarjeta**: Solo muestra últimos 4 dígitos
- **Cuentas bancarias**: Oculta números completos
- **Información sensible**: Nunca se revela completamente
- **Procesamiento local**: Las imágenes se procesan y no se almacenan

### Límites Técnicos
- **Tamaño máximo**: 5MB por imagen
- **Formatos**: PNG, JPEG, WEBP, GIF
- **Resolución**: Optimizada automáticamente

## 🤖 Integración con IA

### Análisis Inteligente
- Reconocimiento de texto (OCR) avanzado
- Contextualización financiera automática
- Consejos personalizados según el historial
- Integración con perfil financiero del usuario

### Respuestas Personalizadas
- Tono amigable y profesional de SofIA
- Preguntas de seguimiento inteligentes
- Sugerencias de acciones específicas
- Consejos basados en el contexto financiero

## 📋 Ejemplos de Uso

### Análisis de Recibo
```
Usuario: [Envía imagen de recibo del supermercado]
SofIA: 📷 Veo tu recibo del supermercado por $1,247 del 15/12/2024. Incluye productos básicos como alimentos y limpieza 🛒 

¿Te gustaría que registre este gasto en tu categoría de "Alimentación"? También noto que compraste productos de limpieza - podríamos crear una subcategoría específica 😊
```

### Análisis de Estado de Cuenta
```
Usuario: "Analiza mi estado de cuenta" [imagen]
SofIA: 📊 Tu estado muestra un buen flujo de ingresos regulares y gastos controlados. Destaco que tienes un ahorro mensual promedio de $2,500 💪

Una observación: veo varios cargos pequeños frecuentes. ¿Te interesa que analicemos estrategias para optimizar esos micro-gastos? 🤔
```

## ⚠️ Limitaciones

### Técnicas
- Requiere conexión a internet para procesamiento
- Dependiente de la API de Perplexity
- Calidad del análisis depende de la claridad de la imagen

### Funcionales
- No almacena las imágenes enviadas
- No puede procesar videos o GIFs animados
- Precisión del OCR puede variar según la calidad

## 🔄 Flujo de Procesamiento

1. **Recepción**: WhatsApp recibe la imagen
2. **Descarga**: Conversión a base64
3. **Detección**: Identificación del tipo de documento
4. **Análisis**: Procesamiento con Sonar Pro
5. **Contextualización**: Integración con perfil del usuario
6. **Respuesta**: Generación de consejos personalizados
7. **Registro**: Guardado opcional en historial

## 🎯 Próximas Mejoras

- [ ] Reconocimiento de múltiples imágenes
- [ ] Análisis comparativo temporal
- [ ] Integración con APIs bancarias
- [ ] Exportación de datos extraídos
- [ ] Plantillas de análisis por tipo de documento

---

**Nota**: Esta funcionalidad está disponible solo con una API Key válida de Perplexity. En modo local, SofIA proporcionará respuestas de ayuda pero no podrá analizar las imágenes. 