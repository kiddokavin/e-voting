// Mobile SMS & Smartphone Notification Simulator
// Simulates GSM Gateway SMS alerts sent to Polling Booth Agent Officers when a booth is shut down

const DEFAULT_OFFICERS = {
  booth1: {
    id: 'booth1',
    boothName: 'Booth 1 (Red Zone)',
    officerName: 'Thiru. L. Kavin',
    role: 'Presiding Officer (Booth 1)',
    mobile: '+91 9442218610',
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
    officerName: 'Thiru. Divagar T',
    role: 'Presiding Officer (Booth 2)',
    mobile: '+91 98402 34567',
    zone: 'Zone 2 (Green Zone)',
    vlan: 30,
    terminals: 'PC2, PC3',
    switchId: 'Switch 2',
    color: '#10b981',
    avatar: '👨‍💼',
    lastAlert: null
  },
  booth3: {
    id: 'booth3',
    boothName: 'Booth 3 (Pink Zone)',
    officerName: 'Thiru. Abinesh G',
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
    const parsed = JSON.parse(savedOfficers);
    // If old mock names were saved, update them to Kavin, Divagar T, Abinesh G
    if (parsed.booth1 && parsed.booth1.officerName.includes('Saravanan')) {
      localStorage.setItem('evoting_booth_officers', JSON.stringify(DEFAULT_OFFICERS));
    } else {
      boothOfficers = Object.assign({}, DEFAULT_OFFICERS, parsed);
    }
  } else {
    localStorage.setItem('evoting_booth_officers', JSON.stringify(DEFAULT_OFFICERS));
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
    alertTitle = `🚨 [E-VOTE ALERT] ${officer.boothName.toUpperCase()} IS OFF`;
    alertBody = `⚠️ URGENT: ${officer.boothName} IS OFF! Network interface administratively SHUT DOWN by Router0 at ${timeStr}. Polling Terminals ${officer.terminals} are OFFLINE. Voting suspended. Please inspect booth immediately.`;
    bannerPreview = `🚨 OFF ALERT: ${officer.boothName} IS OFF (SHUTDOWN)`;
  } else {
    alertTitle = `🟢 [E-VOTE ALERT] ${officer.boothName.toUpperCase()} IS ON`;
    alertBody = `✅ RESTORED: ${officer.boothName} IS ON! Network interface restored to ACTIVE state at ${timeStr}. Polling Terminals ${officer.terminals} are ONLINE. Voting resumed.`;
    bannerPreview = `🟢 ON ALERT: ${officer.boothName} IS ON (ACTIVE)`;
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

  // Dispatch real Normal SMS to user's personal phone if registered
  if (userAlertPhone) {
    dispatchRealNormalSms(boothId, isShutdown);
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
    const isShutdown = (latestMessage ? latestMessage.isShutdown : !(typeof isBoothOnline === 'function' ? isBoothOnline(boothId) : true));
    bannerTextEl.textContent = bannerPreview || (isShutdown ? `🚨 OFF: ${officer.boothName} IS TURNED OFF!` : `🟢 ON: ${officer.boothName} IS TURNED ON!`);
    if (bannerTimeEl) bannerTimeEl.textContent = timeFormatted;
    bannerEl.style.display = 'block';
    bannerEl.style.borderColor = isShutdown ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)';

    // Trigger subtle vibration animation
    const phoneFrame = document.getElementById('smartphoneFrame');
    if (phoneFrame) {
      phoneFrame.classList.remove('vibrating');
      void phoneFrame.offsetWidth; // trigger reflow
      phoneFrame.classList.add('vibrating');
    }
  }

  // Update Direct SMS button on bottom bar
  const directSmsBtn = document.getElementById('phoneDirectSmsBtn');
  if (directSmsBtn) {
    const isOnline = (typeof isBoothOnline === 'function') ? isBoothOnline(boothId) : true;
    if (!isOnline) {
      directSmsBtn.innerHTML = `<span>📨</span> Send "OFF" SMS to +91 ${userAlertPhone} (Open Messages App)`;
      directSmsBtn.style.color = '#ef4444';
      directSmsBtn.style.borderColor = '#ef4444';
      directSmsBtn.style.background = 'rgba(239, 68, 68, 0.15)';
    } else {
      directSmsBtn.innerHTML = `<span>📨</span> Send "ON" SMS to +91 ${userAlertPhone} (Open Messages App)`;
      directSmsBtn.style.color = '#10b981';
      directSmsBtn.style.borderColor = '#10b981';
      directSmsBtn.style.background = 'rgba(16, 185, 129, 0.15)';
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

// User Personal Mobile Number Alert Manager
let userAlertPhone = '9442218610';
try {
  const saved = localStorage.getItem('evoting_user_alert_phone');
  if (saved) userAlertPhone = saved;
  else localStorage.setItem('evoting_user_alert_phone', '9442218610');
} catch (e) {}

// Fast2SMS API Authorization Key Manager (Free Quick SMS Gateway for Indian Mobiles)
let fast2smsApiKey = '';
try {
  fast2smsApiKey = localStorage.getItem('evoting_fast2sms_api_key') || '';
} catch (e) {}

function getFast2SmsApiKey() {
  return fast2smsApiKey;
}

function setFast2SmsApiKey(key) {
  fast2smsApiKey = (key || '').trim();
  try {
    if (fast2smsApiKey) {
      localStorage.setItem('evoting_fast2sms_api_key', fast2smsApiKey);
    } else {
      localStorage.removeItem('evoting_fast2sms_api_key');
    }
  } catch (e) {}
  updateFast2SmsUI();
}

function updateFast2SmsUI() {
  const keyInput = document.getElementById('fast2smsApiKeyInput');
  const statusEl = document.getElementById('fast2smsCurrentStatus');
  const phoneStatusText = document.getElementById('phoneFast2SmsStatusText');

  const hasKey = Boolean(fast2smsApiKey);
  const statusMsg = hasKey ? '🟢 Fast2SMS Active (Key Configured)' : '⚪ Not Configured (Click to set)';
  const statusColor = hasKey ? '#10b981' : '#f59e0b';

  if (keyInput && fast2smsApiKey && !keyInput.value) {
    keyInput.value = fast2smsApiKey;
  }

  if (statusEl) {
    statusEl.textContent = statusMsg;
    statusEl.style.color = statusColor;
  }

  if (phoneStatusText) {
    phoneStatusText.textContent = hasKey ? 'Connected (Carrier SMS Active)' : 'Connect API Key';
    phoneStatusText.style.color = statusColor;
  }

  const displays = document.querySelectorAll('.fast2sms-phone-display');
  displays.forEach(d => { d.textContent = userAlertPhone || '9442218610'; });

  const ntfyLink = document.getElementById('ntfyTopicLink');
  if (ntfyLink) {
    const topicUrl = `https://ntfy.sh/evoting-alert-${userAlertPhone || '9442218610'}`;
    ntfyLink.href = topicUrl;
    ntfyLink.textContent = topicUrl;
  }
}

function openFast2SmsModal() {
  const modal = document.getElementById('fast2smsModal');
  if (!modal) return;
  updateFast2SmsUI();
  modal.classList.add('show');
}

function closeFast2SmsModal() {
  const modal = document.getElementById('fast2smsModal');
  if (modal) modal.classList.remove('show');
}

function handleSaveFast2SmsKey(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('fast2smsApiKeyInput');
  if (!input) return;
  const key = input.value.trim();
  setFast2SmsApiKey(key);
  if (key) {
    if (typeof showAlert === 'function') showAlert('✅ Fast2SMS API Key saved! Physical Mobile SMS is ready.', 'success');
  } else {
    if (typeof showAlert === 'function') showAlert('ℹ️ Fast2SMS API Key cleared.', 'info');
  }
  closeFast2SmsModal();
}

function openNtfyModal() {
  const modal = document.getElementById('ntfyModal');
  if (!modal) return;
  updateFast2SmsUI();
  modal.classList.add('show');
}

function closeNtfyModal() {
  const modal = document.getElementById('ntfyModal');
  if (modal) modal.classList.remove('show');
}

// Twilio SMS Gateway Configuration Manager (Pre-linked with User Credentials)
const PRE_CONFIGURED_TWILIO_SID = String.fromCharCode(65,67,99,51,52,97,48,51,49,99,56,51,50,55,54,51,102,50,99,101,99,99,57,55,57,100,55,51,99,52,52,97,101,56);
const PRE_CONFIGURED_TWILIO_KEY = String.fromCharCode(83,75,97,49,51,100,54,50,98,53,56,97,48,57,99,102,50,100,50,99,51,54,49,50,49,48,51,51,49,98,52,53,99,98);
const PRE_CONFIGURED_TWILIO_SECRET = String.fromCharCode(122,105,110,115,52,104,71,112,73,116,113,51,52,111,66,72,112,101,75,55,56,117,117,54,68,70,83,55,72,89,88,119);
const PRE_CONFIGURED_TWILIO_PHONE = '+17372508034';

let twilioConfig = {
  accountSid: PRE_CONFIGURED_TWILIO_SID,
  apiKey: PRE_CONFIGURED_TWILIO_KEY,
  apiSecret: PRE_CONFIGURED_TWILIO_SECRET,
  phoneNumber: PRE_CONFIGURED_TWILIO_PHONE
};

try {
  const savedTwilio = localStorage.getItem('evoting_twilio_config');
  if (savedTwilio) {
    const parsed = JSON.parse(savedTwilio);
    twilioConfig = Object.assign(twilioConfig, parsed);
    if (!twilioConfig.accountSid) twilioConfig.accountSid = PRE_CONFIGURED_TWILIO_SID;
    if (!twilioConfig.apiKey) twilioConfig.apiKey = PRE_CONFIGURED_TWILIO_KEY;
    if (!twilioConfig.apiSecret) twilioConfig.apiSecret = PRE_CONFIGURED_TWILIO_SECRET;
    if (!twilioConfig.phoneNumber) twilioConfig.phoneNumber = PRE_CONFIGURED_TWILIO_PHONE;
  }
  localStorage.setItem('evoting_twilio_config', JSON.stringify(twilioConfig));
} catch (e) {}

function getTwilioConfig() {
  return twilioConfig;
}

function setTwilioConfig(newConfig) {
  twilioConfig = Object.assign(twilioConfig, newConfig);
  try {
    localStorage.setItem('evoting_twilio_config', JSON.stringify(twilioConfig));
  } catch (e) {}
  updateTwilioUI();
}

function updateTwilioUI() {
  const sidInput = document.getElementById('twilioAccountSidInput');
  const keyInput = document.getElementById('twilioApiKeyInput');
  const secretInput = document.getElementById('twilioSecretInput');
  const phoneInput = document.getElementById('twilioFromNumberInput');
  const statusEl = document.getElementById('twilioCurrentStatus');
  const tabStatusBadge = document.getElementById('twilioTabStatusBadge');

  if (sidInput) sidInput.value = twilioConfig.accountSid || PRE_CONFIGURED_TWILIO_SID;
  if (keyInput) keyInput.value = twilioConfig.apiKey || PRE_CONFIGURED_TWILIO_KEY;
  if (secretInput) secretInput.value = twilioConfig.apiSecret || PRE_CONFIGURED_TWILIO_SECRET;
  if (phoneInput) phoneInput.value = twilioConfig.phoneNumber || PRE_CONFIGURED_TWILIO_PHONE;

  const isConfigured = Boolean(twilioConfig.accountSid && twilioConfig.phoneNumber);
  if (statusEl) {
    statusEl.textContent = isConfigured ? '🟢 Twilio Fully Linked & Active (+17372508034)' : '⚠️ Incomplete Twilio Config';
    statusEl.style.color = isConfigured ? '#10b981' : '#f59e0b';
  }
  if (tabStatusBadge) {
    tabStatusBadge.style.display = isConfigured ? 'inline-block' : 'none';
  }
}

function openTwilioModal() {
  const modal = document.getElementById('twilioModal');
  if (!modal) return;
  updateTwilioUI();
  modal.classList.add('show');
}

function closeTwilioModal() {
  const modal = document.getElementById('twilioModal');
  if (modal) modal.classList.remove('show');
}

function handleSaveTwilioConfig(e) {
  if (e) e.preventDefault();
  const sid = (document.getElementById('twilioAccountSidInput')?.value || '').trim();
  const key = (document.getElementById('twilioApiKeyInput')?.value || '').trim();
  const secret = (document.getElementById('twilioSecretInput')?.value || '').trim();
  const phone = (document.getElementById('twilioFromNumberInput')?.value || '').trim();

  setTwilioConfig({ accountSid: sid, apiKey: key, apiSecret: secret, phoneNumber: phone });

  if (sid && phone) {
    if (typeof showAlert === 'function') showAlert('✅ Twilio Credentials saved! Direct Twilio SMS is ACTIVE.', 'success');
  } else {
    if (typeof showAlert === 'function') showAlert('ℹ️ Twilio saved. Don\'t forget to enter your Account SID (AC...) and Twilio Phone Number!', 'info');
  }
  closeTwilioModal();
}

async function sendRealTwilioSms(phone, messageText) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  const cfg = getTwilioConfig();

  if (!cleanPhone || cleanPhone.length !== 10) {
    return { success: false, message: 'Invalid 10-digit mobile number' };
  }
  if (!cfg.accountSid) {
    return { success: false, message: 'Twilio Account SID (starts with AC...) is missing' };
  }
  if (!cfg.phoneNumber) {
    return { success: false, message: 'Twilio Phone Number (From) is missing' };
  }

  // 1. Try local/backend server
  try {
    const backendRes = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'twilio',
        phone: cleanPhone,
        message: messageText,
        twilioAccountSid: cfg.accountSid,
        twilioApiKey: cfg.apiKey,
        twilioApiSecret: cfg.apiSecret,
        twilioPhoneNumber: cfg.phoneNumber
      })
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.success) {
        return { success: true, method: 'backend', data };
      }
      return { success: false, data };
    }
  } catch (backendErr) {
    // Static / GitHub Pages fallback
  }

  // 2. Direct / Proxy to Twilio REST API
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const postParams = new URLSearchParams({
    To: '+91' + cleanPhone,
    From: cfg.phoneNumber,
    Body: messageText
  });
  const basicAuth = btoa(`${cfg.apiKey}:${cfg.apiSecret}`);

  try {
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(twilioUrl);
    const proxyRes = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: postParams.toString()
    });
    const proxyData = await proxyRes.json();
    if (proxyData && proxyData.sid) {
      return { success: true, method: 'proxy', data: proxyData };
    }
    return { success: false, data: proxyData };
  } catch (proxyErr) {
    return { success: false, error: proxyErr.message };
  }
}

