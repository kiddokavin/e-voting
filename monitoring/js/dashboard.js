// Central Monitoring Dashboard Charts & Stream Engine
let voteShareChart = null;
let zoneTurnoutChart = null;
let monitoringPollTimer = null;

async function initDashboard() {
  await API.init();
  initCharts();
  await refreshDashboard();
  monitoringPollTimer = setInterval(refreshDashboard, 2000);
}

function initCharts() {
  const barCanvas = document.getElementById('voteShareChart');
  if (barCanvas) {
    const ctxBar = barCanvas.getContext('2d');
    voteShareChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Dr. A. R. Sharma (NPP)', 'Er. S. Meenakshi (UDA)', 'K. Rajesh Kumar (PFF)', 'NOTA'],
        datasets: [{
          label: 'Total Votes Cast',
          data: [0, 0, 0, 0],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
          x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
        }
      }
    });
  }

  const doughnutCanvas = document.getElementById('zoneTurnoutChart');
  if (doughnutCanvas) {
    const ctxDoughnut = doughnutCanvas.getContext('2d');
    zoneTurnoutChart = new Chart(ctxDoughnut, {
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
        plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } } }
      }
    });
  }
}

async function refreshDashboard() {
  const stats = await API.getMonitoringStats();

  document.getElementById('totalVotesCount').innerText = stats.totalVotesCast || 0;
  document.getElementById('voterTurnoutText').innerText = `${stats.turnoutPercent || '0.0'}%`;
  document.getElementById('leadingCandidateText').innerText = stats.leader ? `${stats.leader.name}` : '-';
  document.getElementById('securityIncidentCount').innerText = stats.securityAlertCount || 0;
  document.getElementById('monitoringStatusText').innerText = `SERVER ${stats.electionStatus} (VLAN 10)`;

  if (voteShareChart && stats.candidates) {
    voteShareChart.data.labels = stats.candidates.map(c => c.name);
    voteShareChart.data.datasets[0].data = stats.candidates.map(c => c.votes);
    voteShareChart.data.datasets[0].backgroundColor = stats.candidates.map(c => c.color);
    voteShareChart.update();
  }

  if (zoneTurnoutChart && stats.zoneStats) {
    zoneTurnoutChart.data.datasets[0].data = [
      stats.zoneStats['Zone 1 (Red)'] || 0,
      stats.zoneStats['Zone 2 (Green)'] || 0,
      stats.zoneStats['Zone 3 (Pink)'] || 0
    ];
    zoneTurnoutChart.update();
  }

  renderNodes(stats.nodes);
  renderAuditLogs(stats.recentAuditLogs);
}

function renderNodes(nodes) {
  const container = document.getElementById('nodeStatusGrid');
  if (!container || !nodes || nodes.length === 0) return;

  container.innerHTML = nodes.map(n => {
    let zoneClass = 'blue';
    if (n.zone.includes('Red')) zoneClass = 'red';
    else if (n.zone.includes('Green')) zoneClass = 'green';
    else if (n.zone.includes('Pink')) zoneClass = 'pink';
    else if (n.zone.includes('Yellow')) zoneClass = 'yellow';

    return `
      <div class="node-card ${zoneClass}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.85rem;">${n.name}</strong>
          <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399;">ONLINE</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.75rem;">IP: ${n.ip} | Packets: ${n.packets}</p>
        <p style="color: var(--text-muted); font-size: 0.7rem;">Latency: ${n.latency}ms</p>
      </div>
    `;
  }).join('');
}

function renderAuditLogs(logs) {
  const stream = document.getElementById('auditLogStream');
  if (!stream || !logs) return;

  stream.innerHTML = logs.map(l => `
    <div class="audit-row">
      <span class="audit-time">[${new Date(l.timestamp).toLocaleTimeString()}]</span>
      <span class="audit-type ${l.type}">${l.type}</span>
      <span style="color: var(--text-muted);">(${l.sourceIp}):</span>
      <span style="color: #f3f4f6;">${l.message}</span>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', initDashboard);
