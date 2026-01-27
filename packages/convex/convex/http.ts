import { httpRouter, httpAction } from "convex/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// HTTP action for API to update session status
// Secured with API key check
http.post("/api/sessions/updateStatus", httpAction(async (ctx, request) => {
  // Check for API key in header
  const apiKey = request.headers.get("X-API-Key");
  const expectedKey = process.env.API_KEY;
  
  if (!expectedKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { id, status, modalSandboxId, errorMessage } = body;

  // Call internal mutation
  await ctx.runMutation(internal.sessions.internalUpdateStatus, {
    id,
    status,
    modalSandboxId,
    errorMessage,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}));

// HTTP action for API to add messages
http.post("/api/messages/add", httpAction(async (ctx, request) => {
  // Check for API key in header
  const apiKey = request.headers.get("X-API-Key");
  const expectedKey = process.env.API_KEY;
  
  if (!expectedKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { sessionId, role, content, toolCalls, toolResults } = body;

  // Call internal mutation
  const messageId = await ctx.runMutation(internal.messages.internalAdd, {
    sessionId,
    role,
    content,
    toolCalls,
    toolResults,
  });

  return new Response(JSON.stringify({ success: true, messageId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}));

export default http;
