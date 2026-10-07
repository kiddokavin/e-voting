// Admin Control Station Logic
let isAuthenticated = false;

async function initAdmin() {
  await API.init();
}

function verifyAdminLogin() {
  const user = document.getElementById('adminUserInput').value.trim();
  const pass = document.getElementById('adminPassInput').value.trim();
  const errorBox = document.getElementById('adminLoginError');

  if (user === 'admin' && pass === 'admin123') {
    isAuthenticated = true;
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('adminMainPanel').style.display = 'block';
  } else {
    errorBox.style.display = 'block';
    errorBox.innerText = '❌ INVALID CREDENTIALS! Access Denied by Level 5 Security Filter.';
  }
}

async function triggerAdminAction(action) {
  if (!isAuthenticated) return;

  const confirmAction = confirm(`Are you sure you want to perform action: '${action}'?`);
  if (!confirmAction) return;

  const statusDisplay = document.getElementById('currentElectionStatusDisplay');
  const response = await API.adminAction(action);

  if (response.success) {
    if (statusDisplay && response.status) statusDisplay.innerText = response.status;
    alert(`✅ Action '${action}' completed successfully.`);
  } else {
    alert(`❌ Action failed: ` + response.message);
  }
}

async function registerNewVoter() {
  if (!isAuthenticated) return;

  const nameInput = document.getElementById('newVoterName');
  const boothSelect = document.getElementById('newVoterBooth');

  const voterName = nameInput ? nameInput.value.trim() : '';
  const voterBooth = boothSelect ? boothSelect.value : 'Zone 1 (Red)';

  if (!voterName) {
    alert('Please enter voter full name');
    return;
  }

  const response = await API.adminAction('ADD_VOTER', { voterName, voterBooth });
  if (response.success) {
    alert(`✅ New Voter '${voterName}' registered successfully for ${voterBooth}.`);
    nameInput.value = '';
  } else {
    alert(`❌ Registration failed: ` + response.message);
  }
}

window.addEventListener('DOMContentLoaded', initAdmin);
