/**
 * Utilidades compartidas para SofIA Finance Advisor
 */

/**
 * Genera un ID único para sesiones
 */
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valida si una cadena es un número válido
 */
function isValidNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

/**
 * Formatea una cantidad monetaria
 */
function formatCurrency(amount, currency = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Extrae números de una cadena de texto
 */
function extractNumbers(text) {
    const numbers = text.match(/\d+(?:\.\d+)?/g);
    return numbers ? numbers.map(num => parseFloat(num)) : [];
}

/**
 * Valida el formato de base64 de una imagen
 */
function isValidBase64Image(base64String) {
    // Verificar que tenga el formato correcto
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|bmp|webp);base64,/;
    return base64Regex.test(base64String);
}

/**
 * Limpia y normaliza texto para procesamiento
 */
function normalizeText(text) {
    return text
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

/**
 * Detecta si un mensaje contiene información sensible
 */
function containsSensitiveInfo(text) {
    const sensitivePatterns = [
        /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Números de tarjeta
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN/CURP patterns
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Emails
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(text));
}

/**
 * Oculta información sensible en texto
 */
function maskSensitiveInfo(text) {
    return text
        .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '**** **** **** ****')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '***@***.***');
}

/**
 * Valida ID de sesión para diferentes plataformas
 */
function validateSessionId(sessionId, platform = 'web') {
    if (!sessionId) return false;
    
    switch (platform) {
        case 'whatsapp':
            // WhatsApp IDs tienen formato específico
            return /^\d+@c\.us$/.test(sessionId);
        case 'web':
            // Web sessions pueden ser más flexibles
            return typeof sessionId === 'string' && sessionId.length > 0;
        default:
            return false;
    }
}

/**
 * Detecta el tipo de plataforma basado en el sessionId
 */
function detectPlatform(sessionId) {
    if (/^\d+@c\.us$/.test(sessionId)) {
        return 'whatsapp';
    } else {
        return 'web';
    }
}

/**
 * Formatea fecha para display
 */
function formatDate(date = new Date(), includeTime = true) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Mexico_City'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('es-MX', options).format(date);
}

/**
 * Calcula estadísticas básicas de un array de números
 */
function calculateStats(numbers) {
    if (!numbers || numbers.length === 0) {
        return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
    }
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    
    return {
        sum,
        average: Math.round(average * 100) / 100,
        min,
        max,
        count: numbers.length
    };
}

/**
 * Trunca texto a una longitud específica
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Valida configuración de ambiente
 */
function validateEnvironmentConfig() {
    const requiredVars = ['PERPLEXITY_API_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    return {
        isValid: missingVars.length === 0,
        missingVars,
        hasPerplexity: !!process.env.PERPLEXITY_API_KEY,
        hasWebappUrl: !!process.env.WEBAPP_URL,
        hasApiPort: !!process.env.API_PORT
    };
}

module.exports = {
    generateSessionId,
    isValidNumber,
    formatCurrency,
    extractNumbers,
    isValidBase64Image,
    normalizeText,
    containsSensitiveInfo,
    maskSensitiveInfo,
    validateSessionId,
    detectPlatform,
    formatDate,
    calculateStats,
    truncateText,
    validateEnvironmentConfig
}; 