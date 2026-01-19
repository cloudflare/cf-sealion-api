export interface Env {
	AI: Ai;
}

// CORS headers for cross-origin requests (needed for Lovable)
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export default {
	async fetch(request, env): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		// Health check endpoint
		if (url.pathname === "/" || url.pathname === "/health") {
			return new Response(
				JSON.stringify({
					status: "ok",
					model: "@cf/aisingapore/gemma-sea-lion-v4-27b-it",
					endpoints: {
						chat: "/chat",
						stream: "/stream",
					},
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				}
			);
		}

		// Only allow POST for chat endpoints
		if (request.method !== "POST") {
			return new Response(
				JSON.stringify({ error: "Method not allowed. Use POST." }),
				{
					status: 405,
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				}
			);
		}

		// Parse request body
		let body: { messages?: Array<{ role: string; content: string }>; system?: string; prompt?: string };
		try {
			body = await request.json();
		} catch {
			return new Response(
				JSON.stringify({ error: "Invalid JSON body" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				}
			);
		}

		// Build messages array
		let messages: Array<{ role: string; content: string }> = [];

		if (body.messages && Array.isArray(body.messages)) {
			// Use provided messages array
			messages = body.messages;
		} else if (body.prompt) {
			// Simple prompt format
			if (body.system) {
				messages.push({ role: "system", content: body.system });
			}
			messages.push({ role: "user", content: body.prompt });
		} else {
			return new Response(
				JSON.stringify({
					error: "Request must include either 'messages' array or 'prompt' string",
					example: {
						messages: [
							{ role: "system", content: "You are a helpful assistant" },
							{ role: "user", content: "Hello!" },
						],
					},
					simpleExample: {
						prompt: "Hello!",
						system: "You are a helpful assistant",
					},
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				}
			);
		}

		// Non-streaming chat endpoint
		if (url.pathname === "/chat") {
			const response = await env.AI.run("@cf/aisingapore/gemma-sea-lion-v4-27b-it", {
				messages,
			});

			return new Response(JSON.stringify(response), {
				headers: {
					"Content-Type": "application/json",
					...corsHeaders,
				},
			});
		}

		// Streaming chat endpoint
		if (url.pathname === "/stream") {
			const stream = await env.AI.run("@cf/aisingapore/gemma-sea-lion-v4-27b-it", {
				messages,
				stream: true,
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					...corsHeaders,
				},
			});
		}

		// 404 for unknown endpoints
		return new Response(
			JSON.stringify({
				error: "Not found",
				availableEndpoints: ["/", "/health", "/chat", "/stream"],
			}),
			{
				status: 404,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders,
				},
			}
		);
	},
} satisfies ExportedHandler<Env>;
