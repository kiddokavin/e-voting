# NETWORK BASED SECURE ELECTRONIC VOTING SYSTEM WITH CENTRALIZED MONITORING

![Project Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v24.18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive, full-stack, network-oriented Electronic Voting Machine (EVM) web application aligned with Cisco Packet Tracer topology architecture. Features real-time voter authentication, cryptographic SHA-256 vote hashing, single-vote enforcement, live network packet visualizer, and a centralized election monitoring dashboard.

---

## 📐 Network Architecture & Topology

The project mimics a multi-zone Cisco enterprise network with a dedicated **Server Farm**, core routing infrastructure, and distinct **Polling Booth Subnets**:

- **Core Layer**:
  - `Router0` (`192.168.1.1`): Main Gateway Router
  - `Multilayer Switch0` (`3560-24PS`, `192.168.1.2`): Inter-VLAN Routing Node

- **Server Farm (VLAN 10 - Subnet 192.168.10.0/24)**:
  - **WEB Server** (`192.168.10.10`): E-Voting Web Portal & REST API Engine
  - **DNS Server** (`192.168.10.11`): Domain Name Resolution (`evoting.gov.in`)
  - **Database Server0** (`192.168.10.12`): Immutable Vote Ledger Storage
  - **Central Audit Server3** (`192.168.10.13`): Intrusion Detection & Live Monitoring
  - **Security CA Server4** (`192.168.10.14`): SSL/TLS Signatures & SHA-256 Hash Verification

- **Polling Booth Subnets**:
  - **Red Zone (Booth 1 - 192.168.20.0/24)**: Switch1 connected to PC0 & PC1 Terminals
  - **Green Zone (Booth 2 - 192.168.30.0/24)**: Switch2 connected to PC2 & PC3 Terminals
  - **Pink Zone (Booth 3 - 192.168.40.0/24)**: Switch3 connected to PC4 & PC5 Terminals
  - **Yellow Zone (Admin Monitoring - 192.168.50.0/24)**: Switch4 connected to PC6, PC7, PC8 Election Officer Terminals

---

## ✨ Key Features

1. 🗳️ **Digital Voting Booth (EVM Terminal)**:
   - Voter ID eligibility authentication with single-vote locking logic.
   - Interactive Candidate Ballot Box with manifesto details & party symbols.
   - **SHA-256 Cryptographic Hash Generation** for tamper-evident vote records.
   - Printable & Downloadable Digital Vote Receipt.

2. 📊 **Centralized Election Commission Monitoring Station**:
   - Real-time vote tally updates & winning candidate leaderboards.
   - Dynamic **Chart.js Visualizations**: Candidate Vote Share (Bar Chart) & Zone-wise Turnout (Doughnut Chart).
   - Node ping status & latency table for all routers, switches, and server farm nodes.
   - Real-Time Central Security Audit Stream (Server3).

3. 🌐 **Interactive Cisco Packet Tracer Live Topology Visualizer**:
   - HTML5 Canvas canvas replicating the Cisco Packet Tracer diagram.
   - **Animated Packet Engine**: Visualizes vote packets traveling from Polling Station -> Subnet Switch -> Core Multilayer Switch -> WEB Server -> Security CA -> DB Server.
   - Interactive Node Inspector: Click any device to view IP Address, MAC Address, Subnet Mask, and interface status.

4. 🛡️ **Cyber Security & Threat Simulator**:
   - Double-voting prevention policy (blocks repeat attempts and triggers security alert).
   - Built-in SYN Flood Cyber Attack Simulator to demonstrate Central Audit IDS response.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation & Run

1. Clone this repository:
   ```bash
   git clone https://github.com/kiddokavin/NETWORK-BASED-SECURE-ELECTRONIC-VOTING-SYSTEM-WITH-CENTRALIZED-MONITORING-.git
   cd NETWORK-BASED-SECURE-ELECTRONIC-VOTING-SYSTEM-WITH-CENTRALIZED-MONITORING-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📁 Directory Structure

```
├── package.json
├── server.js               # Node.js Express REST API & Database engine
├── .gitignore
├── README.md
├── data/
│   └── database.json       # Election state & audit log persistence
└── public/
    ├── index.html          # Web UI layout & dashboard tabs
    ├── css/
    │   └── styles.css      # Glassmorphism theme & network zone styling
    └── js/
        ├── app.js          # App initialization & navigation
        ├── topology.js     # Cisco Packet Tracer Canvas & animation engine
        ├── voting.js       # EVM voter login & ballot casting
        └── dashboard.js    # Chart.js metrics & admin control center
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
