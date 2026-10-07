// Voters App API Adapter
const CENTRAL_SERVER = 'https://e-voting-i8cw.onrender.com';

const API = {
  baseUrl: CENTRAL_SERVER,
  isStatic: false,

  async getApiUrl(path) {
    // Check if we are running directly on the central backend domain
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
        console.log('[API] Connected to Central E-Voting Server:', this.baseUrl);
        return;
      }
    } catch (e) {
      console.warn('[API] Central server unreachable. Operating in local fallback mode.');
    }
    this.isStatic = true;
  },

  async sha256(str) {
    if (window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
  },

  async getCandidates() {
    try {
      const url = await this.getApiUrl('/api/candidates');
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      status: 'ACTIVE',
      candidates: [
        { id: 'CAND_01', name: 'Dr. A. R. Sharma', party: 'National Progress Party (NPP)', symbol: '⚖️', color: '#3b82f6', manifesto: 'Focus on Digital Infrastructure & Security.' },
        { id: 'CAND_02', name: 'Er. S. Meenakshi', party: 'United Democratic Alliance (UDA)', symbol: '🌱', color: '#10b981', manifesto: 'Sustainable Green Energy & Tech Innovation.' },
        { id: 'CAND_03', name: 'K. Rajesh Kumar', party: 'People\'s Freedom Front (PFF)', symbol: '⚡', color: '#f59e0b', manifesto: 'Rural Broadband Network & Youth Employment.' },
        { id: 'CAND_04', name: 'NOTA (None of the Above)', party: 'Independent Neutral Choice', symbol: '🚫', color: '#6b7280', manifesto: 'Reject all listed candidates for this election cycle.' }
      ]
    };
  },

  async verifyVoter(voterId) {
    try {
      const url = await this.getApiUrl('/api/voter/verify');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Cannot connect to Central Verification Server.' };
    }
  },

  async castVote(payload) {
    try {
      const url = await this.getApiUrl('/api/vote/cast');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Failed to transmit vote to Central Server.' };
    }
  }
};
