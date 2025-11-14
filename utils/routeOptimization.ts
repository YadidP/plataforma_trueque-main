/**
 * Utilidades para optimizar navegación y transiciones entre rutas
 */

/**
 * Limpiar state global entre navegaciones
 */
export const clearNavigationState = () => {
  // Limpiar cualquier estado temporal
  sessionStorage.clear();
};

/**
 * Scroll suave al top
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

/**
 * Esperar a que el DOM se actualice
 */
export const waitForDomUpdate = () => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
};

/**
 * Retry con backoff exponencial
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return retryWithBackoff(fn, maxRetries - 1, delayMs * 2);
  }
};

/**
 * Debounce mejorado con timeout
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

/**
 * Prefetch datos antes de navegar
 */
export const prefetchData = async (fetcher: () => Promise<any>) => {
  try {
    await fetcher();
  } catch (error) {
    console.warn('Prefetch failed:', error);
  }
};
