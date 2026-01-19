# Sea Lion AI Worker

A simple Cloudflare Worker that exposes the **Sea Lion** model (`@cf/aisingapore/gemma-sea-lion-v4-27b-it`) as a REST API.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fayazara/cf-sealion)

## Endpoints

| Endpoint  | Method | Description                     |
| --------- | ------ | ------------------------------- |
| `/`       | GET    | Health check & API info         |
| `/health` | GET    | Health check                    |
| `/chat`   | POST   | Non-streaming chat completion   |
| `/stream` | POST   | Streaming chat completion (SSE) |

## Usage

### Non-Streaming Chat (`/chat`)

```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "What is Singapore famous for?"}
    ]
  }'
```

**Simple format:**

```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is Singapore famous for?",
    "system": "You are a helpful assistant"
  }'
```

### Streaming Chat (`/stream`)

```bash
curl -X POST https://your-worker.workers.dev/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Tell me a story"}
    ]
  }'
```

## Starter Prompt for AI Coding Tools

Copy and paste this prompt into Lovable, Bolt, or any AI coding platform to quickly integrate the Sea Lion API:

---

**Copy this prompt:**

```
I want to integrate the Sea Lion AI model into my app. Here's the API details:

API Base URL: https://your-worker.workers.dev

ENDPOINTS:

1. POST /chat - Non-streaming chat completion
   Request body:
   {
     "prompt": "Your question here",
     "system": "Optional system prompt"
   }
   OR
   {
     "messages": [
       {"role": "system", "content": "System prompt"},
       {"role": "user", "content": "User message"}
     ]
   }
   Response: { "response": "AI response text" }

2. POST /stream - Streaming chat completion (Server-Sent Events)
   Same request body as /chat
   Response: SSE stream with text chunks

EXAMPLE FETCH CODE:

const response = await fetch('https://your-worker.workers.dev/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Hello!',
    system: 'You are a helpful assistant'
  })
});
const data = await response.json();
console.log(data.response);

Please help me build [describe your feature] using this AI API.
```

---

> **Important:** Replace `https://your-worker.workers.dev` with your actual deployed worker URL.

## Using in Lovable, Bolt, or other platforms

When building apps in Lovable, Bolt, or other platforms, you can call this API like this:

```javascript
// Non-streaming
const response = await fetch('https://your-worker.workers.dev/chat', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		prompt: 'Hello, how are you?',
		system: 'You are a friendly assistant',
	}),
});
const data = await response.json();
console.log(data.response);

// Streaming
const streamResponse = await fetch('https://your-worker.workers.dev/stream', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		messages: [{ role: 'user', content: 'Tell me about AI' }],
	}),
});

const reader = streamResponse.body.getReader();
const decoder = new TextDecoder();

while (true) {
	const { done, value } = await reader.read();
	if (done) break;
	console.log(decoder.decode(value));
}
```

## Deploy Your Own

### Option 1: One-Click Deploy

Click the button above to deploy directly to Cloudflare Workers.

### Option 2: Manual Deploy

1. **Clone the repository**

   ```bash
   git clone https://github.com/fayazara/cf-sealion.git
   cd cf-sealion
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Login to Cloudflare**

   ```bash
   npx wrangler login
   ```

4. **Deploy**

   ```bash
   npm run deploy
   ```

5. Your worker will be available at `https://cf-sealion.<your-subdomain>.workers.dev`

## Local Development

```bash
npm run dev
```

This starts a local server at `http://localhost:8787`.

## Request Format

### Messages Array Format

```json
{
	"messages": [
		{ "role": "system", "content": "System prompt here" },
		{ "role": "user", "content": "User message" },
		{ "role": "assistant", "content": "Previous assistant response" },
		{ "role": "user", "content": "Follow-up question" }
	]
}
```

### Simple Format

```json
{
	"prompt": "Your question here",
	"system": "Optional system prompt"
}
```

## Response Format

### Non-Streaming (`/chat`)

```json
{
	"response": "The AI's response text here"
}
```

### Streaming (`/stream`)

Returns Server-Sent Events (SSE) with chunks of the response.

## About Sea Lion

Sea Lion is a family of Large Language Models developed by AI Singapore, optimized for Southeast Asian languages and context. Learn more at [AI Singapore](https://aisingapore.org/).

## License

MIT
