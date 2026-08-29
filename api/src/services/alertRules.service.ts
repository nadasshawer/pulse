import type { Metric, Rule } from "../types/models.js";
import { db } from "../database.js";

export async function checkAlerts(metric: Metric) {
  const fired: Rule[] = [];
  const rules = await db.alertRule.findMany({
    where: { projectId: metric.projectId, metricName: metric.name },
  });

  for (const r of rules) {
    if (!["gt", "lt", "gte", "lte", "eq"].includes(r.operator)) {
      continue;
    }

    if (
      (r.operator === "gt" && metric.value > r.threshold) ||
      (r.operator === "lt" && metric.value < r.threshold) ||
      (r.operator === "gte" && metric.value >= r.threshold) ||
      (r.operator === "lte" && metric.value <= r.threshold) ||
      (r.operator === "eq" && metric.value === r.threshold)
    ) {
      fired.push(r);
    }
  }

  return fired;
}
