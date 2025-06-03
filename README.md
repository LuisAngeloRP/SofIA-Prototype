# SofIA Finance Advisor 💰 v2.1

**Agente de IA Multi-Plataforma para asesoría financiera personal**

SofIA es tu asesora financiera personal que funciona tanto en **WhatsApp** como en una **aplicación web moderna**. Potenciada completamente por **Perplexity Sonar**, con reconocimiento de imágenes financieras y **100% IA** - sin patrones hardcodeados.

## 🌟 Características Principales

### 🚀 **Multi-Plataforma**
- ✅ **WhatsApp Bot**: Chat directo por WhatsApp
- ✅ **Web App**: Interfaz moderna con NextJS + TypeScript
- ✅ **API REST**: Endpoints para integraciones
- ✅ **WebSocket**: Comunicación en tiempo real
- ✅ **Arquitectura Modular**: Fácil agregar nuevas plataformas

### 🧠 **100% IA-Driven - Sin Patrones Hardcodeados**
- **CERO detección de patrones de texto** - TODO es manejado por IA
- **Motor de IA real** usando Perplexity Sonar API para TODAS las decisiones
- **Análisis inteligente** de cada mensaje sin reglas predefinidas
- **Respuestas completamente naturales** sin templates

### 📷 **Reconocimiento de Imágenes Financieras**
- ✅ **Análisis de recibos y comprobantes** automático por IA
- ✅ **Interpretación de estados de cuenta bancarios** con OCR inteligente
- ✅ **Lectura de gráficos financieros** y tablas de inversión
- ✅ **Extracción de datos financieros** de cualquier imagen
- ✅ **Protección de privacidad** (oculta números sensibles automáticamente)

### 💼 **Funciones Financieras Inteligentes**
- ✅ **Detección automática por IA** de ingresos y gastos en lenguaje natural
- ✅ **Categorización inteligente** sin patrones fijos
- ✅ **Análisis financiero completamente generado por IA**
- ✅ **Consejos basados en datos actuales del mercado en tiempo real**
- ✅ **Resúmenes financieros adaptativos** según contexto específico

## 🏗️ Nueva Arquitectura Multi-Plataforma

```
SofIA-Prototype/
├── src/
│   ├── core/                    # Lógica central compartida
│   │   ├── agent/              # Agente de IA financiera
│   │   ├── services/           # Servicios (Perplexity, OCR)
│   │   ├── memory/             # Gestión de memoria/conversaciones
│   │   └── config/             # Configuraciones
│   ├── platforms/              # Plataformas específicas
│   │   ├── whatsapp/           # Implementación WhatsApp
│   │   ├── web/                # Implementación Web API
│   │   └── server.js           # Servidor multi-plataforma
│   ├── shared/                 # Utilidades compartidas
│   └── index.js                # Punto de entrada principal
├── webapp/                     # Aplicación NextJS
│   └── src/
│       ├── app/                # App Router de NextJS 15
│       ├── components/         # Componentes React
│       ├── hooks/              # Hooks personalizados
│       ├── lib/                # Utilidades y API client
│       └── types/              # Tipos TypeScript
└── docs/                       # Documentación completa
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- **API Key de Perplexity** (REQUERIDA para funcionalidad completa)

### 1. Clonar e instalar dependencias
```bash
git clone <tu-repositorio>
cd SofIA-Prototype
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Copia el archivo de ejemplo
cp env.example .env

# Edita .env y configura:
PERPLEXITY_API_KEY=tu_api_key_aqui

# Configuración de plataformas (opcional)
ENABLE_WHATSAPP=true
ENABLE_WEB=true
API_PORT=3001
WEBAPP_URL=http://localhost:3000
```

### 3. Configurar WebApp (NextJS)
```bash
# Instalar dependencias de la webapp
npm run webapp:install

# Configurar variables de entorno de la webapp
cd webapp
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
cd ..
```

## 🎯 Modos de Ejecución

### Multi-Plataforma (Recomendado)
```bash
# Ejecutar ambas plataformas
npm start

