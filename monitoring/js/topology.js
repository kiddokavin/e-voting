// Cisco Packet Tracer Canvas Simulation Engine
const nodes = [
  { id: 'router0', label: 'Router0', ip: '192.168.1.1', type: 'ROUTER', x: 400, y: 70 },
  { id: 'mswitch0', label: 'Core Switch0', ip: '192.168.1.2', type: 'SWITCH', x: 400, y: 160 },

  // Server Farm (VLAN 10)
  { id: 'switch0', label: 'Server Switch0', ip: '192.168.10.1', type: 'SWITCH', x: 400, y: 260 },
  { id: 'web_server', label: 'WEB Server', ip: '192.168.10.10', type: 'SERVER', x: 260, y: 350 },
  { id: 'dns_server', label: 'DNS Server', ip: '192.168.10.11', type: 'SERVER', x: 330, y: 350 },
  { id: 'db_server', label: 'DB Server0', ip: '192.168.10.12', type: 'SERVER', x: 400, y: 350 },
  { id: 'audit_server', label: 'Audit Server3', ip: '192.168.10.13', type: 'SERVER', x: 470, y: 350 },
  { id: 'sec_server', label: 'CA Server4', ip: '192.168.10.14', type: 'SERVER', x: 540, y: 350 },

  // Booth Subnets
  { id: 'switch1', label: 'Booth 1 Switch', ip: '192.168.20.1', type: 'SWITCH', x: 120, y: 220 },
  { id: 'pc0', label: 'PC0 (Booth 1)', ip: '192.168.20.10', type: 'PC', x: 70, y: 300 },
  { id: 'pc1', label: 'PC1 (Booth 1)', ip: '192.168.20.11', type: 'PC', x: 150, y: 300 },

  { id: 'switch2', label: 'Booth 2 Switch', ip: '192.168.30.1', type: 'SWITCH', x: 680, y: 220 },
  { id: 'pc2', label: 'PC2 (Booth 2)', ip: '192.168.30.10', type: 'PC', x: 630, y: 300 },
  { id: 'pc3', label: 'PC3 (Booth 2)', ip: '192.168.30.11', type: 'PC', x: 730, y: 300 },

  { id: 'switch4', label: 'Admin Switch4', ip: '192.168.50.1', type: 'SWITCH', x: 400, y: 440 },
  { id: 'pc8', label: 'PC8 (Officer)', ip: '192.168.50.12', type: 'PC', x: 400, y: 500 }
];

const links = [
  ['router0', 'mswitch0'],
  ['mswitch0', 'switch0'],
  ['mswitch0', 'switch1'],
  ['mswitch0', 'switch2'],
  ['mswitch0', 'switch4'],
  ['switch0', 'web_server'],
  ['switch0', 'dns_server'],
  ['switch0', 'db_server'],
  ['switch0', 'audit_server'],
  ['switch0', 'sec_server'],
  ['switch1', 'pc0'],
  ['switch1', 'pc1'],
  ['switch2', 'pc2'],
  ['switch2', 'pc3'],
  ['switch4', 'pc8']
];

let canvas, ctx;
let animatedPackets = [];

function initTopologyCanvas() {
  canvas = document.getElementById('topologyCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setInterval(spawnPacket, 2500);
  requestAnimationFrame(drawTopology);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight || 520;
}

function spawnPacket() {
  const sources = ['pc0', 'pc1', 'pc2', 'pc3'];
  const srcId = sources[Math.floor(Math.random() * sources.length)];
  const srcNode = nodes.find(n => n.id === srcId);
  const destNode = nodes.find(n => n.id === 'db_server');

  if (srcNode && destNode) {
    animatedPackets.push({
      x: srcNode.x,
      y: srcNode.y,
      targetX: destNode.x,
      targetY: destNode.y,
      progress: 0,
      speed: 0.015
    });
  }
}

function drawTopology() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Links
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  links.forEach(([src, dst]) => {
    const n1 = nodes.find(n => n.id === src);
    const n2 = nodes.find(n => n.id === dst);
    if (n1 && n2) {
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    }
  });

  // Draw Animated Packets
  animatedPackets.forEach((p, idx) => {
    p.progress += p.speed;
    const curX = p.x + (p.targetX - p.x) * p.progress;
    const curY = p.y + (p.targetY - p.y) * p.progress;

    ctx.fillStyle = '#34d399';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (p.progress >= 1) animatedPackets.splice(idx, 1);
  });

  // Draw Nodes
  nodes.forEach(n => {
    ctx.fillStyle = n.type === 'ROUTER' ? '#f59e0b' : n.type === 'SERVER' ? '#3b82f6' : n.type === 'SWITCH' ? '#8b5cf6' : '#10b981';
    ctx.beginPath();
    ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y + 26);
  });

  requestAnimationFrame(drawTopology);
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTopologyCanvas, 500);
});
