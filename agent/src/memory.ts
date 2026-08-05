import os from "node:os";
import type { Metric } from "./types/metrics.js";

export function collectMemoryData(): Metric {
  try {
    const hostname = os.hostname();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const value = Number(((usedMemory / totalMemory) * 100).toFixed(2));
    const name = "memory_metric";

    return { name, hostname, value };
  } catch (err) {
    console.error("Agent failed to collect memory data");
    throw err;
  }
}
