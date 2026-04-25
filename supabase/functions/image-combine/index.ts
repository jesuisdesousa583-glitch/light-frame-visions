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
      .map((_, i) => `IMAGE ${i + 2}${i === 0 ? " is the primary person/face/pose reference" : " is an extra visual reference"}`)
      .join(", ");
    const fullPrompt = `Using the provided images as visual inputs:

IMAGE 1 is the aesthetic base: use its environment, lighting, background mood, color temperature, and premium visual style.
${refsDescription}.

OBJECTIVE:
Create ONE single professional advertising creative for Instagram/Facebook by naturally combining the visual elements from the images. The final result must look like one original photo, not a collage.

MANDATORY MERGE RULES:
- Keep the face, identity, and main pose from IMAGE 2 as the central focus, conveying authority and trust.
- Use the environment, lighting, and style from IMAGE 1 as the aesthetic foundation.
- Harmonize colors, light direction, skin tones, and temperature with consistent cinematic color grading.
- Make the blend realistic, seamless, and photographic, with no visible cutout or artificial montage.
- Apply shallow depth of field with a softly blurred elegant background.

COMPOSITION:
- Vertical social media format, preferably 4:5 or 9:16.
- Person centered or slightly shifted upward.
- Preserve negative space in the lower area for readable text.
- Crop and frame like a premium legal/professional social ad.

VISUAL STYLE:
- Legal, professional, premium, trustworthy, and persuasive.
- Soft warm lighting, high facial sharpness, elegant minimal background.
- Elevated contrast, subtle dark vignette, gentle dodge and burn on the face.
- Slightly darken the background behind text zones to improve legibility.

TEXT IN THE CREATIVE:
- Add a bold red attention banner at the top or center with short text such as "ATENÇÃO" or "STJ DECIDE".
- Add a large uppercase white headline with strong contrast and light shadow.
- Add a smaller CTA at the bottom: "Confira na legenda".
- Use a modern, bold, highly legible sans-serif typeface.
- Clear hierarchy: banner > headline > CTA.

DEFAULT TEXT OPTIONS IF THE USER DOES NOT SPECIFY TEXT:
Banner: "ATENÇÃO"
Headline: "MESMO EM SEPARAÇÃO TOTAL, VOCÊ PODE TER QUE DIVIDIR SEUS BENS"
CTA: "Confira na legenda"

Alternative:
Banner: "STJ DECIDE"
Headline: "IMÓVEL COMPRADO ANTES DO CASAMENTO PODE SER DIVIDIDO"

USER INSTRUCTION:
${prompt}

IMPORTANT:
Do not create an artificial montage. The fusion must look like a single original professional legal advertising photo ready for high-conversion social media.`;

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
          JSON.stringify({ error: "Geração grátis falhou. Tente novamente.", fallback: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
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
      return await freeImageFallback("Gemini direto não retornou imagem — usando geração grátis sem créditos Lovable.");
    }

    return await freeImageFallback(
      "GEMINI_API_KEY não configurada ou Gemini indisponível — usando fallback grátis sem créditos Lovable.",
    );
  } catch (e) {
    console.error("image-combine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
