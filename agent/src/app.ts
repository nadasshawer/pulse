import "dotenv/config";
import { collectMemoryData } from "./memory.js";
import { reportMemory } from "./report.js";

const API_URL = process.env.API_URL as string;
const PROJECT_ID = Number(process.env.PROJECT_ID);
const interval = 10000;

if (!API_URL || !PROJECT_ID || isNaN(PROJECT_ID)) {
  throw new Error(
    "Missing or invalid config: set API_URL and PROJECT_ID in .env",
  );
}

async function tick(): Promise<void> {
  try {
    const data = collectMemoryData();
    await reportMemory(API_URL, PROJECT_ID, data);
  } catch (err) {
    console.error("Tick failed:", err);
  }
}

await tick();

setInterval(() => {
  void tick();
}, interval);
