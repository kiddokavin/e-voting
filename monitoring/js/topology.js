// Authentic Cisco Packet Tracer Network Topology Simulation Engine
const nodes = [
  // Core Layer
  { id: 'router0', label: 'Router0', ip: '192.168.1.1', type: 'ROUTER', zone: 'Core', x: 500, y: 65, ports: ['Gi0/0', 'Gi0/1'] },
  { id: 'mswitch0', label: 'Multilayer Switch0 (3560)', ip: '192.168.1.2', type: 'CORE_SWITCH', zone: 'Core', x: 500, y: 155, ports: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5'] },

  // VLAN 10 - Server Farm (Blue Zone)
  { id: 'switch0', label: 'Switch0 (Server Switch)', ip: '192.168.10.1', type: 'SWITCH', zone: 'VLAN 10', x: 500, y: 255, ports: ['Gi0/1', 'Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5'] },
  { id: 'web_server', label: 'WEB Server', ip: '192.168.10.10', type: 'SERVER', zone: 'VLAN 10', x: 340, y: 355 },
  { id: 'dns_server', label: 'DNS Server', ip: '192.168.10.11', type: 'SERVER', zone: 'VLAN 10', x: 420, y: 355 },
  { id: 'db_server', label: 'Database Server0', ip: '192.168.10.12', type: 'SERVER', zone: 'VLAN 10', x: 500, y: 355 },
  { id: 'audit_server', label: 'Audit Server3', ip: '192.168.10.13', type: 'SERVER', zone: 'VLAN 10', x: 580, y: 355 },
  { id: 'sec_server', label: 'Security CA Server4', ip: '192.168.10.14', type: 'SERVER', zone: 'VLAN 10', x: 660, y: 355 },

  // VLAN 20 - Booth 1 (Red Zone)
  { id: 'switch1', label: 'Switch1 (Booth 1)', ip: '192.168.20.1', type: 'SWITCH', zone: 'VLAN 20', x: 160, y: 225, ports: ['Gi0/1', 'Fa0/1', 'Fa0/2'] },
  { id: 'pc0', label: 'PC0 (Booth 1 Terminal A)', ip: '192.168.20.10', type: 'PC', zone: 'VLAN 20', x: 100, y: 320 },
  { id: 'pc1', label: 'PC1 (Booth 1 Terminal B)', ip: '192.168.20.11', type: 'PC', zone: 'VLAN 20', x: 220, y: 320 },

  // VLAN 30 - Booth 2 (Green Zone)
  { id: 'switch2', label: 'Switch2 (Booth 2)', ip: '192.168.30.1', type: 'SWITCH', zone: 'VLAN 30', x: 840, y: 225, ports: ['Gi0/1', 'Fa0/1', 'Fa0/2'] },
  { id: 'pc2', label: 'PC2 (Booth 2 Terminal A)', ip: '192.168.30.10', type: 'PC', zone: 'VLAN 30', x: 780, y: 320 },
  { id: 'pc3', label: 'PC3 (Booth 2 Terminal B)', ip: '192.168.30.11', type: 'PC', zone: 'VLAN 30', x: 900, y: 320 },

  // VLAN 50 - Admin Control Station (Yellow Zone)
  { id: 'switch4', label: 'Switch4 (Admin Switch)', ip: '192.168.50.1', type: 'SWITCH', zone: 'VLAN 50', x: 500, y: 445, ports: ['Gi0/1', 'Fa0/1'] },
  { id: 'pc8', label: 'PC8 (Election Officer Terminal)', ip: '192.168.50.12', type: 'PC', zone: 'VLAN 50', x: 500, y: 515 }
];

const links = [
  { src: 'router0', dst: 'mswitch0', label1: 'Gi0/0', label2: 'Gi0/1' },
  { src: 'mswitch0', dst: 'switch0', label1: 'Fa0/1', label2: 'Gi0/1' },
  { src: 'mswitch0', dst: 'switch1', label1: 'Fa0/2', label2: 'Gi0/1' },
  { src: 'mswitch0', dst: 'switch2', label1: 'Fa0/3', label2: 'Gi0/1' },
  { src: 'mswitch0', dst: 'switch4', label1: 'Fa0/5', label2: 'Gi0/1' },

  { src: 'switch0', dst: 'web_server', label1: 'Fa0/1', label2: 'Fa0' },
  { src: 'switch0', dst: 'dns_server', label1: 'Fa0/2', label2: 'Fa0' },
  { src: 'switch0', dst: 'db_server', label1: 'Fa0/3', label2: 'Fa0' },
  { src: 'switch0', dst: 'audit_server', label1: 'Fa0/4', label2: 'Fa0' },
  { src: 'switch0', dst: 'sec_server', label1: 'Fa0/5', label2: 'Fa0' },

  { src: 'switch1', dst: 'pc0', label1: 'Fa0/1', label2: 'Fa0' },
  { src: 'switch1', dst: 'pc1', label1: 'Fa0/2', label2: 'Fa0' },

  { src: 'switch2', dst: 'pc2', label1: 'Fa0/1', label2: 'Fa0' },
  { src: 'switch2', dst: 'pc3', label1: 'Fa0/2', label2: 'Fa0' },

  { src: 'switch4', dst: 'pc8', label1: 'Fa0/1', label2: 'Fa0' }
];

let canvas, ctx;
let animatedPackets = [];

function initTopologyCanvas() {
  canvas = document.getElementById('topologyCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setInterval(spawnPacket, 2200);
  requestAnimationFrame(drawTopology);
}

function resizeCanvas() {
  if (!canvas) return;
  const parentWidth = canvas.parentElement.clientWidth;
  canvas.width = Math.max(parentWidth, 960);
  canvas.height = 580;
}

function spawnPacket() {
  const sources = ['pc0', 'pc1', 'pc2', 'pc3', 'pc8'];
  const srcId = sources[Math.floor(Math.random() * sources.length)];
  const route = getRouteForSource(srcId);

  if (route && route.length > 1) {
    animatedPackets.push({
      route,
      segmentIndex: 0,
      progress: 0,
      speed: 0.03
    });
  }
}

function getRouteForSource(srcId) {
  if (srcId === 'pc0' || srcId === 'pc1') {
    const sw = 'switch1';
    return ['pc0', sw, 'mswitch0', 'switch0', 'web_server', 'sec_server', 'db_server', 'audit_server'];
  } else if (srcId === 'pc2' || srcId === 'pc3') {
    return ['pc2', 'switch2', 'mswitch0', 'switch0', 'web_server', 'sec_server', 'db_server', 'audit_server'];
  } else {
    return ['pc8', 'switch4', 'mswitch0', 'switch0', 'audit_server'];
  }
}

function drawTopology() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Cisco Grid Background
  drawGrid();

  // Draw Subnet VLAN Boundary Box Boxes
  drawSubnetZones();

  // Draw Copper Links with Cisco Interface Port LEDs
  links.forEach(link => {
    const n1 = nodes.find(n => n.id === link.src);
    const n2 = nodes.find(n => n.id === link.dst);
    if (n1 && n2) {
      // Cable Line
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();

      // Cisco Link LEDs (Green Dots at interface endpoints)
      drawLinkLED(n1, n2, link.label1, 0.15);
      drawLinkLED(n2, n1, link.label2, 0.15);
    }
  });

  // Draw Animated Cisco PDU Packets
  animatedPackets.forEach((p, idx) => {
    const nCurr = nodes.find(n => n.id === p.route[p.segmentIndex]);
    const nNext = nodes.find(n => n.id === p.route[p.segmentIndex + 1]);

    if (nCurr && nNext) {
      p.progress += p.speed;
      const curX = nCurr.x + (nNext.x - nCurr.x) * p.progress;
      const curY = nCurr.y + (nNext.y - nCurr.y) * p.progress;

      // Draw Packet PDU Box / Envelope
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.fillRect(curX - 7, curY - 5, 14, 10);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(curX - 7, curY - 5, 14, 10);
      ctx.shadowBlur = 0;

      if (p.progress >= 1) {
        p.progress = 0;
        p.segmentIndex += 1;
        if (p.segmentIndex >= p.route.length - 1) {
          animatedPackets.splice(idx, 1);
        }
      }
    }
  });

  // Draw Nodes with Cisco Icons
  nodes.forEach(n => {
    drawCiscoDeviceNode(n);
  });

  requestAnimationFrame(drawTopology);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const step = 30;
  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawSubnetZones() {
  // VLAN 10 Server Farm
  drawZoneBox(310, 240, 430, 160, 'rgba(59, 130, 246, 0.08)', '#3b82f6', 'VLAN 10 - Server Farm Subnet (192.168.10.0/24)');
  // VLAN 20 Red Zone
  drawZoneBox(60, 190, 220, 160, 'rgba(239, 68, 68, 0.08)', '#ef4444', 'VLAN 20 - Booth 1 (192.168.20.0/24)');
  // VLAN 30 Green Zone
  drawZoneBox(740, 190, 220, 160, 'rgba(16, 185, 129, 0.08)', '#10b981', 'VLAN 30 - Booth 2 (192.168.30.0/24)');
  // VLAN 50 Admin Station
  drawZoneBox(400, 420, 200, 130, 'rgba(245, 158, 11, 0.08)', '#f59e0b', 'VLAN 50 - Admin Station (192.168.50.0/24)');
}

function drawZoneBox(x, y, w, h, bg, border, title) {
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = border;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 8, y + 16);
}

function drawLinkLED(n1, n2, label, offsetRatio) {
  const lx = n1.x + (n2.x - n1.x) * offsetRatio;
  const ly = n1.y + (n2.y - n1.y) * offsetRatio;

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();

  if (label) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, lx, ly - 6);
  }
}

