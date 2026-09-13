# ☁️ Vercel Deployment Guide

This document explains how the Spring AI Tour frontend is deployed on Vercel, and how to replicate that deployment locally on your machine.

---

## How It Deploys on Vercel

The frontend is hosted at **[https://spring-ai-ui.vercel.app/](https://spring-ai-ui.vercel.app/)**.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Vercel                            │
│                                                          │
│  User Browser ──► Vercel Edge Network                    │
│                       │                                  │
│         ┌─────────────┼──────────────────┐               │
│         │             │                  │               │
│    /api/(.*)     Static Files      SPA Fallback         │
│    route:         (dist/)            to /index.html      │
│    proxy to         │                  │                 │
│    Render          │                  │                 │
│    Backend         │                  │                 │
│         │          │                  │                 │
│         ▼          │                  │                 │
│  https://spring-ai.onrender.com        │                 │
│         │                              │                 │
│         ▼                              ▼                 │
│  Spring Boot App ◄──── React + TS Static Assets          │
└──────────────────────────────────────────────────────────┘
```

### Build Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "https://spring-ai.onrender.com/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

| Config | Purpose |
|--------|---------|
| `@vercel/static-build` | Builds the React app using Vite; output directory is `dist/` |
| `distDir: "dist"` | Matches the Vite `build.outDir` setting |
| Route `/api/(.*)` | **Proxies all API calls** from the Vercel URL to the Render-hosted backend |
| `handle: "filesystem"` | Serves static files directly from `dist/` |
| `/(.*)` → `/index.html` | SPA client-side routing fallback |

### Build Command

On Vercel, the build runs the `vercel-build` script from `package.json`:

```bash
vercel-build  # → tsc -b && vite build
```

### Environment Variables

Set in the Vercel dashboard (or via `.env.production`):

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_BASE_URL` | `https://spring-ai.onrender.com` | Base URL for backend API calls |
| `VITE_ENVIRONMENT` | `deployed` | Runtime environment identifier |

### Backend (Render)

The backend is deployed separately on **Render** via `render.yaml`:

| Setting | Value |
|---------|-------|
| Type | Web Service (Docker) |
| Runtime | Docker |
| Dockerfile | `./spring-ai/Dockerfile` |
| Port | 8080 |
| Region | Oregon |
| Auto-deploy | Enabled |

---

## 🖥️ Deploy Locally to Mimic Vercel

To run the frontend locally in a way that **faithfully replicates the Vercel deployment** (same static build, same `/api` proxy routing, same SPA fallback), you have two options.

### Option A — Vercel CLI (Recommended)

The **most faithful** local reproduction of the Vercel environment. The Vercel CLI reads `vercel.json` and sets up the same routing and proxy behavior on your local machine.

**Prerequisites:**
- Node.js v20+
- Vercel CLI: `npm i -g @vercel/cli`
- A running backend (either local on `localhost:8080` or the deployed one at `spring-ai.onrender.com`)

**Steps:**

```bash
# 1. Clone and install
git clone https://github.com/iranna-m-31/spring-ai-ui.git
cd spring-ai-ui
npm install

# 2. Configure environment (for deployed backend)
cp .env.example .env
# Edit .env if needed — default uses VITE_API_BASE_URL=https://spring-ai.onrender.com

# 3. Run Vercel dev (reads vercel.json, builds, and serves with same routing)
npx vercel dev
```

The Vercel CLI will:
1. Build the project (same as Vercel's `@vercel/static-build`)
2. Serve the `dist/` output statically
3. **Proxy `/api/(.*)`** requests to `https://spring-ai.onrender.com/api/$1` (same as `vercel.json`)
4. **Fallback to `/index.html`** for SPA routing (same as `vercel.json`)
5. Run on `http://localhost:3000`

> **Tip:** If you want to test against your **local** Spring Boot backend instead of the deployed one, temporarily change the proxy route in `vercel.json` to point at `http://localhost:8080/api/$1`, or set `VITE_API_BASE_URL=http://localhost:8080` and use Option B below.

### Option B — Build + Static Server with Proxy

If you prefer not to install the Vercel CLI, you can manually reproduce the Vercel behavior using a build and a local server that proxies `/api` requests.

**Prerequisites:**
- Node.js v20+
- A running backend (local on `localhost:8080` or the deployed one)

**Steps:**

```bash
# 1. Clone and install
git clone https://github.com/iranna-m-31/spring-ai-ui.git
cd spring-ai-ui
npm install

# 2. Build the production bundle
npm run build        # → tsc -b && vite build → outputs to dist/

# 3. Run the Spring Boot backend locally (on port 8080)
#    (from the spring-ai directory)
cd ../spring-ai
./gradlew bootRun
# Or if you already have a JAR:
# java -jar build/libs/spring-ai-*.jar

# 4. Serve dist/ with a proxy for /api routes
#    Using npx serve with http-proxy-middleware:
cd ../spring-ai-ui
npx serve -s dist -l 3000
```

> **Note:** The static server in Option B does **not** natively proxy `/api` routes like Vercel does. To fully mimic Vercel's routing, you can add a small proxy middleware. The easiest way is to use a `serve.json` config or a simple Node proxy:

**Using a Node proxy script (`server.js`):**

```js
// Place in spring-ai-ui/ root, then run: node server.js
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import httpProxy from 'http-proxy'

const PORT = 3000
const DIST = './dist'
const API_TARGET = 'http://localhost:8080'   // local backend
// const API_TARGET = 'https://spring-ai.onrender.com' // deployed backend

const proxy = httpProxy.createProxyServer({})
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

createServer(async (req, res) => {
  // Route 1: Proxy /api/(.*) to backend (same as vercel.json)
  if (req.url?.startsWith('/api/')) {
    proxy.web(req, res, { target: API_TARGET, changeOrigin: true })
    return
  }

  // Route 2: Serve static files from dist/ (same as handle: filesystem)
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url || 'index.html')
  const ext = extname(filePath)

  if (existsSync(filePath) && ext) {
    const content = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    res.end(content)
    return
  }

  // Route 3: SPA fallback to /index.html (same as (.*) → /index.html)
  const indexPath = join(DIST, 'index.html')
  const indexContent = await readFile(indexPath)
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(indexContent)
}).listen(PORT, () => {
  console.log(`Local Vercel mimic running at http://localhost:${PORT}`)
})
```

```bash
# Install the proxy dependency
npm i http-proxy

