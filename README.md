<div align="center">
  <img src="assets/logo.svg" width="100" height="100" alt="Telescope" />
  <h1>Telescope</h1>
  <p>A lightweight server management dashboard.<br/>One-click to launch SSH, FTP, and RDP connections via your local client.</p>

  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
  ![Status](https://img.shields.io/badge/status-WIP-orange.svg)
</div>

---

## Overview

Telescope is a self-hosted server management panel that centralizes all your server, VPN, and credential information in one place. Click any server to instantly launch your preferred local SSH, FTP, or RDP client — no more hunting through notes or memorizing IPs.

Built for engineers who manage multiple servers across different environments and want a clean, fast interface without the overhead of a full enterprise bastion host.

## Features

- **Server management** — Organize servers by group, store connection details, notes, and credentials
- **One-click connect** — Launches your local client directly via system protocol handlers
  - SSH → Xshell / Termius / Windows Terminal
  - FTP → FileZilla or system default
  - RDP → Windows built-in Remote Desktop (`mstsc`)
- **VPN management** — Store VPN account info, server addresses, and client configuration per device
- **Multi-user** — Each user manages their own server list
- **Encrypted storage** — Passwords and keys are encrypted at rest
- **Multi-device sync** — Self-hosted, data lives on your server, accessible from any browser

## How it works

Telescope consists of two parts:

**Web dashboard** (server-side)
- Manage all your server and VPN information via browser
- Data synced across all your devices

**Local agent** (Windows desktop app)
- A small background agent installed on each Windows machine
- Registers custom protocol handlers (`telescope://`)
- Receives connection requests from the web dashboard and launches the appropriate local client

```
Browser click  →  telescope://ssh?host=...  →  Local agent  →  Xshell / mstsc / FileZilla
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite |
| Local agent | Python → PyInstaller (.exe) |

## Getting started

> Work in progress — installation guide coming soon.

### Requirements

- Python 3.10+
- Node.js 18+
- Windows (for local agent)

### Quick start

```bash
# Clone the repo
git clone https://github.com/yourusername/telescope.git
cd telescope

# Backend
cd server
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd ../web
npm install
npm run dev
```

Download and install the local agent from the web dashboard after login.

## Roadmap

- [x] Project setup
- [ ] Server CRUD
- [ ] VPN info management
- [ ] Local agent (Windows)
- [ ] Protocol handler registration
- [ ] Encrypted credential storage
- [ ] Multi-user support
- [ ] Dark / light theme

## License

MIT © 2026
