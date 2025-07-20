// ✅ FILE: app/login/page.js

"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setStep(1); // Always reset to login on load
  }, []);

  const log = (label, data) => {
    console.log(`[🧩 ${new Date().toISOString()}] ${label}`, data);
  };

  const handleLogin = async () => {
    setError("");
    setMessage("");
    log("Login", { email, password });

    if (!email || !password) {
      setError("Email and password required.");
      alert("Missing login fields");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    log("Login API response", data);

    if (res.status === 200) {
      const verifyRes = await fetch("/api/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const verifyData = await verifyRes.json();
      log("MFA Send Response", verifyData);

      if (verifyData.message) {
        setMessage(verifyData.message);
        setStep(2);
      } else {
        setError(verifyData.error || "Failed to send verification code.");
      }
    } else {
      setError(data.error || "Invalid email or password.");
    }
  };

  const handleMfaSubmit = async () => {
    setError("");
    setMessage("");
    log("Verify Submit", { email, mfaCode });

    if (!email || !mfaCode) {
      setError("Missing email or code");
      return;
    }

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: mfaCode }),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      log("Verify response parse failed", e);
      return setError("Verification response error");
    }

    log("Verify response", data);

    if (res.status === 200 && data.success) {
      setMessage("✅ Verified. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setError(data.error || "Invalid verification code");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", maxWidth: "400px", margin: "auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Image src="/logo.png" alt="Sovereign Ops Logo" width={150} height={150} />
      </div>
      <h2>Secure Login</h2>

      {step === 1 ? (
        <>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button onClick={handleLogin} style={buttonStyle}>Login</button>
        </>
      ) : (
        <>
          <input type="text" placeholder="Enter your verification code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} style={inputStyle} />
          <button onClick={handleMfaSubmit} style={buttonStyle}>Verify Code</button>
        </>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
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



