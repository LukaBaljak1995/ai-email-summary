import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const openai = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY")
);

const oauth2 = new google.auth.OAuth2(
  requireEnv("GOOGLE_CLIENT_ID"),
  requireEnv("GOOGLE_CLIENT_SECRET")
);

oauth2.setCredentials({
  refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN")
});

const gmail = google.gmail({ version: "v1", auth: oauth2 });

type ActionItem = {
  emailId: string;
  sender: string;
  subject: string;
  category: string;
  recommendation: "high" | "medium" | "low" | "ignore";
  deal?: string;
  expiresAt?: string;
  reason: string;
};

type SummaryRow = {
  date: string;
  status: "read" | "unread";
  generated_at: string;
  processed_email_count: number;
  items: ActionItem[];
  full_summary: string;
  read_at?: string | null;
};

function todayId() {
  return new Date().toISOString().slice(0, 10);
}

function decodeBase64Url(data?: string) {
  if (!data) return "";
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function extractBody(payload: any): string {
  if (!payload) return "";

  if (payload.body?.data) return decodeBase64Url(payload.body.data);

  const parts = payload.parts || [];
  const plain = parts.find((p: any) => p.mimeType === "text/plain");
  if (plain?.body?.data) return decodeBase64Url(plain.body.data);

  const html = parts.find((p: any) => p.mimeType === "text/html");
  if (html?.body?.data) {
    return decodeBase64Url(html.body.data).replace(/<[^>]+>/g, " ");
  }

  for (const part of parts) {
    const nested = extractBody(part);
    if (nested) return nested;
  }

  return "";
}

function header(headers: any[], name: string) {
  return headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function toSummaryResponse(row: SummaryRow) {
  return {
    id: row.date,
    date: row.date,
    status: row.status,
    generatedAt: row.generated_at,
    processedEmailCount: row.processed_email_count,
    items: row.items,
    fullSummary: row.full_summary,
    readAt: row.read_at ?? undefined
  };
}

async function analyzeEmail(email: {
  id: string;
  from: string;
  subject: string;
  body: string;
}): Promise<ActionItem | null> {
  const result = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You analyze promotional/social emails for genuinely useful action items. Ignore spam, weak marketing, generic newsletters, and low-value deals."
      },
      {
        role: "user",
        content: JSON.stringify(email)
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "email_action_item",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            hasActionItem: { type: "boolean" },
            category: {
              type: "string",
              enum: ["tech", "beauty", "travel", "food", "finance", "events", "shopping", "other"]
            },
            recommendation: {
              type: "string",
              enum: ["high", "medium", "low", "ignore"]
            },
            deal: { type: ["string", "null"] },
            expiresAt: { type: ["string", "null"] },
            reason: { type: "string" }
          },
          required: ["hasActionItem", "category", "recommendation", "deal", "expiresAt", "reason"]
        }
      }
    }
  });

  const parsed = JSON.parse(result.output_text);

  if (!parsed.hasActionItem || parsed.recommendation === "ignore") return null;

  return {
    emailId: email.id,
    sender: email.from,
    subject: email.subject,
    category: parsed.category,
    recommendation: parsed.recommendation,
    deal: parsed.deal ?? undefined,
    expiresAt: parsed.expiresAt ?? undefined,
    reason: parsed.reason
  };
}

app.post("/run-daily", async (_req, res) => {
  const query = "is:unread (category:promotions OR category:social)";
  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50
  });

  const messages = list.data.messages || [];
  const items: ActionItem[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;

    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full"
    });

    const headers = full.data.payload?.headers || [];
    const email = {
      id: msg.id,
      from: header(headers, "From"),
      subject: header(headers, "Subject"),
      body: extractBody(full.data.payload).slice(0, 12000)
    };

    const item = await analyzeEmail(email);
    if (item) items.push(item);

    await gmail.users.messages.modify({
      userId: "me",
      id: msg.id,
      requestBody: {
        removeLabelIds: ["UNREAD"]
      }
    });
  }

  const date = todayId();

  const fullSummary =
    items.length === 0
      ? "No worthwhile action items found today."
      : items
          .map(i => `- [${i.recommendation}] ${i.category}: ${i.subject} — ${i.reason}`)
          .join("\n");

  const { error } = await supabase.from("daily_summaries").upsert({
    date,
    status: "unread",
    generated_at: new Date().toISOString(),
    processed_email_count: messages.length,
    items,
    full_summary: fullSummary
  });

  if (error) {
    throw error;
  }

  res.json({ ok: true, date, processedEmailCount: messages.length, actionItemCount: items.length });
});

app.get("/summaries", async (_req, res) => {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("date,status,generated_at,processed_email_count,items,full_summary,read_at")
    .order("date", { ascending: false })
    .limit(60);

  if (error) {
    throw error;
  }

  res.json((data ?? []).map(toSummaryResponse));
});

app.get("/summaries/:date", async (req, res) => {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("date,status,generated_at,processed_email_count,items,full_summary,read_at")
    .eq("date", req.params.date)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(toSummaryResponse(data));
});

app.post("/summaries/:date/read", async (req, res) => {
  const { error } = await supabase
    .from("daily_summaries")
    .update({
      status: "read",
      read_at: new Date().toISOString()
    })
    .eq("date", req.params.date);

  if (error) {
    throw error;
  }
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Listening on ${port}`));