# En otra terminal, ejecutar la webapp
npm run webapp:dev
```

### Solo WhatsApp
```bash
ENABLE_WEB=false npm start
```

### Solo Web API + WebApp
```bash
ENABLE_WHATSAPP=false npm start
# En otra terminal:
npm run webapp:dev
```

### Solo WhatsApp Platform
```bash
npm run whatsapp:dev
```

### Solo Web API
```bash
node src/platforms/web/server.js
```

## 📱 Usando SofIA

### WhatsApp
1. Ejecuta `npm start` o `npm run whatsapp:dev`
2. Escanea el código QR que aparece en la terminal
3. ¡Envía mensajes a SofIA desde WhatsApp!

### Web App
1. Ejecuta el backend: `npm start` o `node src/platforms/web/server.js`
2. Ejecuta la webapp: `npm run webapp:dev`
3. Abre `http://localhost:3000` en tu navegador
4. ¡Chatea con SofIA desde la web!

## 🔧 API Endpoints

### REST API
- `GET /health` - Estado del servidor
- `POST /api/chat` - Enviar mensaje de texto
- `POST /api/chat/image` - Enviar imagen con IA
- `GET /api/conversation/:sessionId` - Obtener historial
- `DELETE /api/conversation/:sessionId` - Limpiar conversación

### WebSocket Events
- `join-session` - Unirse a sesión
- `send-message` - Enviar mensaje en tiempo real
- `message` - Recibir mensaje del bot
- `agent-status` - Estado de la IA

## 💡 Ejemplos de Uso

### Mensajes de Texto
```
Usuario: "Gasté $1,500 en el súper ayer"
SofIA: "Registré tu gasto de $1,500 en alimentación 🛒. 
¿Te gustaría que analice tus gastos del mes en supermercado?"

Usuario: "¿Cómo está mi presupuesto este mes?"
SofIA: "Has gastado $12,450 de tu presupuesto de $15,000 (83%). 
Te quedan $2,550 para los próximos 8 días. ¡Vas muy bien! 💪"
```

### Análisis de Imágenes
```
[Usuario envía foto de recibo]
SofIA: "📷 Veo tu recibo de Walmart por $1,247.50 del 15/12/2024. 
Incluye alimentos básicos y productos de limpieza 🛒 
¿Lo registro en 'Alimentación' o prefieres dividirlo en categorías?"

[Usuario envía estado de cuenta]
SofIA: "📊 Analicé tu estado de cuenta. Tienes un flujo saludable 
con $15,000 de ingresos y gastos por $12,300. Tu ahorro mensual 
de $2,700 está excelente! 💪"
```

## 🛠️ Desarrollo

### Estructura del Proyecto
- **Core**: Lógica compartida entre plataformas
- **Platforms**: Implementaciones específicas (WhatsApp, Web)
- **WebApp**: Interfaz NextJS con TypeScript
- **Shared**: Utilidades comunes
- **Docs**: Documentación técnica

### Agregar Nueva Plataforma
1. Crear directorio en `src/platforms/nueva-plataforma/`
2. Implementar servidor específico
3. Reutilizar componentes del core
4. Agregar configuración en multi-platform server

### Testing
```bash
# Tests del backend
npm test

# Tests de imágenes
npm run test:images

# Tests de IA
npm run test:ai-vs-ai
```

## 🚀 Despliegue

### Opciones de Despliegue
1. **Microservicios** (Producción): EC2 + ECS Fargate + RDS
2. **Simplificada** (MVP): EC2 Multi-Platform
3. **Serverless** (Solo Web): Lambda + API Gateway

### Costos Estimados (AWS)
- **Producción**: ~$100/mes (alta disponibilidad)
- **MVP**: ~$37/mes (una instancia EC2)
- **Serverless**: ~$21/mes (pay-per-use)

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para guía completa de despliegue.

## 📚 Documentación

- [Arquitectura](docs/ARCHITECTURE.md) - Estructura técnica detallada
- [Despliegue](docs/DEPLOYMENT.md) - Guía completa de AWS
- [Setup](setup.md) - Configuración paso a paso

## 🔑 Variables de Entorno

### Backend
```bash
# Requeridas
PERPLEXITY_API_KEY=tu_api_key

# Configuración de plataformas
ENABLE_WHATSAPP=true
ENABLE_WEB=true
API_PORT=3001
WEBAPP_URL=http://localhost:3000

# Opcional
SOFIA_DEBUG_MODE=false
SOFIA_MAX_TOKENS=1500
```

### WebApp
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔍 Configuración de Logs

SofIA incluye un sistema de logs inteligente para reducir el spam de mensajes:

### Modo Producción (Por Defecto)
```bash
NODE_ENV=production  # Logs resumidos cada 5 minutos
```
- Muestra estadísticas de conexiones WebSocket cada 5 minutos
- Reduce el spam de logs de conexiones/desconexiones individuales
- Perfecto para uso diario

