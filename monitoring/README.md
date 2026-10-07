# 📊 E-Voting System - Central Monitoring & Packet Tracer Dashboard

A dedicated, real-time election monitoring dashboard featuring live vote tally metrics, Chart.js visualizations, Cisco Packet Tracer topology animation, and central security audit stream.

## 🚀 Overview
This application represents the **Central Election Commission Monitoring Station** (Server3 / PC6 / PC7). It streams live statistics from the Central Backend (`https://e-voting-i8cw.onrender.com`).

## ✨ Features
- 📈 **Real-Time Candidate Vote Share:** Interactive Bar Chart powered by Chart.js.
- 🎨 **Zone-Wise Turnout Breakdown:** Doughnut Chart showing polling turnout across Red, Green, and Pink zones.
- 🌐 **Cisco Packet Tracer Network Topology Visualizer:** HTML5 Canvas animation displaying packet trace route from Polling Subnets -> Core Switch -> Server Farm.
- 🖥️ **Server Farm & Node Inspector:** Displays IP addresses, status, and packet latency for all routers, switches, and server nodes.
- 📜 **Live Audit Stream:** Displays real-time intrusion detection and vote casting logs from Server3.

## 🔗 Architecture Link
- **Connected Central Backend Server:** `https://e-voting-i8cw.onrender.com`
- **API Endpoints Utilized:** `/api/monitoring/stats`
