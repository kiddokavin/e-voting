// Global Application State
const state = {
  currentTab: 'voter',
  electionStatus: 'ACTIVE',
  candidates: [],
  voters: [],
  selectedVoter: null,
  selectedCandidateId: null,
  terminalIp: '192.168.20.10',
  terminalZone: 'Zone 1 (Red)'
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[App] E-Voting Centralized Monitoring Web UI Loaded.');
  await API.init();

  loadCandidates();
  loadSampleVoters();
  initDashboardCharts();
  initTopologyCanvas();

  // Auto-refresh monitoring stats every 3 seconds
  setInterval(() => {
    if (state.currentTab === 'monitoring') {
      fetchMonitoringStats();
    }
  }, 3000);
});

// Tab Switcher
function switchTab(tabId) {
  state.currentTab = tabId;

  // Update Nav Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.nav-btn[onclick="switchTab('${tabId}')"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Tab Content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.classList.add('active');

  // Refresh view data depending on tab
  if (tabId === 'monitoring') {
    fetchMonitoringStats();
  } else if (tabId === 'topology') {
    drawTopology();
  }
}

// Global Alert Notification Toast
function showAlert(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.color = '#fff';
  toast.style.fontWeight = 'bold';
  toast.style.fontSize = '0.9rem';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  toast.style.zIndex = '9999';
  toast.style.transition = 'all 0.3s ease';

  if (type === 'success') {
    toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  } else if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
  }

  toast.innerHTML = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
