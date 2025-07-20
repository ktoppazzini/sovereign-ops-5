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
    console.log(`[🧠 useEffect] Email state: ${email}`);
  }, [email]);

  const log = (label, data) => {
    console.log(`[🧩 ${new Date().toISOString()}] ${label}`, data);
  };

  const handleLogin = async () => {
    setError("");
    setMessage("");
    log("Login attempt", { email, password });

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
    log("Login API response", { status: res.status, data });

    if (res.status === 200) {
      const verifyRes = await fetch("/api/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const verifyData = await verifyRes.json();
      log("MFA Send Response", { status: verifyRes.status, verifyData });

      if (verifyData.message) {
        setMessage(verifyData.message);
        setStep(2);
      } else {
        alert("MFA failed");
        setError(verifyData.error || "Failed to send verification code.");
      }
    } else {
      alert("Login failed");
      setError(data.error || "Invalid email or password.");
    }
  };

  const handleMfaSubmit = async () => {
    setError("");
    setMessage("");

    log("Verify Code Submit", { email, mfaCode });

    if (!email || !mfaCode) {
      alert("Missing email or MFA code");
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
    } catch (err) {
      log("Response parse error", err);
      alert("Could not parse verify-code response");
      setError("Invalid server response");
      return;
    }

    log("Verify API response", { status: res.status, data });

    if (res.status === 200 && data.success) {
      setMessage("✅ Verification successful. Redirecting...");
      alert("MFA success — redirecting");

      setTimeout(() => {
        log("Redirecting to", "/dashboard");
        router.push("/dashboard");
      }, 1000);
    } else {
      alert("MFA failed");
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