### Modo Desarrollo (Debug Detallado)
```bash
NODE_ENV=development  # Logs detallados en tiempo real
```
- Muestra cada conexión y desconexión WebSocket
- Útil para debugging y desarrollo
- Logs más verbosos para diagnósticos

## 🎉 Ventajas de la Nueva Arquitectura

### ✅ **Para Desarrolladores**
- Código modular y mantenible
- TypeScript para mayor robustez
- Separación clara de responsabilidades
- Fácil testing unitario
- Hot reload en desarrollo

### ✅ **Para Usuarios**
- Experiencia consistente entre plataformas
- Interfaz web moderna y responsiva
- Comunicación en tiempo real
- Soporte para drag & drop de imágenes
- Historial persistente

### ✅ **Para Despliegue**
- Escalabilidad independiente por plataforma
- Opciones flexibles de hosting
- Monitoring granular
- Backup y recuperación simplificados
- CI/CD automatizado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## 👨‍💻 Autor

**SofIA Team** - Tu asistente financiero inteligente

---

**⭐ Si te gusta SofIA, por favor dale una estrella al repositorio!**

## 🔧 Solución al Problema de Spam de Conexiones

Si ves muchos logs de conexiones/desconexiones WebSocket:

```
🔌 Cliente conectado: ABC123
🔌 Cliente desconectado: ABC123
```

### Causa del Problema
- La webapp no está ejecutándose pero el backend está esperando conexiones
- Reconexiones automáticas fallidas
- Logs demasiado verbosos en desarrollo

### Solución
1. **Asegúrate de ejecutar ambos procesos**:
   ```bash
   # Terminal 1
   npm run back:dev
   
   # Terminal 2
   npm run front:dev
   ```

2. **Configurar entorno de producción** en `.env`:
   ```env
   NODE_ENV=production
   DEBUG_WEBSOCKET=false
   ```

3. **Solo para debugging** activar logs detallados:
   ```env
   NODE_ENV=development
   DEBUG_WEBSOCKET=true
   ```

### Mejoras Implementadas
- ✅ Configuración optimizada de Socket.IO con menos reconexiones
- ✅ Logs condicionales basados en variables de entorno
- ✅ Sistema de estadísticas agregadas cada 30 segundos
- ✅ Mejor gestión del ciclo de vida de conexiones

## 📊 URLs Disponibles

Una vez ejecutando:

### Backend (Puerto 3001)
- 🔗 API Base: http://localhost:3001
- 💊 Health Check: http://localhost:3001/health
- 💬 Chat API: http://localhost:3001/api/chat
- 📷 Image API: http://localhost:3001/api/chat/image
- 🔌 WebSocket: ws://localhost:3001

### Frontend (Puerto 3000)
- 🌍 Web App: http://localhost:3000

## 🔍 Verificar Estado

```bash
npm run status
```

## 📁 Estructura de Datos por Usuario

```
src/data/users/
├── [usuario-id]/
│   ├── profile.json      # Perfil y preferencias
│   ├── financial.json    # Datos financieros
│   ├── history.json      # Historial de conversaciones
│   └── conversations/    # Conversaciones detalladas
```

## 🤖 Funciones de IA

- **Análisis de Comprobantes**: Extrae datos de facturas e imágenes
- **Consejos Personalizados**: Basados en el perfil financiero del usuario
- **Detección de Transacciones**: Automática con Perplexity AI
- **Memoria Contextual**: Recuerda conversaciones anteriores

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run back:dev          # Backend con nodemon
npm run front:dev         # Frontend con hot reload

# Producción
npm run back:start        # Backend en producción
npm run front:build       # Build del frontend
npm run front:start       # Frontend en producción

# Utilidades
npm run status            # Verificar estado de servicios
npm run back:help         # Ayuda de configuración
```

## 🐛 Troubleshooting

### Problema: Spam de conexiones WebSocket
**Solución**: Seguir la sección "Solución al Problema de Spam de Conexiones" arriba.

### Problema: IA no responde
**Verificar**: API key de Perplexity en `.env`

### Problema: WhatsApp no conecta
**Verificar**: Puerto 3001 disponible y escanear QR

### Problema: Frontend no carga
**Verificar**: 
- `npm run front:dev` ejecutándose
- Puerto 3000 disponible
- URL correcta: http://localhost:3000

## 📝 Licencia

MIT License