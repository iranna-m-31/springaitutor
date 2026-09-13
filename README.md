# Spring AI Tour — Frontend

The interactive React + TypeScript + Vite frontend for the Spring AI Tutor project. Features 16 hands-on modules covering Spring AI 2.0.1 with live API calls, real Java source code, and interactive "Try It" panels.

## 🚀 Quick Start

### Prerequisites

- **Node.js v20+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **OpenRouter API key** (optional, for testing) — [https://openrouter.ai/keys](https://openrouter.ai/keys)

### Setup

```bash
# Clone the repository
git clone https://github.com/iranna-m-31/springaitutor.git
cd springaitutor

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default points to localhost:8080)

# Start the development server
npm run dev
```

The frontend will start at **http://localhost:5173**.

### Verify the Setup

1. Open **http://localhost:5173** in your browser
2. Complete the **Health Check** on the homepage
3. Start with the **Plain Chat** lab
4. Make sure the Spring Boot backend is running at **http://localhost:8080**

## 📁 Project Structure

```
src/
├── main.tsx                  # Application entry point
├── App.tsx                   # Main app component with routing
├── index.css                 # Global styles
├── api/
│   ├── client.ts             # API client for backend calls
│   ├── health.ts             # Health check API
│   └── source.ts             # Source snippet API
├── components/
│   ├── HomePage.tsx          # Landing page with feature navigation
│   ├── IntroductionPage.tsx  # Getting started guide
│   ├── LessonPage.tsx        # Individual lesson display
│   ├── LabPage.tsx           # Interactive lab workspace
│   ├── PlaygroundPage.tsx    # Sandbox environment
│   ├── CodeView.tsx          # Syntax-highlighted code display
│   ├── CodeBlock.tsx         # Code block component
│   ├── CodeDiff.tsx          # Code diff viewer
│   ├── DemoPanel.tsx         # Interactive demo panel
│   ├── FeatureNav.tsx        # Feature navigation sidebar
│   ├── LearningSidebar.tsx   # Learning progress sidebar
│   ├── TopNav.tsx            # Top navigation bar
│   ├── Footer.tsx            # Footer component
│   ├── SetupBanner.tsx       # Setup instructions banner
│   ├── SetupDoctor.tsx       # Environment checker
│   ├── SettingsPage.tsx      # User settings
│   ├── ThemeToggle.tsx       # Dark/light theme toggle
│   ├── SearchPalette.tsx     # Search palette
│   ├── RuntimeTimeline.tsx   # Runtime visualization
│   ├── Checkpoint.tsx        # Progress checkpoint
│   ├── ProgressiveDisclosure.tsx # Expandable content
│   ├── Skeleton.tsx          # Loading skeleton
│   ├── CopyButton.tsx        # Copy-to-clipboard button
│   └── ...
├── hooks/
│   ├── useClipboard.ts       # Clipboard utility hook
│   └── useStreamingChat.ts   # SSE streaming hook
├── data/
│   ├── features.ts           # Feature metadata
│   └── lessons.ts            # Lesson content
├── styles/                   # CSS module files
└── assets/                   # Image assets

public/                       # Static assets
tests/                        # Playwright e2e tests
docs/                         # Setup and deployment guides
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint with oxlint
npm run lint

# Preview production build
npm run preview

# Run Playwright tests
npx playwright test
```

## 🔗 Backend Integration

The frontend calls the Spring AI backend API. Configure the base URL in `.env`:

```env
# Local development
VITE_API_BASE_URL=http://localhost:8080

# Deployed
VITE_API_BASE_URL=https://spring-ai.onrender.com
```

The `vite.config.ts` also proxies `/ai`, `/api/tutor`, and `/actuator` requests to `http://localhost:8080` during local development.

## 📦 Deployment

This project is deployed on **Vercel**. See `vercel.json` for configuration.

## 🧪 Testing

```bash
# Run e2e tests with Playwright
npx playwright install
npx playwright test
```

## 📚 Documentation

- [Local Setup Guide](./docs/LOCAL_SETUP.md)
- [Deployed Labs Guide](./docs/DEPLOYED_LABS.md)
- [Vercel Deployment Guide](./docs/VERCEL_DEPLOY.md)
- [Spring AI Reference](https://docs.spring.io/spring-ai/reference/index.html)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
