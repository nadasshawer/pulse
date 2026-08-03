export type Metric = {
  id: number;
  name: string;
  value: number;
  hostname: string;
  receivedAt: string;
  projectId: number;
};

export type Project = {
  id: number;
  name: string;
  createdAt: string;
};
