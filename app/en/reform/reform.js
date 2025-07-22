import { useState, useEffect } from "react";
import Image from "next/image";

export default function ReformFormEN() {
  const [org, setOrg] = useState("");
  const [country, setCountry] = useState("");
  const [size, setSize] = useState("");
  const [tier, setTier] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [outcome, setOutcome] = useState("");
  const [savings, setSavings] = useState("");
  const [goals, setGoals] = useState("");

  const [countries, setCountries] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [timeFrames, setTimeFrames] = useState([]);

  useEffect(() => {
    fetch("/api/options")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.countriesEN || []);
        setSizes(data.sizes || []);
        setTiers(data.tiers || []);
        setTimeFrames(data.timeFramesEN || []);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org,
        country,
        size,
        tier,
        timeframe,
        outcome,
        savings,
        goals,
        language: "EN",
      }),
    });
    const result = await res.json();
    if (result.success) alert("✅ Report submitted!");
    else alert("❌ Error submitting report.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: "center" }}>
          <Image src="/secure.png" width={40} height={40} alt="Lock" />
          <h2>Sovereign Ops Reform Generator</h2>
        </div>

        <a href="/fr/reform" style={styles.toggle}>FR</a>

        <form onSubmit={handleSubmit}>
          <label>Organization Name</label>
          <input value={org} onChange={(e) => setOrg(e.target.value)} required />

          <label>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} required>
            <option>-- Select Country --</option>
            {countries.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <label>Company Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} required>
            <option>-- Select Size --</option>
            {sizes.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>

          <label>Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} required>
            <option>-- Select Tier --</option>
            {tiers.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>

          <label>Time Frame</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} required>
            <option>-- Select Time Frame --</option>
            {timeFrames.map((tf, i) => (
              <option key={i} value={tf}>{tf}</option>
            ))}
          </select>

          <label>Desired Outcome</label>
          <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} required />

          <label>Cost Savings Goal</label>
          <input value={savings} onChange={(e) => setSavings(e.target.value)} required />

          <label>Strategic Goals</label>
          <textarea value={goals} onChange={(e) => setGoals(e.target.value)} required />

          <button type="submit">Generate Report</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "500px",
    position: "relative",
  },
  toggle: {
    position: "absolute",
    right: 20,
    top: 20,
    fontSize: "14px",
    color: "#0074D9",
    textDecoration: "underline",
    cursor: "pointer",
  },
};
