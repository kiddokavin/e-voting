// Cisco Packet Tracer Interactive Canvas Visualizer
// Ultra-Fast Packet Animation & Instant 2-Node Router0 Ping Simulation
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

function resizeCanvas() {
  if (!canvas) return;
  const parent = canvas.parentElement;
  const w = (parent && parent.clientWidth) ? parent.clientWidth : 1200;
  const h = (parent && parent.clientHeight) ? parent.clientHeight : 580;
  canvas.width = w > 200 ? w : 1200;
  canvas.height = h > 200 ? h : 580;
  drawTopology();
}

const ciscoDevices = [
  { id: 'router0', name: 'Router0', ip: '192.168.1.1', type: 'ROUTER', left: '49.8%', top: '15.5%', model: 'Cisco 2911 ISR Router' },
  { id: 'mswitch0', name: 'Multilayer Switch0', ip: '192.168.1.2', type: 'CORE_SWITCH', left: '49.8%', top: '24.5%', model: 'Cisco Catalyst 3560-24PS' },
  { id: 'switch0', name: 'Switch0', ip: '192.168.10.1', type: 'SWITCH', left: '27.4%', top: '35.5%', model: 'Cisco Catalyst 2960-24TT' },
  { id: 'db_server', name: 'Server0', ip: '192.168.10.12', type: 'SERVER', left: '21.5%', top: '53%', model: 'Cisco Server-PT' },
  { id: 'web_server', name: 'Server1', ip: '192.168.10.10', type: 'SERVER', left: '33.2%', top: '53%', model: 'Cisco Server-PT' },
  { id: 'dns_server', name: 'Server2', ip: '192.168.10.11', type: 'SERVER', left: '21.5%', top: '68%', model: 'Cisco Server-PT' },
  { id: 'audit_server', name: 'Server3', ip: '192.168.10.13', type: 'SERVER', left: '33.2%', top: '68%', model: 'Cisco Server-PT' },
  { id: 'sec_server', name: 'Server4', ip: '192.168.10.14', type: 'SERVER', left: '27.4%', top: '78%', model: 'Cisco Server-PT' },
  { id: 'switch1', name: 'Switch1', ip: '192.168.20.1', type: 'SWITCH', left: '45.1%', top: '37%', model: 'Cisco Catalyst 2960-24TT' },
  { id: 'pc0', name: 'PC0', ip: '192.168.20.10', type: 'PC', left: '42.2%', top: '64%', model: 'Generic PC-PT' },
  { id: 'pc1', name: 'PC1', ip: '192.168.20.11', type: 'PC', left: '48.1%', top: '64%', model: 'Generic PC-PT' },
  { id: 'switch2', name: 'Switch2', ip: '192.168.30.1', type: 'SWITCH', left: '57.1%', top: '37%', model: 'Cisco Catalyst 2960-24TT' },
  { id: 'pc2', name: 'PC2', ip: '192.168.30.10', type: 'PC', left: '54.6%', top: '64%', model: 'Generic PC-PT' },
  { id: 'pc3', name: 'PC3', ip: '192.168.30.11', type: 'PC', left: '59.6%', top: '64%', model: 'Generic PC-PT' },
  { id: 'switch3', name: 'Switch3', ip: '192.168.40.1', type: 'SWITCH', left: '69.1%', top: '37%', model: 'Cisco Catalyst 2960-24TT' },
  { id: 'pc4', name: 'PC4', ip: '192.168.40.10', type: 'PC', left: '66.6%', top: '64%', model: 'Generic PC-PT' },
  { id: 'pc5', name: 'PC5', ip: '192.168.40.11', type: 'PC', left: '71.6%', top: '64%', model: 'Generic PC-PT' },
  { id: 'switch4', name: 'Switch4', ip: '192.168.50.1', type: 'SWITCH', left: '81.1%', top: '37%', model: 'Cisco Catalyst 2960-24TT' },
  { id: 'pc6', name: 'PC6', ip: '192.168.50.10', type: 'PC', left: '76.8%', top: '64%', model: 'Generic PC-PT' },
  { id: 'pc7', name: 'PC7', ip: '192.168.50.11', type: 'PC', left: '81.1%', top: '75%', model: 'Generic PC-PT' },
  { id: 'pc8', name: 'PC8', ip: '192.168.50.12', type: 'PC', left: '85.4%', top: '64%', model: 'Generic PC-PT' }
];