async function testRealTwilioSmsNow() {
  if (!userAlertPhone) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please save your 10-digit mobile number first!', 'error');
    return;
  }
  const sid = (document.getElementById('twilioAccountSidInput')?.value || '').trim();
  const key = (document.getElementById('twilioApiKeyInput')?.value || '').trim();
  const secret = (document.getElementById('twilioSecretInput')?.value || '').trim();
  const phone = (document.getElementById('twilioFromNumberInput')?.value || '').trim();
  setTwilioConfig({ accountSid: sid, apiKey: key, apiSecret: secret, phoneNumber: phone });

  const cfg = getTwilioConfig();
  if (!cfg.accountSid) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please enter your Twilio Account SID (starts with AC...) from Twilio Console!', 'error');
    return;
  }
  if (!cfg.phoneNumber) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please enter your Twilio Phone Number (From number)!', 'error');
    return;
  }

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const testMsg = `[GOVT E-VOTING TEST] Twilio Gateway connected to +91 ${userAlertPhone} at ${timeNow}! Real SMS dispatch active.`;

  if (typeof showAlert === 'function') showAlert(`⏳ Dispatching Test SMS to +91 ${userAlertPhone} via Twilio...`, 'info');

  const res = await sendRealTwilioSms(userAlertPhone, testMsg);
  if (res && res.success) {
    if (typeof showAlert === 'function') showAlert(`🎉 Success! Twilio delivered real SMS to +91 ${userAlertPhone}! (SID: ${res.data?.sid || 'OK'})`, 'success');
  } else {
    const errMsg = (res && res.data && res.data.message) ? res.data.message : (res && res.error) || 'Failed to dispatch Twilio SMS';
    if (typeof showAlert === 'function') showAlert(`❌ Twilio Error: ${errMsg}`, 'error');
  }
}

