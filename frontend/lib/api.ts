import type { PredictionFormData, PredictionResult, AnalyticsData, ModelMetadata } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error ${res.status}`);
  }
  return res.json();
}

export async function predictPerformance(input: PredictionFormData): Promise<PredictionResult> {
  return apiFetch<PredictionResult>("/predict", {
    method: "POST",
    body:   JSON.stringify(input),
  });
}

export async function getAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>("/analytics");
}

export async function getModelMetadata(): Promise<ModelMetadata> {
  return apiFetch<ModelMetadata>("/model-metadata");
}

export async function checkHealth(): Promise<{ status: string; model: string }> {
  return apiFetch("/health");
}
