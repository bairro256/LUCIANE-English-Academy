import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set(["https://bairro256.github.io"]);
const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (body: unknown, status = 200, origin = "https://bairro256.github.io") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const letters = ["A", "B", "C", "D"];
const types = ["fill_blank", "situational", "definition", "grammar", "meaning_in_context"];

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lesson: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        topic: { type: "string" },
        level: { type: "string", enum: ["A2", "B1"] },
        instructionLanguage: { type: "string", enum: ["pt", "en", "pt-en"] },
        exerciseCount: { type: "integer" }
      },
      required: ["id", "topic", "level", "instructionLanguage", "exerciseCount"]
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: types },
          target: { type: "string" },
          prompt: { type: "string" },
          context: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string", enum: letters },
                text: { type: "string" }
              },
              required: ["id", "text"]
            }
          },
          correctOptionId: { type: "string", enum: letters },
          explanation: { type: "string" }
        },
        required: ["id", "type", "target", "prompt", "context", "options", "correctOptionId", "explanation"]
      }
    }
  },
  required: ["lesson", "exercises"]
};

function normalise(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function randomInt(max: number) {
  const data = new Uint32Array(1);
  crypto.getRandomValues(data);
  return data[0] % max;
}
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function validateAndRandomise(data: any, expectedTopic: string, level: string) {
  if (!data || !Array.isArray(data.exercises) || data.exercises.length !== 5) {
    throw new Error("A lição tem de conter exactamente cinco exercícios.");
  }
  const ids = new Set<string>();
  const targets = new Set<string>();
  const seenTypes = new Set<string>();
  for (const ex of data.exercises) {
    if (!ex || typeof ex.id !== "string" || ids.has(ex.id)) throw new Error("Identificadores de exercício inválidos ou repetidos.");
    ids.add(ex.id);
    const target = normalise(String(ex.target ?? ""));
    if (!target || targets.has(target)) throw new Error("A lição contém alvos de aprendizagem repetidos.");
    targets.add(target);
    if (!Array.isArray(ex.options) || ex.options.length !== 4) throw new Error("Cada exercício deve ter quatro opções.");
    const optionIds = ex.options.map((o: any) => o?.id);
    const optionTexts = ex.options.map((o: any) => normalise(String(o?.text ?? "")));
    if (new Set(optionIds).size !== 4 || !letters.every((x) => optionIds.includes(x))) throw new Error("IDs de opções inválidos.");
    if (optionTexts.some((x: string) => !x) || new Set(optionTexts).size !== 4) throw new Error("As quatro opções devem ser diferentes e não vazias.");
    if (!letters.includes(ex.correctOptionId) || !optionIds.includes(ex.correctOptionId)) throw new Error("Resposta correcta não corresponde a uma opção.");
    if (!types.includes(ex.type) || seenTypes.has(ex.type)) throw new Error("Os cinco formatos de exercício devem ser diferentes.");
    seenTypes.add(ex.type);
    if (![ex.prompt, ex.context, ex.explanation].every((x) => typeof x === "string" && x.trim().length > 0)) throw new Error("Conteúdo pedagógico incompleto.");
  }

  // Force a balanced, unpredictable correct-answer pattern on the server.
  const correctPositions = shuffle(["A", "B", "C", "D", "A"]);
  data.exercises = data.exercises.map((ex: any, index: number) => {
    const correct = ex.options.find((o: any) => o.id === ex.correctOptionId);
    const distractors = shuffle(ex.options.filter((o: any) => o.id !== ex.correctOptionId));
    const position = letters.indexOf(correctPositions[index]);
    const arranged = [...distractors];
    arranged.splice(position, 0, correct);
    return {
      ...ex,
      options: arranged.map((option: any, i: number) => ({ id: letters[i], text: option.text })),
      correctOptionId: correctPositions[index]
    };
  });
  data.lesson = {
    id: typeof data.lesson?.id === "string" ? data.lesson.id : crypto.randomUUID(),
    topic: expectedTopic,
    level,
    instructionLanguage: level === "A2" ? "pt" : "pt-en",
    exerciseCount: 5
  };
  return data;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  if (req.method === "OPTIONS") {
    if (!allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
    return new Response("ok", { headers: cors(origin) });
  }
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405, origin || "https://bairro256.github.io");
  if (!allowedOrigins.has(origin)) return json({ error: "Origem não autorizada." }, 403);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey) return json({ error: "O gerador ainda não tem a chave privada da IA configurada no servidor." }, 503, origin);
  if (!supabaseUrl || !serviceKey) return json({ error: "O controlo de utilização do gerador não está configurado." }, 503, origin);

  // Persistent per-IP quota. The raw IP is never stored in the database.
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const minute = new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + ":" + apiKey));
  const ipHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const limitResponse = await fetch(supabaseUrl + "/rest/v1/rpc/consume_practice_generation_limit", {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": "Bearer " + serviceKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ p_ip_hash: ipHash, p_window_start: minute })
  });
  if (!limitResponse.ok) {
    console.error("Rate limit store failed", limitResponse.status, (await limitResponse.text()).slice(0, 300));
    return json({ error: "Não foi possível validar o limite de utilização. Tenta novamente." }, 503, origin);
  }
  const requestCount = Number(await limitResponse.json());
  if (!Number.isFinite(requestCount) || requestCount > 5) {
    return json({ error: "Limite temporário atingido: máximo de cinco lições por minuto. Aguarda e tenta novamente." }, 429, origin);
  }

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "Pedido JSON inválido." }, 400, origin); }

  const topicKeys = ["all", "adjectives", "nouns", "pronouns", "verbs", "prepositions"];
  const activityKeys = ["meaning", "gap", "context", "translate", "repair", "recall"];
  const topic = topicKeys.includes(payload?.topic) ? payload.topic : "all";
  const activity = activityKeys.includes(payload?.activity) ? payload.activity : "meaning";
  const level = payload?.level === "advanced" ? "B1" : "A2";
  const topicLabel: Record<string, string> = {
    all: "mixed English grammar and vocabulary",
    adjectives: "adjectives",
    nouns: "nouns",
    pronouns: "pronouns",
    verbs: "verbs",
    prepositions: "prepositions"
  };
  const activityLabel: Record<string, string> = {
    meaning: "meaning in context",
    gap: "gap filling and grammar application",
    context: "sentence detective and contextual choice",
    translate: "natural translation and meaning transfer",
    repair: "error correction",
    recall: "active recall and transfer"
  };

  const systemPrompt = `You are the assessment designer for LUCIANE English Academy. Generate one COMPLETE lesson batch of exactly FIVE multiple-choice exercises in a SINGLE response.
Learner level: ${level}. Topic: ${topicLabel[topic]}. Preferred activity emphasis: ${activityLabel[activity]}.
Pedagogy:
- Each exercise must teach a DIFFERENT target word, phrase, collocation, or grammar structure. Never repeat or paraphrase the same target.
- Never create mirrored questions where one asks for a translation and another simply reverses that translation.
- Use five varied formats across the batch: fill_blank, situational, definition, grammar, meaning_in_context. Use the requested activity as a slight emphasis, not as a reason to repeat formats.
- Use authentic, realistic contexts related to community life, education, work, public services, neighbourhoods, and everyday communication where suitable.
- Distractors must be genuinely challenging: same grammatical class, plausible collocations, preposition errors, word-order mistakes, false friends, near-synonyms, or contextually tempting alternatives. Avoid silly or obviously unrelated options.
- Exactly ONE option must be correct in the given context. All four options must be distinct, natural-looking, and similar in length where practical.
- At A2, use Portuguese for instructions and explanations, while keeping English examples natural. At B1, use English more often, with concise Portuguese support only where useful.
- Do not mention the correct answer in the prompt or context. Explanations must teach the rule and clarify why the correct form fits.
- Return only the JSON object matching the supplied schema. Generate all five exercises together and check target uniqueness before returning.
- Do not try to encode a preferred correct-letter pattern; the server randomises answer positions after validation.`;

  const userPrompt = `Create five challenging ${level} exercises about ${topicLabel[topic]}, with ${activityLabel[activity]} emphasis. Include different targets and realistic distractors. The five exercise types must cover the five schema types exactly once.`;

  let aiResponse: Response;
  try {
    aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_schema", json_schema: { name: "luciane_practice_lesson", strict: true, schema } },
        temperature: 0.65,
        max_tokens: 3000
      })
    });
  } catch (error) {
    console.error("OpenAI network error", error);
    return json({ error: "Não foi possível contactar o gerador de exercícios." }, 502, origin);
  }
  if (!aiResponse.ok) {
    const detail = await aiResponse.text();
    console.error("OpenAI error", aiResponse.status, detail.slice(0, 600));
    return json({ error: "A IA não conseguiu gerar esta lição. Tenta novamente." }, 502, origin);
  }

  const result = await aiResponse.json();
  const message = result.choices?.[0]?.message;
  if (message?.refusal) return json({ error: "O gerador recusou este pedido." }, 502, origin);
  let lesson: any;
  try { lesson = JSON.parse(message?.content ?? "{}"); }
  catch { return json({ error: "A resposta da IA não veio em JSON válido." }, 502, origin); }

  try {
    const validated = validateAndRandomise(lesson, topicLabel[topic], level);
    return json(validated, 200, origin);
  } catch (error) {
    console.error("Batch validation failed", String(error));
    return json({ error: "A lição gerada não passou na validação de qualidade. Gera novamente." }, 502, origin);
  }
});
