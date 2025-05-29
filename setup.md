# 🚀 Configuración Rápida de SofIA

## Instalación en 3 Pasos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Probar el Agente (Opcional)
```bash
npm test
```
Esto ejecutará una conversación de prueba para verificar que todo funciona.

### 3. Iniciar el Bot
```bash
npm start
```

## 📱 Conectar WhatsApp

1. **Ejecuta el comando `npm start`**
2. **Aparecerá un código QR en tu terminal**
3. **Abre WhatsApp en tu teléfono**
4. **Ve a Configuración > Dispositivos vinculados**
5. **Escanea el código QR**
6. **¡Listo! SofIA está conectada**

## 💬 Primeros Mensajes

Envía cualquiera de estos mensajes a SofIA para empezar:

- `"Hola SofIA"`
- `"Me llamo [tu nombre]"`
- `"Gané $5000 de mi trabajo"`
- `"Gasté $300 en comida"`
- `"¿Cómo van mis finanzas?"`

## ⚙️ Personalización Rápida

### Cambiar Cantidad de Memoria
Edita `src/memory/ConversationMemory.js`, línea 4:
```javascript
constructor(maxContextMessages = 15) { // Cambia de 10 a 15
```

### Cambiar Personalidad
Edita `src/agent/FinanceAgent.js`, líneas 15-25 para modificar la personalidad.

## 🆘 Solución Rápida de Problemas

### Error "Cannot find module"
```bash
npm install
```

### El QR no aparece
- Cierra WhatsApp Web en tu navegador
- Reinicia el bot con `npm start`

### El bot no responde
- Revisa que esté conectado (mensaje "SofIA Finance Advisor está lista!")
- Verifica que no sea un mensaje de grupo

## 🎯 ¡Ya estás listo!

SofIA ahora está funcionando como tu asesor financiero personal en WhatsApp. Habla con ella de manera natural sobre tus finanzas y verás cómo te ayuda a mantener un mejor control de tu dinero.

**Nota:** Todos tus datos se guardan localmente en la carpeta `data/` y nunca salen de tu computadora. 