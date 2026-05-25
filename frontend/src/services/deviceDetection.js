// Detecta las especificaciones del dispositivo y calcula un multiplicador de precio
class DeviceDetector {
  constructor() {
    this.specs = this.detectSpecs();
    this.tier = this.calculateTier();
    this.multiplier = this.calculateMultiplier();
  }

  detectSpecs() {
    const specs = {
      gpu: this.detectGPU(),
      cores: this.detectCores(),
      memory: this.detectMemory(),
      resolution: this.detectResolution(),
      gpu3d: this.detect3DCapabilities(),
      touchscreen: this.detectTouchscreen(),
      ram: this.detectRAM(),
      connection: this.detectConnection(),
    };
    return specs;
  }

  // Detecta capacidades GPU usando WebGL
  detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unknown';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'integrated';
      }
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  // Detecta número de cores (aproximado)
  detectCores() {
    return navigator.hardwareConcurrency || 2;
  }

  // Detecta memoria del dispositivo (si está disponible)
  detectMemory() {
    return navigator.deviceMemory || null;
  }

  // Detecta resolución de pantalla
  detectResolution() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      width: width,
      height: height,
      pixelRatio: window.devicePixelRatio || 1,
      total: width * height,
    };
  }

  // Detecta capacidades 3D y WebGL 2.0
  detect3DCapabilities() {
    try {
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      return !!gl2;
    } catch (e) {
      return false;
    }
  }

  // Detecta si tiene pantalla táctil
  detectTouchscreen() {
    return (
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      ('ontouchstart' in window) ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    );
  }

  // Detecta RAM (aproximada desde deviceMemory)
  detectRAM() {
    // deviceMemory en GB: 1, 2, 4, 8, 16, etc.
    return navigator.deviceMemory || 'unknown';
  }

  // Detecta tipo de conexión
  detectConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType; // 4g, 3g, 2g, slow-2g
    const downlink = connection.downlink; // Mbps aproximados
    return { effectiveType, downlink };
  }

  // Calcula el "tier" del dispositivo basado en specs
  calculateTier() {
    let score = 0;

    // Cores (max 20 points)
    if (this.specs.cores >= 8) score += 20;
    else if (this.specs.cores >= 6) score += 15;
    else if (this.specs.cores >= 4) score += 10;
    else if (this.specs.cores >= 2) score += 5;

    // Memory/RAM (max 25 points)
    const ram = this.specs.memory;
    if (ram >= 16) score += 25;
    else if (ram >= 12) score += 22;
    else if (ram >= 8) score += 18;
    else if (ram >= 6) score += 12;
    else if (ram >= 4) score += 8;
    else if (ram >= 2) score += 4;

    // Resolution (max 20 points)
    const res = this.specs.resolution.total;
    if (res >= 2560 * 1440) score += 20;
    else if (res >= 1920 * 1080) score += 15;
    else if (res >= 1280 * 720) score += 10;
    else score += 5;

    // 3D Capabilities (max 15 points)
    if (this.specs.gpu3d) score += 15;

    // Touchscreen bonus (devices with touchscreen are usually newer)
    if (this.specs.touchscreen) score += 5;

    // GPU (max 15 points - rough estimation)
    const gpu = this.specs.gpu.toLowerCase();
    if (gpu.includes('nvidia') && !gpu.includes('mx')) score += 12;
    else if (gpu.includes('amd') || gpu.includes('radeon')) score += 10;
    else if (gpu.includes('intel') && !gpu.includes('uhd') && !gpu.includes('hd')) score += 8;
    else if (gpu.includes('apple')) score += 14;

    // Connection quality (max 10 points)
    const conn = this.specs.connection;
    if (conn.effectiveType === '4g') score += 10;
    else if (conn.effectiveType === '3g') score += 5;
    else if (conn.effectiveType === 'slow-2g') score -= 5;

    // Si el ancho del viewport corresponde a móvil, capar la puntuación en un máximo de 40 para clasificar como móvil
    if (window.innerWidth < 768) {
      score = Math.min(score, 40);
    }

    return score;
  }

  // Clasifica el dispositivo en tiers
  calculateMultiplier() {
    const tier = this.tier;

    // Rango: 0-100
    if (tier < 25) {
      // Dispositivo muy malo - Descuento del 15%
      return { tier: 'very-poor', multiplier: 0.85, label: 'Dispositivo muy básico', description: '15% descuento' };
    } else if (tier < 45) {
      // Dispositivo pobre - Descuento del 8%
      return { tier: 'poor', multiplier: 0.92, label: 'Dispositivo básico', description: '8% descuento' };
    } else if (tier < 60) {
      // Dispositivo promedio - Precio normal
      return { tier: 'average', multiplier: 1.0, label: 'Dispositivo promedio', description: 'Precio normal' };
    } else if (tier < 75) {
      // Dispositivo bueno - Aumento del 12%
      return { tier: 'good', multiplier: 1.12, label: 'Dispositivo de alta gama', description: '12% aumento' };
    } else {
      // Dispositivo excelente - Aumento del 20%
      return { tier: 'excellent', multiplier: 1.2, label: 'Dispositivo premium', description: '20% aumento' };
    }
  }

  // Devuelve un objeto con toda la información
  getReport() {
    return {
      specs: this.specs,
      score: this.tier,
      priceAdjustment: this.multiplier,
    };
  }

  // Ajusta un precio
  adjustPrice(basePrice) {
    return Math.round(basePrice * this.multiplier.multiplier * 100) / 100;
  }
}

// Crear una instancia global
export const deviceDetector = new DeviceDetector();

// Hook para React que proporciona el multiplicador de precio
export const useDeviceMultiplier = () => {
  return deviceDetector.multiplier;
};

// Hook para obtener el reporte completo
export const useDeviceReport = () => {
  return deviceDetector.getReport();
};

// Función para ajustar precio
export const adjustPriceByDevice = (basePrice) => {
  return deviceDetector.adjustPrice(basePrice);
};
