import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return errorResponse(response.url);
}

// API and server-function callers must always get JSON — an HTML error page is
// unparseable on the client and hides the real cause.
function wantsJson(request: Request): boolean {
  const path = new URL(request.url).pathname;
  return path.startsWith("/api/") || path.startsWith("/_serverFn");
}

function jsonError(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function errorResponse(_url?: string): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Keep a static import of the framework handler and export through createServerEntry
// so AsyncLocalStorage is shared with server functions, middleware, and loaders.
// A dynamic import("@tanstack/react-start/server-entry") can load a second module
// graph and break getRequest() / other server context utilities at runtime.
export default createServerEntry({
  async fetch(request: Request, ...rest: unknown[]) {
    try {
      const response = await handler.fetch(request, ...rest);
      if (wantsJson(request)) return response;
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      if (wantsJson(request)) {
        return jsonError(
          error instanceof Error && error.message
            ? error.message
            : "The server hit an unexpected error.",
        );
      }
      return errorResponse();
    }
  },
});
