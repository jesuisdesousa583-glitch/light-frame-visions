// Edge function: image-combine
// Combina 2 imagens (foto-base + referência de estilo/fundo/elemento) usando
// Nano Banana (google/gemini-2.5-flash-image) via Lovable AI Gateway.
// CONSOME créditos do workspace Lovable AI.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { baseImage, prompt } = body;
    // Aceita `referenceImages` (array) OU `referenceImage` (string, legado)
    const refsRaw: unknown =
      body.referenceImages ?? (body.referenceImage ? [body.referenceImage] : []);
    const referenceImages: string[] = Array.isArray(refsRaw)
      ? refsRaw.filter((s) => typeof s === "string" && s.length > 0)
      : [];

    if (!baseImage || typeof baseImage !== "string") {
      return new Response(
        JSON.stringify({ error: "baseImage é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (referenceImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Pelo menos 1 imagem de referência é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (referenceImages.length > 4) {
      return new Response(
        JSON.stringify({ error: "Máximo de 4 imagens de referência" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const refsDescription = referenceImages
      .map((_, i) => `IMAGE ${i + 2}`)
      .join(", ");
    const fullPrompt = `IMAGE 1 is the base subject (preserve identity, face, pose). ${refsDescription} ${
      referenceImages.length > 1 ? "are references" : "is the reference"
    } for style/background/elements (combine them as instructed). Instruction: ${prompt}`;

    // Helper: convert data URL or http URL to {mimeType, base64}
    const toInlineData = async (
      url: string,
    ): Promise<{ mimeType: string; data: string }> => {
      if (url.startsWith("data:")) {
        const [head, b64] = url.split(",");
        const mimeType = head.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
        return { mimeType, data: b64 };
      }
      const r = await fetch(url);
      const buf = new Uint8Array(await r.arrayBuffer());
      const mimeType = r.headers.get("content-type") ?? "image/jpeg";
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) {
        binary += String.fromCharCode(...buf.subarray(i, i + chunk));
      }
      return { mimeType, data: btoa(binary) };
    };

    // PRIMARY PATH: Direct Google Gemini API (uses user's GEMINI_API_KEY, no Lovable credits)
    if (GEMINI_API_KEY) {
      try {
        const allImages = [baseImage, ...referenceImages];
        const inlineParts = await Promise.all(
          allImages.map(async (u) => {
            const { mimeType, data } = await toInlineData(u);
            return { inline_data: { mime_type: mimeType, data } };
          }),
        );
        const geminiBody = {
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }, ...inlineParts],
            },
          ],
        };
        const gResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiBody),
          },
        );
        if (gResp.ok) {
          const gData = await gResp.json();
          const parts = gData?.candidates?.[0]?.content?.parts ?? [];
          const imgPart = parts.find(
            (p: Record<string, unknown>) =>
              (p as { inline_data?: unknown }).inline_data ||
              (p as { inlineData?: unknown }).inlineData,
          );
          const inline =
            (imgPart as { inline_data?: { mime_type: string; data: string } })
              ?.inline_data ??
            (imgPart as { inlineData?: { mimeType: string; data: string } })
              ?.inlineData;
          if (inline) {
            const mt =
              (inline as { mime_type?: string; mimeType?: string }).mime_type ??
              (inline as { mimeType?: string }).mimeType ??
              "image/png";
            const dataUrl = `data:${mt};base64,${inline.data}`;
            return new Response(
              JSON.stringify({
                imageUrl: dataUrl,
                fallback: false,
                provider: "gemini-direct",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
          console.error("Gemini direct: no image in response");
        } else {
          const t = await gResp.text();
          console.error("Gemini direct error", gResp.status, t.slice(0, 300));
        }
      } catch (err) {
        console.error("Gemini direct exception:", err);
      }
      // fall through to Lovable AI / Pollinations
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Nenhuma API key configurada (GEMINI_API_KEY ou LOVABLE_API_KEY)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const content: Array<Record<string, unknown>> = [
      { type: "text", text: fullPrompt },
      { type: "image_url", image_url: { url: baseImage } },
      ...referenceImages.map((url) => ({
        type: "image_url",
        image_url: { url },
      })),
    ];

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content }],
          modalities: ["image", "text"],
        }),
      },
    );

    // Helper: fallback 100% grátis via Pollinations (text-to-image).
    // Não usa as imagens como referência visual (limitação do tier grátis),
    // mas mantém o fluxo funcional sem consumir créditos.
    const pollinationsFallback = async (reason: string) => {
      try {
        const seed = Math.floor(Math.random() * 1_000_000);
        const enriched = `${prompt}. Professional photo composition, sharp focus, cinematic lighting, ultra realistic, 4k, social media post`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          enriched,
        )}?width=1024&height=1024&model=flux-realism&seed=${seed}&nologo=true`;
        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error(`Pollinations ${imgRes.status}`);
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        // Converte para data URL para o client renderizar offline
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < buf.length; i += chunk) {
          binary += String.fromCharCode(...buf.subarray(i, i + chunk));
        }
        const dataUrl = `data:image/jpeg;base64,${btoa(binary)}`;
        return new Response(
          JSON.stringify({
            imageUrl: dataUrl,
            fallback: true,
            fallbackReason: reason,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (err) {
        console.error("Pollinations fallback failed:", err);
        return new Response(
          JSON.stringify({
            error:
              "Sem créditos do Lovable AI e fallback grátis (Pollinations) também falhou. Tente novamente.",
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    };

    if (!resp.ok) {
      if (resp.status === 402 || resp.status === 429) {
        const reason =
          resp.status === 402
            ? "Créditos Lovable AI esgotados — usando geração grátis (sem usar suas fotos como referência visual)."
            : "Limite de uso temporário — usando geração grátis.";
        return await pollinationsFallback(reason);
      }
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return await pollinationsFallback(`Erro no gateway (${resp.status}) — usando fallback grátis.`);
    }

    const data = await resp.json();
    const url: string | undefined =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!url) {
      console.error("Sem imagem:", JSON.stringify(data).slice(0, 500));
      return await pollinationsFallback("Modelo não retornou imagem — usando fallback grátis.");
    }

    return new Response(
      JSON.stringify({ imageUrl: url, fallback: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("image-combine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