let hotspotSource = null;
let hotspotTarget = null;

function initCiscoHotspots() {
  const container = document.getElementById('ciscoHotspotsContainer');
  if (!container) return;
  container.innerHTML = '';

  ciscoDevices.forEach(dev => {
    const btn = document.createElement('div');
    btn.className = 'cisco-hotspot';
    btn.style.left = dev.left;
    btn.style.top = dev.top;
    btn.title = `${dev.name} (${dev.ip})\nModel: ${dev.model}\nClick to Select for Cisco Ping!`;
    btn.dataset.id = dev.id;

    btn.onclick = (e) => {
      e.stopPropagation();
      handleHotspotClick(dev);
    };

    container.appendChild(btn);
  });
}

function handleHotspotClick(dev) {
  if (!hotspotSource || (hotspotSource && hotspotTarget)) {
    hotspotSource = dev;
    hotspotTarget = null;

    document.querySelectorAll('.cisco-hotspot').forEach(el => {
      el.classList.remove('selected-src', 'selected-tgt');
      if (el.dataset.id === dev.id) el.classList.add('selected-src');
    });

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `📍 Source: ${dev.name}`;

    updateDetailBox(`
      <div style="color: #60a5fa; font-weight: bold;">
        📍 SOURCE SELECTED ON DIAGRAM: ${dev.name} (${dev.ip})
      </div>
      <div style="color: #f59e0b; margin-top: 4px;">
        👉 Now click any 2nd Target Device on the Cisco diagram to simulate ICMP Ping...
      </div>
    `);

    showAlert(`📍 Source '${dev.name}' selected on Cisco diagram! Now click target device...`, 'info');
  } else if (hotspotSource && !hotspotTarget) {
    if (hotspotSource.id === dev.id) {
      showAlert('Please select a DIFFERENT target device on the diagram!', 'warning');
      return;
    }

    hotspotTarget = dev;

    document.querySelectorAll('.cisco-hotspot').forEach(el => {
      if (el.dataset.id === dev.id) el.classList.add('selected-tgt');
    });

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `Ping: ${hotspotSource.name} ➔ ${hotspotTarget.name}`;

    executeRouterPing(hotspotSource.name, hotspotTarget.name, false);
  }
}

