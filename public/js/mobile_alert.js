// Mobile SMS & Smartphone Notification Simulator
// Simulates GSM Gateway SMS alerts sent to Polling Booth Agent Officers when a booth is shut down

const DEFAULT_OFFICERS = {
  booth1: {
    id: 'booth1',
    boothName: 'Booth 1 (Red Zone)',
    officerName: 'Thiru. R. Saravanan',
    role: 'Presiding Officer (Booth 1)',
    mobile: '+91 98401 23456',
    zone: 'Zone 1 (Red Zone)',
    vlan: 20,
    terminals: 'PC0, PC1',
    switchId: 'Switch 1',
    color: '#ef4444',
    avatar: '👨‍💼',
    lastAlert: null
  },
  booth2: {
    id: 'booth2',
    boothName: 'Booth 2 (Green Zone)',
    officerName: 'Tmt. S. Meenakshi',
    role: 'Presiding Officer (Booth 2)',
    mobile: '+91 98402 34567',
    zone: 'Zone 2 (Green Zone)',
    vlan: 30,
    terminals: 'PC2, PC3',
    switchId: 'Switch 2',
    color: '#10b981',
    avatar: '👩‍💼',
    lastAlert: null
  },
  booth3: {
    id: 'booth3',
    boothName: 'Booth 3 (Pink Zone)',
    officerName: 'Thiru. K. Vignesh',
    role: 'Presiding Officer (Booth 3)',
    mobile: '+91 98403 45678',
    zone: 'Zone 3 (Pink Zone)',
    vlan: 40,
    terminals: 'PC4, PC5',
    switchId: 'Switch 3',
    color: '#ec4899',
    avatar: '👨‍💼',
    lastAlert: null
  }
};

let boothOfficers = Object.assign({}, DEFAULT_OFFICERS);
try {
  const savedOfficers = localStorage.getItem('evoting_booth_officers');
  if (savedOfficers) {
    boothOfficers = Object.assign({}, DEFAULT_OFFICERS, JSON.parse(savedOfficers));
  }
} catch (e) {
  console.error('[Officer Store Error]', e);
}

// Conversation thread history per officer
const officerMessageHistory = {
  booth1: [],
  booth2: [],
  booth3: []
};

