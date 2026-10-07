// Admin App API Adapter
const CENTRAL_SERVER = 'https://e-voting-i8cw.onrender.com';

const API = {
  baseUrl: CENTRAL_SERVER,
  isStatic: false,

  async getApiUrl(path) {
    if (window.location.origin === CENTRAL_SERVER || window.location.origin.includes('localhost')) {
      return path;
    }
    return `${this.baseUrl}${path}`;
  },

  async init() {
    try {
      const url = await this.getApiUrl('/api/candidates');
      const res = await fetch(url);
      if (res.ok) {
        this.isStatic = false;
        console.log('[API] Connected to Central Admin API:', this.baseUrl);
        return;
      }
    } catch (e) {
      console.warn('[API] Admin server offline.');
    }
    this.isStatic = true;
  },

  async adminAction(action, data = {}) {
    try {
      const url = await this.getApiUrl('/api/admin/control');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Admin action request failed.' };
    }
  }
};
