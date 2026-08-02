import os from "node:os";
import type { memoryMetric } from "./types/memory.js";

export function collectMemoryData(): memoryMetric {
  try {
    const hostname = os.hostname();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usedMemoryPercent = Number(
      ((usedMemory / totalMemory) * 100).toFixed(2),
    );

    return { hostname, usedMemoryPercent };
  } catch (err) {
    console.error("Agent failed to collect memory data.");
    throw err;
  }
}
