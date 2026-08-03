import "./App.css";
import { useEffect, useState } from "react";
import type { Metric } from "../../api/src/types/models";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Missing or invalid config: set API_URL in .env");
}

function App() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/metrics`);
      const data = await res.json();
      setMetrics(data);
    }
    void load();
  }, []); // Run once after first load

  return (
    <>
      <h1>Pulse</h1>
      <p>Metrics Dashboard</p>
      <table className="metrics-table">
        <thead>
          <tr>
            <th>Host</th>
            <th>Name</th>
            <th>Value</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.id}>
              <td>{m.hostname}</td>
              <td>{m.name}</td>
              <td>{m.value}%</td>
              <td>{m.receivedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
