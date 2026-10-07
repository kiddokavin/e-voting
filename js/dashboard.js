// Centralized Monitoring Dashboard & Chart.js Visualizer
let candidateChart, zoneChart;

function initDashboardCharts() {
  const ctxCand = document.getElementById('candidateChart');
  const ctxZone = document.getElementById('zoneChart');

  if (ctxCand) {
    candidateChart = new Chart(ctxCand, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Total Votes Received',
          data: [],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af', precision: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: {
            ticks: { color: '#9ca3af' },
            grid: { display: false }
          }
        }
      }
    });
  }

  if (ctxZone) {
    zoneChart = new Chart(ctxZone, {
      type: 'doughnut',
      data: {
        labels: ['Zone 1 (Red)', 'Zone 2 (Green)', 'Zone 3 (Pink)'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#ef4444', '#10b981', '#ec4899'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } }
        }
      }
    });
  }
}

async function fetchMonitoringStats() {
  try {
    const data = await API.getMonitoringStats();

    // Metric Cards
    document.getElementById('statTotalVotes').textContent = data.totalVotesCast;
    document.getElementById('statTurnout').textContent = `${data.turnoutPercent}%`;
    document.getElementById('statAlerts').textContent = data.securityAlertCount;
    document.getElementById('statLeader').textContent = data.leader ? data.leader.name : 'N/A';

    // Update Charts
    if (candidateChart) {
      candidateChart.data.labels = data.candidates.map(c => c.name);
      candidateChart.data.datasets[0].data = data.candidates.map(c => c.votes);
      candidateChart.data.datasets[0].backgroundColor = data.candidates.map(c => c.color || '#3b82f6');
      candidateChart.update();
    }

    if (zoneChart) {
      zoneChart.data.datasets[0].data = [
        data.zoneStats['Zone 1 (Red)'] || 0,
        data.zoneStats['Zone 2 (Green)'] || 0,
        data.zoneStats['Zone 3 (Pink)'] || 0
      ];
      zoneChart.update();
    }

    // Update Node Status Table
    renderNodeTable(data.nodes);

    // Update Audit Logs Stream
    renderAuditLogs(data.recentAuditLogs);
  } catch (err) {
    console.error('[Monitoring Error] Failed to load stats:', err);
  }
}

function renderNodeTable(nodes) {
  const tbody = document.getElementById('nodeStatusTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  nodes.forEach(node => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${node.name}</strong></td>
      <td><code style="color:#60a5fa;">${node.ip}</code></td>
      <td><span class="badge badge-info">${node.zone}</span></td>
      <td>${node.latency} ms</td>
      <td><span class="badge badge-success">● ONLINE</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAuditLogs(logs) {
  const consoleEl = document.getElementById('auditLogConsole');
  if (!consoleEl) return;
  consoleEl.innerHTML = '';

  logs.forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const timeStr = new Date(log.timestamp).toLocaleTimeString();
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-type ${log.type}">${log.type}</span>
      <span class="log-msg">${log.message}</span>
    `;
    consoleEl.appendChild(entry);
  });
}

function refreshLogs() {
  fetchMonitoringStats();
  showAlert('Audit logs refreshed from Server3', 'info');
}

// Admin Control Panel Actions
async function adminAction(action) {
  try {
    const data = await API.adminAction(action);
    showAlert(`Admin Directive Completed: ${data.message}`, 'success');
    fetchMonitoringStats();
    loadCandidates();
  } catch (err) {
    showAlert('Admin command failed', 'error');
  }
}

async function testDoubleVoteSimulation() {
  try {
    const data = await API.verifyVoter('VOT1000001');
    if (!data.success) {
      showAlert(`🔒 CENTRAL IDS PROTECTION: ${data.message}`, 'error');
      // Trigger Red Intrusion Packet animation
      animatePacketRoute(['pc0', 'switch1', 'mswitch0', 'switch0', 'audit_server'], '#ef4444');
      fetchMonitoringStats();
    } else {
      showAlert('Voter hasn\'t voted yet. Please cast a vote for VOT1000001 first, then click this button again to test double-voting block!', 'info');
    }
  } catch (err) {
    console.error(err);
  }
}

async function addNewVoter() {
  const name = document.getElementById('newVoterName').value.trim();
  const booth = document.getElementById('newVoterBooth').value;
  if (!name) {
    showAlert('Please enter voter full name', 'error');
    return;
  }

  try {
    await API.adminAction('ADD_VOTER', { voterName: name, voterBooth: booth });
    showAlert(`New voter '${name}' registered successfully!`, 'success');
    document.getElementById('newVoterName').value = '';
    loadSampleVoters();
  } catch (err) {
    console.error(err);
  }
}