# Run
node server.js
```

This gives you a local server on `http://localhost:3000` that behaves exactly like the Vercel deployment.

### Comparison: Vercel vs Local Mimic

| Aspect | Vercel (Production) | Local Mimic (Option A) | Local Mimic (Option B) |
|--------|---------------------|------------------------|------------------------|
| Static build | `@vercel/static-build` → `dist/` | `vercel dev` (auto-builds) | `npm run build` → `dist/` |
| `/api` proxy | To Render backend | To Render backend | To localhost:8080 or Render |
| SPA fallback | `/index.html` | `/index.html` (built-in) | `/index.html` (custom server) |
| Port | 443 (HTTPS) | `localhost:3000` | `localhost:3000` |
| Environment | `VITE_ENVIRONMENT=deployed` | From `.env` | From `.env` |
| Backend required? | Yes (on Render) | Yes (deployed or local) | Yes (local or deployed) |

---

## 📁 File Reference

| File | Role |
|------|------|
| `vercel.json` | Vercel build + routing configuration |
| `package.json` | `vercel-build` script drives the production build |
| `.env.production` | Default env vars on Vercel (`VITE_API_BASE_URL`, `VITE_ENVIRONMENT`) |
| `vite.config.ts` | Dev-server proxy and build output config |
| `src/api/client.ts` | API client; uses `VITE_API_BASE_URL` for backend calls |

---

## 🔗 Related Docs

- [Local Setup Guide](./LOCAL_SETUP.md) — running the app in development mode
- [Deployed Labs Guide](./DEPLOYED_LABS.md) — using the live deployed version
