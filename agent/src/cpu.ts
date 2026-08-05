import os from "node:os";
import type { Metric } from "./types/metrics.js";

export async function collectCPUData(): Promise<Metric> {
  try {
    let idleA = 0;
    let idleB = 0;
    let totalA = 0;
    let totalB = 0;

    const sampleA = os.cpus();
    sampleA.forEach((a) => {
      idleA += a.times.idle;
      totalA +=
        a.times.user + a.times.nice + a.times.sys + a.times.idle + a.times.irq;
    });

    await new Promise((resolve) => setTimeout(resolve, 200));

    const sampleB = os.cpus();
    sampleB.forEach((b) => {
      idleB += b.times.idle;
      totalB +=
        b.times.user + b.times.nice + b.times.sys + b.times.idle + b.times.irq;
    });

    const deltaIdle = idleB - idleA;
    const deltaTotal = totalB - totalA;
    const value = Number(((1 - deltaIdle / deltaTotal) * 100).toFixed(2));

    const hostname = os.hostname();
    const name = "cpu_metric";

    return { name, hostname, value };
  } catch (err) {
    console.error("Agent failed to collect CPU data");
    throw err;
  }
}
