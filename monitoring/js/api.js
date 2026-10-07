// Monitoring App API Adapter
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
      const url = await this.getApiUrl('/api/monitoring/stats');
      const res = await fetch(url);
      if (res.ok) {
        this.isStatic = false;
        console.log('[API] Central Monitoring connected to server:', this.baseUrl);
        return;
      }
    } catch (e) {
      console.warn('[API] Monitoring operating in static fallback mode.');
    }
    this.isStatic = true;
  },

  async getMonitoringStats() {
    try {
      const url = await this.getApiUrl('/api/monitoring/stats');
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      electionStatus: 'ACTIVE',
      totalVoters: 10,
      votedCount: 0,
      totalVotesCast: 0,
      turnoutPercent: '0.0',
      zoneStats: { 'Zone 1 (Red)': 0, 'Zone 2 (Green)': 0, 'Zone 3 (Pink)': 0 },
      leader: null,
      candidates: [],
      nodes: [],
      recentAuditLogs: [],
      securityAlertCount: 0
    };
  }
};
