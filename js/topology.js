// Cisco Packet Tracer Canvas Visualizer
let canvas, ctx;
let activePackets = [];
let selectedNode = null;

const topoNodes = [
  // Core
  { id: 'router0', name: 'Router0', type: 'ROUTER', ip: '192.168.1.1', x: 600, y: 40, icon: '🌐' },
  { id: 'mswitch0', name: 'Multilayer Switch0', type: 'CORE_SWITCH', ip: '192.168.1.2', x: 600, y: 130, icon: '🔀' },

  // Server Farm (Blue Zone)
  { id: 'switch0', name: 'Switch0', type: 'SWITCH', ip: '192.168.10.1', x: 260, y: 220, icon: '🎛️' },
  { id: 'db_server', name: 'Server0 (DB Server)', type: 'SERVER', ip: '192.168.10.12', x: 180, y: 310, icon: '🗄️' },
  { id: 'web_server', name: 'WEB Server', type: 'SERVER', ip: '192.168.10.10', x: 340, y: 310, icon: '🖥️' },
  { id: 'dns_server', name: 'DNS Server', type: 'SERVER', ip: '192.168.10.11', x: 180, y: 420, icon: '🌍' },
  { id: 'audit_server', name: 'Server3 (Audit)', type: 'SERVER', ip: '192.168.10.13', x: 340, y: 420, icon: '📊' },
  { id: 'sec_server', name: 'Server4 (Security)', type: 'SERVER', ip: '192.168.10.14', x: 260, y: 480, icon: '🛡️' },

  // Booth 1 (Red Zone)
  { id: 'switch1', name: 'Switch1', type: 'SWITCH', ip: '192.168.20.1', x: 490, y: 260, icon: '🎛️' },
  { id: 'pc0', name: 'PC0', type: 'PC', ip: '192.168.20.10', x: 450, y: 400, icon: '💻' },
  { id: 'pc1', name: 'PC1', type: 'PC', ip: '192.168.20.11', x: 530, y: 400, icon: '💻' },

  // Booth 2 (Green Zone)
  { id: 'switch2', name: 'Switch2', type: 'SWITCH', ip: '192.168.30.1', x: 670, y: 260, icon: '🎛️' },
  { id: 'pc2', name: 'PC2', type: 'PC', ip: '192.168.30.10', x: 630, y: 400, icon: '💻' },
  { id: 'pc3', name: 'PC3', type: 'PC', ip: '192.168.30.11', x: 710, y: 400, icon: '💻' },

  // Booth 3 (Pink Zone)
  { id: 'switch3', name: 'Switch3', type: 'SWITCH', ip: '192.168.40.1', x: 850, y: 260, icon: '🎛️' },
  { id: 'pc4', name: 'PC4', type: 'PC', ip: '192.168.40.10', x: 810, y: 400, icon: '💻' },
  { id: 'pc5', name: 'PC5', type: 'PC', ip: '192.168.40.11', x: 890, y: 400, icon: '💻' },

  // Admin Monitoring (Yellow Zone)
  { id: 'switch4', name: 'Switch4', type: 'SWITCH', ip: '192.168.50.1', x: 1040, y: 260, icon: '🎛️' },
  { id: 'pc6', name: 'PC6', type: 'PC', ip: '192.168.50.10', x: 990, y: 390, icon: '💻' },
  { id: 'pc7', name: 'PC7', type: 'PC', ip: '192.168.50.11', x: 1040, y: 470, icon: '💻' },
  { id: 'pc8', name: 'PC8', type: 'PC', ip: '192.168.50.12', x: 1090, y: 390, icon: '💻' }
];

const topoLinks = [
  // Core connections
  { from: 'router0', to: 'mswitch0' },
  { from: 'mswitch0', to: 'switch0' },
  { from: 'mswitch0', to: 'switch1' },
  { from: 'mswitch0', to: 'switch2' },
  { from: 'mswitch0', to: 'switch3' },
  { from: 'mswitch0', to: 'switch4' },

  // Server Farm connections
  { from: 'switch0', to: 'db_server' },
  { from: 'switch0', to: 'web_server' },
  { from: 'switch0', to: 'dns_server' },
  { from: 'switch0', to: 'audit_server' },
  { from: 'switch0', to: 'sec_server' },

  // Booth 1 connections
  { from: 'switch1', to: 'pc0' },
  { from: 'switch1', to: 'pc1' },
  { from: 'switch1', to: 'switch2' },

  // Booth 2 connections
  { from: 'switch2', to: 'pc2' },
  { from: 'switch2', to: 'pc3' },

  // Booth 3 connections
  { from: 'switch3', to: 'pc4' },
  { from: 'switch3', to: 'pc5' },

  // Admin connections
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

  // Canvas Click Handler
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
      showNodeDetails(clicked);
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

  // Subnet Background Boxes
  drawZoneBox(130, 180, 260, 340, 'rgba(59, 130, 246, 0.12)', '#3b82f6', 'SERVER FARM (VLAN 10)');
  drawZoneBox(415, 230, 150, 250, 'rgba(239, 68, 68, 0.12)', '#ef4444', 'BOOTH 1 (VLAN 20)');
  drawZoneBox(595, 230, 150, 250, 'rgba(16, 185, 129, 0.12)', '#10b981', 'BOOTH 2 (VLAN 30)');
  drawZoneBox(775, 230, 150, 250, 'rgba(236, 72, 153, 0.12)', '#ec4899', 'BOOTH 3 (VLAN 40)');
  drawZoneBox(955, 230, 175, 280, 'rgba(245, 158, 11, 0.12)', '#f59e0b', 'ADMIN MONITORING (VLAN 50)');

  // Link Cables
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

    drawLinkTriangle(fromNode.x, fromNode.y, toNode.x, toNode.y);
  });

  // Device Nodes
  topoNodes.forEach(node => {
    const isSelected = selectedNode && selectedNode.id === node.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#60a5fa' : '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = isSelected ? '#60a5fa' : '#e2e8f0';
    ctx.fillText(node.name, node.x, node.y + 32);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(node.ip, node.x, node.y + 44);
  });

  // Animated Packets
  activePackets.forEach(pkt => {
    ctx.beginPath();
    ctx.arc(pkt.currentX, pkt.currentY, 6, 0, Math.PI * 2);
    ctx.fillStyle = pkt.color || '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

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

function drawLinkTriangle(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  ctx.beginPath();
  ctx.arc(midX, midY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
}

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

function showNodeDetails(node) {
  const box = document.getElementById('nodeDetailBox');
  if (!box) return;

  box.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem;">
      <div><strong>Device Name:</strong> ${node.name}</div>
      <div><strong>Device Type:</strong> ${node.type}</div>
      <div><strong>IP Address:</strong> ${node.ip}</div>
      <div><strong>Subnet Mask:</strong> 255.255.255.0</div>
      <div><strong>Default Gateway:</strong> 192.168.1.1</div>
      <div><strong>Status:</strong> <span style="color:#10b981; font-weight:bold;">ONLINE</span></div>
    </div>
  `;
}

function triggerDemoPacket() {
  animatePacketRoute(['pc0', 'switch1', 'mswitch0', 'switch0', 'web_server', 'sec_server', 'db_server', 'audit_server'], '#3b82f6');
  showAlert('🚀 Simulated Vote Packet traveling from PC0 across Subnet 192.168.20.0 to Server Farm!', 'info');
}

function triggerPingTest() {
  animatePacketRoute(['pc8', 'switch4', 'mswitch0', 'router0'], '#f59e0b');
  showAlert('📡 ICMP Echo Ping sent from Monitoring PC8 to Router0 Gateway.', 'success');
}
