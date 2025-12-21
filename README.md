# Byte Integration Hub

Multi-Agent Automation Platform powered by Claude Opus 4.5

## Features

- **Command Center** - AI chat interface with real-time agent monitoring
- **Rapid Prototype** - Bolt/Byte-style code generation interface
- **Agent Monitor** - Full 57-agent fleet management
- **Action Outbox** - Heartbeat + Outbox pattern with approval workflows
- **Integrations Hub** - VFS-mapped tool connections
- **Memory System** - 4-tier memory visualization

## Tech Stack

- React 18
- Vite 5
- TailwindCSS 3.4
- Lucide React Icons

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

1. Connect this repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Node version: 18+

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.
