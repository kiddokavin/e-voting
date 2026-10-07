const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Handle JSON syntax errors gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body payload' });
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/voters', express.static(path.join(__dirname, 'voters')));
app.use('/monitoring', express.static(path.join(__dirname, 'monitoring')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));


// In-Memory Database with optional JSON file backup
const DB_FILE = path.join(__dirname, 'data', 'database.json');

let db = {
  electionStatus: 'ACTIVE', // ACTIVE, PAUSED, ENDED
  startTime: new Date().toISOString(),
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
    { id: 'VOT1000001', name: 'Kavin Kumar', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000002', name: 'Priya Dharshini', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000003', name: 'Anand Viswanathan', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000004', name: 'Deepa Sundaram', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000005', name: 'Vikram Chandran', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000006', name: 'Sanjay Raghavan', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000007', name: 'Lakshmi Narayanan', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000008', name: 'Karthik Subramanian', booth: 'Zone 2 (Green)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000009', name: 'Divya Bharathi', booth: 'Zone 3 (Pink)', status: 'REGISTERED', voted: false },
    { id: 'VOT1000010', name: 'Manojit Banerjee', booth: 'Zone 1 (Red)', status: 'REGISTERED', voted: false }
  ],
  nodes: [
    { id: 'router0', name: 'Router0 (Central Gateway)', ip: '192.168.1.1', type: 'ROUTER', zone: 'Core', status: 'ONLINE', latency: 2, packets: 1420 },
    { id: 'mswitch0', name: 'Multilayer Switch0 (3560-24PS)', ip: '192.168.1.2', type: 'CORE_SWITCH', zone: 'Core', status: 'ONLINE', latency: 1, packets: 3250 },
    
    // Blue Zone - Server Farm
    { id: 'web_server', name: 'WEB Server (E-Voting Engine)', ip: '192.168.10.10', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 3, packets: 1890, role: 'Web Portal & REST API' },
    { id: 'dns_server', name: 'DNS Server (evoting.gov.in)', ip: '192.168.10.11', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 2, packets: 840, role: 'Domain Resolution' },
    { id: 'db_server', name: 'Database Server (Server0)', ip: '192.168.10.12', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 4, packets: 2150, role: 'Encrypted Vote Storage' },
    { id: 'audit_server', name: 'Central Audit Server (Server3)', ip: '192.168.10.13', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 3, packets: 1980, role: 'Centralized Monitoring & IDS' },
    { id: 'sec_server', name: 'Security CA Server (Server4)', ip: '192.168.10.14', type: 'SERVER', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 2, packets: 1100, role: 'SSL/TLS & Hash Signatures' },
    { id: 'switch0', name: 'Switch0 (Server Switch)', ip: '192.168.10.1', type: 'SWITCH', zone: 'Blue (Server Farm)', status: 'ONLINE', latency: 1, packets: 3100 },

    // Red Zone - Booth 1
    { id: 'switch1', name: 'Switch1 (Booth 1 Switch)', ip: '192.168.20.1', type: 'SWITCH', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 5, packets: 420 },
    { id: 'pc0', name: 'PC0 (Booth 1 Terminal A)', ip: '192.168.20.10', type: 'PC', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 8, packets: 210 },
    { id: 'pc1', name: 'PC1 (Booth 1 Terminal B)', ip: '192.168.20.11', type: 'PC', zone: 'Red (Booth 1)', status: 'ONLINE', latency: 7, packets: 210 },

    // Green Zone - Booth 2
    { id: 'switch2', name: 'Switch2 (Booth 2 Switch)', ip: '192.168.30.1', type: 'SWITCH', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 6, packets: 380 },
    { id: 'pc2', name: 'PC2 (Booth 2 Terminal A)', ip: '192.168.30.10', type: 'PC', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 9, packets: 190 },
    { id: 'pc3', name: 'PC3 (Booth 2 Terminal B)', ip: '192.168.30.11', type: 'PC', zone: 'Green (Booth 2)', status: 'ONLINE', latency: 8, packets: 190 },

    // Pink Zone - Booth 3
    { id: 'switch3', name: 'Switch3 (Booth 3 Switch)', ip: '192.168.40.1', type: 'SWITCH', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 7, packets: 310 },
    { id: 'pc4', name: 'PC4 (Booth 3 Terminal A)', ip: '192.168.40.10', type: 'PC', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 11, packets: 155 },
    { id: 'pc5', name: 'PC5 (Booth 3 Terminal B)', ip: '192.168.40.11', type: 'PC', zone: 'Pink (Booth 3)', status: 'ONLINE', latency: 10, packets: 155 },

    // Yellow Zone - Admin & Monitoring
    { id: 'switch4', name: 'Switch4 (Admin Switch)', ip: '192.168.50.1', type: 'SWITCH', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 4, packets: 980 },
    { id: 'pc6', name: 'PC6 (Monitoring Terminal 1)', ip: '192.168.50.10', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 5, packets: 320 },
    { id: 'pc7', name: 'PC7 (Monitoring Terminal 2)', ip: '192.168.50.11', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 6, packets: 330 },
    { id: 'pc8', name: 'PC8 (Election Officer PC)', ip: '192.168.50.12', type: 'PC', zone: 'Yellow (Central Monitoring)', status: 'ONLINE', latency: 4, packets: 330 }
  ],
  auditLogs: [
    {
      id: 'LOG_1001',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'SYSTEM',
      sourceIp: '192.168.10.13',
      message: 'Centralized Monitoring Service initialized on Server3.',
      hash: crypto.createHash('sha256').update('LOG_1001_INIT').digest('hex')
    },
    {
      id: 'LOG_1002',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      type: 'NETWORK',
      sourceIp: '192.168.1.1',
      message: 'Core Multilayer Switch 3560-24PS link established with VLAN 10, 20, 30, 40, 50.',
      hash: crypto.createHash('sha256').update('LOG_1002_VLAN').digest('hex')
    }
  ],
  votesCast: []
};

