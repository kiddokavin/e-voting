# 🗳️ E-Voting System - Voter Terminal Application

A dedicated, standalone Electronic Voting Machine (EVM) Web Terminal application designed for Polling Booth Subnets.

## 🚀 Overview
This application represents the **Voter Interface** used at physical polling stations (Booth 1 Red Zone, Booth 2 Green Zone, Booth 3 Pink Zone). It connects directly to the Central E-Voting Server (`https://e-voting-i8cw.onrender.com`) to verify voter eligibility and record cryptographically signed votes.

## ✨ Features
- 🔐 **Voter Verification & Eligibility Check:** Authenticates voter IDs against the Central Electoral Roll.
- 🚫 **Single-Vote Security Lock:** Prevents double-voting attempts with central policy enforcement.
- 📜 **Interactive Electronic Ballot Box:** Displays verified candidate profiles, party symbols, and manifestos.
- 🔒 **SHA-256 Digital Receipt:** Generates end-to-end cryptographic transaction receipts upon casting a vote.

## 🔗 Architecture Link
- **Connected Central Backend Server:** `https://e-voting-i8cw.onrender.com`
- **API Endpoints Utilized:** `/api/voter/verify`, `/api/vote/cast`, `/api/candidates`
