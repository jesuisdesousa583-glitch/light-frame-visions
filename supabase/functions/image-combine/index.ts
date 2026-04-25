// Edge function: image-combine
// Combina foto-base + imagens de referência usando Gemini direto quando GEMINI_API_KEY existe.
// Nunca chama Lovable AI Gateway neste fluxo, evitando consumo de créditos Lovable.

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

    const refsDescription = referenceImages
      .map((_, i) => `IMAGE ${i + 2}`)
      .join(", ");
    const fullPrompt = `IMAGE 1 is the base subject. Preserve the subject identity, face, body, product, pose, and main composition from IMAGE 1. ${refsDescription} ${
      referenceImages.length > 1 ? "are references" : "is the reference"
    } for the new background, style, lighting, objects, or visual elements. Create one polished final image by applying the user's instruction. Instruction: ${prompt}`;

    const toInlineData = async (
      url: string,
    ): Promise<{ mimeType: string; data: string }> => {
      if (url.startsWith("data:")) {
        const [head, b64] = url.split(",");
        const mimeType = head.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
        return { mimeType, data: b64 };
      }
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Falha ao baixar imagem (${r.status})`);
      const buf = new Uint8Array(await r.arrayBuffer());
      const mimeType = r.headers.get("content-type") ?? "image/jpeg";
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) {
        binary += String.fromCharCode(...buf.subarray(i, i + chunk));
      }
      return { mimeType, data: btoa(binary) };
    };

    const freeImageFallback = async (reason: string) => {
      try {
        const seed = Math.floor(Math.random() * 1_000_000);
        const enriched = `${prompt}. Professional photo composition, sharp focus, cinematic lighting, ultra realistic, 4k, social media post`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          enriched,
        )}?width=1024&height=1024&model=flux-realism&seed=${seed}&nologo=true`;
        const imgRes = await fetch(url);
        if (!imgRes.ok) throw new Error(`Pollinations ${imgRes.status}`);
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < buf.length; i += chunk) {
          binary += String.fromCharCode(...buf.subarray(i, i + chunk));
        }
        return new Response(
          JSON.stringify({
            imageUrl: `data:image/jpeg;base64,${btoa(binary)}`,
            fallback: true,
            provider: "pollinations-free",
            fallbackReason: reason,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (err) {
        console.error("Free fallback failed:", err);
        return new Response(
          JSON.stringify({
            error: "Geração grátis falhou. Tente novamente.",
            fallback: true,
            provider: "pollinations-free",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    };

    if (!GEMINI_API_KEY) {
      return await freeImageFallback(
        "GEMINI_API_KEY não configurada — usando geração grátis sem créditos Lovable.",
      );
    }

    try {
      const allImages = [baseImage, ...referenceImages];
      const inlineParts = await Promise.all(
        allImages.map(async (u) => {
          const { mimeType, data } = await toInlineData(u);
          return { inline_data: { mime_type: mimeType, data } };
        }),
      );

      const gResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }, ...inlineParts],
              },
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        },
      );

      if (!gResp.ok) {
        const t = await gResp.text();
        console.error("Gemini direct error", gResp.status, t.slice(0, 500));
        return await freeImageFallback(
          `Gemini direto retornou erro ${gResp.status} — usando geração grátis sem créditos Lovable.`,
        );
      }

      const gData = await gResp.json();
      const parts = gData?.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find(
        (p: Record<string, unknown>) =>
          (p as { inline_data?: unknown }).inline_data ||
          (p as { inlineData?: unknown }).inlineData,
      );
      const inline =
        (imgPart as { inline_data?: { mime_type?: string; data?: string } })?.inline_data ??
        (imgPart as { inlineData?: { mimeType?: string; data?: string } })?.inlineData;

      if (!inline?.data) {
        console.error("Gemini direct: no image in response", JSON.stringify(gData).slice(0, 500));
        return await freeImageFallback(
          "Gemini direto respondeu sem imagem — usando geração grátis sem créditos Lovable.",
        );
      }

      const mimeType =
        (inline as { mime_type?: string; mimeType?: string }).mime_type ??
        (inline as { mimeType?: string }).mimeType ??
        "image/png";

      return new Response(
        JSON.stringify({
          imageUrl: `data:${mimeType};base64,${inline.data}`,
          fallback: false,
          provider: "gemini-direct",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("Gemini direct exception:", err);
      return await freeImageFallback(
        "Gemini direto falhou — usando geração grátis sem créditos Lovable.",
      );
    }
  } catch (e) {
    console.error("image-combine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
