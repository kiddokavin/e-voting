// Cisco Packet Tracer Canvas Visualizer & Device Inspector
let canvas, ctx;
let activePackets = [];
let selectedNode = null;

const topoNodes = [
  // Core Layer
  { 
    id: 'router0', name: 'Router0', model: 'Cisco 2911 ISR Router', type: 'ROUTER', ip: '192.168.1.1', mask: '255.255.255.0', mac: '0001.C4A1.9001', x: 600, y: 40, icon: '🌐',
    ports: [{ name: 'GigabitEthernet0/0', status: 'UP', speed: '1000 Mbps', ip: '192.168.1.1' }, { name: 'GigabitEthernet0/1', status: 'UP', speed: '1000 Mbps', ip: '192.168.10.1' }]
  },
  { 
    id: 'mswitch0', name: 'Multilayer Switch0', model: 'Cisco Catalyst 3560-24PS (L3)', type: 'CORE_SWITCH', ip: '192.168.1.2', mask: '255.255.255.0', mac: '0002.4A9B.1102', x: 600, y: 130, icon: '🔀',
    ports: [{ name: 'Gig0/1 (VLAN 10)', status: 'UP', speed: '1000 Mbps' }, { name: 'Gig0/2 (VLAN 20)', status: 'UP', speed: '1000 Mbps' }, { name: 'Gig0/3 (VLAN 30)', status: 'UP', speed: '1000 Mbps' }, { name: 'Gig0/4 (VLAN 40)', status: 'UP', speed: '1000 Mbps' }, { name: 'Gig0/5 (VLAN 50)', status: 'UP', speed: '1000 Mbps' }]
  },

  // Server Farm (Blue Zone - VLAN 10)
  { 
    id: 'switch0', name: 'Switch0', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.10.1', mask: '255.255.255.0', mac: '00D0.BA11.0001', x: 260, y: 220, icon: '🎛️',
    ports: [{ name: 'Fa0/1 (Trunk)', status: 'UP' }, { name: 'Fa0/2 (WEB Server)', status: 'UP' }, { name: 'Fa0/3 (DNS Server)', status: 'UP' }, { name: 'Fa0/4 (DB Server0)', status: 'UP' }, { name: 'Fa0/5 (Audit Server3)', status: 'UP' }, { name: 'Fa0/6 (Security Server4)', status: 'UP' }]
  },
  { id: 'db_server', name: 'Server0 (DB Server)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.12', mask: '255.255.255.0', mac: '0060.702B.DB01', x: 180, y: 310, icon: '🗄️', role: 'Encrypted Vote Database & Immutable Ledger' },
  { id: 'web_server', name: 'WEB Server', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.10', mask: '255.255.255.0', mac: '0060.702B.WEB1', x: 340, y: 310, icon: '🖥️', role: 'E-Voting Web Portal & REST API' },
  { id: 'dns_server', name: 'DNS Server', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.11', mask: '255.255.255.0', mac: '0060.702B.DNS1', x: 180, y: 420, icon: '🌍', role: 'Domain Resolution (evoting.gov.in)' },
  { id: 'audit_server', name: 'Server3 (Audit)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.13', mask: '255.255.255.0', mac: '0060.702B.AUD3', x: 340, y: 420, icon: '📊', role: 'Centralized Security IDS & Audit Logger' },
  { id: 'sec_server', name: 'Server4 (Security)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.14', mask: '255.255.255.0', mac: '0060.702B.SEC4', x: 260, y: 480, icon: '🛡️', role: 'SSL/TLS Certificate Authority & SHA-256 Signer' },

  // Booth 1 (Red Zone - VLAN 20)
  { id: 'switch1', name: 'Switch1', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.20.1', mask: '255.255.255.0', mac: '00E0.8F11.0002', x: 490, y: 260, icon: '🎛️' },
  { id: 'pc0', name: 'PC0 (Booth 1)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.20.10', mask: '255.255.255.0', mac: '0001.42A3.PC01', x: 450, y: 400, icon: '💻', role: 'Polling Booth 1 Voting Terminal A' },
  { id: 'pc1', name: 'PC1 (Booth 1)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.20.11', mask: '255.255.255.0', mac: '0001.42A3.PC02', x: 530, y: 400, icon: '💻', role: 'Polling Booth 1 Voting Terminal B' },

  // Booth 2 (Green Zone - VLAN 30)
  { id: 'switch2', name: 'Switch2', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.30.1', mask: '255.255.255.0', mac: '00E0.8F11.0003', x: 670, y: 260, icon: '🎛️' },
  { id: 'pc2', name: 'PC2 (Booth 2)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.30.10', mask: '255.255.255.0', mac: '0001.42A3.PC03', x: 630, y: 400, icon: '💻', role: 'Polling Booth 2 Voting Terminal A' },
  { id: 'pc3', name: 'PC3 (Booth 2)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.30.11', mask: '255.255.255.0', mac: '0001.42A3.PC04', x: 710, y: 400, icon: '💻', role: 'Polling Booth 2 Voting Terminal B' },

  // Booth 3 (Pink Zone - VLAN 40)
  { id: 'switch3', name: 'Switch3', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.40.1', mask: '255.255.255.0', mac: '00E0.8F11.0004', x: 850, y: 260, icon: '🎛️' },
  { id: 'pc4', name: 'PC4 (Booth 3)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.40.10', mask: '255.255.255.0', mac: '0001.42A3.PC05', x: 810, y: 400, icon: '💻', role: 'Polling Booth 3 Voting Terminal A' },
  { id: 'pc5', name: 'PC5 (Booth 3)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.40.11', mask: '255.255.255.0', mac: '0001.42A3.PC06', x: 890, y: 400, icon: '💻', role: 'Polling Booth 3 Voting Terminal B' },

  // Admin Monitoring (Yellow Zone - VLAN 50)
  { id: 'switch4', name: 'Switch4', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.50.1', mask: '255.255.255.0', mac: '00E0.8F11.0005', x: 1040, y: 260, icon: '🎛️' },
  { id: 'pc6', name: 'PC6 (Monitoring)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.10', mask: '255.255.255.0', mac: '0001.42A3.PC07', x: 990, y: 390, icon: '💻', role: 'Central Monitoring Terminal 1' },
  { id: 'pc7', name: 'PC7 (Monitoring)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.11', mask: '255.255.255.0', mac: '0001.42A3.PC08', x: 1040, y: 470, icon: '💻', role: 'Central Monitoring Terminal 2' },
  { id: 'pc8', name: 'PC8 (Officer PC)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.12', mask: '255.255.255.0', mac: '0001.42A3.PC09', x: 1090, y: 390, icon: '💻', role: 'Election Commission Admin Control PC' }
];

const topoLinks = [
  // Core Layer Links
  { from: 'router0', to: 'mswitch0' },
  { from: 'mswitch0', to: 'switch0' },
  { from: 'mswitch0', to: 'switch1' },
  { from: 'mswitch0', to: 'switch2' },
  { from: 'mswitch0', to: 'switch3' },
  { from: 'mswitch0', to: 'switch4' },

  // Server Farm Links
  { from: 'switch0', to: 'db_server' },
  { from: 'switch0', to: 'web_server' },
  { from: 'switch0', to: 'dns_server' },
  { from: 'switch0', to: 'audit_server' },
  { from: 'switch0', to: 'sec_server' },

  // Booth 1 Links
  { from: 'switch1', to: 'pc0' },
  { from: 'switch1', to: 'pc1' },
  { from: 'switch1', to: 'switch2' },

  // Booth 2 Links
  { from: 'switch2', to: 'pc2' },
  { from: 'switch2', to: 'pc3' },

  // Booth 3 Links
  { from: 'switch3', to: 'pc4' },
  { from: 'switch3', to: 'pc5' },

  // Admin Links
  { from: 'switch4', to: 'pc6' },
  { from: 'switch4', to: 'pc7' },
  { from: 'switch4', to: 'pc8' }
];

function initTopologyCanvas() {
  canvas = document.getElementById('topologyCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawTopology();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Canvas Click Handler: Node Inspector
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clicked = topoNodes.find(n => {
      const dist = Math.hypot(n.x - clickX, n.y - clickY);
      return dist < 24;
    });

    if (clicked) {
      selectedNode = clicked;
      showCiscoInspector(clicked);
      drawTopology();
    }
  });

  function animLoop() {
    updatePackets();
    drawTopology();
    requestAnimationFrame(animLoop);
  }
  requestAnimationFrame(animLoop);
}

function drawTopology() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subnet Background Boxes (matching Packet Tracer colors)
  drawZoneBox(130, 180, 260, 340, 'rgba(59, 130, 246, 0.12)', '#3b82f6', 'SERVER FARM (VLAN 10)');
  drawZoneBox(415, 230, 150, 250, 'rgba(239, 68, 68, 0.12)', '#ef4444', 'BOOTH 1 (VLAN 20)');
  drawZoneBox(595, 230, 150, 250, 'rgba(16, 185, 129, 0.12)', '#10b981', 'BOOTH 2 (VLAN 30)');
  drawZoneBox(775, 230, 150, 250, 'rgba(236, 72, 153, 0.12)', '#ec4899', 'BOOTH 3 (VLAN 40)');
  drawZoneBox(955, 230, 175, 280, 'rgba(245, 158, 11, 0.12)', '#f59e0b', 'ADMIN MONITORING (VLAN 50)');

  // Draw Link Cables with Link LEDs
  topoLinks.forEach(link => {
    const fromNode = topoNodes.find(n => n.id === link.from);
    const toNode = topoNodes.find(n => n.id === link.to);
    if (!fromNode || !toNode) return;

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    if (link.from === 'switch1' && link.to === 'switch2') {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#f59e0b';
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Green Cable Interface LEDs (Cisco Packet Tracer style)
    drawLinkLed(fromNode.x, fromNode.y, toNode.x, toNode.y);
  });

  // Draw Device Nodes
  topoNodes.forEach(node => {
    const isSelected = selectedNode && selectedNode.id === node.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Outer Circle Icon Background
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#60a5fa' : '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Device Icon
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y);

    // Device Name Label
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = isSelected ? '#60a5fa' : '#e2e8f0';
    ctx.fillText(node.name, node.x, node.y + 32);

    // IP Address Label
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(node.ip, node.x, node.y + 44);
  });

  // Draw Animated Packets
  activePackets.forEach(pkt => {
    ctx.beginPath();
    ctx.arc(pkt.currentX, pkt.currentY, 6, 0, Math.PI * 2);
    ctx.fillStyle = pkt.color || '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pulse Ring
    ctx.beginPath();
    ctx.arc(pkt.currentX, pkt.currentY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = pkt.color || 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawZoneBox(x, y, w, h, bg, border, label) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = border;
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 10, y + 20);
}

function drawLinkLed(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  ctx.beginPath();
  ctx.arc(midX, midY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981'; // Green Link LED
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Packet Animation Engine
function animatePacketRoute(nodePath, color = '#10b981') {
  for (let i = 0; i < nodePath.length - 1; i++) {
    const fromId = nodePath[i];
    const toId = nodePath[i + 1];

    const fromNode = topoNodes.find(n => n.id === fromId || n.ip === fromId);
    const toNode = topoNodes.find(n => n.id === toId || n.ip === toId);

    if (fromNode && toNode) {
      setTimeout(() => {
        activePackets.push({
          startX: fromNode.x,
          startY: fromNode.y,
          endX: toNode.x,
          endY: toNode.y,
          currentX: fromNode.x,
          currentY: fromNode.y,
          progress: 0,
          speed: 0.04,
          color: color
        });
      }, i * 300);
    }
  }
}

function updatePackets() {
  for (let i = activePackets.length - 1; i >= 0; i--) {
    const pkt = activePackets[i];
    pkt.progress += pkt.speed;
    pkt.currentX = pkt.startX + (pkt.endX - pkt.startX) * pkt.progress;
    pkt.currentY = pkt.startY + (pkt.endY - pkt.startY) * pkt.progress;

    if (pkt.progress >= 1) {
      activePackets.splice(i, 1);
    }
  }
}

// Cisco Device Inspection Dialog
function showCiscoInspector(node) {
  const modal = document.getElementById('ciscoInspectorModal');
  const icon = document.getElementById('ciscoDeviceIcon');
  const title = document.getElementById('ciscoDeviceTitle');
  const body = document.getElementById('ciscoDeviceBody');

  const badgeEl = document.getElementById('topoSelectedNodeBadge');
  if (badgeEl) badgeEl.textContent = `Selected: ${node.name} (${node.ip})`;

  // Also update lower inline box
  const box = document.getElementById('nodeDetailBox');
  if (box) {
    box.innerHTML = `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <div><strong>Selected Node:</strong> <span style="color:#60a5fa;">${node.name}</span></div>
        <div><strong>Device Model:</strong> ${node.model || 'Generic Cisco Node'}</div>
        <div><strong>IP Address:</strong> <code>${node.ip}</code></div>
        <div><strong>MAC Address:</strong> <code>${node.mac || '0001.42A3.8F01'}</code></div>
        <div><strong>Link Status:</strong> <span style="color:#10b981; font-weight:bold;">CONNECTED (1000Mbps)</span></div>
      </div>
    `;
  }

  if (!modal || !body) return;

  icon.textContent = node.icon;
  title.textContent = `${node.name} Configuration & Interface Inspector`;

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem;">
        <div><strong>Hardware Model:</strong> ${node.model || 'Cisco Device'}</div>
        <div><strong>Device Role:</strong> ${node.role || node.type}</div>
        <div><strong>IP Address:</strong> <code style="color:#60a5fa;">${node.ip}</code></div>
        <div><strong>Subnet Mask:</strong> <code>${node.mask || '255.255.255.0'}</code></div>
        <div><strong>Default Gateway:</strong> <code>192.168.1.1</code></div>
        <div><strong>MAC Address:</strong> <code>${node.mac || '0001.C4A1.9001'}</code></div>
      </div>

      <div>
        <h4 style="margin-bottom: 0.5rem; color:#60a5fa;">🔌 Interface Port Status Table</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Port Name</th>
                <th>Status</th>
                <th>Speed / Duplex</th>
                <th>Configured IP</th>
              </tr>
            </thead>
            <tbody>
              ${(node.ports || [
                { name: 'FastEthernet0/1', status: 'UP', speed: '100 Mbps / Full', ip: node.ip },
                { name: 'GigabitEthernet0/1', status: 'UP', speed: '1000 Mbps / Full', ip: '192.168.1.1' }
              ]).map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td><span class="badge badge-success">● ${p.status}</span></td>
                  <td>${p.speed || '1000 Mbps / Full'}</td>
                  <td><code>${p.ip || node.ip}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
        <button class="btn-primary" style="width: auto; padding: 0.5rem 1.2rem;" onclick="pingFromInspector('${node.id}')">
          <span>📡</span> Test Ping from ${node.name}
        </button>
        <button class="btn-primary" style="width: auto; background: #4b5563;" onclick="closeCiscoInspector()">
          Close
        </button>
      </div>
    </div>
  `;

  modal.classList.add('show');
}

function closeCiscoInspector() {
  const modal = document.getElementById('ciscoInspectorModal');
  if (modal) modal.classList.remove('show');
}

function pingFromInspector(sourceId) {
  closeCiscoInspector();
  animatePacketRoute([sourceId, 'mswitch0', 'switch0', 'web_server'], '#3b82f6');
  const sourceNode = topoNodes.find(n => n.id === sourceId);
  showAlert(`📡 ICMP Echo Ping initiated from ${sourceNode ? sourceNode.name : sourceId} to WEB Server (.10.10)!`, 'success');
}

// Custom Interactive Packet Generator
function sendCustomPacket() {
  const srcId = document.getElementById('packetSourceSelect').value;
  const tgtId = document.getElementById('packetTargetSelect').value;

  const srcNode = topoNodes.find(n => n.id === srcId);
  const tgtNode = topoNodes.find(n => n.id === tgtId);

  if (!srcNode || !tgtNode) return;

  // Determine path
  let switchNode = 'switch1';
  if (srcId === 'pc2' || srcId === 'pc3') switchNode = 'switch2';
  else if (srcId === 'pc4' || srcId === 'pc5') switchNode = 'switch3';
  else if (srcId === 'pc6' || srcId === 'pc7' || srcId === 'pc8') switchNode = 'switch4';

  let path = [srcId, switchNode, 'mswitch0'];

  if (tgtId === 'router0') {
    path.push('router0');
  } else {
    path.push('switch0', tgtId);
  }

  // Trigger Packet Glow Animation
  animatePacketRoute(path, '#3b82f6');

  // Display Hop Tracer output
  const box = document.getElementById('nodeDetailBox');
  if (box) {
    box.innerHTML = `
      <div style="color: #10b981; font-weight: bold; margin-bottom: 0.4rem;">
        🚀 ICMP Echo Request Packet Sent: ${srcNode.name} (${srcNode.ip}) ➔ ${tgtNode.name} (${tgtNode.ip})
      </div>
      <div><strong>Packet Path Hops:</strong> ${path.map(id => {
        const n = topoNodes.find(node => node.id === id);
        return n ? n.name : id;
      }).join(' ➔ ')}</div>
      <div style="color: #9ca3af; font-size: 0.78rem; margin-top: 0.3rem;">
        Status: ICMP Echo Reply Received | RTT = 2ms | TTL = 64 | Packet Loss = 0%
      </div>
    `;
  }

  showAlert(`🚀 ICMP Packet transmitted from ${srcNode.name} to ${tgtNode.name}!`, 'success');
}

function triggerDemoPacket() {
  sendCustomPacket();
}

function triggerPingTest() {
  animatePacketRoute(['pc8', 'switch4', 'mswitch0', 'router0'], '#f59e0b');
  showAlert('📡 ICMP Echo Ping sent from Monitoring PC8 to Router0 Gateway.', 'success');
}