function initTopologyCanvas() {
  canvas = document.getElementById('topologyCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Canvas Click Handler: Instant 2-Node Selection
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clicked = topoNodes.find(n => {
      const dist = Math.hypot(n.x - clickX, n.y - clickY);
      return dist < 28;
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
  if (!pingSourceNode || (pingSourceNode && pingTargetNode)) {
    pingSourceNode = node;
    pingTargetNode = null;

    updateDetailBox(`
      <div style="color: #60a5fa; font-weight: bold;">
        📍 Source Selected: ${node.name} (${node.ip})
      </div>
      <div style="color: #f59e0b; margin-top: 0.2rem;">
        👉 Now click 2nd Target Node to Ping instantly...
      </div>
    `);

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `Source: ${node.name}`;

    showAlert(`📍 Source '${node.name}' selected. Click target node!`, 'info');
  } 
  else if (pingSourceNode && !pingTargetNode) {
    if (pingSourceNode.id === node.id) {
      showAlert('Please select a DIFFERENT target node!', 'warning');
      return;
    }

    pingTargetNode = node;

    const badge = document.getElementById('topoSelectedNodeBadge');
    if (badge) badge.textContent = `Ping: ${pingSourceNode.name} ➔ ${pingTargetNode.name}`;

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

let pduCounter = 5;

function clearCiscoPduTable() {
  const tbody = document.getElementById('ciscoSimulationTable');
  if (tbody) tbody.innerHTML = '';
  if (typeof showAlert === 'function') showAlert('Cisco PDU Simulation Window Cleared.', 'info');
}

function sendCustomPacket() {
  const srcId = document.getElementById('packetSourceSelect').value;
  const tgtId = document.getElementById('packetTargetSelect').value;

  const srcNode = topoNodes.find(n => n.id.toLowerCase() === srcId.toLowerCase() || n.name.toLowerCase().includes(srcId.toLowerCase()));
  const tgtNode = topoNodes.find(n => n.id.toLowerCase() === tgtId.toLowerCase() || n.name.toLowerCase().includes(tgtId.toLowerCase()) || n.ip === tgtId);

  const isFailed = tgtId.includes('192.168.99.250');
  executeRouterPing(srcNode || srcId, tgtNode || tgtId, isFailed);
}

function triggerTestPingSuccess() {
  const srcNode = topoNodes.find(n => n.id === 'pc0');
  const tgtNode = topoNodes.find(n => n.id === 'sec_server');
  executeRouterPing(srcNode, tgtNode, false);
}

function triggerTestPingFail() {
  const srcNode = topoNodes.find(n => n.id === 'pc0');
  const tgtNode = { id: 'offline_target', name: 'Unknown Target (192.168.99.250)', ip: '192.168.99.250' };
  executeRouterPing(srcNode, tgtNode, true);
}

function executeRouterPing(srcParam, tgtParam, forceFail = false) {
  pduCounter++;

  const srcNode = (typeof srcParam === 'object') ? srcParam : (topoNodes.find(n => n.id.toLowerCase() === String(srcParam).toLowerCase() || n.name.toLowerCase().includes(String(srcParam).toLowerCase())) || { id: srcParam, name: String(srcParam), ip: '192.168.20.10' });
  const tgtNode = (typeof tgtParam === 'object') ? tgtParam : (topoNodes.find(n => n.id.toLowerCase() === String(tgtParam).toLowerCase() || n.name.toLowerCase().includes(String(tgtParam).toLowerCase())) || { id: tgtParam, name: String(tgtParam), ip: '192.168.10.10' });

  pingSourceNode = srcNode;
  pingTargetNode = tgtNode;

  const srcName = srcNode.name;
  const tgtName = tgtNode.name;
  const srcIp = srcNode.ip || '192.168.20.10';
  const tgtIp = tgtNode.ip || '192.168.10.10';

  if (forceFail) {
    const failPath = [srcNode.id, getSubnetSwitch(srcNode.id), 'mswitch0', 'router0'];
    animatePacketRoute(failPath, '#ef4444', 0.35, 20);

    updateDetailBox(`
      <div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #ef4444; font-family:monospace;">
        <div style="color:#ef4444; font-weight:bold; font-size:0.9rem; margin-bottom:8px;">
          ❌ CISCO IOS COMMAND PROMPT [${srcName} - ${srcIp}]:
        </div>
        <div style="color:#94a3b8; font-size:0.8rem;">
          > ping ${tgtIp}<br><br>
          Pinging ${tgtIp} with 32 bytes of data:<br>
          <span style="color:#ef4444;">Request timed out.</span><br>
          <span style="color:#ef4444;">Request timed out.</span><br>
          <span style="color:#ef4444;">Request timed out.</span><br>
          <span style="color:#ef4444;">Request timed out.</span><br><br>
          Ping statistics for ${tgtIp}:<br>
          &nbsp;&nbsp;&nbsp;&nbsp;Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)<br>
        </div>
        <div style="margin-top:10px; padding:6px 10px; background:rgba(239,68,68,0.2); border-radius:4px; color:#ef4444; font-weight:bold; font-size:0.85rem;">
          CISCO SIMULATION RESULT: FAILED ❌ (Request Timed Out / Host Unreachable)
        </div>
      </div>
    `);

    addCiscoSimulationEvent('Failed', false, srcName, tgtName, 'ICMP', '#ef4444');
    if (typeof showAlert === 'function') showAlert(`❌ Cisco PDU Ping: ${srcName} ➔ ${tgtName} | Status: FAILED`, 'error');
    return;
  }

  // Successful Ping Simulation
  const srcSwitch = getSubnetSwitch(srcNode.id);
  const tgtSwitch = getSubnetSwitch(tgtNode.id);

  let requestPath = [srcNode.id];
  if (srcSwitch !== srcNode.id) requestPath.push(srcSwitch);
  requestPath.push('mswitch0', 'router0'); // Gateway
  if (tgtSwitch !== tgtNode.id) requestPath.push(tgtSwitch);
  requestPath.push(tgtNode.id);

  let replyPath = [tgtNode.id];
  if (tgtSwitch !== tgtNode.id) replyPath.push(tgtSwitch);
  replyPath.push('mswitch0', 'router0');
  if (srcSwitch !== srcNode.id) replyPath.push(srcSwitch);
  replyPath.push(srcNode.id);

  // Lightning Ultra-Fast Packet Animation (0.35 speed, 20ms hop delay)
  animatePacketRoute(requestPath, '#3b82f6', 0.35, 20);

  setTimeout(() => {
    animatePacketRoute(replyPath, '#10b981', 0.35, 20);
  }, requestPath.length * 20);

  updateDetailBox(`
    <div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #10b981; font-family:monospace;">
      <div style="color:#60a5fa; font-weight:bold; font-size:0.9rem; margin-bottom:8px;">
        💻 CISCO IOS COMMAND PROMPT [${srcName} - ${srcIp}]:
      </div>
      <div style="color:#d1d5db; font-size:0.8rem;">
        > ping ${tgtIp}<br><br>
        Pinging ${tgtIp} with 32 bytes of data:<br>
        <span style="color:#10b981;">Reply from ${tgtIp}: bytes=32 time=2ms TTL=128</span><br>
        <span style="color:#10b981;">Reply from ${tgtIp}: bytes=32 time=1ms TTL=128</span><br>
        <span style="color:#10b981;">Reply from ${tgtIp}: bytes=32 time=3ms TTL=128</span><br>
        <span style="color:#10b981;">Reply from ${tgtIp}: bytes=32 time=2ms TTL=128</span><br><br>
        Ping statistics for ${tgtIp}:<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),<br>
        Approximate round trip times in milli-seconds:<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Minimum = 1ms, Maximum = 3ms, Average = 2ms<br>
      </div>
      <div style="margin-top:10px; padding:6px 10px; background:rgba(16,185,129,0.2); border-radius:4px; color:#10b981; font-weight:bold; font-size:0.85rem;">
        CISCO SIMULATION RESULT: SUCCESSFUL ✅ (Routed via Router0 Gateway 192.168.1.1)
      </div>
    </div>
  `);

  addCiscoSimulationEvent('Successful', true, srcName, tgtName, 'ICMP', '#10b981');
  if (typeof showAlert === 'function') showAlert(`✅ Cisco PDU Ping: ${srcName} ➔ ${tgtName} | Status: SUCCESSFUL`, 'success');
}

function addCiscoSimulationEvent(statusText, isSuccess, srcName, tgtName, type = 'ICMP', colorHex = '#3b82f6') {
  const tbody = document.getElementById('ciscoSimulationTable');
  if (!tbody) return;

  pduCounter++;
  const num = pduCounter;
  const statusColor = isSuccess ? '#10b981' : '#ef4444';
  const statusStr = isSuccess ? 'Successful' : 'Failed';

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>🔥</td>
    <td><span style="color:${statusColor}; font-weight:bold;">${statusStr}</span></td>
    <td>${srcName}</td>
    <td>${tgtName}</td>
    <td>${type}</td>
    <td><span style="display:inline-block; width:12px; height:12px; background:${colorHex}; border-radius:2px;"></span></td>
    <td>0.000</td>
    <td>N</td>
    <td>${num}</td>
    <td style="color:#60a5fa; cursor:pointer;">(edit)</td>
    <td style="color:#ef4444; cursor:pointer;" onclick="this.parentElement.remove()">(delete)</td>
  `;

  tbody.insertBefore(tr, tbody.firstChild);
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

    drawLinkLed(fromNode.x, fromNode.y, toNode.x, toNode.y);
  });

  // Device Nodes
  topoNodes.forEach(node => {
    const isSource = pingSourceNode && pingSourceNode.id === node.id;
    const isTarget = pingTargetNode && pingTargetNode.id === node.id;

    if (isSource) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (isTarget) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isSource ? '#60a5fa' : (isTarget ? '#34d399' : '#475569');
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = isSource ? '#60a5fa' : (isTarget ? '#34d399' : '#e2e8f0');
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

function animatePacketRoute(nodePath, color = '#10b981', speed = 0.35, hopDelay = 20) {
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
          speed: speed,
          color: color
        });
      }, i * hopDelay);
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
