/**
 * ServiceRegistry - Singleton para gestionar instancias de servicios
 * Evita dependencias circulares y múltiples instanciaciones
 */
class ServiceRegistry {
    constructor() {
        if (ServiceRegistry.instance) {
            return ServiceRegistry.instance;
        }
        
        this.services = new Map();
        this.initializing = new Set();
        ServiceRegistry.instance = this;
    }

    static getInstance() {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    // Obtener o crear servicio de forma segura
    getService(serviceName) {
        // Si ya existe, devolverlo
        if (this.services.has(serviceName)) {
            return this.services.get(serviceName);
        }

        // Si se está inicializando, evitar loops infinitos
        if (this.initializing.has(serviceName)) {
            console.warn(`⚠️ Dependencia circular detectada para ${serviceName}, devolviendo null temporalmente`);
            return null;
        }

        try {
            // Marcar como inicializando
            this.initializing.add(serviceName);
            
            let service = null;
            
            switch (serviceName) {
                case 'PerplexityService':
                    const PerplexityService = require('./PerplexityService');
                    service = this.createService(PerplexityService, serviceName);
                    break;
                    
                case 'UserDataService':
                    const UserDataService = require('./UserDataService');
                    service = this.createService(UserDataService, serviceName);
                    break;
                    
                case 'TransactionDetectorService':
                    const TransactionDetectorService = require('./TransactionDetectorService');
                    service = this.createService(TransactionDetectorService, serviceName);
                    break;
                    
                default:
                    console.warn(`⚠️ Servicio ${serviceName} no reconocido`);
                    return null;
            }

            // Quitar de inicializando
            this.initializing.delete(serviceName);
            
            return service;

        } catch (error) {
            console.error(`❌ Error inicializando ${serviceName}:`, error.message);
            this.initializing.delete(serviceName);
            return null;
        }
    }

    // Método para verificar si un servicio está disponible
    hasService(serviceName) {
        return this.services.has(serviceName);
    }

    // Método para limpiar servicios (útil para testing)
    clearServices() {
        this.services.clear();
        this.initializing.clear();
    }

    // Crear servicio con manejo especial
    createService(ServiceClass, serviceName) {
        try {
            // Usar el operador 'new' para crear una instancia apropiada
            const service = new ServiceClass();
            this.services.set(serviceName, service);
            
            // console.log(`✅ ${serviceName} registrado en ServiceRegistry`);
            return service;
        } catch (error) {
            console.error(`❌ Error creando servicio ${serviceName}:`, error.message);
            this.services.delete(serviceName);
            return null;
        }
    }

    // Método para obtener estadísticas
    getStats() {
        return {
            totalServices: this.services.size,
            services: Array.from(this.services.keys()),
            initializing: Array.from(this.initializing)
        };
    }
}

module.exports = ServiceRegistry; 