// Play realistic two-tone mobile SMS audio chime using Web Audio API
function playSmsNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Beep Tone 1 (High chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Beep Tone 2 (Higher chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.25, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch (err) {
    console.log('[Web Audio API]', err);
  }
}

// Trigger Emergency SMS to Booth Agent Officer when a booth power is toggled
function triggerOfficerMobileAlert(boothId, actionState = 'OFF') {
  const officer = boothOfficers[boothId];
  if (!officer) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const isShutdown = (actionState === 'OFF');

  let alertTitle, alertBody, bannerPreview;
  if (isShutdown) {
    alertTitle = `🚨 CRITICAL SECURITY ALERT: ${officer.boothName.toUpperCase()} SHUT DOWN`;
    alertBody = `URGENT NOTICE [EVAL-SEC-01]: Polling Booth (${officer.boothName} / VLAN ${officer.vlan}) network interface administratively SHUT DOWN by Router0 at ${timeStr}. Terminals ${officer.terminals} are OFFLINE. Voting suspended. Please inspect booth immediately!`;
    bannerPreview = `⚠️ SHUTDOWN ALERT: ${officer.boothName} interface administratively disabled!`;
  } else {
    alertTitle = `🟢 RESTORATION NOTICE: ${officer.boothName.toUpperCase()} POWERED ON`;
    alertBody = `STATUS UPDATE [EVAL-NET-02]: Polling Booth (${officer.boothName} / VLAN ${officer.vlan}) network interface restored to active state (no shutdown) at ${timeStr}. Terminals ${officer.terminals} are ONLINE. Voting resumed.`;
    bannerPreview = `✅ RESTORED: ${officer.boothName} interface back online.`;
  }

  const messageRecord = {
    id: `SMS_${Date.now()}`,
    timestamp: timeStr,
    fullDate: now.toLocaleString(),
    isShutdown: isShutdown,
    title: alertTitle,
    body: alertBody,
    sender: 'E-VOTE-ALERT (Cisco Core Gateway)',
    status: 'Delivered (GSM Gateway 100%)'
  };

  if (!officerMessageHistory[boothId]) officerMessageHistory[boothId] = [];
  officerMessageHistory[boothId].push(messageRecord);
  officer.lastAlert = timeStr;

  // Save to Central Audit Stream
  if (window.API && API.mockDB && API.mockDB.auditLogs) {
    API.mockDB.auditLogs.unshift({
      id: `LOG_SMS_${Date.now()}`,
      timestamp: now.toISOString(),
      type: isShutdown ? 'SECURITY_ALERT' : 'NETWORK',
      sourceIp: '192.168.1.1',
      message: `GSM_GATEWAY: Emergency SMS dispatched to ${officer.officerName} (${officer.mobile}) - ${alertTitle}`,
      hash: '0x' + Math.random().toString(16).substring(2, 10)
    });
  }

  // Play Realistic SMS Tone
  playSmsNotificationSound();

  // Show Toast Alert
  if (typeof showAlert === 'function') {
    showAlert(`📱 SMS Alert sent to ${officer.officerName} (${officer.mobile})!`, isShutdown ? 'error' : 'success');
  }

  // Render & Open Smartphone Mockup Popup
  renderSmartphoneView(boothId, messageRecord, bannerPreview);
  openPhoneAlertModal();

  // Update Officer Directory Table in Tab 4
  renderOfficerDirectory();
}

// Current active officer viewing in phone
let currentViewingBoothId = 'booth1';

function renderSmartphoneView(boothId, latestMessage = null, bannerPreview = null) {
  currentViewingBoothId = boothId;
  const officer = boothOfficers[boothId];
  if (!officer) return;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Update Phone Clock
  const clockEl = document.getElementById('phoneClockDisplay');
  if (clockEl) clockEl.textContent = timeFormatted;

  // Update Officer Contact Header
  const contactNameEl = document.getElementById('phoneOfficerName');
  const contactRoleEl = document.getElementById('phoneOfficerRole');
  const contactPhoneEl = document.getElementById('phoneOfficerPhone');
  const contactAvatarEl = document.getElementById('phoneOfficerAvatar');
  const boothPillEl = document.getElementById('phoneBoothPill');

  if (contactNameEl) contactNameEl.textContent = officer.officerName;
  if (contactRoleEl) contactRoleEl.textContent = officer.role;
  if (contactPhoneEl) contactPhoneEl.textContent = officer.mobile;
  if (contactAvatarEl) contactAvatarEl.textContent = officer.avatar;
  if (boothPillEl) {
    boothPillEl.textContent = officer.boothName;
    boothPillEl.style.background = officer.color + '25';
    boothPillEl.style.color = officer.color;
    boothPillEl.style.borderColor = officer.color + '60';
  }

  // Update Top Push Notification Banner
  const bannerEl = document.getElementById('phoneNotificationBanner');
  const bannerTextEl = document.getElementById('phoneBannerPreviewText');
  const bannerTimeEl = document.getElementById('phoneBannerTime');

  if (bannerEl && bannerTextEl) {
    bannerTextEl.textContent = bannerPreview || `Alert received from E-Voting Command Gateway`;
    if (bannerTimeEl) bannerTimeEl.textContent = timeFormatted;
    bannerEl.style.display = 'block';

    // Trigger subtle vibration animation
    const phoneFrame = document.getElementById('smartphoneFrame');
    if (phoneFrame) {
      phoneFrame.classList.remove('vibrating');
      void phoneFrame.offsetWidth; // trigger reflow
      phoneFrame.classList.add('vibrating');
    }
  }

  // Render SMS Message Stream
  const messageStream = document.getElementById('phoneMessageStream');
  if (!messageStream) return;

  const history = officerMessageHistory[boothId] || [];

  if (history.length === 0) {
    messageStream.innerHTML = `
      <div style="text-align: center; color: #64748b; font-size: 0.78rem; margin: 3rem 1rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
        No messages yet for ${officer.officerName}.<br>
        Turn OFF a booth to trigger an emergency SMS!
      </div>
    `;
    return;
  }

  messageStream.innerHTML = '';

  // Add date divider
  const dateDiv = document.createElement('div');
  dateDiv.style.cssText = 'text-align:center; font-size:0.68rem; color:#94a3b8; margin: 0.8rem 0 0.4rem 0; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;';
  dateDiv.textContent = 'Today • Official Election Service';
  messageStream.appendChild(dateDiv);

  history.forEach((msg, idx) => {
    const isLast = idx === history.length - 1;
    const bubble = document.createElement('div');
    bubble.className = 'sms-bubble';
    bubble.style.cssText = `
      background: ${msg.isShutdown ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
      border: 1px solid ${msg.isShutdown ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)'};
      border-radius: 14px;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.75rem;
      color: #f1f5f9;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
    `;

    bubble.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <span style="font-size: 0.72rem; font-weight: bold; color: ${msg.isShutdown ? '#f87171' : '#34d399'}; display: flex; align-items: center; gap: 0.3rem;">
          ${msg.isShutdown ? '🚨 E-VOTE-ALERT' : '✅ E-VOTE-INFO'}
        </span>
        <span style="font-size: 0.65rem; color: #94a3b8;">${msg.timestamp}</span>
      </div>
      <div style="font-size: 0.76rem; line-height: 1.42; margin-bottom: 0.5rem; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${msg.body}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.64rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.3rem;">
        <span>📡 GSM Gateway Delivered</span>
        <span style="color: #10b981;">✔✔ Read</span>
      </div>
    `;

    messageStream.appendChild(bubble);
  });

  // Auto-scroll to latest message
  setTimeout(() => {
    messageStream.scrollTop = messageStream.scrollHeight;
  }, 50);

  // Update tabs highlight
  ['booth1', 'booth2', 'booth3'].forEach(id => {
    const tabBtn = document.getElementById(`phoneTab_${id}`);
    if (tabBtn) {
      if (id === boothId) {
        tabBtn.style.background = '#3b82f6';
        tabBtn.style.color = '#fff';
      } else {
        tabBtn.style.background = 'rgba(255,255,255,0.08)';
        tabBtn.style.color = '#94a3b8';
      }
    }
  });
}

function switchPhoneOfficer(boothId) {
  renderSmartphoneView(boothId);
}

function openPhoneAlertModal() {
  const modal = document.getElementById('phoneAlertModal');
  if (modal) modal.classList.add('show');
}

function closePhoneAlertModal() {
  const modal = document.getElementById('phoneAlertModal');
  if (modal) modal.classList.remove('show');
}

// Render Officer Directory in Tab 4 (Admin Panel)
function renderOfficerDirectory() {
  const container = document.getElementById('officerDirectoryList');
  if (!container) return;

  container.innerHTML = '';

  ['booth1', 'booth2', 'booth3'].forEach(id => {
    const off = boothOfficers[id];
    const isOnline = (typeof isBoothOnline === 'function') ? isBoothOnline(id) : true;

    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid ${off.color}40;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      flex-wrap: wrap;
      gap: 0.8rem;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <div style="font-size: 1.8rem; background: ${off.color}20; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid ${off.color}50;">
          ${off.avatar}
        </div>
        <div>
          <div style="font-weight: bold; font-size: 0.9rem; color: #f3f4f6;">
            ${off.officerName} 
            <span style="font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: ${off.color}25; color: ${off.color}; border: 1px solid ${off.color}50; margin-left: 0.4rem;">
              ${off.boothName}
            </span>
          </div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem;">
            📞 <strong>${off.mobile}</strong> | Subnet: ${off.switchId} (VLAN ${off.vlan}) | Status: 
            <span style="color: ${isOnline ? '#10b981' : '#ef4444'}; font-weight: bold;">
              ${isOnline ? '● Subnet Active' : '🔴 Subnet Shutdown'}
            </span>
          </div>
          ${off.lastAlert ? `
            <div style="font-size: 0.68rem; color: #f59e0b; margin-top: 0.2rem;">
              📲 Last SMS Sent: ${off.lastAlert} (Delivered via GSM)
            </div>
          ` : ''}
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; width: auto; background: #3b82f6;" onclick="triggerOfficerMobileAlert('${id}', '${isOnline ? 'OFF' : 'ON'}')">
          📲 Test SMS Alert
        </button>
        <button class="btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; width: auto; background: rgba(255,255,255,0.08);" onclick="openEditOfficerModal('${id}')">
          ✏️ Edit Phone
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Edit Officer details modal
function openEditOfficerModal(boothId) {
  const off = boothOfficers[boothId];
  if (!off) return;

  const newName = prompt(`Enter Officer Name for ${off.boothName}:`, off.officerName);
  if (newName === null) return;

  const newPhone = prompt(`Enter 10-digit Mobile Number for ${off.boothName}:`, off.mobile);
  if (newPhone === null) return;

  off.officerName = newName.trim() || off.officerName;
  off.mobile = newPhone.trim() || off.mobile;

  try {
    localStorage.setItem('evoting_booth_officers', JSON.stringify(boothOfficers));
  } catch (e) {}

  if (typeof showAlert === 'function') {
    showAlert(`✅ Officer details for ${off.boothName} updated! Mobile: ${off.mobile}`, 'success');
  }

  renderOfficerDirectory();
  renderSmartphoneView(boothId);
}

// Initialize on window load
window.triggerOfficerMobileAlert = triggerOfficerMobileAlert;
window.openPhoneAlertModal = openPhoneAlertModal;
window.closePhoneAlertModal = closePhoneAlertModal;
window.switchPhoneOfficer = switchPhoneOfficer;
window.openEditOfficerModal = openEditOfficerModal;
window.renderOfficerDirectory = renderOfficerDirectory;
window.boothOfficers = boothOfficers;

document.addEventListener('DOMContentLoaded', () => {
  renderOfficerDirectory();
});
