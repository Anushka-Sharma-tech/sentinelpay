import type { AnalysisResult } from "@/lib/types/risk";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function analyzeAudio(audio: File, accessToken: string) {
  if (!apiUrl) {
    throw new Error("The FastAPI service is not connected in this environment.");
  }

  const body = new FormData();
  body.append("audio", audio);

  const response = await fetch(`${apiUrl}/api/v1/analyze-audio`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(payload?.detail ?? "Audio analysis failed.");
  }

  return (await response.json()) as AnalysisResult;
}
