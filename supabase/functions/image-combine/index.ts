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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const refsDescription = referenceImages
      .map((_, i) => `IMAGE ${i + 2}`)
      .join(", ");
    const fullPrompt = `IMAGE 1 is the base subject (preserve identity, face, pose). ${refsDescription} ${
      referenceImages.length > 1 ? "are references" : "is the reference"
    } for style/background/elements (combine them as instructed). Instruction: ${prompt}`;

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

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite atingido. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos Lovable AI esgotados. Adicione saldo em Settings → Cloud & AI balance." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no gateway" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const url: string | undefined =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!url) {
      console.error("Sem imagem:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Modelo não retornou imagem" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ imageUrl: url }),
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
