/**
 * Simple toast notification utility
 * Uses browser alert for now - can be replaced with a proper toast library later
 */

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Log to console
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Create a visible toast notification
  if (typeof window !== 'undefined') {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.aip-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create a simple notification element with highly visible colors
    const toast = document.createElement('div');
    const colorConfig = {
      success: {
        bg: '#10b981', // Bright green
        border: '#059669',
        text: '#ffffff',
        icon: '✓'
      },
      error: {
        bg: '#ef4444', // Bright red
        border: '#dc2626',
        text: '#ffffff',
        icon: '✕'
      },
      info: {
        bg: '#3b82f6', // Bright blue
        border: '#2563eb',
        text: '#ffffff',
        icon: 'ℹ'
      }
    };
    
    const config = colorConfig[type];
    toast.className = 'aip-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 3px ${config.border}, 0 0 20px ${config.bg}40;
      font-weight: 600;
      font-size: 15px;
      min-width: 320px;
      max-width: 500px;
      background-color: ${config.bg};
      color: ${config.text};
      border: 2px solid ${config.border};
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    toast.innerHTML = `
      <span style="font-size: 20px; font-weight: bold; flex-shrink: 0;">${config.icon}</span>
      <span>${message}</span>
    `;
    
    // Add animation keyframes if not already present
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds with fade out
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }
}

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
};
