"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setMessage("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 200) {
      const result = await fetch("/api/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(res => res.json());

      if (result.message) {
        setMessage(result.message);
        setStep(2);
      } else {
        setError(result.error || "Failed to send code.");
      }
    } else {
      setError(data.error || "Invalid email or password.");
    }
  };

  const handleMfaSubmit = async () => {
    setError("");
    setMessage("");

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: mfaCode }),
    });

    const data = await res.json();

    if (res.status === 200) {
      router.push("/dashboard");
    } else {
      setError(data.error || "Invalid verification code.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Secure Login</h2>

      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
            Login
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "8px" }}
          />
          <button onClick={handleMfaSubmit} style={{ padding: "10px 20px" }}>
            Verify Code
          </button>
        </>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}
    </div>
  );
}





