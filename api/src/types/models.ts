export type Metric = {
  id: number;
  name: string;
  value: number;
  hostname: string;
  receivedAt: string | Date;
  projectId: number;
};

export type Project = {
  id: number;
  name: string;
  createdAt: string;
  apiKey: string;
};

export type Rule = {
  id: number;
  createdAt: string | Date;
  threshold: number;
  operator: string;
  metricName: string;
  projectId: number;
};
