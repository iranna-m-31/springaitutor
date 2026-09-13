# 🚀 Local Lab Setup Guide — Frontend

Follow these instructions to run the Spring AI Tutor frontend locally on your machine.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- An API key from [OpenRouter](https://openrouter.ai/) (or any OpenAI-compatible provider)

## 🛠️ Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/iranna-m-31/spring-ai-ui.git
cd spring-ai-ui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default points to localhost:8080)
```

### 4. Start the Development Server
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 5. Verify Setup
1. Open `http://localhost:5173` in your browser
2. Complete the Health Check on the homepage
3. Start with the **Plain Chat** lab

## 🧪 Running Specific Labs

All labs work with a compatible Spring AI backend. Make sure your `VITE_API_BASE_URL` in `.env` points to:
- Local: `http://localhost:8080`
- Deployed: `https://spring-ai.onrender.com`

## 🔌 API Endpoints

| Lab | Endpoint | Method | Parameters |
|-----|----------|--------|------------|
| Plain Chat | `/api/ai` | GET | `userInput` |
| RAG | `/api/ai/rag` | GET | `q`, `threshold` |
| Structured Output | `/api/ai/structured` | POST | JSON body |
| ... | ... | ... | ... |

## ⚠️ Troubleshooting

- **CORS errors**: Ensure your backend has proper CORS configuration allowing your frontend origin
- **Rate limit errors**: Free tier on OpenRouter has limits (10 requests/minute, 100 requests/day)
- **Backend not responding**: Check that your backend is running and accessible at the configured `VITE_API_BASE_URL`

## 📦 Build

```bash
npm run build
```

## 🚀 Deployment

See [Deployment Guide](./VERCEL_DEPLOY.md) for how the frontend is deployed on Vercel and how to run it locally to mimic that deployment.

## 📚 Related Documentation

- [Deployed Labs Guide](./DEPLOYED_LABS.md)
- [Spring AI Reference Documentation](https://docs.spring.io/spring-ai/reference/index.html)