// pages/login/page.js

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import secureIcon from "@/public/images/secure.png";
import styles from "./login.module.css"; // or your preferred styling method

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = login form, 2 = MFA input
  const [mfaCode, setMfaCode] = useState("");
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
      // Successful password check – trigger MFA
      const result = await fetch("/api/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(res => res.json());

      if (result.message) {
        setMessage(result.message); // Shows “Check your texts…” or “Check your email…”
        setStep(2); // Proceed to MFA step
      } else {
        setError(result.error || "Failed to send code.");
      }
    } else {
      setError(data.error || "Invalid login.");
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
    <div className={styles.container}>
      <Image src={secureIcon} alt="Secure" width={100} height={100} />
      <h2>Secure Login</h2>

      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />
          <button onClick={handleMfaSubmit}>Verify Code</button>
        </>
      )}

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>❌ {error}</p>}
    </div>
  );
}




