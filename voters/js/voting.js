// Voter Terminal Logic
let verifiedVoter = null;
let selectedBoothZone = 'Zone 1 (Red)';
let currentTerminalIp = '192.168.20.10';

async function initVoterTerminal() {
  await API.init();
  updateTerminalInfo();
  await loadCandidates();
}

function updateTerminalInfo() {
  const select = document.getElementById('boothSelect');
  if (!select) return;
  const val = select.value.split('|');
  selectedBoothZone = val[0];
  currentTerminalIp = val[1];

  const boothText = document.getElementById('currentTerminalText');
  if (boothText) boothText.innerText = `${selectedBoothZone.replace(' (Red)', '').replace(' (Green)', '').replace(' (Pink)', '')} Terminal`;

  const ipText = document.getElementById('terminalIpText');
  if (ipText) ipText.innerText = `Terminal IP: ${currentTerminalIp}`;
}

function selectQuickVoter(voterId) {
  const input = document.getElementById('voterIdInput');
  if (input) input.value = voterId;
  verifyVoter();
}

async function verifyVoter() {
  const input = document.getElementById('voterIdInput');
  const voterId = input ? input.value.trim() : '';

  if (!voterId) {
    alert('Please enter a valid Voter ID Number');
    return;
  }

  const resultBox = document.getElementById('voterVerificationResult');
  const candidatePanel = document.getElementById('ballotBoxPanel');

  resultBox.innerHTML = `<div style="text-align: center; color: var(--accent-blue); font-weight: 600;">🔍 Verifying Voter ID '${voterId}' with Central CA Server...</div>`;

  const response = await API.verifyVoter(voterId);

  if (response.success) {
    verifiedVoter = response.voter;
    resultBox.innerHTML = `
      <div class="voter-card">
        <h3 style="color: #34d399; margin-bottom: 6px;">✅ Eligible Voter Verified</h3>
        <p><strong>Name:</strong> ${verifiedVoter.name}</p>
        <p><strong>Voter ID:</strong> ${verifiedVoter.id}</p>
        <p><strong>Assigned Zone:</strong> ${verifiedVoter.booth}</p>
        <p style="margin-top: 8px; font-size: 0.75rem; color: var(--text-muted);">Single-Vote Security Token Issued by CA Server4.</p>
      </div>
    `;
    enableBallotButtons(true);
    if (candidatePanel) candidatePanel.style.opacity = '1';
  } else {
    verifiedVoter = null;
    resultBox.innerHTML = `
      <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 1rem; margin-top: 1rem;">
        <h3 style="color: #f87171; margin-bottom: 6px;">❌ Eligibility Check Failed</h3>
        <p style="font-size: 0.85rem;">${response.message}</p>
      </div>
    `;
    enableBallotButtons(false);
  }
}

async function loadCandidates() {
  const data = await API.getCandidates();
  const container = document.getElementById('candidateListContainer');
  if (!container) return;

  if (data.status !== 'ACTIVE') {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #f59e0b;">
        <h2>⚠️ ELECTION IS CURRENTLY ${data.status}</h2>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Electronic Ballot Box is locked by the Election Commission.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.candidates.map(c => `
    <div class="candidate-card">
      <div class="candidate-info">
        <div class="candidate-symbol" style="border-color: ${c.color}">${c.symbol}</div>
        <div>
          <h3 style="font-size: 1.05rem;">${c.name}</h3>
          <p style="font-size: 0.8rem; color: ${c.color}; font-weight: 600;">${c.party}</p>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${c.manifesto}</p>
        </div>
      </div>
      <button class="btn-vote" id="btn-vote-${c.id}" onclick="submitVote('${c.id}')" disabled>
        🗳️ CAST VOTE
      </button>
    </div>
  `).join('');
}

function enableBallotButtons(enable) {
  const btns = document.querySelectorAll('.btn-vote');
  btns.forEach(btn => {
    btn.disabled = !enable;
  });
}

async function submitVote(candidateId) {
  if (!verifiedVoter) {
    alert('Please verify your Voter ID first.');
    return;
  }

  const confirmVote = confirm(`Are you sure you want to cast your vote? This action is permanent and recorded in the Central SHA-256 Ledger.`);
  if (!confirmVote) return;

  const payload = {
    voterId: verifiedVoter.id,
    candidateId: candidateId,
    boothZone: selectedBoothZone,
    terminalIp: currentTerminalIp
  };

  const response = await API.castVote(payload);

  if (response.success) {
    showReceiptModal(response.receipt);
    verifiedVoter = null;
    enableBallotButtons(false);
    document.getElementById('voterVerificationResult').innerHTML = `
      <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 1rem; margin-top: 1rem;">
        <h3 style="color: #60a5fa;">🗳️ Vote Cast & Signed</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Your vote has been transmitted to Central Server0.</p>
      </div>
    `;
  } else {
    alert('Failed to cast vote: ' + response.message);
  }
}

function showReceiptModal(receipt) {
  const modal = document.getElementById('receiptModal');
  const content = document.getElementById('receiptDetails');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="receipt-row"><span>Transaction ID:</span><strong>${receipt.txId}</strong></div>
    <div class="receipt-row"><span>Voter ID:</span><strong>${receipt.voterId}</strong></div>
    <div class="receipt-row"><span>Voted For:</span><strong style="color: #34d399;">${receipt.candidateName} (${receipt.party})</strong></div>
    <div class="receipt-row"><span>Polling Subnet:</span><strong>${receipt.boothZone}</strong></div>
    <div class="receipt-row"><span>Terminal IP:</span><strong>${receipt.sourceIp}</strong></div>
    <div class="receipt-row"><span>Timestamp:</span><strong>${new Date(receipt.timestamp).toLocaleTimeString()}</strong></div>
    <div style="margin-top: 12px; font-weight: 600; font-size: 0.8rem; color: var(--text-muted);">SHA-256 Security Digital Signature:</div>
    <div class="receipt-hash">${receipt.hash}</div>
  `;

  modal.classList.add('active');
}

function closeReceiptModal() {
  const modal = document.getElementById('receiptModal');
  if (modal) modal.classList.remove('active');
}

window.addEventListener('DOMContentLoaded', initVoterTerminal);