// Load saved data if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(raw);
    console.log('[DB] Loaded existing data from database.json');
  } catch (err) {
    console.warn('[DB] Failed to load database.json, using default seed');
  }
} else {
  // Ensure data folder exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('[DB Save Error]:', err);
  }
}

// REST API Endpoints

// 1. Get Election Overview & Candidates
app.get('/api/candidates', (req, res) => {
  res.json({
    status: db.electionStatus,
    candidates: db.candidates,
    totalVotes: db.candidates.reduce((sum, c) => sum + c.votes, 0)
  });
});

// 2. Verify Voter ID
app.post('/api/voter/verify', (req, res) => {
  const { voterId } = req.body;
  if (!voterId) {
    return res.status(400).json({ success: false, message: 'Voter ID is required' });
  }

  const cleanId = voterId.trim().toUpperCase();
  const voter = db.voters.find(v => v.id === cleanId);

  if (!voter) {
    // Record security log for invalid ID attempt
    const alertLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'SECURITY_ALERT',
      sourceIp: req.ip || '192.168.20.10',
      message: `AUTH_FAILED: Unregistered Voter ID attempt '${cleanId}'`,
      hash: crypto.createHash('sha256').update(`FAIL_${cleanId}_${Date.now()}`).digest('hex')
    };
    db.auditLogs.unshift(alertLog);
    saveDB();

    return res.status(404).json({ success: false, message: 'Voter ID not found in Electoral Roll.' });
  }

  if (voter.voted) {
    // Record security log for double voting attempt
    const alertLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'SECURITY_ALERT',
      sourceIp: req.ip || '192.168.20.10',
      message: `DOUBLE_VOTE_BLOCKED: Voter ${voter.id} (${voter.name}) attempted to vote twice!`,
      hash: crypto.createHash('sha256').update(`DOUBLE_${voter.id}_${Date.now()}`).digest('hex')
    };
    db.auditLogs.unshift(alertLog);
    saveDB();

    return res.status(403).json({ success: false, message: 'ACCESS DENIED: Voter has ALREADY cast their vote! Double voting is blocked by central security policy.' });
  }

  res.json({
    success: true,
    voter: {
      id: voter.id,
      name: voter.name,
      booth: voter.booth,
      status: voter.status
    }
  });
});

