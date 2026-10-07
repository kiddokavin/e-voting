// Cisco Packet Tracer Interactive Canvas Visualizer
// Two-Node Click Ping with Router0 Inter-VLAN Routing Simulation
let canvas, ctx;
let activePackets = [];
let pingSourceNode = null;
let pingTargetNode = null;

const topoNodes = [
  // Core Layer
  { id: 'router0', name: 'Router0', model: 'Cisco 2911 ISR Router', type: 'ROUTER', ip: '192.168.1.1', mask: '255.255.255.0', mac: '0001.C4A1.9001', x: 600, y: 40, icon: '🌐' },
  { id: 'mswitch0', name: 'Multilayer Switch0', model: 'Cisco Catalyst 3560-24PS (L3)', type: 'CORE_SWITCH', ip: '192.168.1.2', mask: '255.255.255.0', mac: '0002.4A9B.1102', x: 600, y: 130, icon: '🔀' },

  // Server Farm (Blue Zone - VLAN 10)
  { id: 'switch0', name: 'Switch0', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.10.1', mask: '255.255.255.0', mac: '00D0.BA11.0001', x: 260, y: 220, icon: '🎛️' },
  { id: 'db_server', name: 'Server0 (DB Server)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.12', mask: '255.255.255.0', mac: '0060.702B.DB01', x: 180, y: 310, icon: '🗄️' },
  { id: 'web_server', name: 'WEB Server', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.10', mask: '255.255.255.0', mac: '0060.702B.WEB1', x: 340, y: 310, icon: '🖥️' },
  { id: 'dns_server', name: 'DNS Server', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.11', mask: '255.255.255.0', mac: '0060.702B.DNS1', x: 180, y: 420, icon: '🌍' },
  { id: 'audit_server', name: 'Server3 (Audit)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.13', mask: '255.255.255.0', mac: '0060.702B.AUD3', x: 340, y: 420, icon: '📊' },
  { id: 'sec_server', name: 'Server4 (Security)', model: 'Cisco Server-PT', type: 'SERVER', ip: '192.168.10.14', mask: '255.255.255.0', mac: '0060.702B.SEC4', x: 260, y: 480, icon: '🛡️' },

  // Booth 1 (Red Zone - VLAN 20)
  { id: 'switch1', name: 'Switch1', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.20.1', mask: '255.255.255.0', mac: '00E0.8F11.0002', x: 490, y: 260, icon: '🎛️' },
  { id: 'pc0', name: 'PC0 (Booth 1)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.20.10', mask: '255.255.255.0', mac: '0001.42A3.PC01', x: 450, y: 400, icon: '💻' },
  { id: 'pc1', name: 'PC1 (Booth 1)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.20.11', mask: '255.255.255.0', mac: '0001.42A3.PC02', x: 530, y: 400, icon: '💻' },

  // Booth 2 (Green Zone - VLAN 30)
  { id: 'switch2', name: 'Switch2', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.30.1', mask: '255.255.255.0', mac: '00E0.8F11.0003', x: 670, y: 260, icon: '🎛️' },
  { id: 'pc2', name: 'PC2 (Booth 2)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.30.10', mask: '255.255.255.0', mac: '0001.42A3.PC03', x: 630, y: 400, icon: '💻' },
  { id: 'pc3', name: 'PC3 (Booth 2)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.30.11', mask: '255.255.255.0', mac: '0001.42A3.PC04', x: 710, y: 400, icon: '💻' },

  // Booth 3 (Pink Zone - VLAN 40)
  { id: 'switch3', name: 'Switch3', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.40.1', mask: '255.255.255.0', mac: '00E0.8F11.0004', x: 850, y: 260, icon: '🎛️' },
  { id: 'pc4', name: 'PC4 (Booth 3)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.40.10', mask: '255.255.255.0', mac: '0001.42A3.PC05', x: 810, y: 400, icon: '💻' },
  { id: 'pc5', name: 'PC5 (Booth 3)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.40.11', mask: '255.255.255.0', mac: '0001.42A3.PC06', x: 890, y: 400, icon: '💻' },

  // Admin Monitoring (Yellow Zone - VLAN 50)
  { id: 'switch4', name: 'Switch4', model: 'Cisco Catalyst 2960-24TT', type: 'SWITCH', ip: '192.168.50.1', mask: '255.255.255.0', mac: '00E0.8F11.0005', x: 1040, y: 260, icon: '🎛️' },
  { id: 'pc6', name: 'PC6 (Monitoring)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.10', mask: '255.255.255.0', mac: '0001.42A3.PC07', x: 990, y: 390, icon: '💻' },
  { id: 'pc7', name: 'PC7 (Monitoring)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.11', mask: '255.255.255.0', mac: '0001.42A3.PC08', x: 1040, y: 470, icon: '💻' },
  { id: 'pc8', name: 'PC8 (Officer PC)', model: 'Generic PC-PT', type: 'PC', ip: '192.168.50.12', mask: '255.255.255.0', mac: '0001.42A3.PC09', x: 1090, y: 390, icon: '💻' }
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

  // Canvas Click Handler: Click 2 Nodes to Ping via Router0
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clicked = topoNodes.find(n => {
      const dist = Math.hypot(n.x - clickX, n.y - clickY);
      return dist < 24;
    });

    if (clicked) {
      handleNodeClick(clicked);
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

function handleNodeClick(node) {
  // If no source is selected yet, or if both were selected, set as Source Node
  if (!pingSourceNode || (pingSourceNode && pingTargetNode)) {
    pingSourceNode = node;
    pingTargetNode = null;

    updateDetailBox(`
      <div style="color: #60a5fa; font-weight: bold;">
        📍 Source Node Selected: ${node.name} (${node.ip})
      </div>
      <div style="color: #f59e0b; margin-top: 0.2rem;">
        👉 Now click any SECOND node on the canvas to Ping via Router0 Gateway...
      </div>
    `);

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `Source: ${node.name}`;

    showAlert(`📍 Source Node '${node.name}' selected. Now click Target Node to Ping!`, 'info');
  } 
  // Second click: Target Node selected!
  else if (pingSourceNode && !pingTargetNode) {
    if (pingSourceNode.id === node.id) {
      showAlert('Please select a DIFFERENT target node to ping!', 'warning');
      return;
    }

    pingTargetNode = node;

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `Ping: ${pingSourceNode.name} ➔ ${pingTargetNode.name}`;

    // Execute Ping via Router0 Gateway
    executeRouterPing(pingSourceNode, pingTargetNode);
  }
}

function getSubnetSwitch(nodeId) {
  if (['pc0', 'pc1'].includes(nodeId)) return 'switch1';
  if (['pc2', 'pc3'].includes(nodeId)) return 'switch2';
  if (['pc4', 'pc5'].includes(nodeId)) return 'switch3';
  if (['pc6', 'pc7', 'pc8'].includes(nodeId)) return 'switch4';
  if (['db_server', 'web_server', 'dns_server', 'audit_server', 'sec_server'].includes(nodeId)) return 'switch0';
  if (nodeId.startsWith('switch')) return nodeId;
  return 'mswitch0';
}

function executeRouterPing(src, tgt) {
  const srcSwitch = getSubnetSwitch(src.id);
  const tgtSwitch = getSubnetSwitch(tgt.id);

  // Path from Source -> Switch -> Multilayer Switch -> Router0 -> Multilayer Switch -> Target Switch -> Target
  let requestPath = [src.id];
  if (srcSwitch !== src.id) requestPath.push(srcSwitch);
  requestPath.push('mswitch0', 'router0'); // Goes to Router0!
  if (tgtSwitch !== tgt.id) requestPath.push(tgtSwitch);
  requestPath.push(tgt.id);

  // Echo Reply Path back from Target -> Router0 -> Source
  let replyPath = [tgt.id];
  if (tgtSwitch !== tgt.id) replyPath.push(tgtSwitch);
  replyPath.push('mswitch0', 'router0');
  if (srcSwitch !== src.id) replyPath.push(srcSwitch);
  replyPath.push(src.id);

  // 1. Animate Request Packet (Blue Glow)
  animatePacketRoute(requestPath, '#3b82f6');

  // 2. Animate Reply Packet (Green Glow) after request arrives
  setTimeout(() => {
    animatePacketRoute(replyPath, '#10b981');
  }, requestPath.length * 300);

  // Update Hop Tracer Inspector Box
  updateDetailBox(`
    <div style="color: #10b981; font-weight: bold; margin-bottom: 0.4rem;">
      📡 ICMP Echo Ping Transmitted: ${src.name} (${src.ip}) ➔ ${tgt.name} (${tgt.ip})
    </div>
    <div style="margin-bottom: 0.3rem;">
      <strong>1. ICMP Request Path (via Gateway Router0):</strong>
      <div style="color: #60a5fa; font-size: 0.8rem; margin-top: 0.2rem;">
        ${requestPath.map(id => { const n = topoNodes.find(item => item.id === id); return n ? n.name : id; }).join(' ➔ ')}
      </div>
    </div>
    <div>
      <strong>2. ICMP Reply Path (via Gateway Router0):</strong>
      <div style="color: #34d399; font-size: 0.8rem; margin-top: 0.2rem;">
        ${replyPath.map(id => { const n = topoNodes.find(item => item.id === id); return n ? n.name : id; }).join(' ➔ ')}
      </div>
    </div>
    <div style="color: #9ca3af; font-size: 0.78rem; margin-top: 0.4rem;">
      Status: 4 Packets Sent, 4 Received (0% Loss) | Round Trip Time: 2ms | Core Gateway Router0 (.1.1) Active
    </div>
  `);

  showAlert(`📡 Ping Packet traveling from ${src.name} ➔ Router0 Gateway ➔ ${tgt.name}!`, 'success');
}

function resetPingSelection() {
  pingSourceNode = null;
  pingTargetNode = null;
  drawTopology();

  const badge = document.getElementById('topoSelectedNodeBadge');
  if (badge) badge.textContent = 'Selection Cleared';

  updateDetailBox(`
    <div>Click any node on the canvas to set as <strong>Source Node</strong>, then click a second node to <strong>Ping via Router0 Gateway</strong>!</div>
  `);
}

function updateDetailBox(html) {
  const box = document.getElementById('nodeDetailBox');
  if (box) box.innerHTML = html;
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

  // Link Cables with LEDs
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

    drawLinkLed(fromNode.x, fromNode.y, toNode.x, toNode.y);
  });

  // Device Nodes
  topoNodes.forEach(node => {
    const isSource = pingSourceNode && pingSourceNode.id === node.id;
    const isTarget = pingTargetNode && pingTargetNode.id === node.id;

    // Glowing Ring for Source Selection (Blue)
    if (isSource) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Glowing Ring for Target Selection (Green)
    if (isTarget) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Node Base Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isSource ? '#60a5fa' : (isTarget ? '#34d399' : '#475569');
    ctx.lineWidth = 2;
    ctx.stroke();

    // Device Icon
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y);

    // Device Name Label
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = isSource ? '#60a5fa' : (isTarget ? '#34d399' : '#e2e8f0');
    ctx.fillText(node.name, node.x, node.y + 32);

    // IP Label
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

function drawLinkLed(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  ctx.beginPath();
  ctx.arc(midX, midY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1;
  ctx.stroke();
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

function triggerDemoPacket() {
  executeRouterPing(topoNodes.find(n => n.id === 'pc0'), topoNodes.find(n => n.id === 'web_server'));
}

function triggerPingTest() {
  executeRouterPing(topoNodes.find(n => n.id === 'pc8'), topoNodes.find(n => n.id === 'router0'));
}
