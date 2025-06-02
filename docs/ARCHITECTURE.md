# SofIA Finance Advisor - Arquitectura

## 🏗️ Nueva Estructura del Proyecto

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
│   │   │   └── server.js       # Servidor WhatsApp
│   │   ├── web/                # Implementación Web API
│   │   │   └── server.js       # Servidor Express + Socket.IO
│   │   └── server.js           # Servidor multi-plataforma
│   ├── shared/                 # Utilidades compartidas
│   │   └── utils.js            # Funciones comunes
│   └── index.js                # Punto de entrada principal
├── webapp/                     # Aplicación NextJS
│   └── src/
│       ├── app/                # App Router de NextJS 15
│       ├── components/         # Componentes React
│       ├── hooks/              # Hooks personalizados
│       ├── lib/                # Utilidades y API client
│       └── types/              # Tipos TypeScript
├── data/                       # Datos persistentes
├── docs/                       # Documentación
└── README.md
```

## 🧩 Componentes Principales

### 1. Core (src/core/)
**Propósito**: Lógica central reutilizable entre plataformas

- **FinanceAgent**: Motor de IA financiera principal
- **PerplexityService**: Integración con Perplexity Sonar API
- **ImageRecognitionService**: Procesamiento de imágenes financieras
- **ConversationMemory**: Gestión de historial de conversaciones

### 2. Platforms (src/platforms/)
**Propósito**: Implementaciones específicas por plataforma

#### WhatsApp Platform
- Cliente de WhatsApp Web
- Manejo de QR, mensajes y medios
- Integración directa con el core

#### Web Platform
- API REST con Express
- WebSocket con Socket.IO para tiempo real
- CORS configurado para NextJS

#### Multi-Platform Server
- Servidor que puede ejecutar ambas plataformas
- Configuración mediante variables de entorno
- Manejo graceful de errores y cierre

### 3. WebApp (webapp/)
**Propósito**: Interfaz web moderna con NextJS

- **ChatInterface**: Componente principal del chat
- **useSocket**: Hook para WebSocket en tiempo real
- **API Client**: Cliente para comunicación con el backend
- **TypeScript**: Tipado completo para mayor robustez

## 🔄 Flujo de Datos

### WhatsApp Flow
```
Usuario WhatsApp → WhatsApp Web.js → Core Agent → Perplexity/OCR → Response → WhatsApp
```

### Web Flow
```
Usuario Web → NextJS → API/WebSocket → Core Agent → Perplexity/OCR → Response → NextJS
```

## 🔧 Configuración por Plataformas

### Variables de Entorno
```bash
# Core
PERPLEXITY_API_KEY=tu_api_key

# Platform Control
ENABLE_WHATSAPP=true|false
ENABLE_WEB=true|false

# Web API
API_PORT=3001
WEBAPP_URL=http://localhost:3000

# NextJS
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Modos de Ejecución
```bash
# Ambas plataformas (default)
npm start

# Solo WhatsApp
ENABLE_WEB=false npm start

# Solo Web
ENABLE_WHATSAPP=false npm start

# Solo Web API (backend)
npm run api:start

# Solo WhatsApp
npm run whatsapp:start

# WebApp dev
npm run webapp:dev
```

## 📊 Escalabilidad y Separación de Responsabilidades

### Ventajas de la Nueva Arquitectura

1. **Modularidad**: Cada plataforma es independiente
2. **Reutilización**: Core compartido entre plataformas
3. **Escalabilidad**: Fácil agregar nuevas plataformas (Telegram, Discord, etc.)
4. **Desarrollo**: Equipos pueden trabajar en paralelo
5. **Deployment**: Despliegue independiente por plataforma
6. **Testing**: Tests unitarios por componente

### Patrón de Diseño
- **Strategy Pattern**: Diferentes plataformas, misma lógica core
- **Factory Pattern**: Creación de instancias de plataforma
- **Observer Pattern**: WebSocket para actualizaciones en tiempo real
- **Singleton Pattern**: Servicios compartidos (Memory, Agent)

## 🔌 Extensibilidad

### Agregar Nueva Plataforma
1. Crear directorio en `src/platforms/nueva-plataforma/`
2. Implementar servidor específico
3. Reutilizar core components
4. Agregar configuración en multi-platform server

### Agregar Nuevo Servicio
1. Crear en `src/core/services/`
2. Integrar en FinanceAgent
3. Configurar en variables de entorno
4. Actualizar tipos en webapp si es necesario

## 🚀 Arquitectura de Despliegue

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para detalles específicos de despliegue en AWS. 