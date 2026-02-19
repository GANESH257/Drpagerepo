/**
 * Simple toast notification utility
 * Uses browser alert for now - can be replaced with a proper toast library later
 */

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // For now, use console and could add a proper toast system later
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // In a real app, you'd use a toast library like sonner or react-hot-toast
  // For now, we'll use a simple approach that can be enhanced later
  if (typeof window !== 'undefined') {
    // Create a simple notification element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
};
