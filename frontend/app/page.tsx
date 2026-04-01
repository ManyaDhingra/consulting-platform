"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const router = useRouter();

useEffect(() => {
  const user = localStorage.getItem("user");

  if (!user) {
    router.push("/auth");
  }
}, []);
const user = typeof window !== "undefined" ? localStorage.getItem("user") : "";


  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/full-analysis`,
  formData
);
      setData(res.data);
    } catch {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    data && data.region_sales
      ? Object.entries(data.region_sales).map(([region, sales]) => ({
          region,
          sales,
        }))
      : [];

  const theme = darkMode
    ? {
        bg: "#0f172a",
        card: "#1e293b",
        text: "#f1f5f9",
        button: "#3b82f6",
      }
    : {
        bg: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        button: "#2563eb",
      };

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1000px" }}>
        
        {/* HEADER */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
    alignItems: "center",
  }}
>
  <div>
    <h1 style={{ fontSize: "30px", fontWeight: "600" }}>
      Consulting Insight Platform 📊
    </h1>
    <p style={{ opacity: 0.7 }}>
      Welcome, {user}
    </p>
  </div>

  <div style={{ display: "flex", gap: "10px" }}>
    <button onClick={() => setDarkMode(!darkMode)}>
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("user");
        router.push("/auth");
      }}
      style={{
        background: "#ef4444",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>
</div>

        {/* UPLOAD CARD */}
        <div
          style={{
            background: theme.card,
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <h3>Upload Data</h3>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            
            {/* CUSTOM FILE BUTTON */}
            <label
              style={{
                padding: "10px 15px",
                background: "#334155",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    setFile(e.target.files[0]);
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
            </label>

            {/* UPLOAD BUTTON */}
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: theme.button,
                color: "white",
              }}
            >
              {loading ? "Analyzing..." : "Upload"}
            </button>
          </div>

          {/* FILE NAME */}
          {fileName && (
            <p style={{ marginTop: "10px", opacity: 0.7 }}>
              {fileName}
            </p>
          )}

          {/* ERROR */}
          {error && (
            <p style={{ color: "#f87171", marginTop: "10px" }}>{error}</p>
          )}
        </div>

        {/* RESULTS */}
        {data && (
          <>
            {/* KPI */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
              <div style={{ flex: 1, background: theme.card, padding: "20px", borderRadius: "12px" }}>
                <h4>💰 Total Sales</h4>
                <p style={{ fontSize: "24px" }}>{data.kpi.total_sales}</p>
              </div>

              <div style={{ flex: 1, background: theme.card, padding: "20px", borderRadius: "12px" }}>
                <h4>📊 Avg Sales</h4>
                <p style={{ fontSize: "24px" }}>
                  {data.kpi.average_sales.toFixed(2)}
                </p>
              </div>
            </div>

            {/* INSIGHTS */}
            <div style={{ background: theme.card, padding: "20px", borderRadius: "12px", marginBottom: "25px" }}>
              <h3>Insights</h3>
              <ul>
                {data.insights.map((ins: string, i: number) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* CHART */}
            <div style={{ background: theme.card, padding: "20px", borderRadius: "12px" }}>
              <h3>Region Performance 📊</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}