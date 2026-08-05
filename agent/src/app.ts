import "dotenv/config";
import { collectMemoryData } from "./memory.js";
import { collectCPUData } from "./cpu.js";
import { reportMetric } from "./report.js";

const API_URL = process.env.API_URL as string;
const API_KEY = process.env.API_KEY as string;

const interval = 10000;

if (!API_URL || !API_KEY) {
  throw new Error("Missing or invalid config: set API_URL and API_KEY in .env");
}

async function tick(): Promise<void> {
  try {
    const memoryData = collectMemoryData();
    const cpuData = await collectCPUData();
    await reportMetric(API_URL, API_KEY, memoryData);
    await reportMetric(API_URL, API_KEY, cpuData);
  } catch (err) {
    console.error("Tick failed:", err);
  }
}

await tick();

setInterval(() => {
  void tick();
}, interval);