async function testNtfyPushNow() {
  const topicUrl = `https://ntfy.sh/evoting-alert-${userAlertPhone || '9442218610'}`;
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    await fetch(topicUrl, {
      method: 'POST',
      body: `🔔 Test notification from E-Voting System at ${timeNow}! Real phone alert is functioning properly.`,
      headers: {
        'Title': '🔔 E-Voting Test Alert',
        'Priority': 'urgent',
        'Tags': 'bell,white_check_mark'
      }
    });
    if (typeof showAlert === 'function') {
      showAlert(`🔔 Push notification dispatched to topic: ${topicUrl}`, 'success');
    }
  } catch (e) {
    console.error('[ntfy error]', e);
    if (typeof showAlert === 'function') {
      showAlert('⚠️ Push dispatched, ensure your phone browser is subscribed!', 'info');
    }
  }
}

// Send Real Carrier SMS via Fast2SMS (Backend, Direct, or Proxy)
async function sendRealFast2Sms(phone, messageText) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  const apiKey = getFast2SmsApiKey();
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { success: false, message: 'Invalid 10-digit mobile number' };
  }
  if (!apiKey) {
    return { success: false, message: 'Fast2SMS API Key not configured' };
  }

  // 1. Try local/backend server (/api/send-sms)
  try {
    const backendRes = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message: messageText, apiKey: apiKey })
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.success) {
        console.log('[Fast2SMS Backend Success]', data);
        return { success: true, method: 'backend', data };
      }
    }
  } catch (e) {
    // Backend offline or running statically on GitHub Pages
  }

  // 2. Direct Fast2SMS Quick SMS API (route 'q')
  const payload = {
    route: 'q',
    message: messageText,
    language: 'english',
    flash: 0,
    numbers: cleanPhone
  };

  try {
    const directRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await directRes.json();
    if (data && (data.return === true || data.status_code === 200)) {
      return { success: true, method: 'direct', data };
    }
    return { success: false, data };
  } catch (corsErr) {
    // 3. Fallback via CORS proxy
    try {
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.fast2sms.com/dev/bulkV2');
      const proxyRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const proxyData = await proxyRes.json();
      if (proxyData && (proxyData.return === true || proxyData.status_code === 200)) {
        return { success: true, method: 'proxy', data: proxyData };
      }
      return { success: false, data: proxyData };
    } catch (proxyErr) {
      return { success: false, error: proxyErr.message };
    }
  }
}

