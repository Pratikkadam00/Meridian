// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.108.1";
import { z } from "npm:zod@4.4.3";

const milestoneSchema = z.object({
  label: z.string().min(1),
  triggerType: z.enum(["booking", "registration", "construction", "handover"]),
  triggerValue: z.string().nullable(),
  percent: z.string().regex(/^\d+(\.\d+)?$/),
  amountAed: z.string().regex(/^\d+(\.\d+)?$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  status: z.enum(["due", "upcoming", "overdue", "paid"]),
  source: z.literal("spa_extracted"),
});

const requestSchema = z.object({
  dealId: z.string().uuid(),
  storagePath: z.string().min(1),
});

const responseSchema = z.object({
  milestones: z.array(milestoneSchema).min(1),
});

serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const anthropicModel = Deno.env.get("ANTHROPIC_MODEL");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json({ error: "Supabase function environment is not configured." }, 500);
  }

  if (!anthropicApiKey || !anthropicModel) {
    return json({ error: "AI extraction is not configured. Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL." }, 503);
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return json({ error: "Authorization is required." }, 401);
  }

  const body = requestSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return json({ error: "Invalid extraction request." }, 400);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const { data: orgId, error: orgError } = await userClient.rpc("current_org_id");

  if (orgError || !orgId) {
    return json({ error: orgError?.message ?? "Could not resolve organization." }, 403);
  }

  if (!body.data.storagePath.startsWith(`${orgId}/${body.data.dealId}/`)) {
    return json({ error: "Storage path does not belong to this organization and deal." }, 403);
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: spaFile, error: downloadError } = await serviceClient.storage.from("deal-documents").download(body.data.storagePath);

  if (downloadError || !spaFile) {
    return json({ error: downloadError?.message ?? "Could not read SPA file." }, 404);
  }

  const pdfBase64 = encodeBase64(await spaFile.arrayBuffer());
  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": anthropicApiKey,
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text:
                "Extract the off-plan real estate payment schedule from this SPA. Return JSON only in this exact shape: {\"milestones\":[{\"label\":\"Down payment\",\"triggerType\":\"booking|registration|construction|handover\",\"triggerValue\":\"Booking or 40% built\",\"percent\":\"20\",\"amountAed\":\"640000\",\"dueDate\":\"YYYY-MM-DD or null\",\"status\":\"due|upcoming|overdue|paid\",\"source\":\"spa_extracted\"}]}. Use numeric strings only for percent and amountAed.",
            },
          ],
        },
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    return json({ error: "SPA extraction failed. Continue with manual entry." }, 502);
  }

  const anthropicPayload = await anthropicResponse.json();
  const text = extractText(anthropicPayload);
  const parsedJson = parseJsonObject(text);
  const parsed = responseSchema.safeParse(parsedJson);

  if (!parsed.success) {
    return json({ error: "SPA extraction returned an invalid payment plan. Continue with manual entry." }, 422);
  }

  return json(parsed.data);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function extractText(payload: unknown) {
  const content = (payload as { content?: Array<{ type?: string; text?: string }> }).content ?? [];
  const text = content
    .filter((item) => item.type === "text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("No text returned from AI extraction.");
  }

  return text;
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("No JSON object returned from AI extraction.");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function encodeBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}
