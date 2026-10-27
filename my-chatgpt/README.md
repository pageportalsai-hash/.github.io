# My ChatGPT

An independently built ChatGPT-style personal chat application.

## Live GitHub Pages demo

Open the /my-chatgpt/ URL on this repository's GitHub Pages site. It is an interactive **demo with simulated responses** — not real AI. Try new chats, saved chat history, exporting conversations, and light/dark mode.

## Run it with actual OpenAI responses

GitHub Pages cannot execute Node.js or conceal private API keys. For real GPT replies, run or host the Node server included here:

1. Install Node.js 20+ and run npm install from this folder.
2. Copy .env.example to .env (never commit .env).
3. Put your own API key in OPENAI_API_KEY, and configure a unique APP_PASSWORD (12+ characters). Optional: OPENAI_MODEL.
4. Run npm start and open http://localhost:3000.
5. On the Node-hosted site, enter your app password when prompted. Your API key never goes in the browser or GitHub source.

To host online, connect this repo to a Node host such as Render, set **root directory to my-chatgpt**, build command npm install, start command npm start, and configure OPENAI_API_KEY and APP_PASSWORD as private environment variables. The host will give you a *separate* URL for actual AI chat. Hosting and API usage may incur charges; ChatGPT subscription billing does not include API usage.

The Node site has basic password gating and rate limits; it is intended for a small personal prototype, not a multi-user public service. Conversations are stored in browser localStorage, not synced across devices. This is not the official ChatGPT app.
