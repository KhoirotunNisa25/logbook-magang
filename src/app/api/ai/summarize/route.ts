import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { rawText, provider, apiKey, model } = await req.json();

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: "Teks laporan tidak boleh kosong." }, { status: 400 });
    }

    const aiProvider = provider || "gemini";
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!effectiveKey) {
      return NextResponse.json(
        {
          error: "API Key belum diisi. Masukkan API Key Gemini atau Claude di menu Pengaturan.",
        },
        { status: 400 }
      );
    }

    const systemInstruction = `Anda adalah asisten akademik yang bertugas merangkum laporan harian aktivitas magang industri mahasiswa Jurusan Teknologi Informasi Politeknik Negeri Malang (Polinema).
Tugas Anda adalah mengubah catatan/chat laporan harian Telegram menjadi TEPAT SATU PARAGRAF narasi formal yang baku, mengalir, dan padat.

Aturan Penting:
1. Output HANYA berupa satu paragraf narasi tanpa kata pengantar, tanpa salam, tanpa tanda kutip, dan tanpa bullet points.
2. Gunakan kata kerja baku formal (misal: Mengikuti, Mengembangkan, Menyelesaikan, Memvalidasi, Melakukan pengujian, Memperbaiki kendala).
3. Rangkai beberapa aktivitas menjadi satu kesatuan kalimat yang padat dan logis menggunakan konjungsi baku (serta, dan, untuk).
4. Singkat dan tidak bertele-tele (antara 2 hingga 4 kalimat).
5. Pertahankan istilah teknis (seperti API, Meta Ads, Next.js, backend, database, sprint, meeting, E2E).`;

    let summaryText = "";

    if (aiProvider === "gemini") {
      const preferredModel = model || "gemini-3.8-flash";
      const callGemini = async (modelName: string) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveKey}`;
        return await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemInstruction}\n\nBerikut catatan laporan harian Telegram:\n${rawText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 300,
            },
          }),
        });
      };

      let res = await callGemini(preferredModel);
      if (!res.ok && res.status === 404) {
        const fallbackModel = preferredModel === "gemini-3.8-flash" ? "gemini-flash-latest" : "gemini-3.8-flash";
        res = await callGemini(fallbackModel);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error (Status ${res.status})`);
      }

      const data = await res.json();
      summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } else if (aiProvider === "claude") {
      const selectedModel = model || "claude-3-5-sonnet-20241022";
      const url = "https://api.anthropic.com/v1/messages";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": effectiveKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 300,
          temperature: 0.3,
          system: systemInstruction,
          messages: [
            {
              role: "user",
              content: `Berikut catatan laporan harian Telegram:\n${rawText}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude API error (Status ${res.status})`);
      }

      const data = await res.json();
      summaryText = data.content?.[0]?.text?.trim() || "";
    } else {
      throw new Error(`Provider ${aiProvider} tidak didukung.`);
    }

    return NextResponse.json({ summary: summaryText });
  } catch (error: any) {
    console.error("AI Summarizer Error:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses narasi dengan AI." }, { status: 500 });
  }
}
