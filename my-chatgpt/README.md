# My ChatGPT • AI + Game Studio

A personal ChatGPT-inspired project with chat history, a game studio, live browser code previews, writing shortcuts, theme switching and HTML downloads.

**Live demo**: https://pageportalsai-hash.github.io/.github.io/my-chatgpt/

## Works on GitHub Pages without a server
- Play four built-in games: racing, space shooter, snake, platform jumper.
- Pick a game template by describing an idea; open it in Code Lab, edit and download it as HTML.
- Create and test HTML/CSS/JS sites in an isolated iframe.
- Manage conversations locally and export chat history.
- Chat answers are **not AI** until you configure a private backend.

## Make it real AI

GitHub Pages is static and **cannot run a private OpenAI API key**. Never commit OPENAI_API_KEY or APP_PASSWORD and never put the API key into the browser.

This repository includes a Node.js server for the OpenAI Responses API:

1. Create an OpenAI Platform API key with billing enabled (separate from ChatGPT subscriptions).
2. Deploy the folder my-chatgpt on a Node host (such as Render). Node 20+.
   - Root directory: my-chatgpt
   - Install/build command: npm install
   - Start command: npm start
   - Environment variables: OPENAI_API_KEY, APP_PASSWORD (12+ characters), optionally OPENAI_MODEL (default gpt-5-mini).
   - ALLOWED_ORIGINS may be set to https://pageportalsai-hash.github.io or to a comma-separated list of trusted site origins.
3. Open the GitHub Pages URL, click **AI settings**, paste the secure HTTPS address of the hosted Node server and your APP_PASSWORD, then Test connection and Save.
4. The game builder now asks AI for a custom single-file HTML5 game; ordinary chat works as AI chat.

For local use: run npm install, create .env using .env.example, run npm start and open http://localhost:3000.

**Security and limitations:** The default authentication is basic shared-password gating intended for personal prototypes only. Protect your server URL and password, set budget limits on your API account, and do not expose an unauthenticated API. Browser chat history is stored locally and not synced. AI-generated HTML may contain mistakes and should be reviewed before sharing. The game iframe is sandboxed; downloading HTML and running it outside the app removes that protection. The app cannot automatically browse the web, send messages, create pictures, access files or operate GitHub without separately engineered integrations and permission.
