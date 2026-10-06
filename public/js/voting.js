// Electronic Voting Machine (EVM) Client Script

function loadCandidates() {
  fetch('/api/candidates')
    .then(res => res.json())
    .then(data => {
      state.candidates = data.candidates;
      state.electionStatus = data.status;
      renderBallotPaper();
      const statusEl = document.getElementById('voterElectionStatus');
      if (statusEl) statusEl.textContent = data.status;
    })
    .catch(err => {
      console.error('[EVM Error] Failed to load candidates:', err);
    });
}

function loadSampleVoters() {
  fetch('/api/monitoring/stats')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('quickVotersList');
      if (!container) return;
      container.innerHTML = '';

      // Sample voters
      const sampleIds = ['VOTE1001', 'VOTE1002', 'VOTE1003', 'VOTE1005'];
      sampleIds.forEach(id => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.style.padding = '0.3rem 0.6rem';
        btn.style.fontSize = '0.75rem';
        btn.style.width = 'auto';
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.border = '1px solid var(--border-color)';
        btn.textContent = id;
        btn.onclick = () => {
          document.getElementById('voterIdInput').value = id;
          verifyVoter();
        };
        container.appendChild(btn);
      });
    });
}

function updateTerminalInfo() {
  const select = document.getElementById('boothSelect');
  if (!select) return;
  const [zone, ip] = select.value.split('|');
  state.terminalZone = zone;
  state.terminalIp = ip;

  let pcName = 'PC0 (Booth 1)';
  if (zone.includes('Zone 2')) pcName = 'PC2 (Booth 2)';
  else if (zone.includes('Zone 3')) pcName = 'PC4 (Booth 3)';

  const termText = document.getElementById('currentTerminalText');
  if (termText) termText.textContent = `${zone.split(' ')[0]} (${pcName.split(' ')[0]})`;
}

function verifyVoter() {
  const voterId = document.getElementById('voterIdInput').value.trim();
  if (!voterId) {
    showAlert('Please enter a valid Voter ID number!', 'error');
    return;
  }

  fetch('/api/voter/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterId })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      showAlert(data.message, 'error');
      document.getElementById('voterDetailsCard').style.display = 'none';
      state.selectedVoter = null;
      document.getElementById('castVoteBtn').disabled = true;
      return;
    }

    state.selectedVoter = data.voter;
    document.getElementById('voterNameText').textContent = data.voter.name;
    document.getElementById('verifiedIdText').textContent = data.voter.id;
    document.getElementById('voterZoneText').textContent = data.voter.booth;
    document.getElementById('voterDetailsCard').style.display = 'block';

    showAlert(`✅ Voter ${data.voter.name} verified! Select candidate on ballot box below.`, 'success');
    document.getElementById('ballotSubtitle').textContent = `Ready for Voter ${data.voter.id}`;
    
    // Enable vote button if a candidate is selected
    if (state.selectedCandidateId) {
      document.getElementById('castVoteBtn').disabled = false;
    }
  })
  .catch(err => {
    showAlert('Server error during voter verification', 'error');
  });
}

function renderBallotPaper() {
  const grid = document.getElementById('ballotPaperGrid');
  if (!grid) return;
  grid.innerHTML = '';

  state.candidates.forEach(cand => {
    const card = document.createElement('div');
    card.className = `candidate-card ${state.selectedCandidateId === cand.id ? 'selected' : ''}`;
    card.onclick = () => selectCandidate(cand.id);

    card.innerHTML = `
      <div class="cand-header">
        <div class="cand-symbol">${cand.symbol}</div>
        <div class="cand-info">
          <h3>${cand.name}</h3>
          <p>${cand.party}</p>
        </div>
      </div>
      <div class="cand-manifesto">
        "${cand.manifesto}"
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-info">${cand.id}</span>
        <span style="font-size: 0.8rem; color: ${state.selectedCandidateId === cand.id ? '#10b981' : '#9ca3af'}; font-weight: bold;">
          ${state.selectedCandidateId === cand.id ? '✓ SELECTED' : 'Click to Select'}
        </span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function selectCandidate(candId) {
  state.selectedCandidateId = candId;
  renderBallotPaper();
  if (state.selectedVoter) {
    document.getElementById('castVoteBtn').disabled = false;
  }
}

function confirmAndCastVote() {
  if (!state.selectedVoter) {
    showAlert('Please authenticate voter first!', 'error');
    return;
  }
  if (!state.selectedCandidateId) {
    showAlert('Please select a candidate from the ballot box!', 'error');
    return;
  }

  const payload = {
    voterId: state.selectedVoter.id,
    candidateId: state.selectedCandidateId,
    boothZone: state.terminalZone,
    terminalIp: state.terminalIp
  };

  fetch('/api/vote/cast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      showAlert(data.message, 'error');
      return;
    }

    // Trigger Canvas Network Packet Animation
    let startNode = 'pc0';
    if (state.terminalZone.includes('Zone 2')) startNode = 'pc2';
    else if (state.terminalZone.includes('Zone 3')) startNode = 'pc4';

    let switchNode = 'switch1';
    if (state.terminalZone.includes('Zone 2')) switchNode = 'switch2';
    else if (state.terminalZone.includes('Zone 3')) switchNode = 'switch3';

    animatePacketRoute([startNode, switchNode, 'mswitch0', 'switch0', 'web_server', 'sec_server', 'db_server', 'audit_server'], '#10b981');

    // Show Receipt Modal
    showReceiptModal(data.receipt);

    // Reset Form
    state.selectedVoter = null;
    state.selectedCandidateId = null;
    document.getElementById('voterIdInput').value = '';
    document.getElementById('voterDetailsCard').style.display = 'none';
    document.getElementById('castVoteBtn').disabled = true;
    renderBallotPaper();

    // Reload Candidates & Dashboard
    loadCandidates();
    if (typeof fetchMonitoringStats === 'function') fetchMonitoringStats();
  })
  .catch(err => {
    showAlert('Failed to cast vote. Network timeout.', 'error');
  });
}

function showReceiptModal(receipt) {
  const modal = document.getElementById('receiptModal');
  const content = document.getElementById('receiptDetailsContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="receipt-row"><span>Transaction ID:</span><strong>${receipt.txId}</strong></div>
    <div class="receipt-row"><span>Voter ID:</span><strong>${receipt.voterId}</strong></div>
    <div class="receipt-row"><span>Candidate Voted:</span><strong>${receipt.candidateName}</strong></div>
    <div class="receipt-row"><span>Party:</span><strong>${receipt.party}</strong></div>
    <div class="receipt-row"><span>Polling Subnet:</span><strong>${receipt.boothZone} (${receipt.sourceIp})</strong></div>
    <div class="receipt-row"><span>Timestamp:</span><strong>${new Date(receipt.timestamp).toLocaleString()}</strong></div>
    <div class="receipt-row"><span>Server Farm Target:</span><strong>WEB Server (192.168.10.10)</strong></div>
    <div style="margin-top: 0.8rem;">
      <span style="font-size:0.75rem; color:var(--text-muted);">SHA-256 Immutable Cryptographic Hash:</span>
      <div class="receipt-hash">${receipt.hash}</div>
    </div>
  `;

  modal.classList.add('show');
}

function closeReceiptModal() {
  const modal = document.getElementById('receiptModal');
  if (modal) modal.classList.remove('show');
}

function printReceipt() {
  window.print();
}
