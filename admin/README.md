# 🔒 E-Voting System - Election Officer Control Station

Restricted Security & Election Management Panel for Election Commission Officers (PC8 - VLAN 50).

## 🚀 Overview
This application provides Level 5 Authorization controls for managing the overall election lifecycle, triggering cyber security threat simulations, and registering new eligible voters into the system.

## ✨ Features
- 🔑 **Restricted Officer Authentication:** Passcode authorization terminal (`admin` / `admin123`).
- 🚥 **Election State Controller:** Allows START, PAUSE, END, and RESET actions on the central database.
- 🛡️ **Cyber Attack & IDS Threat Simulator:** Simulates SYN Flood DDoS attacks on the WEB Server (`192.168.10.10`) to test Central Audit Server3 responses.
- 👤 **New Voter Registration:** Dynamically adds new registered voters to polling subnets.

## 🔗 Architecture Link
- **Connected Central Backend Server:** `https://e-voting-i8cw.onrender.com`
- **API Endpoints Utilized:** `/api/admin/control`