function drawCiscoDeviceNode(n) {
  const { x, y, type, label, ip } = n;

  ctx.save();
  ctx.translate(x, y);

  if (type === 'ROUTER') {
    // Cisco Router Icon (Blue Disc with White Arrows)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    // Cross arrows
    ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
    ctx.moveTo(0, -10); ctx.lineTo(0, 10);
    ctx.stroke();
  } else if (type === 'CORE_SWITCH') {
    // Cisco Multilayer Switch 3560 (Purple Square with Cross Arrows)
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(-22, -18, 44, 36);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.strokeRect(-22, -18, 44, 36);
    ctx.beginPath();
    ctx.moveTo(-12, -8); ctx.lineTo(12, 8);
    ctx.moveTo(12, -8); ctx.lineTo(-12, 8);
    ctx.stroke();
  } else if (type === 'SWITCH') {
    // Cisco 2960 Switch (Blue Box with Opposite Arrows)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-20, -14, 40, 28);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-20, -14, 40, 28);
    ctx.beginPath();
    ctx.moveTo(-10, -3); ctx.lineTo(10, -3);
    ctx.moveTo(10, 3); ctx.lineTo(-10, 3);
    ctx.stroke();
  } else if (type === 'SERVER') {
    // Server Chassis Box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-16, -20, 32, 40);
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.strokeRect(-16, -20, 32, 40);
    // LED Lights
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-10, -14, 6, 3);
    ctx.fillRect(-2, -14, 6, 3);
  } else if (type === 'PC') {
    // Desktop Monitor + Base
    ctx.fillStyle = '#334155';
    ctx.fillRect(-16, -16, 32, 22);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-16, -16, 32, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-13, -13, 26, 16);
    // Base Stand
    ctx.fillStyle = '#475569';
    ctx.fillRect(-6, 6, 12, 6);
    ctx.fillRect(-12, 12, 24, 3);
  }

  ctx.restore();

  // Text Labels
  ctx.fillStyle = '#f3f4f6';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 34);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '9px monospace';
  ctx.fillText(ip, x, y + 46);
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTopologyCanvas, 400);
});
