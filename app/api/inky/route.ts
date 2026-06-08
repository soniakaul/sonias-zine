import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/inky";

export const runtime = "nodejs"; // needs the filesystem to read the corpus

// Built once per server instance. Identical bytes every request → the
// system prompt caches near-perfectly (cache reads ~10% of input cost).
const SYSTEM_PROMPT = buildSystemPrompt();

// ---- Rate limiting (in-memory; resets on cold start — fine to start) ----
const PER_IP_MAX = 20; // questions per IP per window
const PER_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const GLOBAL_DAILY_MAX = 600; // total questions/day across everyone

const ipHits = new Map<string, number[]>();
let dayStamp = "";
let dayCount = 0;

function todayKey(): string {
  // Avoid Date in cache-sensitive paths only; here it's fine.
  return new Date().toISOString().slice(0, 10);
}

function allow(ip: string): { ok: boolean; reason?: string } {
  const today = todayKey();
  if (today !== dayStamp) {
    dayStamp = today;
    dayCount = 0;
  }
  if (dayCount >= GLOBAL_DAILY_MAX) {
    return { ok: false, reason: "global" };
  }

  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS);
  if (recent.length >= PER_IP_MAX) {
    return { ok: false, reason: "ip" };
  }
  recent.push(now);
  ipHits.set(ip, recent);
  dayCount += 1;
  return { ok: true };
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function textResponse(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  let question = "";
  try {
    const data = await req.json();
    question = typeof data?.question === "string" ? data.question.trim() : "";
  } catch {
    return textResponse("Hmm, I couldn't read that question.", 400);
  }

  if (!question) return textResponse("Ask me something first ✦", 400);
  if (question.length > 600) {
    return textResponse("That's a long one — try asking me something shorter.", 400);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return textResponse(
      "Inky's brain isn't plugged in yet — the site owner needs to set ANTHROPIC_API_KEY.",
      503
    );
  }

  const gate = allow(clientIp(req));
  if (!gate.ok) {
    const msg =
      gate.reason === "global"
        ? "I've answered a lot of questions today — give me a rest and come back tomorrow ✦"
        : "Whoa, lots of questions! Give me a minute to catch my breath and try again soon ✦";
    return textResponse(msg, 429);
  }

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: question }],
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Anthropic.RateLimitError
            ? "\n\n(I'm a little overwhelmed right now — try again in a moment.)"
            : "\n\n(Something went sideways on my end. Try again?)";
        controller.enqueue(encoder.encode(msg));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
