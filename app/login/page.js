"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        setError(result.error || "Failed to send verification code.");
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
    console.log("📥 verify-code response", res.status, data);

    if (res.status === 200) {
      setMessage("✅ Verification successful. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(data.error || "Invalid verification code.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", maxWidth: "400px", margin: "auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Image src="/logo.png" alt="Sovereign Ops Logo" width={150} height={150} />
      </div>
      <h2 style={{ marginTop: "1rem" }}>Secure Login</h2>

      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleLogin} style={buttonStyle}>
            Login
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter your verification code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleMfaSubmit} style={buttonStyle}>
            Verify Code
          </button>
        </>
      )}

      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  margin: "10px 0",
  padding: "10px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  backgroundColor: "#0a2540",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