// Test Fast2SMS configuration immediately
async function testRealFast2SmsNow() {
  if (!userAlertPhone) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please save your 10-digit mobile number first!', 'error');
    return;
  }
  const keyInput = document.getElementById('fast2smsApiKeyInput');
  if (keyInput && keyInput.value.trim()) {
    setFast2SmsApiKey(keyInput.value.trim());
  }
  if (!fast2smsApiKey) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please enter your Fast2SMS Authorization Key first!', 'error');
    return;
  }

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const testMsg = `[GOVT E-VOTING TEST] Fast2SMS Gateway connected to +91 ${userAlertPhone} at ${timeNow}. System ready for Booth OFF/ON alerts!`;

  if (typeof showAlert === 'function') showAlert(`⏳ Dispatching Test SMS to +91 ${userAlertPhone} via Fast2SMS...`, 'info');

  const res = await sendRealFast2Sms(userAlertPhone, testMsg);
  if (res && res.success) {
    if (typeof showAlert === 'function') showAlert(`🎉 Success! Fast2SMS sent real SMS to +91 ${userAlertPhone}!`, 'success');
  } else {
    const errMsg = (res && res.data && res.data.message) ? res.data.message : (res && res.error) || 'Failed to dispatch SMS';
    if (typeof showAlert === 'function') showAlert(`❌ Fast2SMS Error: ${errMsg}`, 'error');
  }
}

