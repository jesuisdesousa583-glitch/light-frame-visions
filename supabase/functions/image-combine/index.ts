// Edge function: image-combine
// Combina foto-base + referências usando a chave Gemini configurada no backend.
// Não chama Lovable AI Gateway, portanto não consome créditos Lovable.

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

    const refsDescription = referenceImages
      .map((_, i) => `IMAGEM ${i + 2}${i === 0 ? " = rosto e pose principal" : " = referência visual adicional"}`)
      .join("; ");
    const fullPrompt = `Usando DUAS imagens fornecidas como base:

MAPEAMENTO DAS IMAGENS:
- IMAGEM 1: ambiente, iluminação, fundo e estilo estético.
- ${refsDescription}.

OBJETIVO:
Criar UM ÚNICO criativo publicitário profissional para redes sociais (Instagram/Facebook), combinando elementos visuais das duas imagens de forma natural, moderna e altamente persuasiva.

REGRAS DE MESCLAGEM (OBRIGATÓRIO):
- Manter o rosto e pose principal da imagem 2 como foco central (autoridade/confiança)
- Usar o ambiente/iluminação/estilo da imagem 1 como base estética
- Harmonizar cores, luz e temperatura entre as duas imagens (color grading consistente)
- Garantir aparência realista (não artificial ou colagem visível)
- Aplicar profundidade de campo suave (background levemente desfocado)

COMPOSIÇÃO:
- Formato vertical (4:5 ou 9:16)
- Pessoa centralizada ou levemente deslocada para cima
- Espaço negativo na parte inferior para texto

ESTILO VISUAL:
- Estilo jurídico/profissional/premium
- Iluminação suave e quente
- Alta nitidez no rosto
- Fundo elegante e minimalista

TEXTO NO CRIATIVO:
- Inserir um banner vermelho chamativo no topo ou centro com texto curto (ex: "ATENÇÃO" ou "STJ DECIDE")
- Abaixo, inserir headline grande em branco, caixa alta, forte contraste
- Texto com sombra leve para legibilidade
- Inserir CTA menor no final: "Confira na legenda"

TIPOGRAFIA:
- Fonte sans-serif moderna, forte e legível
- Hierarquia clara: título > subtítulo > CTA

EXEMPLO DE TEXTO:
Banner: "ATENÇÃO"
Headline: "MESMO EM SEPARAÇÃO TOTAL, VOCÊ PODE TER QUE DIVIDIR SEUS BENS"
CTA: "Confira na legenda"

OU

Banner: "STJ DECIDE"
Headline: "IMÓVEL COMPRADO ANTES DO CASAMENTO PODE SER DIVIDIDO"

EFEITOS:
- Leve vinheta escura nas bordas
- Contraste elevado
- Realce no rosto (dodge & burn leve)
- Fundo levemente escurecido para destacar texto

INSTRUÇÃO DO USUÁRIO:
${prompt}

RESULTADO FINAL:
Um criativo único, profissional, altamente chamativo, com aparência de anúncio real de advocacia, pronto para alta conversão em redes sociais.

IMPORTANTE:
Não criar montagem artificial. A fusão deve parecer uma única foto original.`;

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

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY não configurada no backend.",
          provider: "gemini-direct",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // PRIMARY PATH: Direct Google Gemini API (uses user's GEMINI_API_KEY, no Lovable credits)
    const directModels = ["gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"];
    let lastGeminiStatus = 502;
    let lastGeminiError = "Gemini direto não retornou imagem.";

    for (const model of directModels) {
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
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        };
        const gResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
          lastGeminiError = `${model}: resposta sem imagem`;
          console.error("Gemini direct: no image in response", model);
        } else {
          const t = await gResp.text();
          lastGeminiStatus = gResp.status;
          lastGeminiError = `${model}: ${t.slice(0, 500)}`;
          console.error("Gemini direct error", model, gResp.status, t.slice(0, 300));
        }
      } catch (err) {
        lastGeminiError = err instanceof Error ? err.message : "Erro desconhecido no Gemini direto";
        console.error("Gemini direct exception:", model, err);
      }
    }

    return new Response(
      JSON.stringify({
        error:
          lastGeminiStatus === 429
            ? "A chave Gemini está configurada, mas está sem quota para geração/edição de imagem. Nenhum crédito Lovable foi usado."
            : "Gemini direto não conseguiu gerar a imagem. Nenhum crédito Lovable foi usado.",
        provider: "gemini-direct",
        details: lastGeminiError,
      }),
      {
        status: lastGeminiStatus === 429 ? 429 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("image-combine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
