import "https://deno.land/std@0.167.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import EventsRouter from "./eventsRouter.ts";
import { EventAnswer } from "./types/eventAnswer.d.ts";

async function handler(request: Request): Promise<Response> {
  const requestBody = await request.text();
  const requestMethod = request.method;
  const requestURL = request.url;
  const requestContentType = request.headers.get("Content-Type") || "";
  const envvars = {
    SLACK_BOT_TOKEN: Deno.env.get("SLACK_BOT_TOKEN") || "",
    SLACK_SIGNING_SECRET: Deno.env.get("SLACK_SIGNING_SECRET") || "",
    SLACK_CHANNELL_NAME: Deno.env.get("SLACK_CHANNELL_NAME") || "",
    SLACK_SLASHCOMMAND: Deno.env.get("SLACK_SLASHCOMMAND") || "",
    SLACK_SLASHCOMMAND_REQUEST_PATH: Deno.env.get("SLACK_SLASHCOMMAND_REQUEST_PATH") || "",
    OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY") || "",
  };
  const eventsRouter = EventsRouter(requestBody, requestMethod, requestURL, requestContentType, envvars);
  const answer: EventAnswer = await eventsRouter;

  return new Response(answer.message, {
    status: answer.statusCode,
    headers: {
      "Content-Type": answer.contentType,
    },
  });
}

serve(handler, { port: parseInt(Deno.env.get("SERVICE_PORT") || "8686") });