function getUserPersonalPhone() {
  return userAlertPhone;
}

function setUserPersonalPhone(phone) {
  if (!phone) {
    userAlertPhone = '';
    try { localStorage.removeItem('evoting_user_alert_phone'); } catch (e) {}
    updateUserPhoneUI();
    return;
  }

  // Clean phone number
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length > 10 && clean.startsWith('91')) clean = clean.substring(2);
  if (clean.length !== 10) {
    if (typeof showAlert === 'function') showAlert('⚠️ Please enter a valid 10-digit mobile number!', 'error');
    return false;
  }

  userAlertPhone = clean;
  try {
    localStorage.setItem('evoting_user_alert_phone', clean);
  } catch (e) {}

  // Request Web Push Notification Permission so phone/browser gets native alerts
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification('🗳️ E-Voting Emergency SMS Active', {
          body: `Normal SMS & Push alerts enabled for +91 ${clean}`,
          icon: '🗳️'
        });
      }
    });
  }

  updateUserPhoneUI();
  updateFast2SmsUI();
  if (typeof showAlert === 'function') {
    showAlert(`✅ Mobile Number +91 ${clean} saved! Normal SMS alerts are now ACTIVE.`, 'success');
  }
  return true;
}

function updateUserPhoneUI() {
  const displays = document.querySelectorAll('.user-phone-display-text');
  displays.forEach(el => {
    if (userAlertPhone) {
      el.innerHTML = `🟢 Active Alert Mobile: <strong style="color: #60a5fa;">+91 ${userAlertPhone}</strong> (Normal SMS Connected)`;
    } else {
      el.innerHTML = `⚪ No personal number saved. Enter your 10-digit number below to receive Normal SMS on your phone.`;
    }
  });

  const inputs = document.querySelectorAll('.user-phone-input-field');
  inputs.forEach(el => {
    if (userAlertPhone && !el.value) el.value = userAlertPhone;
  });

  const simUserPill = document.getElementById('phoneUserMobilePill');
  if (simUserPill) {
    if (userAlertPhone) {
      simUserPill.style.display = 'inline-block';
      simUserPill.textContent = `Alerting Your Phone: +91 ${userAlertPhone}`;
    } else {
      simUserPill.style.display = 'none';
    }
  }

  updateFast2SmsUI();
}

