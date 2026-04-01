"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      const url = isLogin
      ? `${API}/login`
      : `${API}/signup`;
      
      const res = await axios.post(url, { email,
        password,
    });

      // ✅ STORE LOGIN + REDIRECT
      if (isLogin) {
        localStorage.setItem("user", email);
        router.push("/");
      }

      setMessage(res.data.message);

    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Error occurred");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "12px",
          width: "300px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "6px",
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          {isLogin ? "No account?" : "Already have an account?"}{" "}
          <span
            style={{ color: "#60a5fa", cursor: "pointer" }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

        {message && (
          <p style={{ marginTop: "10px", color: "#22c55e" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}