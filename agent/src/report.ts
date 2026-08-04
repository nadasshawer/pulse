import type { memoryMetric } from "./types/memory.js";

export async function reportMemory(
  API_URL: string,
  API_KEY: string,
  memoryData: memoryMetric,
): Promise<void> {
  try {
    const result = await fetch(`${API_URL}/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${API_KEY}`,
      },
      body: JSON.stringify({
        name: "memory_used_percent",
        hostname: memoryData.hostname,
        value: memoryData.usedMemoryPercent,
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
