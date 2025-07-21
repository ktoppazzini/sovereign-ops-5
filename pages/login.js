// ✅ FILE: pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    if (!cleanedEmail || !cleanedPassword) {
      setError("Missing email or password");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanedEmail, password: cleanedPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        // Success: redirect to your dashboard or homepage
        router.push("/dashboard"); // Change to your target route
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h2>Secure Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f2f4f8;
        }

        .login-box {
          background: #fff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 100%;
          max-width: 400px;
        }

        .logo {
          width: 80px;
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          width: 100%;
          padding: 12px;
          background-color: #002244;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .error {
          color: red;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
