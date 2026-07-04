import React, { useState } from "react";
import orBIS from "../assets/orBIS.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleForgotPassword = () => {
    alert("Redirect to forgot password page");
    // later: navigate("/forgot-password")
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* LOGO */}
        <img src={orBIS} alt="Logo" style={styles.logo} />

        <h1 style={styles.title}>Sign In</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {/* Forgot Password */}
          <div style={styles.forgotRow}>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={styles.forgotLink}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <p style={styles.text}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#09090b",
    fontFamily: "Inter, sans-serif",
  },

  card: {
    width: "380px",
    padding: "28px",
    borderRadius: "14px",
    background: "#18181b",
    border: "1px solid #3f3f46",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  logo: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    margin: "0 auto 10px auto",
    display: "block",
  },

  title: {
    color: "#fafafa",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    backgroundColor: "#27272a",
    color: "#fafafa",
    outline: "none",
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
  },

  forgotLink: {
    background: "none",
    border: "none",
    color: "#f44336",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #e91e63, #f44336, #5b21b6)",
    color: "#fafafa",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "6px",
  },

  text: {
    marginTop: "14px",
    textAlign: "center",
    color: "#a1a1aa",
    fontSize: "14px",
  },

  link: {
    color: "#e91e63",
    textDecoration: "none",
    fontWeight: 500,
  },
};

export default Login;