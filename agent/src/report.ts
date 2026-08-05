import type { Metric } from "./types/metrics.js";

export async function reportMetric(
  API_URL: string,
  API_KEY: string,
  metric: Metric,
): Promise<void> {
  try {
    const result = await fetch(`${API_URL}/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${API_KEY}`,
      },
      body: JSON.stringify({
        name: metric.name,
        hostname: metric.hostname,
        value: metric.value,
      }),
    });

    if (!result.ok) {
      const body = await result.text();
      throw new Error(`API error ${result.status}: ${body}`);
    }
    console.log("Metric sent to API successfully.");
  } catch (err) {
    console.error("Agent failed:", err);
  }
}