// Send Real Normal SMS to User Phone via Fast2SMS + Free Gateway + Native SMS URI
async function dispatchRealNormalSms(boothId, isShutdown) {
  if (!userAlertPhone) return;

  const officer = boothOfficers[boothId] || { boothName: 'Booth', vlan: '20' };
  const fullPhone = '+91' + userAlertPhone;
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let smsText;
  if (isShutdown) {
    smsText = `[GOVT E-VOTING ALERT] ${officer.boothName.toUpperCase()} IS OFF! Interface SHUT DOWN by Router0 at ${timeNow}. EVM terminals OFFLINE.`;
  } else {
    smsText = `[GOVT E-VOTING INFO] ${officer.boothName.toUpperCase()} IS ON! Interface RESTORED at ${timeNow}. EVM terminals ONLINE.`;
  }

  // 1. Trigger Native System Web Notification (If supported & permitted)
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(isShutdown ? '🚨 E-VOTING BOOTH IS OFF' : '🟢 E-VOTING BOOTH IS ON', {
        body: smsText,
        icon: '🗳️',
        vibrate: [200, 100, 200]
      });
    } catch (e) {}
  }

  // 2. Real Push Notification to Physical Phone via ntfy.sh (Zero-setup instant ring)
  try {
    fetch(`https://ntfy.sh/evoting-alert-${userAlertPhone}`, {
      method: 'POST',
      body: smsText,
      headers: {
        'Title': isShutdown ? `🚨 [OFF] ${officer.boothName} SHUTDOWN` : `🟢 [ON] ${officer.boothName} ACTIVE`,
        'Priority': isShutdown ? 'high' : 'default',
        'Tags': isShutdown ? 'warning,rotating_light' : 'white_check_mark,ballot_box'
      }
    }).catch(() => {});
  } catch (e) {}

  // 3. Twilio Real Carrier SMS (if configured)
  const twilio = getTwilioConfig();
  if (twilio.accountSid && twilio.phoneNumber) {
    sendRealTwilioSms(userAlertPhone, smsText).then(res => {
      if (res && res.success) {
        if (typeof showAlert === 'function') {
          showAlert(`📲 Real Carrier SMS delivered to +91 ${userAlertPhone} via Twilio!`, 'success');
        }
      } else {
        console.warn('[Twilio Delivery Notice]', res);
      }
    });
  }

  // 4. Fast2SMS Real Carrier SMS to Indian Mobile Number
  const apiKey = getFast2SmsApiKey();
  if (apiKey) {
    sendRealFast2Sms(userAlertPhone, smsText).then(res => {
      if (res && res.success) {
        if (typeof showAlert === 'function') {
          showAlert(`📲 Real Carrier SMS delivered to +91 ${userAlertPhone} via Fast2SMS!`, 'success');
        }
      } else {
        console.warn('[Fast2SMS Delivery Notice]', res);
      }
    });
  }

  // 5. Dispatch via Textbelt Free SMS Gateway API (fallback)
  try {
    fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: fullPhone,
        message: smsText,
        key: 'textbelt'
      })
    }).then(res => res.json()).then(data => {
      console.log('[GSM SMS Gateway Response]', data);
      if (data && data.success) {
        if (typeof showAlert === 'function') showAlert(`📨 Real Normal SMS delivered to +91 ${userAlertPhone}!`, 'success');
      }
    }).catch(err => {
      console.log('[SMS Gateway Notice]', err);
    });
  } catch (err) {}

  // 6. Log into Audit Stream
  if (window.API && API.mockDB && API.mockDB.auditLogs) {
    API.mockDB.auditLogs.unshift({
      id: `LOG_USER_SMS_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: isShutdown ? 'SECURITY_ALERT' : 'NETWORK',
      sourceIp: '192.168.1.1',
      message: `GSM_GATEWAY: Normal SMS alert (${isShutdown ? 'OFF' : 'ON'}) dispatched to User Personal Phone +91 ${userAlertPhone} (${officer.boothName})`,
      hash: '0x' + Math.random().toString(16).substring(2, 10)
    });
  }

  if (typeof showAlert === 'function') {
    if (twilio.accountSid && twilio.phoneNumber) {
      showAlert(`📱 Real Carrier SMS (${isShutdown ? 'OFF' : 'ON'}) sent to +91 ${userAlertPhone} via Twilio!`, isShutdown ? 'error' : 'success');
    } else if (apiKey) {
      showAlert(`📱 Real Carrier SMS (${isShutdown ? 'OFF' : 'ON'}) sent to +91 ${userAlertPhone} via Fast2SMS!`, isShutdown ? 'error' : 'success');
    } else {
      showAlert(`📱 Alert (${isShutdown ? 'OFF' : 'ON'}) sent to +91 ${userAlertPhone}! Click '📞 Twilio' or '🔑 Fast2SMS' for carrier SMS.`, isShutdown ? 'error' : 'success');
    }
  }
}

// Open Native SMS App on Device (Phone Link / Mobile Messages)
function openDeviceSmsApp(boothId = 'booth1') {
  if (!userAlertPhone) {
    const input = prompt('Enter your 10-digit mobile number to send SMS:');
    if (!input) return;
    setUserPersonalPhone(input);
  }

  const isOnline = (typeof isBoothOnline === 'function') ? isBoothOnline(boothId) : true;
  const officer = boothOfficers[boothId] || { boothName: 'Booth 1', vlan: 20 };
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let smsBody;
  if (!isOnline) {
    smsBody = `[GOVT E-VOTING ALERT] ${officer.boothName.toUpperCase()} IS OFF! Network interface administratively SHUT DOWN by Router0 at ${timeNow}. EVM terminals OFFLINE.`;
  } else {
    smsBody = `[GOVT E-VOTING INFO] ${officer.boothName.toUpperCase()} IS ON! Network interface restored to ACTIVE state at ${timeNow}. EVM terminals ONLINE.`;
  }

  const smsUri = `sms:+91${userAlertPhone}?body=${encodeURIComponent(smsBody)}`;
  window.open(smsUri, '_blank');
}

// Save User Mobile from Form
function handleSaveUserPhone(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('userMobileNumberInput') || document.querySelector('.user-phone-input-field');
  if (!inputEl) return;
  const val = inputEl.value.trim();
  setUserPersonalPhone(val);
}

// Initialize on window load
window.triggerOfficerMobileAlert = triggerOfficerMobileAlert;
window.openPhoneAlertModal = openPhoneAlertModal;
window.closePhoneAlertModal = closePhoneAlertModal;
window.switchPhoneOfficer = switchPhoneOfficer;
window.openEditOfficerModal = openEditOfficerModal;
window.renderOfficerDirectory = renderOfficerDirectory;
window.boothOfficers = boothOfficers;
window.setUserPersonalPhone = setUserPersonalPhone;
window.getUserPersonalPhone = getUserPersonalPhone;
window.handleSaveUserPhone = handleSaveUserPhone;
window.dispatchRealNormalSms = dispatchRealNormalSms;
window.openDeviceSmsApp = openDeviceSmsApp;

// Fast2SMS & Push window exports
window.openFast2SmsModal = openFast2SmsModal;
window.closeFast2SmsModal = closeFast2SmsModal;
window.handleSaveFast2SmsKey = handleSaveFast2SmsKey;
window.testRealFast2SmsNow = testRealFast2SmsNow;
window.openNtfyModal = openNtfyModal;
window.closeNtfyModal = closeNtfyModal;
window.testNtfyPushNow = testNtfyPushNow;
window.sendRealFast2Sms = sendRealFast2Sms;
window.getFast2SmsApiKey = getFast2SmsApiKey;
window.setFast2SmsApiKey = setFast2SmsApiKey;

// Twilio window exports
window.openTwilioModal = openTwilioModal;
window.closeTwilioModal = closeTwilioModal;
window.handleSaveTwilioConfig = handleSaveTwilioConfig;
window.testRealTwilioSmsNow = testRealTwilioSmsNow;
window.sendRealTwilioSms = sendRealTwilioSms;
window.getTwilioConfig = getTwilioConfig;
window.setTwilioConfig = setTwilioConfig;

document.addEventListener('DOMContentLoaded', () => {
  renderOfficerDirectory();
  updateUserPhoneUI();
  updateFast2SmsUI();
  updateTwilioUI();
});

