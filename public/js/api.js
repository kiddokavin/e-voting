// Universal API Adapter: Supports both Node.js Express backend and Static GitHub Pages (localStorage fallback)
const API = {
  isStatic: false,

  // In-Browser State for GitHub Pages
  mockDB: {
    electionStatus: 'ACTIVE',
    candidates: [
      {
        id: 'CAND_01',
        name: 'Dr. A. R. Sharma',
        party: 'National Progress Party (NPP)',
        symbol: '⚖️',
        color: '#3b82f6',
        manifesto: 'Focus on Digital Infrastructure, Cyber Security, and Economic Growth.',
        votes: 142
      },
      {
        id: 'CAND_02',
        name: 'Er. S. Meenakshi',
        party: 'United Democratic Alliance (UDA)',
        symbol: '🌱',
        color: '#10b981',
        manifesto: 'Sustainable Green Energy, Higher Education, and Tech Innovation.',
        votes: 128
      },
      {
        id: 'CAND_03',
        name: 'K. Rajesh Kumar',
        party: 'People\'s Freedom Front (PFF)',
        symbol: '⚡',
        color: '#f59e0b',
        manifesto: 'Rural Broadband Network, Youth Employment, and Public Health.',
        votes: 95
      },
      {
        id: 'CAND_04',
        name: 'NOTA (None of the Above)',
        party: 'Independent Neutral Choice',
        symbol: '🚫',
        color: '#6b7280',
        manifesto: 'Reject all listed candidates for this election cycle.',
        votes: 15
      }
    ],
    voters: [
      { id: 'VOTE1001', name: 'Kavin Kumar', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1002', name: 'Priya Dharshini', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1003', name: 'Anand Viswanathan', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1004', name: 'Deepa Sundaram', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1005', name: 'Vikram Chandran', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1006', name: 'Sanjay Raghavan', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1007', name: 'Lakshmi Narayanan', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1008', name: 'Karthik Subramanian', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1009', name: 'Divya Bharathi', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
      { id: 'VOTE1010', name: 'Manojit Banerjee', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false }
    ],
    nodes: [
      { id: 'router0', name: 'Router0 (Central Gateway)', ip: '192.168.1.1', type: 'ROUTER', zone: 'Core', status: 'ONLINE', latency: 2, packets: 1420 },
      { id: 'mswitch0', name: 'Multilayer Switch0 (3560-24PS)', ip: '192.168.1.2', type: 'CORE_SWITCH', zone: 'Core', status: 'ONLINE', latency: 1, packets: 3250 },
      { id: 'web_server', name: 'WEB Server (E-Voting Engine)', ip: '192.168.10.10', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 3, packets: 1890 },
      { id: 'dns_server', name: 'DNS Server (evoting.gov.in)', ip: '192.168.10.11', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 2, packets: 840 },
      { id: 'db_server', name: 'Database Server (Server0)', ip: '192.168.10.12', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 4, packets: 2150 },
      { id: 'audit_server', name: 'Central Audit Server (Server3)', ip: '192.168.10.13', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 3, packets: 1980 },
      { id: 'sec_server', name: 'Security CA Server (Server4)', ip: '192.168.10.14', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 2, packets: 1100 },
      { id: 'switch0', name: 'Switch0 (Server Switch)', ip: '192.168.10.1', type: 'SWITCH', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 1, packets: 3100 },
      { id: 'switch1', name: 'Switch1 (Booth 1 Switch)', ip: '192.168.20.1', type: 'SWITCH', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 5, packets: 420 },
      { id: 'pc0', name: 'PC0 (Booth 1 Terminal A)', ip: '192.168.20.10', type: 'PC', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 8, packets: 210 },
      { id: 'pc1', name: 'PC1 (Booth 1 Terminal B)', ip: '192.168.20.11', type: 'PC', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 7, packets: 210 },
      { id: 'switch2', name: 'Switch2 (Booth 2 Switch)', ip: '192.168.30.1', type: 'SWITCH', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 6, packets: 380 },
      { id: 'pc2', name: 'PC2 (Booth 2 Terminal A)', ip: '192.168.30.10', type: 'PC', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 9, packets: 190 },
      { id: 'pc3', name: 'PC3 (Booth 2 Terminal B)', ip: '192.168.30.11', type: 'PC', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 8, packets: 190 },
      { id: 'switch3', name: 'Switch3 (Booth 3 Switch)', ip: '192.168.40.1', type: 'SWITCH', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 7, packets: 310 },
      { id: 'pc4', name: 'PC4 (Booth 3 Terminal A)', ip: '192.168.40.10', type: 'PC', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 11, packets: 155 },
      { id: 'pc5', name: 'PC5 (Booth 3 Terminal B)', ip: '192.168.40.11', type: 'PC', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 10, packets: 155 },
      { id: 'switch4', name: 'Switch4 (Admin Switch)', ip: '192.168.50.1', type: 'SWITCH', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 4, packets: 980 },
      { id: 'pc6', name: 'PC6 (Monitoring Terminal 1)', ip: '192.168.50.10', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 5, packets: 320 },
      { id: 'pc7', name: 'PC7 (Monitoring Terminal 2)', ip: '192.168.50.11', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 6, packets: 330 },
      { id: 'pc8', name: 'PC8 (Election Officer PC)', ip: '192.168.50.12', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 4, packets: 330 }
    ],
    auditLogs: [
      { id: 'LOG_1001', timestamp: new Date().toISOString(), type: 'SYSTEM', sourceIp: '192.168.10.13', message: 'Centralized Monitoring Service initialized on Server3.', hash: '0x8f3a9b1029c' },
      { id: 'LOG_1002', timestamp: new Date().toISOString(), type: 'NETWORK', sourceIp: '192.168.1.1', message: 'Core Multilayer Switch 3560-24PS link active on VLANs 10, 20, 30, 40, 50.', hash: '0x4e2c918a00f' }
    ],
    votesCast: []
  },

  async init() {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) {
        this.isStatic = false;
        console.log('[API] Connected to Node.js Express Backend.');
        return;
      }
    } catch (e) {
      console.log('[API] Running on Static GitHub Pages mode with LocalStorage DB engine.');
    }
    this.isStatic = true;
    this.loadLocalStorage();
  },

  loadLocalStorage() {
    const saved = localStorage.getItem('evoting_db');
    if (saved) {
      try { this.mockDB = JSON.parse(saved); } catch (e) {}
    }
  },

  saveLocalStorage() {
    try { localStorage.setItem('evoting_db', JSON.stringify(this.mockDB)); } catch (e) {}
  },

  // Cryptographic SHA-256 helper for client static mode
  async sha256(str) {
    if (window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
  },

  // API Methods
  async getCandidates() {
    if (!this.isStatic) {
      const res = await fetch('/api/candidates');
      return await res.json();
    }
    return {
      status: this.mockDB.electionStatus,
      candidates: this.mockDB.candidates,
      totalVotes: this.mockDB.candidates.reduce((sum, c) => sum + c.votes, 0)
    };
  },

  async verifyVoter(voterId) {
    if (!this.isStatic) {
      const res = await fetch('/api/voter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId })
      });
      return await res.json();
    }

    const cleanId = (voterId || '').trim().toUpperCase();
    const voter = this.mockDB.voters.find(v => v.id === cleanId);

    if (!voter) {
      this.mockDB.auditLogs.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SECURITY_ALERT',
        sourceIp: '192.168.20.10',
        message: `AUTH_FAILED: Unregistered Voter ID '${cleanId}'`,
        hash: await this.sha256(`FAIL_${cleanId}_${Date.now()}`)
      });
      this.saveLocalStorage();
      return { success: false, message: 'Voter ID not found in Electoral Roll.' };
    }

    if (voter.voted) {
      this.mockDB.auditLogs.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SECURITY_ALERT',
        sourceIp: '192.168.20.10',
        message: `DOUBLE_VOTE_BLOCKED: Voter ${voter.id} (${voter.name}) attempted double vote!`,
        hash: await this.sha256(`DOUBLE_${voter.id}_${Date.now()}`)
      });
      this.saveLocalStorage();
      return { success: false, message: 'ACCESS DENIED: Voter has ALREADY cast their vote! Double voting is blocked.' };
    }

    return { success: true, voter };
  },

  async castVote(payload) {
    if (!this.isStatic) {
      const res = await fetch('/api/vote/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    }

    const { voterId, candidateId, boothZone, terminalIp } = payload;
    const cleanVoterId = (voterId || '').trim().toUpperCase();
    const voter = this.mockDB.voters.find(v => v.id === cleanVoterId);
    const candidate = this.mockDB.candidates.find(c => c.id === candidateId);

    if (!voter || voter.voted) {
      return { success: false, message: 'Double voting attempt blocked!' };
    }
    if (!candidate) {
      return { success: false, message: 'Candidate not found' };
    }

    const timestamp = new Date().toISOString();
    const voteHash = await this.sha256(`${cleanVoterId}:${candidateId}:${timestamp}`);

    candidate.votes += 1;
    voter.voted = true;
    voter.votedAt = timestamp;
    voter.voteHash = voteHash;

    const receipt = {
      txId: `TX_${Date.now()}`,
      voterId: cleanVoterId,
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party,
      boothZone: boothZone || voter.booth,
      sourceIp: terminalIp || '192.168.20.10',
      timestamp,
      hash: voteHash
    };

    this.mockDB.votesCast.unshift(receipt);
    this.mockDB.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      timestamp,
      type: 'VOTE_CAST',
      sourceIp: terminalIp || '192.168.20.10',
      message: `VOTE_CAST_SUCCESS: Voter ${cleanVoterId} cast vote. SHA-256 Hash: ${voteHash.substring(0, 16)}...`,
      hash: voteHash
    });

    this.saveLocalStorage();
    return { success: true, message: 'Vote cast successfully!', receipt };
  },

  async getMonitoringStats() {
    if (!this.isStatic) {
      const res = await fetch('/api/monitoring/stats');
      return await res.json();
    }

    const totalVoters = this.mockDB.voters.length;
    const votedCount = this.mockDB.voters.filter(v => v.voted).length;
    const totalVotesCast = this.mockDB.candidates.reduce((sum, c) => sum + c.votes, 0);
    const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

    const zoneStats = { 'Zone 1 (Red)': 0, 'Zone 2 (Green)': 0, 'Zone 3 (Pink)': 0 };
    this.mockDB.votesCast.forEach(v => {
      if ((v.boothZone || '').includes('Zone 1') || (v.boothZone || '').includes('Red')) zoneStats['Zone 1 (Red)'] += 1;
      else if ((v.boothZone || '').includes('Zone 2') || (v.boothZone || '').includes('Green')) zoneStats['Zone 2 (Green)'] += 1;
      else if ((v.boothZone || '').includes('Zone 3') || (v.boothZone || '').includes('Pink')) zoneStats['Zone 3 (Pink)'] += 1;
    });

    const sorted = [...this.mockDB.candidates].sort((a, b) => b.votes - a.votes);

    return {
      electionStatus: this.mockDB.electionStatus,
      totalVoters,
      votedCount,
      totalVotesCast,
      turnoutPercent,
      zoneStats,
      leader: sorted[0] ? { name: sorted[0].name, party: sorted[0].party, votes: sorted[0].votes } : null,
      candidates: this.mockDB.candidates,
      nodes: this.mockDB.nodes,
      recentAuditLogs: this.mockDB.auditLogs.slice(0, 15),
      securityAlertCount: this.mockDB.auditLogs.filter(l => l.type === 'SECURITY_ALERT').length
    };
  },

  async adminAction(action, data = {}) {
    if (!this.isStatic) {
      const res = await fetch('/api/admin/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await res.json();
    }

    if (action === 'START') this.mockDB.electionStatus = 'ACTIVE';
    else if (action === 'PAUSE') this.mockDB.electionStatus = 'PAUSED';
    else if (action === 'END') this.mockDB.electionStatus = 'ENDED';
    else if (action === 'RESET') {
      this.mockDB.candidates.forEach(c => c.votes = 0);
      this.mockDB.voters.forEach(v => v.voted = false);
      this.mockDB.votesCast = [];
      this.mockDB.auditLogs = [];
    } else if (action === 'SIMULATE_ATTACK') {
      this.mockDB.auditLogs.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SECURITY_ALERT',
        sourceIp: '192.168.99.250',
        message: 'INTRUSION DETECTED: Unauthorized SYN Flood attempt on WEB Server (192.168.10.10) blocked by Router0 ACL!',
        hash: await this.sha256(`ATTACK_${Date.now()}`)
      });
    } else if (action === 'ADD_VOTER' && data.voterName) {
      this.mockDB.voters.push({
        id: `VOTE${1001 + this.mockDB.voters.length}`,
        name: data.voterName,
        booth: data.voterBooth || 'Zone 1 (Red)',
        status: 'REGISTERED',
        voted: false
      });
    }

    this.saveLocalStorage();
    return { success: true, message: `Admin action '${action}' completed successfully` };
  }
};
