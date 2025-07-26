# AI Video Generation Dashboard

A web interface for AI-powered video generation using script inputs, mood boards, and base images.

## Features

- **Script Input**: Enter your video concept/script
- **Mood Board**: Upload multiple images to generate vibe descriptions using OpenAI Vision API
- **Base Image**: Upload a base image for image-to-video conversion
- **Smart Prompt Generation**: Combines all inputs to create detailed video prompts
- **Video Generation**: Uses OpenAI or ByteDance ModelArk for final video creation

## Quick Start

1. Visit the deployed app or open `index.html` in your browser
2. Click Settings ⚙️ and add your API keys:
   - OpenAI API key (for image analysis)
   - ByteDance API key (for video generation)
3. Start creating videos!

## API Keys Setup

**IMPORTANT**: API keys are stored only in your browser's local storage. They are never sent to any database or server other than the respective API endpoints.

1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Get ByteDance API Key**: Visit [ModelArk Console](https://console.byteplus.com/ark/)
3. **Add API keys** in the dashboard settings - they will be cached locally
4. **Test with a simple script** and a few mood board images

## Deployment

### Deploy to Vercel

#### Via Terminal:
```bash
# Install Vercel CLI
npm i -g vercel

# In your project directory
vercel

# Follow the prompts to deploy
```

#### Via Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Deploy with default settings

### Local Development
```bash
# Simply open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8000
# or
npx serve .
```

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- OpenAI API for image analysis and prompt generation
- ByteDance ModelArk for video generation
- Completely client-side, no servers required
- Deployed on Vercel

## API Keys Required

- **OpenAI API Key** (for image analysis and mood board compilation)
- **ByteDance ModelArk API Key** (for video generation)

**Security**: All API keys are stored locally in your browser only. No server-side storage.

## File Structure

```
├── index.html          # Main dashboard
├── style.css           # Styling
├── script.js           # Core functionality with API integration
├── video-generator.js  # Video generation logic
├── config.js           # API configuration
├── vercel.json         # Vercel deployment config
├── README.md           # This file
└── STRATEGY.md         # Development strategy
```

## MVP Focus

This is an MVP focused on simplicity and functionality. No over-engineering, minimal code, maximum results. 