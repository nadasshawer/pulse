import "dotenv/config";
import { collectMemoryData } from "./memory.js";
import { reportMemory } from "./report.js";

const API_URL = process.env.API_URL as string;
const API_KEY = process.env.API_KEY as string;

const interval = 10000;

if (!API_URL || !API_KEY) {
  throw new Error("Missing or invalid config: set API_URL and API_KEY in .env");
}

async function tick(): Promise<void> {
  try {
    const data = collectMemoryData();
    await reportMemory(API_URL, API_KEY, data);
  } catch (err) {
    console.error("Tick failed:", err);
  }
}

await tick();

setInterval(() => {
  void tick();
}, interval);