// 3. Cast Vote with Network Packet Trace & SHA-256 Hashing
app.post('/api/vote/cast', (req, res) => {
  if (db.electionStatus !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: `Election is currently ${db.electionStatus}. Voting disabled.` });
  }

  const { voterId, candidateId, boothZone, terminalIp } = req.body;
  if (!voterId || !candidateId) {
    return res.status(400).json({ success: false, message: 'Voter ID and Candidate ID are required' });
  }

  const cleanVoterId = voterId.trim().toUpperCase();
  const voter = db.voters.find(v => v.id === cleanVoterId);

  if (!voter) {
    return res.status(404).json({ success: false, message: 'Voter not found' });
  }

  if (voter.voted) {
    return res.status(403).json({ success: false, message: 'Double voting attempt blocked!' });
  }

  const candidate = db.candidates.find(c => c.id === candidateId);
  if (!candidate) {
    return res.status(404).json({ success: false, message: 'Candidate not found' });
  }

  // Define Packet Route based on Zone
  let sourceSwitch = 'switch1';
  let boothName = boothZone || voter.booth || 'Zone 1 (Red)';
  let sourceIp = terminalIp || '192.168.20.10';

  if (boothName.includes('Zone 2') || boothName.includes('Green')) {
    sourceSwitch = 'switch2';
    sourceIp = terminalIp || '192.168.30.10';
  } else if (boothName.includes('Zone 3') || boothName.includes('Pink')) {
    sourceSwitch = 'switch3';
    sourceIp = terminalIp || '192.168.40.10';
  }

  const packetRoute = [
    { node: sourceIp, name: `Polling Terminal (${sourceIp})`, step: 1 },
    { node: sourceSwitch, name: `Subnet Access Switch (${sourceSwitch})`, step: 2 },
    { node: 'mswitch0', name: 'Multilayer Core Switch (3560-24PS)', step: 3 },
    { node: 'switch0', name: 'Server Farm Switch (Switch0)', step: 4 },
    { node: 'web_server', name: 'E-Voting WEB Server (192.168.10.10)', step: 5 },
    { node: 'sec_server', name: 'Security CA Server (192.168.10.14) - SHA-256 Sign', step: 6 },
    { node: 'db_server', name: 'Database Server0 (192.168.10.12) - Commit Ledger', step: 7 },
    { node: 'audit_server', name: 'Central Audit Server3 (192.168.10.13) - Log & Notify', step: 8 }
  ];

  // Cryptographic Signature
  const timestamp = new Date().toISOString();
  const txPayload = `${cleanVoterId}:${candidateId}:${timestamp}:${sourceIp}:${Math.random()}`;
  const voteHash = crypto.createHash('sha256').update(txPayload).digest('hex');

  // Update DB State
  candidate.votes += 1;
  voter.voted = true;
  voter.votedAt = timestamp;
  voter.voteHash = voteHash;

  const voteReceipt = {
    txId: `TX_${Date.now()}`,
    voterId: cleanVoterId,
    candidateId: candidate.id,
    candidateName: candidate.name,
    party: candidate.party,
    boothZone: boothName,
    sourceIp: sourceIp,
    timestamp: timestamp,
    hash: voteHash,
    route: packetRoute
  };

  db.votesCast.unshift(voteReceipt);

  // Increment packet counts for nodes on route
  packetRoute.forEach(r => {
    const nodeObj = db.nodes.find(n => n.id === r.node || n.ip === r.node);
    if (nodeObj) nodeObj.packets += 10;
  });

  // Audit Log Entry
  const auditLog = {
    id: `LOG_${Date.now()}`,
    timestamp: timestamp,
    type: 'VOTE_CAST',
    sourceIp: sourceIp,
    message: `VOTE_CAST_SUCCESS: Voter ${cleanVoterId} cast vote at ${boothName}. Hash: ${voteHash.substring(0, 16)}...`,
    hash: voteHash
  };
  db.auditLogs.unshift(auditLog);

  saveDB();

  res.json({
    success: true,
    message: 'Vote cast successfully and stored in encrypted ledger!',
    receipt: voteReceipt
  });
});

