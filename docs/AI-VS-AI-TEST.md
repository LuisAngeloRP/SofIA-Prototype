# 🤖 Test AI vs AI - SofIA Finance Bot

## Descripción

El **Test AI vs AI** es un sistema de pruebas completamente automatizado donde dos inteligencias artificiales interactúan entre sí:

1. **Cliente Simulador IA**: Genera mensajes naturales como si fuera un usuario real
2. **SofIA Bot**: Responde con su sistema de IA financiera avanzada

Este test verifica todas las funcionalidades del bot de forma automatizada, sin necesidad de intervención humana.

## 🎯 Funcionalidades Verificadas

### ✅ Detección Automática
- **Reconocimiento de nombres**: Extrae el nombre del usuario automáticamente
- **Detección de ingresos**: Identifica montos y fuentes de ingresos
- **Detección de gastos**: Reconoce gastos y los categoriza
- **Manejo de monedas**: Asume soles peruanos por defecto

### 🧠 Inteligencia Conversacional
- **Respuestas contextuales**: Adapta respuestas al historial de conversación
- **Memoria conversacional**: Mantiene contexto entre intercambios
- **Personalidad consistente**: SofIA mantiene su personalidad empática
- **Análisis financiero inteligente**: Genera resúmenes y consejos

### 📊 Capacidades Avanzadas
- **Generación de resúmenes financieros**: Análisis completo con IA
- **Consejos personalizados**: Recomendaciones basadas en perfil del usuario
- **Respuestas empáticas**: Tono natural y comprensivo

## 🚀 Cómo Ejecutar

### Prerequisitos
```bash
# 1. Tener la API key de Perplexity configurada
echo "PERPLEXITY_API_KEY=tu_api_key_aqui" > .env

# 2. Instalar dependencias
npm install
```

### Ejecutar Test
```bash
# Ejecutar test AI vs AI completo
npm run test:ai-vs-ai

# O directamente
node test-ai-vs-ai.js
```

## 🎭 Personalidad del Cliente IA

El simulador genera automáticamente un cliente virtual con:

- **Nombre aleatorio**: María, Carlos, Ana, etc.
- **Edad**: Entre 25-55 años
- **Profesión**: Ingeniera, médico, freelancer, etc.
- **Personalidad**: Cautelosa, impulsiva, organizada, etc.
- **Situación financiera**: Quiere ahorrar, invertir, etc.

### Ejemplo de Cliente Generado:
```
👤 Cliente IA generado:
   Nombre: María
   Edad: 32 años
   Profesión: diseñadora gráfica
   Personalidad: cautelosa con el dinero
   Situación: quiere empezar a ahorrar
```

## 📋 Plan de Conversación

El cliente IA sigue un plan estructurado pero genera mensajes naturales:

1. **Greeting**: Saludo y presentación
2. **Income Report**: Reporta ingresos recientes
3. **Expense Report**: Menciona gastos
4. **Financial Question**: Hace preguntas sobre finanzas
5. **Goal Setting**: Establece metas financieras
6. **Advice Request**: Pide consejos específicos
7. **Follow Up**: Seguimiento de consejos
8. **Farewell**: Despedida natural

## 🔧 Arquitectura Técnica

### Cliente Simulador IA
```javascript
class AIClientSimulator {
    // Usa Perplexity Sonar API
    model: 'sonar-pro'
    // Genera mensajes contextuales
    // Mantiene personalidad consistente
    // Sigue plan de conversación natural
}
```

### Sistema de Prompts
El cliente IA usa prompts sofisticados:

```
Eres María, una persona de 32 años que trabaja como diseñadora gráfica.
Tu personalidad: cautelosa con el dinero.
Tu situación financiera: quiere empezar a ahorrar.

INSTRUCCIONES:
- Escribe EXACTAMENTE como escribirías por WhatsApp
- USA números y cantidades específicas para Perú
- Mantén tu personalidad consistente
- Limita tu respuesta a 1-2 oraciones máximo
```

## 📊 Reporte de Resultados

El test genera un reporte completo:

### Estadísticas Básicas
- ✅ Intercambios exitosos: X/Y
- ❌ Errores de IA: X
- 🤖 Tasa de éxito: X%

### Funcionalidades Verificadas
- 💰 Ingresos detectados automáticamente: X
- 💸 Gastos detectados automáticamente: X
- 👤 Nombre del usuario detectado: ✅/❌
- 💬 Memoria conversacional activa: ✅/❌

### Transacciones Procesadas
```
💱 Transacciones Procesadas por IA:
   📈 Ingreso 1: S/3500 - trabajo freelance
   📉 Gasto 1: S/800 - supermercado
```

### Resumen Financiero IA
```
💡 Resumen Financiero Generado por IA:
📊 Hola María! He estado analizando tu situación financiera...
```

### Puntuación Final
- **80-100**: 🥇 ¡Excelente! SofIA funciona perfectamente
- **60-79**: 🥈 Bueno, algunas mejoras posibles  
- **<60**: 🥉 Regular, necesita optimización

## 🔍 Análisis de Calidad

### Personalidad Consistente
Verifica que SofIA mantenga:
- Saludos amigables
- Uso de emojis apropiados
- Tono empático y profesional

### Respuestas Contextuales
Confirma que las respuestas:
- Tengan longitud apropiada (>10 caracteres)
- Se adapten al contexto de la conversación
- Sean relevantes al mensaje del usuario

## 🚨 Solución de Problemas

### Error: API Key no configurada
```bash
❌ ERROR: Se requiere PERPLEXITY_API_KEY para el test AI vs AI
```
**Solución**: Configurar `.env` con tu API key de Perplexity

### Error: Sin respuesta del cliente IA
**Causa**: Problema de conectividad o límites de API
**Solución**: El sistema usa mensajes de respaldo automáticos

### Error: Bot no responde
**Causa**: Error en el FinanceAgent
**Solución**: Revisa logs, el sistema maneja errores gracefully

## 🌟 Ventajas del Test AI vs AI

### ✅ Automatización Completa
- No requiere intervención humana
- Pruebas consistentes y repetibles
- Disponible 24/7

### ✅ Conversaciones Realistas
- Cliente IA genera mensajes naturales
- Personalidades variadas en cada ejecución
- Cantidades y situaciones realistas para Perú

### ✅ Cobertura Integral
- Verifica todas las funcionalidades clave
- Múltiples escenarios de conversación
- Métricas detalladas de rendimiento

### ✅ Escalabilidad
- Puede ejecutarse múltiples veces
- Diferentes personalidades de cliente
- Fácil modificación de escenarios

## 🔮 Extensiones Futuras

### Test de Imágenes AI vs AI
- Cliente IA que genere y envíe imágenes financieras
- Verificación automática de reconocimiento OCR

### Test de Estrés AI vs AI
- Múltiples clientes IA simultáneos
- Verificación de concurrencia

### Test de Scenarios Específicos
- Clientes con deudas complejas
- Situaciones de inversión avanzada
- Emergencias financieras

## 📞 Soporte

Para problemas con el test AI vs AI:
1. Verificar configuración de API keys
2. Revisar logs de errores
3. Ejecutar test básico primero (`npm test`)
4. Validar conectividad con Perplexity API

---

**🎯 El Test AI vs AI garantiza que SofIA esté lista para conversaciones reales con usuarios de WhatsApp, verificando cada funcionalidad de forma completamente automatizada.** 