// 4. Centralized Monitoring Dashboard API
app.get('/api/monitoring/stats', (req, res) => {
  const totalVoters = db.voters.length;
  const votedCount = db.voters.filter(v => v.voted).length;
  const totalVotesCast = db.candidates.reduce((sum, c) => sum + c.votes, 0);
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

  // Breakdown by Zone
  const zoneStats = {
    'Zone 1 (Red)': 0,
    'Zone 2 (Green)': 0,
    'Zone 3 (Pink)': 0
  };

  db.votesCast.forEach(v => {
    if (v.boothZone.includes('Zone 1') || v.boothZone.includes('Red')) zoneStats['Zone 1 (Red)'] += 1;
    else if (v.boothZone.includes('Zone 2') || v.boothZone.includes('Green')) zoneStats['Zone 2 (Green)'] += 1;
    else if (v.boothZone.includes('Zone 3') || v.boothZone.includes('Pink')) zoneStats['Zone 3 (Pink)'] += 1;
  });

  // Candidate Standings
  const sortedCandidates = [...db.candidates].sort((a, b) => b.votes - a.votes);
  const leader = sortedCandidates[0];

  res.json({
    electionStatus: db.electionStatus,
    totalVoters,
    votedCount,
    totalVotesCast,
    turnoutPercent,
    zoneStats,
    leader: leader ? { name: leader.name, party: leader.party, votes: leader.votes } : null,
    candidates: db.candidates,
    nodes: db.nodes,
    recentAuditLogs: db.auditLogs.slice(0, 15),
    securityAlertCount: db.auditLogs.filter(l => l.type === 'SECURITY_ALERT').length
  });
});

// 5. Network Nodes API
app.get('/api/monitoring/nodes', (req, res) => {
  res.json({ nodes: db.nodes });
});

// 6. Audit Logs API
app.get('/api/audit/logs', (req, res) => {
  res.json({ logs: db.auditLogs });
});

// 7. Admin Election Control
app.post('/api/admin/control', (req, res) => {
  const { action, voterName, voterBooth } = req.body;

  if (action === 'START') {
    db.electionStatus = 'ACTIVE';
  } else if (action === 'PAUSE') {
    db.electionStatus = 'PAUSED';
  } else if (action === 'END') {
    db.electionStatus = 'ENDED';
  } else if (action === 'RESET') {
    db.candidates.forEach(c => c.votes = 0);
    db.voters.forEach(v => { v.voted = false; delete v.votedAt; delete v.voteHash; });
    db.votesCast = [];
    db.auditLogs = [
      {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'ADMIN',
        sourceIp: '192.168.50.12',
        message: 'ADMIN RESET: Election database reset by Central Officer at Terminal PC8.',
        hash: crypto.createHash('sha256').update(`RESET_${Date.now()}`).digest('hex')
      }
    ];
  } else if (action === 'SIMULATE_ATTACK') {
    const attackLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'SECURITY_ALERT',
      sourceIp: '192.168.99.250',
      message: 'INTRUSION DETECTED: Unauthorized SYN Flood attempt on WEB Server (192.168.10.10) blocked by Router0 ACL!',
      hash: crypto.createHash('sha256').update(`ATTACK_${Date.now()}`).digest('hex')
    };
    db.auditLogs.unshift(attackLog);
  } else if (action === 'ADD_VOTER') {
    if (voterName) {
      const newId = `VOTE${1001 + db.voters.length}`;
      db.voters.push({
        id: newId,
        name: voterName,
        booth: voterBooth || 'Zone 1 (Red)',
        status: 'REGISTERED',
        voted: false
      });
    }
  }

  const logEntry = {
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'ADMIN',
    sourceIp: '192.168.50.12',
    message: `ADMIN ACTION: Election state changed to '${action}'`,
    hash: crypto.createHash('sha256').update(`ADMIN_${action}_${Date.now()}`).digest('hex')
  };
  db.auditLogs.unshift(logEntry);

  saveDB();
  res.json({ success: true, message: `Admin action '${action}' completed successfully`, status: db.electionStatus });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` NETWORK BASED SECURE ELECTRONIC VOTING SYSTEM WITH MONITORING`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Server Farm IP: 192.168.10.10 (WEB Server)`);
  console.log(` Centralized Audit IP: 192.168.10.13 (Server3 Monitoring)`);
  console.log(`================================================================`);
});
